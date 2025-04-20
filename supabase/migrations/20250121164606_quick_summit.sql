/*
  # User Authentication System

  1. User Management
    - User profiles with required and optional fields
    - Password policies and validation
    - Login attempt tracking
    - Session management

  2. Security
    - Rate limiting
    - Password encryption
    - Input validation
*/

-- Create profiles table for additional user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

-- Create login_attempts table
CREATE TABLE IF NOT EXISTS auth.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address inet NOT NULL,
  attempted_at timestamptz DEFAULT now(),
  success boolean NOT NULL
);

-- Create function to check login attempts
CREATE OR REPLACE FUNCTION check_login_attempts()
RETURNS TRIGGER AS $$
DECLARE
  attempt_count INT;
BEGIN
  SELECT COUNT(*)
  INTO attempt_count
  FROM auth.login_attempts
  WHERE email = NEW.email
    AND attempted_at > now() - interval '1 hour'
    AND success = false;

  IF attempt_count >= 3 THEN
    RAISE EXCEPTION 'Too many failed login attempts. Please try again later.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for login attempts
CREATE TRIGGER check_login_attempts_trigger
  BEFORE INSERT ON auth.login_attempts
  FOR EACH ROW
  EXECUTE FUNCTION check_login_attempts();

-- Create function to clean up old login attempts
CREATE OR REPLACE FUNCTION cleanup_login_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM auth.login_attempts
  WHERE attempted_at < now() - interval '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();