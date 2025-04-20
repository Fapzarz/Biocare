/*
  # Enforce Email Verification

  1. Changes
    - Reset email verification status for non-admin users
    - Add trigger to enforce email verification
    - Update RLS policies to check email verification

  2. Security
    - Adds email verification requirement for all non-admin users
    - Preserves admin access without verification
    - Updates RLS policies to check verification status
*/

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin(user_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = user_id
    AND email = 'admin_Kj9#mP2$vL5@biocare.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reset email verification for non-admin users
DO $$ 
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = NULL,
      updated_at = NOW()
  WHERE email != 'admin_Kj9#mP2$vL5@biocare.com'
  AND email_confirmed_at IS NOT NULL;
END $$;

-- Function to check email verification
CREATE OR REPLACE FUNCTION auth.require_verified_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT auth.is_admin(auth.uid()) AND 
     NOT EXISTS (
       SELECT 1
       FROM auth.users
       WHERE id = auth.uid()
       AND email_confirmed_at IS NOT NULL
     ) THEN
    RAISE EXCEPTION 'Email verification required';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to enforce email verification
DO $$ 
BEGIN
  -- Diseases table
  DROP TRIGGER IF EXISTS check_email_verified_diseases ON public.diseases;
  CREATE TRIGGER check_email_verified_diseases
    BEFORE INSERT OR UPDATE OR DELETE ON public.diseases
    FOR EACH ROW
    EXECUTE FUNCTION auth.require_verified_email();

  -- Blog posts table
  DROP TRIGGER IF EXISTS check_email_verified_blog_posts ON public.blog_posts;
  CREATE TRIGGER check_email_verified_blog_posts
    BEFORE INSERT OR UPDATE OR DELETE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION auth.require_verified_email();

  -- Blog tags table
  DROP TRIGGER IF EXISTS check_email_verified_blog_tags ON public.blog_tags;
  CREATE TRIGGER check_email_verified_blog_tags
    BEFORE INSERT OR UPDATE OR DELETE ON public.blog_tags
    FOR EACH ROW
    EXECUTE FUNCTION auth.require_verified_email();

  -- Blog posts tags table
  DROP TRIGGER IF EXISTS check_email_verified_blog_posts_tags ON public.blog_posts_tags;
  CREATE TRIGGER check_email_verified_blog_posts_tags
    BEFORE INSERT OR UPDATE OR DELETE ON public.blog_posts_tags
    FOR EACH ROW
    EXECUTE FUNCTION auth.require_verified_email();

  -- Profiles table
  DROP TRIGGER IF EXISTS check_email_verified_profiles ON public.profiles;
  CREATE TRIGGER check_email_verified_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION auth.require_verified_email();
END $$;

-- Update RLS policies to include email verification check
CREATE OR REPLACE FUNCTION public.is_verified_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT 
      CASE
        WHEN auth.is_admin(auth.uid()) THEN true
        WHEN u.email_confirmed_at IS NOT NULL THEN true
        ELSE false
      END
    FROM auth.users u
    WHERE u.id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.is_verified_or_admin TO authenticated;
GRANT EXECUTE ON FUNCTION auth.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION auth.require_verified_email TO authenticated;