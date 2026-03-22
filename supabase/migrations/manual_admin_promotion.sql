-- Script: Promote User to Admin
-- Description: Manually promote a user to admin role by email
-- Usage: Replace 'user@example.com' with the actual user email
-- 
-- IMPORTANT: 
-- - User must have signed in at least once (profile must exist)
-- - Run this directly in Supabase SQL Editor
-- - Only needed for the first admin; subsequent admins can be promoted via app

-- ============================================================================
-- PROMOTE USER TO ADMIN
-- ============================================================================

DO $$
DECLARE
  user_email TEXT := 'user@example.com';  -- CHANGE THIS TO ACTUAL EMAIL
  user_record RECORD;
BEGIN
  -- Find the user by email
  SELECT id, email, role, full_name 
  INTO user_record
  FROM profiles 
  WHERE email = user_email;

  -- Check if user exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User with email % not found. User must sign in at least once.', user_email;
  END IF;

  -- Check if already admin
  IF user_record.role = 'admin' THEN
    RAISE NOTICE 'User % (%) is already an admin.', user_record.full_name, user_record.email;
    RETURN;
  END IF;

  -- Promote to admin
  UPDATE profiles 
  SET 
    role = 'admin',
    updated_at = NOW()
  WHERE id = user_record.id;

  -- Log success
  RAISE NOTICE 'SUCCESS: User % (%) promoted to admin.', user_record.full_name, user_record.email;
  
END $$;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Run this to verify the promotion worked
-- SELECT id, email, full_name, role, created_at, updated_at 
-- FROM profiles 
-- WHERE role = 'admin';
