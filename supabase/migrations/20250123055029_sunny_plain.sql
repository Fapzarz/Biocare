-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admin can view user emails" ON auth.users;

-- Create a secure function to check admin status without recursion
CREATE OR REPLACE FUNCTION is_admin_check()
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  user_email text;
BEGIN
  -- Get the email directly from session info to avoid recursion
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  RETURN user_email = 'admin_Kj9#mP2$vL5@biocare.com';
END;
$$;

-- Create a new policy using the secure function
CREATE POLICY "Admin can view users"
ON auth.users
FOR SELECT
TO authenticated
USING (is_admin_check());

-- Grant necessary permissions
GRANT SELECT ON auth.users TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_check TO authenticated;

-- Create function to get user data safely
CREATE OR REPLACE FUNCTION get_user_management_data()
RETURNS TABLE (
  id uuid,
  full_name text,
  email text,
  is_doctor boolean,
  verification_status text,
  reputation_score integer,
  is_banned boolean,
  ban_expires_at timestamptz,
  total_posts integer,
  total_solutions integer
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- Check if user is admin using our safe function
  IF NOT is_admin_check() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    u.email,
    p.is_doctor,
    p.verification_status,
    p.reputation_score,
    p.is_banned,
    p.ban_expires_at,
    p.total_posts,
    p.total_solutions
  FROM profiles p
  JOIN auth.users u ON u.id = p.id;
END;
$$;