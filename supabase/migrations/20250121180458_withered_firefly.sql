/*
  # Fix Profiles Table RLS Policies

  1. Changes
    - Add policy for inserting new profiles during signup
    - Add policy for authenticated users to read their own profile
    - Add policy for authenticated users to update their own profile
    - Add policy for admin to manage all profiles

  2. Security
    - Enable RLS on profiles table
    - Restrict profile access to authenticated users
    - Allow users to only access their own profile
    - Allow admin full access to all profiles
*/

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin full access" ON public.profiles;

-- Create policy for users to view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR 
  auth.jwt()->>'email' = 'admin_Kj9#mP2$vL5@biocare.com'
);

-- Create policy for users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id OR 
  auth.jwt()->>'email' = 'admin_Kj9#mP2$vL5@biocare.com'
)
WITH CHECK (
  auth.uid() = id OR 
  auth.jwt()->>'email' = 'admin_Kj9#mP2$vL5@biocare.com'
);

-- Create policy for users to insert their own profile
CREATE POLICY "Allow users to insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = id OR 
  auth.jwt()->>'email' = 'admin_Kj9#mP2$vL5@biocare.com'
);

-- Create policy for admin to manage all profiles
CREATE POLICY "Allow admin full access"
ON public.profiles
FOR ALL
TO authenticated
USING (auth.jwt()->>'email' = 'admin_Kj9#mP2$vL5@biocare.com')
WITH CHECK (auth.jwt()->>'email' = 'admin_Kj9#mP2$vL5@biocare.com');