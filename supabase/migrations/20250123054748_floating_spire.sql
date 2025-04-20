-- Enable RLS on auth.users for admin access
CREATE POLICY "Admin can view user emails"
ON auth.users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND email = 'admin_Kj9#mP2$vL5@biocare.com'
  )
);

-- Grant necessary permissions
GRANT SELECT ON auth.users TO authenticated;

-- Create secure function to get user management data
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
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND email = 'admin_Kj9#mP2$vL5@biocare.com'
  ) THEN
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

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_management_data TO authenticated;