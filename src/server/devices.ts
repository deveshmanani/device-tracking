'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import type { Device, DeviceStatus } from '@/types/database';

export interface DeviceFilters {
  search?: string;
  status?: DeviceStatus;
  platform?: string;
  brand?: string;
}

export interface DeviceListItem extends Omit<Device, 'condition_note' | 'image_url'> {
  current_holder?: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

export interface DeviceDetail extends Device {
  current_holder?: {
    id: string;
    full_name: string | null;
    email: string;
  };
  creator?: {
    full_name: string | null;
    email: string;
  };
}

/**
 * Get a single device by ID with full details
 */
export async function getDeviceById(id: string): Promise<DeviceDetail> {
  await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('devices')
    .select(`
      *,
      device_assignments!device_assignments_device_id_fkey (
        user_id,
        returned_at,
        profiles:user_id (
          id,
          full_name,
          email
        )
      ),
      creator:profiles!devices_created_by_fkey (
        full_name,
        email
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching device:', error);
    throw new Error('Device not found');
  }

  // Find active assignment
  const activeAssignment = Array.isArray(data.device_assignments)
    ? data.device_assignments.find((assignment: any) => !assignment.returned_at)
    : null;

  const device: DeviceDetail = {
    id: data.id,
    name: data.name,
    brand: data.brand,
    model: data.model,
    platform: data.platform,
    os_version: data.os_version,
    serial_number: data.serial_number,
    imei: data.imei,
    asset_tag: data.asset_tag,
    status: data.status,
    condition_note: data.condition_note,
    location_name: data.location_name,
    image_url: data.image_url,
    qr_code_value: data.qr_code_value,
    created_by: data.created_by,
    created_at: data.created_at,
    updated_at: data.updated_at,
    current_holder: activeAssignment?.profiles
      ? {
          id: activeAssignment.profiles.id,
          full_name: activeAssignment.profiles.full_name,
          email: activeAssignment.profiles.email,
        }
      : undefined,
    creator: data.creator
      ? {
          full_name: data.creator.full_name,
          email: data.creator.email,
        }
      : undefined,
  };

  return device;
}

/**
 * Get paginated list of devices with filters
 */
export async function getDevices(filters: DeviceFilters = {}): Promise<DeviceListItem[]> {
  await requireAuth();
  const supabase = await createClient();

  let query = supabase
    .from('devices')
    .select(`
      id,
      name,
      brand,
      model,
      platform,
      os_version,
      serial_number,
      imei,
      asset_tag,
      status,
      location_name,
      qr_code_value,
      created_by,
      created_at,
      updated_at,
      device_assignments!device_assignments_device_id_fkey (
        user_id,
        returned_at,
        profiles:user_id (
          id,
          full_name,
          email
        )
      )
    `)
    .order('updated_at', { ascending: false });

  // Apply search filter
  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,model.ilike.%${filters.search}%,asset_tag.ilike.%${filters.search}%,serial_number.ilike.%${filters.search}%`
    );
  }

  // Apply status filter
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  // Apply platform filter
  if (filters.platform) {
    query = query.eq('platform', filters.platform);
  }

  // Apply brand filter
  if (filters.brand) {
    query = query.eq('brand', filters.brand);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching devices:', error);
    throw new Error('Failed to fetch devices');
  }

  // Transform data to match DeviceListItem interface
  const devices: DeviceListItem[] = data.map((device: any) => {
    // Find active assignment (returned_at is null)
    const activeAssignment = Array.isArray(device.device_assignments)
      ? device.device_assignments.find((assignment: any) => !assignment.returned_at)
      : null;

    return {
      id: device.id,
      name: device.name,
      brand: device.brand,
      model: device.model,
      platform: device.platform,
      os_version: device.os_version,
      serial_number: device.serial_number,
      imei: device.imei,
      asset_tag: device.asset_tag,
      status: device.status,
      location_name: device.location_name,
      qr_code_value: device.qr_code_value,
      created_by: device.created_by,
      created_at: device.created_at,
      updated_at: device.updated_at,
      current_holder: activeAssignment?.profiles
        ? {
            id: activeAssignment.profiles.id,
            full_name: activeAssignment.profiles.full_name,
            email: activeAssignment.profiles.email,
          }
        : undefined,
    };
  });

  return devices;
}

/**
 * Get unique platforms for filter dropdown
 */
export async function getDevicePlatforms(): Promise<string[]> {
  await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('devices')
    .select('platform')
    .not('platform', 'is', null);

  if (error) {
    console.error('Error fetching platforms:', error);
    return [];
  }

  const platforms = Array.from(new Set(data.map((d: any) => d.platform).filter(Boolean)));
  return platforms.sort();
}

/**
 * Get unique brands for filter dropdown
 */
export async function getDeviceBrands(): Promise<string[]> {
  await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('devices')
    .select('brand')
    .not('brand', 'is', null);

  if (error) {
    console.error('Error fetching brands:', error);
    return [];
  }

  const brands = Array.from(new Set(data.map((d: any) => d.brand).filter(Boolean)));
  return brands.sort();
}
