-- Drop existing table and related objects
DROP TABLE IF EXISTS public.post_likes CASCADE;
DROP FUNCTION IF EXISTS handle_post_like CASCADE;

-- Create post_likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES consultations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for post_likes
CREATE POLICY "Anyone can view likes"
ON post_likes FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can create likes"
ON post_likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own likes"
ON post_likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);

-- Create function to handle post likes
CREATE OR REPLACE FUNCTION handle_post_like()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment likes count
    UPDATE consultations
    SET likes = COALESCE(likes, 0) + 1
    WHERE id = NEW.post_id;
    
    -- Update author's reputation
    UPDATE profiles
    SET reputation_score = COALESCE(reputation_score, 0) + 1
    WHERE id = (
      SELECT author_id 
      FROM consultations 
      WHERE id = NEW.post_id
    );

    -- Create notification for post author
    INSERT INTO notifications (
      user_id,
      type,
      title,
      content,
      link
    )
    SELECT
      author_id,
      'new_like',
      'New Like on Your Post',
      'Someone liked your post: ' || SUBSTRING(title FROM 1 FOR 50) || '...',
      '/post/' || NEW.post_id
    FROM consultations
    WHERE id = NEW.post_id
    AND author_id != NEW.user_id;

  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement likes count
    UPDATE consultations
    SET likes = GREATEST(0, COALESCE(likes, 0) - 1)
    WHERE id = OLD.post_id;
    
    -- Update author's reputation
    UPDATE profiles
    SET reputation_score = GREATEST(0, COALESCE(reputation_score, 0) - 1)
    WHERE id = (
      SELECT author_id 
      FROM consultations 
      WHERE id = OLD.post_id
    );
  END IF;
  
  -- Check achievements after reputation change
  PERFORM check_and_award_achievements(
    CASE TG_OP
      WHEN 'INSERT' THEN (SELECT author_id FROM consultations WHERE id = NEW.post_id)
      WHEN 'DELETE' THEN (SELECT author_id FROM consultations WHERE id = OLD.post_id)
    END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for post likes
CREATE TRIGGER post_like_trigger
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION handle_post_like();

-- Grant necessary permissions
GRANT ALL ON post_likes TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Recreate likes count for existing posts
UPDATE consultations c
SET likes = COALESCE(
  (SELECT COUNT(*) FROM post_likes WHERE post_id = c.id),
  0
);