'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import type { Device, DeviceStatus } from '@/types/database';

export interface DeviceFilters {
  search?: string;
  status?: DeviceStatus;
  platform?: string;
  brand?: string;
  category?: string;
}

export interface DeviceListItem extends Omit<Device, 'condition_note'> {
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
    assigned_at: string;
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
  const { profile } = await requireAuth();
  const supabase = await createClient();

  let query = supabase
    .from('devices')
    .select(`
      *,
      device_assignments!device_assignments_device_id_fkey (
        user_id,
        returned_at,
        assigned_at,
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
    .eq('id', id);

  // Apply role-based platform filtering for non-admin users
  if (profile.role !== 'admin') {
    query = query.in('platform', ['Android', 'iOS', 'iPadOS']);
  }

  const { data, error } = await query.single();

  if (error) {
    console.error('Error fetching device:', error);
    // Check if it's a permission issue (device exists but not accessible)
    if (profile.role !== 'admin') {
      throw new Error("You don't have permission to access this device");
    }
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
    category: data.category,
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
          assigned_at: activeAssignment.assigned_at,
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
  const { profile } = await requireAuth();
  const supabase = await createClient();

  let query = supabase
    .from('devices')
    .select(`
      id,
      name,
      brand,
      model,
      platform,
      category,
      os_version,
      serial_number,
      imei,
      asset_tag,
      status,
      location_name,
      image_url,
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

  // Apply role-based platform filtering for non-admin users
  if (profile.role !== 'admin') {
    query = query.in('platform', ['Android', 'iOS', 'iPadOS']);
  }

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

  // Apply category filter
  if (filters.category) {
    query = query.eq('category', filters.category);
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
      category: device.category,
      os_version: device.os_version,
      serial_number: device.serial_number,
      imei: device.imei,
      asset_tag: device.asset_tag,
      status: device.status,
      location_name: device.location_name,
      image_url: device.image_url,
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
  const { profile } = await requireAuth();
  const supabase = await createClient();

  let query = supabase
    .from('devices')
    .select('platform')
    .not('platform', 'is', null);

  // Apply role-based platform filtering for non-admin users
  if (profile.role !== 'admin') {
    query = query.in('platform', ['Android', 'iOS', 'iPadOS']);
  }

  const { data, error } = await query;

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
  const { profile } = await requireAuth();
  const supabase = await createClient();

  let query = supabase
    .from('devices')
    .select('brand')
    .not('brand', 'is', null);

  // Apply role-based platform filtering for non-admin users
  if (profile.role !== 'admin') {
    query = query.in('platform', ['Android', 'iOS', 'iPadOS']);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching brands:', error);
    return [];
  }

  const brands = Array.from(new Set(data.map((d: any) => d.brand).filter(Boolean)));
  return brands.sort();
}

/**
 * Get unique categories for filter dropdown
 */
export async function getDeviceCategories(): Promise<string[]> {
  const { profile } = await requireAuth();
  const supabase = await createClient();

  let query = supabase
    .from('devices')
    .select('category')
    .not('category', 'is', null);

  if (profile.role !== 'admin') {
    query = query.in('platform', ['Android', 'iOS', 'iPadOS']);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  const categories = Array.from(new Set(data.map((d: any) => d.category).filter(Boolean)));
  return categories.sort();
}
