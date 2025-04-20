-- Create comment_likes table
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid REFERENCES consultation_responses(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for comment_likes
CREATE POLICY "Users can view their own likes"
ON comment_likes FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create likes"
ON comment_likes FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own likes"
ON comment_likes FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Grant necessary permissions
GRANT ALL ON comment_likes TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comment_likes_user ON comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON comment_likes(comment_id);

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

-- Create new policies for notifications
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Enable RLS if not already enabled
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON notifications TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Ensure proper permissions on related tables
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- Recreate consultation_responses policies to ensure proper access
DROP POLICY IF EXISTS "Anyone can read responses" ON consultation_responses;
DROP POLICY IF EXISTS "Authenticated users can create responses" ON consultation_responses;
DROP POLICY IF EXISTS "Users can update their own responses" ON consultation_responses;
DROP POLICY IF EXISTS "Users can delete their own responses" ON consultation_responses;

CREATE POLICY "Anyone can read responses"
ON consultation_responses FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can create responses"
ON consultation_responses FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update their own responses"
ON consultation_responses FOR UPDATE
TO authenticated
USING (author_id = auth.uid())
WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete their own responses"
ON consultation_responses FOR DELETE
TO authenticated
USING (author_id = auth.uid());