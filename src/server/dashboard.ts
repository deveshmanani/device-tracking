'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import type { DeviceStatus } from '@/types/database';

export interface DashboardStats {
  total: number;
  available: number;
  checked_out: number;
  in_repair: number;
  retired: number;
  lost: number;
}

export interface RecentDevice {
  id: string;
  name: string;
  brand: string;
  model: string;
  status: DeviceStatus;
  asset_tag: string;
  image_url: string | null;
  updated_at: string;
  current_holder?: {
    full_name: string | null;
    email: string;
  };
}

/**
 * Get device counts by status for dashboard
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAuth();
  const supabase = await createClient();

  // Get counts grouped by status
  const { data, error } = await supabase
    .from('devices')
    .select('status');

  if (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error('Failed to fetch dashboard statistics');
  }

  // Calculate stats
  const stats: DashboardStats = {
    total: data.length,
    available: 0,
    checked_out: 0,
    in_repair: 0,
    retired: 0,
    lost: 0,
  };

  data.forEach((device: { status: string }) => {
    if (device.status in stats) {
      stats[device.status as keyof Omit<DashboardStats, 'total'>]++;
    }
  });

  return stats;
}

/**
 * Get recently updated devices for dashboard
 */
export async function getRecentDevices(limit = 10): Promise<RecentDevice[]> {
  await requireAuth();
  const supabase = await createClient();

  // Get recent devices with current assignments
  const { data, error } = await supabase
    .from('devices')
    .select(`
      id,
      name,
      brand,
      model,
      status,
      asset_tag,
      image_url,
      updated_at,
      device_assignments!device_assignments_device_id_fkey (
        user_id,
        profiles:user_id (
          full_name,
          email
        )
      )
    `)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent devices:', error);
    throw new Error('Failed to fetch recent devices');
  }

  // Transform data to match RecentDevice interface
  const devices: RecentDevice[] = data.map((device: any) => {
    // Find active assignment (returned_at is null)
    const activeAssignment = Array.isArray(device.device_assignments)
      ? device.device_assignments.find((assignment: any) => !assignment.returned_at)
      : null;

    return {
      id: device.id,
      name: device.name,
      brand: device.brand,
      model: device.model,
      status: device.status,
      asset_tag: device.asset_tag,
      image_url: device.image_url,
      updated_at: device.updated_at,
      current_holder: activeAssignment?.profiles
        ? {
            full_name: activeAssignment.profiles.full_name,
            email: activeAssignment.profiles.email,
          }
        : undefined,
    };
  });

  return devices;
}
