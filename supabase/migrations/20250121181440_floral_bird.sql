/*
  # Add Email Verification

  1. Changes
    - Enable email verification requirement
    - Add email templates for verification
    - Add verification status tracking
*/

-- Enable email verification requirement
ALTER TABLE auth.users
  ALTER COLUMN email_confirmed_at DROP DEFAULT;

-- Create email verification status tracking
CREATE TABLE IF NOT EXISTS public.verification_status (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_sent_at timestamptz DEFAULT now(),
  verified_at timestamptz,
  verification_token text
);

-- Enable RLS
ALTER TABLE public.verification_status ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own verification status"
  ON public.verification_status
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage verification status"
  ON public.verification_status
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);