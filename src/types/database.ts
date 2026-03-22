// Database types based on Supabase schema
export type AppRole = 'user' | 'admin';

export type DeviceStatus = 
  | 'available' 
  | 'checked_out' 
  | 'in_repair' 
  | 'retired' 
  | 'lost';

export type AssignmentSource = 
  | 'scan' 
  | 'admin_manual' 
  | 'bulk_import';

export type DeviceEventType =
  | 'device_created'
  | 'device_updated'
  | 'qr_generated'
  | 'assigned'
  | 'returned'
  | 'status_changed'
  | 'override_assigned';

// Table types
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Device {
  id: string;
  asset_tag: string;
  qr_code_value: string;
  name: string;
  brand: string;
  model: string;
  platform: string;
  os_version: string | null;
  serial_number: string | null;
  imei: string | null;
  status: DeviceStatus;
  condition_note: string | null;
  location_name: string | null;
  image_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeviceAssignment {
  id: string;
  device_id: string;
  user_id: string;
  assigned_at: string;
  returned_at: string | null;
  assignment_source: AssignmentSource;
  purpose: string | null;
  expected_return_at: string | null;
  condition_out: string | null;
  condition_in: string | null;
  notes: string | null;
}

export interface DeviceEvent {
  id: string;
  device_id: string;
  actor_user_id: string | null;
  event_type: DeviceEventType;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Joined types for queries
export interface DeviceWithAssignment extends Device {
  current_assignment?: DeviceAssignment & {
    user?: Profile;
  };
}

export interface AssignmentWithDetails extends DeviceAssignment {
  device?: Device;
  user?: Profile;
}

export interface DeviceEventWithDetails extends DeviceEvent {
  actor?: Profile;
  device?: Device;
}
