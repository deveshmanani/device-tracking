'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Assign a device to the current user (self-assignment)
 * Validates: device exists, status is available, no open assignment
 */
export async function assignDeviceToMe(deviceId: string): Promise<{ success: boolean; message: string }> {
  const { user } = await requireAuth();
  const supabase = createAdminClient();

  try {
    // Start transaction-like operation
    // 1. Get device and check status
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('id, status, name')
      .eq('id', deviceId)
      .single();

    if (deviceError || !device) {
      return { success: false, message: 'Device not found' };
    }

    if (device.status !== 'available') {
      return { success: false, message: `Device is not available (status: ${device.status})` };
    }

    // 2. Check for existing open assignment (concurrency check)
    const { data: existingAssignment } = await supabase
      .from('device_assignments')
      .select('id')
      .eq('device_id', deviceId)
      .is('returned_at', null)
      .single();

    if (existingAssignment) {
      return { success: false, message: 'Device is already assigned to someone' };
    }

    // 3. Create assignment
    const { error: assignError } = await supabase
      .from('device_assignments')
      .insert({
        device_id: deviceId,
        user_id: user.id,
        assigned_at: new Date().toISOString(),
        assignment_source: 'scan',
      });

    if (assignError) {
      console.error('Assignment insert error:', assignError);
      return { success: false, message: 'Failed to create assignment' };
    }

    // 4. Update device status
    const { error: updateError } = await supabase
      .from('devices')
      .update({ status: 'checked_out' })
      .eq('id', deviceId);

    if (updateError) {
      console.error('Device status update error:', updateError);
      return { success: false, message: 'Failed to update device status' };
    }

    // 5. Create audit event
    await supabase.from('device_events').insert({
      device_id: deviceId,
      event_type: 'assigned',
      performed_by: user.id,
      metadata: {
        assigned_to: user.id,
      },
    });

    revalidatePath('/devices');
    revalidatePath(`/devices/${deviceId}`);
    revalidatePath('/my-devices');

    return { success: true, message: `${device.name} has been assigned to you` };
  } catch (error) {
    console.error('Assign device error:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
}

/**
 * Return a device (end assignment)
 * Validates: open assignment exists, caller is holder OR admin
 */
export async function returnDevice(deviceId: string): Promise<{ success: boolean; message: string }> {
  const { user, profile } = await requireAuth();
  const supabase = createAdminClient();

  try {
    // 1. Get current assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('device_assignments')
      .select('id, user_id, device_id')
      .eq('device_id', deviceId)
      .is('returned_at', null)
      .single();

    if (assignmentError || !assignment) {
      return { success: false, message: 'No active assignment found for this device' };
    }

    // 2. Check permission (must be holder or admin)
    if (assignment.user_id !== user.id && profile.role !== 'admin') {
      return { success: false, message: 'You do not have permission to return this device' };
    }

    // 3. Close assignment
    const { error: closeError } = await supabase
      .from('device_assignments')
      .update({ returned_at: new Date().toISOString() })
      .eq('id', assignment.id);

    if (closeError) {
      console.error('Assignment close error:', closeError);
      return { success: false, message: 'Failed to close assignment' };
    }

    // 4. Update device status back to available
    const { error: updateError } = await supabase
      .from('devices')
      .update({ status: 'available' })
      .eq('id', deviceId);

    if (updateError) {
      console.error('Device status update error:', updateError);
      return { success: false, message: 'Failed to update device status' };
    }

    // 5. Create audit event
    await supabase.from('device_events').insert({
      device_id: deviceId,
      event_type: 'returned',
      performed_by: user.id,
      metadata: {
        returned_by: user.id,
        was_assigned_to: assignment.user_id,
      },
    });

    revalidatePath('/devices');
    revalidatePath(`/devices/${deviceId}`);
    revalidatePath('/my-devices');

    return { success: true, message: 'Device has been returned' };
  } catch (error) {
    console.error('Return device error:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
}

/**
 * Admin override: Assign device to any user regardless of current status
 * If device was assigned, closes existing assignment first
 */
export async function adminAssignDevice(
  deviceId: string,
  targetUserId: string
): Promise<{ success: boolean; message: string }> {
  const { user } = await requireAdmin();
  const supabase = createAdminClient();

  try {
    // 1. Get device
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('id, name, status')
      .eq('id', deviceId)
      .single();

    if (deviceError || !device) {
      return { success: false, message: 'Device not found' };
    }

    // 2. Verify target user exists
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', targetUserId)
      .single();

    if (userError || !targetUser) {
      return { success: false, message: 'Target user not found' };
    }

    // 3. If device has an open assignment, close it first
    const { data: existingAssignment } = await supabase
      .from('device_assignments')
      .select('id, user_id')
      .eq('device_id', deviceId)
      .is('returned_at', null)
      .single();

    if (existingAssignment) {
      await supabase
        .from('device_assignments')
        .update({ returned_at: new Date().toISOString() })
        .eq('id', existingAssignment.id);
    }

    // 4. Create new assignment
    const { error: assignError } = await supabase
      .from('device_assignments')
      .insert({
        device_id: deviceId,
        user_id: targetUserId,
        assigned_at: new Date().toISOString(),
        assignment_source: 'admin_manual',
      });

    if (assignError) {
      console.error('Admin assignment insert error:', assignError);
      return { success: false, message: 'Failed to create assignment' };
    }

    // 5. Update device status
    const { error: updateError } = await supabase
      .from('devices')
      .update({ status: 'checked_out' })
      .eq('id', deviceId);

    if (updateError) {
      console.error('Device status update error:', updateError);
      return { success: false, message: 'Failed to update device status' };
    }

    // 6. Create audit event
    await supabase.from('device_events').insert({
      device_id: deviceId,
      event_type: 'override_assigned',
      performed_by: user.id,
      metadata: {
        assigned_to: targetUserId,
        previous_holder: existingAssignment?.user_id,
        admin_override: true,
      },
    });

    revalidatePath('/devices');
    revalidatePath(`/devices/${deviceId}`);
    revalidatePath('/my-devices');

    return {
      success: true,
      message: `${device.name} has been assigned to ${targetUser.full_name || targetUser.email}`,
    };
  } catch (error) {
    console.error('Admin assign device error:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
}
