-- Add level column to user_achievements
ALTER TABLE user_achievements 
ADD COLUMN IF NOT EXISTS level integer DEFAULT 1;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_badge 
ON user_achievements(user_id, badge_id);

-- Recreate function to handle badge awards with levels
CREATE OR REPLACE FUNCTION award_badge(
  p_user_id uuid,
  p_badge_id uuid,
  p_level integer DEFAULT 1
)
RETURNS void AS $$
BEGIN
  INSERT INTO user_achievements (user_id, badge_id, level)
  VALUES (p_user_id, p_badge_id, p_level)
  ON CONFLICT (user_id, badge_id) 
  DO UPDATE SET 
    level = EXCLUDED.level
  WHERE user_achievements.level < EXCLUDED.level;

  -- Create notification for new badge
  INSERT INTO notifications (
    user_id,
    type,
    title,
    content
  ) 
  SELECT
    p_user_id,
    'achievement_earned',
    'New Badge Level Earned!',
    'Congratulations! You''ve earned ' || name || ' badge level ' || p_level || '!'
  FROM user_badges
  WHERE id = p_badge_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check and award badges based on reputation
CREATE OR REPLACE FUNCTION check_and_award_badges()
RETURNS trigger AS $$
BEGIN
  -- Newcomer Badge (Level 1)
  IF NEW.reputation_score >= 0 THEN
    PERFORM award_badge(NEW.id, (SELECT id FROM user_badges WHERE name = 'Newcomer'), 1);
  END IF;

  -- Helper Badge (Levels 1-3)
  IF NEW.reputation_score >= 100 THEN
    PERFORM award_badge(NEW.id, (SELECT id FROM user_badges WHERE name = 'Helper'), 1);
  END IF;
  IF NEW.reputation_score >= 500 THEN
    PERFORM award_badge(NEW.id, (SELECT id FROM user_badges WHERE name = 'Helper'), 2);
  END IF;
  IF NEW.reputation_score >= 1000 THEN
    PERFORM award_badge(NEW.id, (SELECT id FROM user_badges WHERE name = 'Helper'), 3);
  END IF;

  -- Problem Solver Badge (Levels 1-3)
  IF NEW.helpful_answers >= 5 THEN
    PERFORM award_badge(NEW.id, (SELECT id FROM user_badges WHERE name = 'Problem Solver'), 1);
  END IF;
  IF NEW.helpful_answers >= 25 THEN
    PERFORM award_badge(NEW.id, (SELECT id FROM user_badges WHERE name = 'Problem Solver'), 2);
  END IF;
  IF NEW.helpful_answers >= 50 THEN
    PERFORM award_badge(NEW.id, (SELECT id FROM user_badges WHERE name = 'Problem Solver'), 3);
  END IF;

  -- Expert Badge (Levels 1-3)
  IF NEW.reputation_score >= 1000 THEN
    PERFORM award_badge(NEW.id, (SELECT id FROM user_badges WHERE name = 'Expert'), 1);
  END IF;
  IF NEW.reputation_score >= 5000 THEN
    PERFORM award_badge(NEW.id, (SELECT id FROM user_badges WHERE name = 'Expert'), 2);
  END IF;
  IF NEW.reputation_score >= 10000 THEN
    PERFORM award_badge(NEW.id, (SELECT id FROM user_badges WHERE name = 'Expert'), 3);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for badge checking
DROP TRIGGER IF EXISTS check_badges_trigger ON profiles;
CREATE TRIGGER check_badges_trigger
  AFTER UPDATE OF reputation_score, helpful_answers ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_and_award_badges();

-- Award initial badges to all users
DO $$ 
DECLARE 
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM profiles LOOP
    PERFORM award_badge(
      user_record.id, 
      (SELECT id FROM user_badges WHERE name = 'Newcomer'),
      1
    );
  END LOOP;
END $$;