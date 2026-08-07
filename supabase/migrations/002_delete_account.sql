-- ============================================================
-- 002: Delete Account Function
-- Allows users to fully delete their account and all data.
-- The email becomes available for re-registration.
-- ============================================================

-- Revoke existing policies on auth.users to prevent direct access
-- (Supabase already handles this, but being explicit)

-- Function: delete authenticated user's own account
-- SECURITY DEFINER runs as the function owner (postgres),
-- which has permission to delete from auth.users
CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  uid uuid;
BEGIN
  -- Get the current user's ID from the JWT
  uid := auth.uid();

  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete profile (CASCADE removes quiz_attempts, quiz_answers, favorites, char_views)
  DELETE FROM public.profiles WHERE id = uid;

  -- Delete the auth user (this frees up the email for re-registration)
  DELETE FROM auth.users WHERE id = uid;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;
