-- Migration: Role helper functions
-- Description: Create helper functions for role checks (safe for RLS policies)
-- Created: 2026-03-22

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get the role of the current authenticated user
CREATE OR REPLACE FUNCTION get_user_role(uid UUID)
RETURNS app_role
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_role app_role;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = uid;
  
  RETURN COALESCE(user_role, 'user'::app_role);
END;
$$;

-- Check if the current authenticated user is an admin
CREATE OR REPLACE FUNCTION is_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN get_user_role(uid) = 'admin';
END;
$$;

-- Get the current authenticated user's ID (convenience function)
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.uid();
$$;

-- Check if current user is admin (convenience wrapper)
CREATE OR REPLACE FUNCTION current_user_is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT is_admin(auth.uid());
$$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION get_user_role(UUID) IS 'Get role for a specific user ID';
COMMENT ON FUNCTION is_admin(UUID) IS 'Check if a specific user ID has admin role';
COMMENT ON FUNCTION current_user_id() IS 'Get current authenticated user ID';
COMMENT ON FUNCTION current_user_is_admin() IS 'Check if current user is admin';
