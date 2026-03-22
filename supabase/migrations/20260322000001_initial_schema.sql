-- Migration: Initial schema for device tracking
-- Description: Create enums, tables, triggers, and constraints
-- Created: 2026-03-22

-- ============================================================================
-- ENUMS
-- ============================================================================

-- App role enum (only user and admin for MVP)
CREATE TYPE app_role AS ENUM ('user', 'admin');

-- Device status enum
CREATE TYPE device_status AS ENUM (
  'available',
  'checked_out',
  'in_repair',
  'retired',
  'lost'
);

-- Assignment source enum
CREATE TYPE assignment_source AS ENUM (
  'scan',
  'admin_manual',
  'bulk_import'
);

-- Device event type enum
CREATE TYPE device_event_type AS ENUM (
  'device_created',
  'device_updated',
  'qr_generated',
  'assigned',
  'returned',
  'status_changed',
  'override_assigned'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role app_role NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on email for lookups
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Devices table
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_tag TEXT UNIQUE NOT NULL,
  qr_code_value TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  platform TEXT NOT NULL,
  os_version TEXT,
  serial_number TEXT UNIQUE,
  imei TEXT,
  status device_status NOT NULL DEFAULT 'available',
  condition_note TEXT,
  location_name TEXT,
  image_url TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_devices_asset_tag ON devices(asset_tag);
CREATE INDEX idx_devices_platform ON devices(platform);
CREATE INDEX idx_devices_brand ON devices(brand);

-- Device assignments table
CREATE TABLE device_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  returned_at TIMESTAMPTZ,
  assignment_source assignment_source NOT NULL,
  purpose TEXT,
  expected_return_at TIMESTAMPTZ,
  condition_out TEXT,
  condition_in TEXT,
  notes TEXT
);

-- Create indexes for assignments
CREATE INDEX idx_assignments_device_id ON device_assignments(device_id);
CREATE INDEX idx_assignments_user_id ON device_assignments(user_id);
CREATE INDEX idx_assignments_assigned_at ON device_assignments(assigned_at DESC);

-- Unique partial index: only one open (not returned) assignment per device
CREATE UNIQUE INDEX idx_assignments_device_active 
  ON device_assignments(device_id) 
  WHERE returned_at IS NULL;

-- Device events table (audit trail)
CREATE TABLE device_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES profiles(id),
  event_type device_event_type NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for events
CREATE INDEX idx_events_device_id ON device_events(device_id);
CREATE INDEX idx_events_created_at ON device_events(created_at DESC);
CREATE INDEX idx_events_event_type ON device_events(event_type);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for devices
CREATE TRIGGER update_devices_updated_at 
  BEFORE UPDATE ON devices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users';
COMMENT ON TABLE devices IS 'Device inventory with QR codes';
COMMENT ON TABLE device_assignments IS 'Track device checkout/checkin history';
COMMENT ON TABLE device_events IS 'Audit trail for all device mutations';

COMMENT ON COLUMN devices.qr_code_value IS 'Unique value encoded in QR code (format: /scan/{device_id})';
COMMENT ON COLUMN device_assignments.returned_at IS 'NULL means device is still checked out';
COMMENT ON INDEX idx_assignments_device_active IS 'Ensures only one active assignment per device';
