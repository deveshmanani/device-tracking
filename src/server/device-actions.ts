'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { DeviceStatus } from '@/types/database';
import { deviceSchema, deviceUpdateSchema } from '@/lib/validation/schemas';

export interface CreateDeviceInput {
  name: string;
  brand: string;
  model: string;
  platform: string;
  os_version?: string;
  serial_number?: string;
  imei?: string;
  asset_tag: string;
  condition_note?: string;
  location_name?: string;
  image_url?: string;
  purchase_date?: string;
  warranty_expiry?: string;
}

export interface UpdateDeviceInput extends CreateDeviceInput {
  status: DeviceStatus;
}

/**
 * Create a new device (Admin only)
 */
export async function createDevice(input: CreateDeviceInput): Promise<{ id: string }> {
  const { user } = await requireAdmin();
  
  // Validate input
  try {
    deviceSchema.parse(input);
  } catch (error: any) {
    throw new Error(`Validation failed: ${error.message}`);
  }
  
  const supabase = createAdminClient();

  // Generate unique QR code value
  const qrCodeValue = `/scan/${crypto.randomUUID()}`;

  const { data, error } = await supabase
    .from('devices')
    .insert({
      ...input,
      qr_code_value: qrCodeValue,
      status: 'available',
      created_by: user.id,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating device:', error);
    throw new Error('Failed to create device');
  }

  // Create device_created event
  await supabase.from('device_events').insert({
    device_id: data.id,
    event_type: 'device_created',
    actor_user_id: user.id,
    metadata: {
      initial_status: 'available',
      location: input.location_name,
    },
  });

  revalidatePath('/devices');
  revalidatePath('/admin/devices');

  return { id: data.id };
}

/**
 * Update an existing device (Admin only)
 */
export async function updateDevice(
  id: string,
  input: UpdateDeviceInput
): Promise<void> {
  const { user } = await requireAdmin();
  const supabase = createAdminClient();

  // Get current device to check for status change
  const { data: currentDevice } = await supabase
    .from('devices')
    .select('status')
    .eq('id', id)
    .single();

  // Check if device is currently checked out
  const { data: activeAssignment } = await supabase
    .from('device_assignments')
    .select('id, user_id')
    .eq('device_id', id)
    .is('returned_at', null)
    .single();

  // If changing status to available and device is checked out, auto-return it
  if (input.status === 'available' && activeAssignment && currentDevice?.status === 'checked_out') {
    const now = new Date().toISOString();
    const { error: returnError } = await supabase
      .from('device_assignments')
      .update({ returned_at: now })
      .eq('id', activeAssignment.id);

    if (returnError) {
      console.error('Auto-return error:', returnError);
      throw new Error('Failed to return device automatically');
    }

    // Create return audit event
    await supabase.from('device_events').insert({
      device_id: id,
      actor_user_id: user.id,
      event_type: 'returned',
      metadata: {
        assignment_id: activeAssignment.id,
        returned_by_admin: true,
        admin_action: true,
        via_edit_form: true,
      },
    });
  }

  const { data, error } = await supabase
    .from('devices')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating device:', error);
    throw new Error('Failed to update device');
  }

  // Create device_updated event
  const eventMetadata: any = {
    updated_fields: Object.keys(input),
  };

  // If status changed, add to metadata
  if (currentDevice && currentDevice.status !== input.status) {
    eventMetadata.status_change = {
      from: currentDevice.status,
      to: input.status,
    };
    
    if (input.status === 'available' && activeAssignment) {
      eventMetadata.auto_returned = true;
    }
  }

  await supabase.from('device_events').insert({
    device_id: id,
    event_type: 'device_updated',
    actor_user_id: user.id,
    metadata: eventMetadata,
  });

  revalidatePath('/devices');
  revalidatePath(`/devices/${id}`);
  revalidatePath('/admin/devices');
  revalidatePath('/my-devices');
}
