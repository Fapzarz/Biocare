-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own achievements" ON user_achievements;
DROP POLICY IF EXISTS "System can manage achievements" ON user_achievements;

-- Create new policies with proper checks
CREATE POLICY "Anyone can view achievements"
ON user_achievements FOR SELECT
TO public
USING (true);

CREATE POLICY "System can manage achievements"
ON user_achievements FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update own achievements"
ON user_achievements FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own achievements"
ON user_achievements FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Grant necessary permissions
GRANT ALL ON user_achievements TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;