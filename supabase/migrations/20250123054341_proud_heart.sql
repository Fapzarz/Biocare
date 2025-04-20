-- Create admin_actions table to track admin activities
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  points_changed integer,
  details text,
  previous_points integer,
  new_points integer,
  created_at timestamptz DEFAULT now()
);

-- Add new columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ban_expires_at timestamptz,
ADD COLUMN IF NOT EXISTS ban_reason text;

-- Enable RLS
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_actions
CREATE POLICY "Admin can manage actions"
ON admin_actions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND email = 'admin_Kj9#mP2$vL5@biocare.com'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND email = 'admin_Kj9#mP2$vL5@biocare.com'
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_actions_target_user ON admin_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON profiles(is_banned);
CREATE INDEX IF NOT EXISTS idx_profiles_ban_expires_at ON profiles(ban_expires_at);

-- Grant necessary permissions
GRANT ALL ON admin_actions TO authenticated;