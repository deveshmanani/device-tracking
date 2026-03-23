'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { DeviceStatus } from '@/types/database';
import { statusTransitionSchema } from '@/lib/validation/schemas';

/**
 * Change device status (Admin only)
 * Validates transitions and creates audit events
 */
export async function changeDeviceStatus(
  deviceId: string,
  newStatus: DeviceStatus
): Promise<{ success: boolean; message: string }> {
  const { user } = await requireAdmin();
  
  // Validate input
  try {
    statusTransitionSchema.parse({ deviceId, newStatus });
  } catch (error: any) {
    return {
      success: false,
      message: `Validation failed: ${error.issues?.[0]?.message || error.message}`,
    };
  }
  
  const supabase = createAdminClient();

  try {
    // Cannot manually set to checked_out - must use assignment flow
    if (newStatus === 'checked_out') {
      return {
        success: false,
        message: 'Cannot manually set status to "checked_out". Use the assignment flow instead.',
      };
    }

    // Get current device state
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('id, name, status')
      .eq('id', deviceId)
      .single();

    if (deviceError || !device) {
      return { success: false, message: 'Device not found' };
    }

    if (device.status === newStatus) {
      return { success: false, message: `Device is already ${newStatus}` };
    }

    // Check if device is currently checked out
    const { data: activeAssignment } = await supabase
      .from('device_assignments')
      .select('id, user_id')
      .eq('device_id', deviceId)
      .is('returned_at', null)
      .single();

    // If device is checked out, handle based on new status
    if (activeAssignment && device.status === 'checked_out') {
      // For critical status changes, prevent transition
      if (newStatus === 'retired' || newStatus === 'lost') {
        return {
          success: false,
          message: `Device is currently checked out. Please return it before marking as ${newStatus}.`,
        };
      }
      
      // For available status, automatically return the device
      if (newStatus === 'available') {
        const now = new Date().toISOString();
        const { error: returnError } = await supabase
          .from('device_assignments')
          .update({ returned_at: now })
          .eq('id', activeAssignment.id);

        if (returnError) {
          console.error('Auto-return error:', returnError);
          return { 
            success: false, 
            message: 'Failed to return device automatically' 
          };
        }

        // Create return audit event
        await supabase.from('device_events').insert({
          device_id: deviceId,
          event_type: 'returned',
          actor_user_id: user.id,
          metadata: {
            assignment_id: activeAssignment.id,
            returned_by_admin: true,
            admin_action: true,
          },
        });
      }
      // For in_repair, allow but note in audit
    }

    const oldStatus = device.status;

    // Update device status
    const { error: updateError } = await supabase
      .from('devices')
      .update({ status: newStatus })
      .eq('id', deviceId);

    if (updateError) {
      console.error('Status update error:', updateError);
      return { success: false, message: 'Failed to update device status' };
    }

    // Create status change audit event
    await supabase.from('device_events').insert({
      device_id: deviceId,
      event_type: 'status_changed',
      actor_user_id: user.id,
      metadata: {
        old_status: oldStatus,
        new_status: newStatus,
        admin_action: true,
        auto_returned: activeAssignment && newStatus === 'available',
      },
    });

    revalidatePath('/devices');
    revalidatePath(`/devices/${deviceId}`);
    revalidatePath('/my-devices');

    const wasAutoReturned = activeAssignment && newStatus === 'available';
    const baseMessage = `${device.name} status changed from ${oldStatus} to ${newStatus}`;
    const message = wasAutoReturned 
      ? `${baseMessage} (device automatically returned)` 
      : baseMessage;

    return {
      success: true,
      message,
    };
  } catch (error) {
    console.error('Change device status error:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
}
