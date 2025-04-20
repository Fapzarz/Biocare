-- Drop existing problematic policies
DROP POLICY IF EXISTS "Anyone can view achievements" ON user_achievements;
DROP POLICY IF EXISTS "System can insert achievements" ON user_achievements;
DROP POLICY IF EXISTS "System can update achievements" ON user_achievements;

-- Create new policies with proper access controls
CREATE POLICY "Public read access"
ON user_achievements FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can manage achievements"
ON user_achievements FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Ensure proper permissions
GRANT ALL ON user_achievements TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Update comment_likes policies
DROP POLICY IF EXISTS "Users can view their own likes" ON comment_likes;
DROP POLICY IF EXISTS "Users can create likes" ON comment_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON comment_likes;

CREATE POLICY "Anyone can view likes"
ON comment_likes FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can manage likes"
ON comment_likes FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON comment_likes TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;