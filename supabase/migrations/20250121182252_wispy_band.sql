-- Drop and recreate verification_status table with proper structure
DROP TABLE IF EXISTS public.verification_status;

CREATE TABLE public.verification_status (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_sent_at timestamptz DEFAULT now(),
  verified_at timestamptz,
  verification_token text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.verification_status ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own verification status" ON public.verification_status;
DROP POLICY IF EXISTS "Users can insert own verification status" ON public.verification_status;
DROP POLICY IF EXISTS "Admin has full access to verification status" ON public.verification_status;

-- Create policies for verification_status
CREATE POLICY "Users can view own verification status"
ON public.verification_status
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR 
  (SELECT public.is_admin())
);

CREATE POLICY "Users can insert own verification status"
ON public.verification_status
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id OR 
  (SELECT public.is_admin())
);

CREATE POLICY "Admin has full access to verification status"
ON public.verification_status
FOR ALL
TO authenticated
USING (
  (SELECT public.is_admin())
)
WITH CHECK (
  (SELECT public.is_admin())
);

-- Grant necessary permissions
GRANT ALL ON public.verification_status TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create updated_at trigger for verification_status
CREATE TRIGGER update_verification_status_updated_at
  BEFORE UPDATE ON public.verification_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();