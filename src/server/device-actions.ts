'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { DeviceStatus } from '@/types/database';

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
}

export interface UpdateDeviceInput extends CreateDeviceInput {
  status: DeviceStatus;
}

/**
 * Create a new device (Admin only)
 */
export async function createDevice(input: CreateDeviceInput): Promise<{ id: string }> {
  const { user } = await requireAdmin();
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
    performed_by: user.id,
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
  }

  await supabase.from('device_events').insert({
    device_id: id,
    event_type: 'device_updated',
    performed_by: user.id,
    metadata: eventMetadata,
  });

  revalidatePath('/devices');
  revalidatePath(`/devices/${id}`);
  revalidatePath('/admin/devices');
}
