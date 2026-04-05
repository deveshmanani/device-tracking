-- Migration: Fix device assignment visibility for all users
-- Description: Allow all authenticated users to see who has booked devices
-- Created: 2026-03-29

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users read own assignments, admins read all" ON device_assignments;

-- Create new policy that allows all authenticated users to read all assignments
CREATE POLICY "All users can read device assignments"
  ON device_assignments
  FOR SELECT
  TO authenticated
  USING (true);

-- Update comment to reflect the change
COMMENT ON POLICY "All users can read device assignments" ON device_assignments IS 
  'All authenticated users can see device assignment information to know who has booked devices';
