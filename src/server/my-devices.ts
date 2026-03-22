'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import type { Device } from '@/types/database';

export interface MyDeviceAssignment {
  id: string;
  assigned_at: string;
  purpose: string | null;
  device: Device;
}

export interface DeviceEvent {
  id: string;
  event_type: string;
  performed_by: string;
  created_at: string;
  metadata: any;
  actor: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

/**
 * Get current user's active device assignments
 */
export async function getMyDevices(): Promise<MyDeviceAssignment[]> {
  const { user } = await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('device_assignments')
    .select(`
      id,
      assigned_at,
      purpose,
      device:devices (*)
    `)
    .eq('user_id', user.id)
    .is('returned_at', null)
    .order('assigned_at', { ascending: false });

  if (error) {
    console.error('Error fetching my devices:', error);
    throw new Error('Failed to fetch your devices');
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    assigned_at: item.assigned_at,
    purpose: item.purpose,
    device: Array.isArray(item.device) ? item.device[0] : item.device,
  })) as MyDeviceAssignment[];
}

/**
 * Get device event history
 */
export async function getDeviceEvents(deviceId: string): Promise<DeviceEvent[]> {
  await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('device_events')
    .select(`
      id,
      event_type,
      performed_by,
      created_at,
      metadata,
      actor:profiles!device_events_performed_by_fkey (
        id,
        full_name,
        email
      )
    `)
    .eq('device_id', deviceId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching device events:', error);
    throw new Error('Failed to fetch device history');
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    event_type: item.event_type,
    performed_by: item.performed_by,
    created_at: item.created_at,
    metadata: item.metadata,
    actor: Array.isArray(item.actor) ? item.actor[0] : item.actor,
  })) as DeviceEvent[];
}
