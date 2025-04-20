-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view achievements" ON user_achievements;
DROP POLICY IF EXISTS "System can manage achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can update own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can delete own achievements" ON user_achievements;

-- Recreate user_achievements table with proper structure
DROP TABLE IF EXISTS user_achievements CASCADE;
CREATE TABLE user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES user_badges(id) ON DELETE CASCADE,
  level integer DEFAULT 1,
  awarded_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_badge ON user_achievements(user_id, badge_id);

-- Enable RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for user_achievements
CREATE POLICY "Public can view achievements"
ON user_achievements FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can manage achievements"
ON user_achievements FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON user_achievements TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create function to handle achievement awards
CREATE OR REPLACE FUNCTION handle_achievement_award()
RETURNS trigger AS $$
BEGIN
  -- Create notification for new achievement
  INSERT INTO notifications (
    user_id,
    type,
    title,
    content
  )
  SELECT
    NEW.user_id,
    'achievement_earned',
    'New Achievement Unlocked!',
    CASE 
      WHEN NEW.level = 1 THEN 'You''ve earned the ' || b.name || ' badge!'
      ELSE 'You''ve reached level ' || NEW.level || ' of the ' || b.name || ' badge!'
    END
  FROM user_badges b
  WHERE b.id = NEW.badge_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for achievement notifications
CREATE TRIGGER achievement_notification_trigger
  AFTER INSERT OR UPDATE ON user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION handle_achievement_award();