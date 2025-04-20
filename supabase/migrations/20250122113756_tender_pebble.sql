-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view achievements" ON user_achievements;
DROP POLICY IF EXISTS "System can manage achievements" ON user_achievements;

-- Create new policies for user_achievements
CREATE POLICY "Users can view achievements"
ON user_achievements FOR SELECT
TO public
USING (true);

CREATE POLICY "System can manage achievements"
ON user_achievements FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Enable RLS if not already enabled
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON user_achievements TO authenticated;

-- Ensure proper permissions on related tables
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Ensure RLS is enabled on consultation_responses
ALTER TABLE consultation_responses ENABLE ROW LEVEL SECURITY;

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