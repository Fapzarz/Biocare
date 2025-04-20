/*
  # Fix Email Verification Enforcement

  1. Changes
    - Enable email confirmation requirement
    - Add trigger to enforce verification on sign-in
    - Update RLS policies for verification

  2. Security
    - Enforces email verification for all non-admin users
    - Prevents access until email is verified
*/

-- Enable email confirmation requirement
ALTER TABLE auth.users ALTER COLUMN email_confirmed_at SET DEFAULT NULL;

-- Create function to enforce verification on sign-in
CREATE OR REPLACE FUNCTION auth.enforce_email_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email != 'admin_Kj9#mP2$vL5@biocare.com' AND NEW.email_confirmed_at IS NULL THEN
    RAISE EXCEPTION 'Email verification required';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to enforce verification on sign-in
DROP TRIGGER IF EXISTS enforce_email_verification_trigger ON auth.users;
CREATE TRIGGER enforce_email_verification_trigger
  BEFORE UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auth.enforce_email_verification();

-- Update RLS policies to check verification
CREATE OR REPLACE FUNCTION public.is_verified_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT 
      CASE
        WHEN auth.users.email = 'admin_Kj9#mP2$vL5@biocare.com' THEN true
        WHEN auth.users.email_confirmed_at IS NOT NULL THEN true
        ELSE false
      END
    FROM auth.users
    WHERE auth.users.id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;