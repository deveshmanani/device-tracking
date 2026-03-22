-- Migration: Row Level Security policies
-- Description: Enable RLS and create security policies for all tables
-- Created: 2026-03-22

-- ============================================================================
-- ENABLE RLS
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_events ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- All authenticated users can read basic profile info
CREATE POLICY "Users can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

-- Only admins can insert profiles (managed by server)
CREATE POLICY "Admins can insert profiles"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (current_user_is_admin());

-- ============================================================================
-- DEVICES POLICIES
-- ============================================================================

-- All authenticated users can read devices
CREATE POLICY "Users can read all devices"
  ON devices
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert devices
CREATE POLICY "Admins can insert devices"
  ON devices
  FOR INSERT
  TO authenticated
  WITH CHECK (current_user_is_admin());

-- Only admins can update devices
CREATE POLICY "Admins can update devices"
  ON devices
  FOR UPDATE
  TO authenticated
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());

-- Only admins can delete devices
CREATE POLICY "Admins can delete devices"
  ON devices
  FOR DELETE
  TO authenticated
  USING (current_user_is_admin());

-- ============================================================================
-- DEVICE ASSIGNMENTS POLICIES
-- ============================================================================

-- Users can read their own assignments, admins can read all
CREATE POLICY "Users read own assignments, admins read all"
  ON device_assignments
  FOR SELECT
  TO authenticated
  USING (
    current_user_is_admin() 
    OR user_id = auth.uid()
  );

-- Only admins can insert assignments directly
-- (Normal users will use server actions that bypass RLS)
CREATE POLICY "Admins can insert assignments"
  ON device_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (current_user_is_admin());

-- Only admins can update assignments directly
CREATE POLICY "Admins can update assignments"
  ON device_assignments
  FOR UPDATE
  TO authenticated
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());

-- ============================================================================
-- DEVICE EVENTS POLICIES
-- ============================================================================

-- Users can read events for devices they can see
-- Admins can read all events
CREATE POLICY "Users read events for visible devices"
  ON device_events
  FOR SELECT
  TO authenticated
  USING (
    current_user_is_admin()
    OR EXISTS (
      SELECT 1 FROM devices WHERE devices.id = device_events.device_id
    )
  );

-- Only admins can insert events directly
-- (Server actions will bypass RLS for audit events)
CREATE POLICY "Admins can insert events"
  ON device_events
  FOR INSERT
  TO authenticated
  WITH CHECK (current_user_is_admin());

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Users can read all profiles" ON profiles IS 
  'Allow authenticated users to see basic profile information';

COMMENT ON POLICY "Users read own assignments, admins read all" ON device_assignments IS 
  'Users see only their device history, admins see everything';

COMMENT ON POLICY "Users read events for visible devices" ON device_events IS 
  'Users can see audit events for devices they have access to';
