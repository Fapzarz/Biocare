-- Drop existing policies
DROP POLICY IF EXISTS "Public can view achievements" ON user_achievements;
DROP POLICY IF EXISTS "Authenticated users can manage achievements" ON user_achievements;
DROP POLICY IF EXISTS "System can manage achievements" ON user_achievements;

-- Create new policies with proper access controls
CREATE POLICY "Anyone can view achievements"
ON user_achievements FOR SELECT
TO public
USING (true);

CREATE POLICY "System can insert achievements"
ON user_achievements FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "System can update achievements"
ON user_achievements FOR UPDATE
TO authenticated
WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT ON user_achievements TO public;
GRANT ALL ON user_achievements TO authenticated;

-- Ensure proper permissions for badge relationships
GRANT SELECT ON user_badges TO public;
GRANT SELECT ON user_badges TO authenticated;

-- Create function to calculate achievement progress
CREATE OR REPLACE FUNCTION calculate_achievement_progress(
  p_user_id uuid,
  p_badge_name text,
  OUT current_level integer,
  OUT progress integer,
  OUT next_threshold integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reputation integer;
  v_solutions integer;
  v_responses integer;
BEGIN
  -- Get user stats
  SELECT 
    COALESCE(reputation_score, 0),
    COALESCE(total_solutions, 0),
    COALESCE(total_posts, 0)
  INTO
    v_reputation,
    v_solutions,
    v_responses
  FROM profiles
  WHERE id = p_user_id;

  -- Initialize defaults
  current_level := 0;
  progress := 0;
  next_threshold := 0;

  -- Calculate level and progress based on badge type
  IF p_badge_name = 'Newcomer' THEN
    current_level := 1;
    progress := v_reputation;
    next_threshold := 50;
    
    IF v_reputation >= 50 THEN
      current_level := 2;
      next_threshold := 100;
    END IF;
    
    IF v_reputation >= 100 THEN
      current_level := 3;
      next_threshold := 100;
    END IF;

  ELSIF p_badge_name = 'Helper' THEN
    progress := v_responses;
    next_threshold := 10;
    
    IF v_responses >= 10 THEN
      current_level := 1;
      next_threshold := 50;
    END IF;
    
    IF v_responses >= 50 THEN
      current_level := 2;
      next_threshold := 100;
    END IF;
    
    IF v_responses >= 100 THEN
      current_level := 3;
      next_threshold := 100;
    END IF;

  ELSIF p_badge_name = 'Problem Solver' THEN
    progress := v_solutions;
    next_threshold := 5;
    
    IF v_solutions >= 5 THEN
      current_level := 1;
      next_threshold := 25;
    END IF;
    
    IF v_solutions >= 25 THEN
      current_level := 2;
      next_threshold := 50;
    END IF;
    
    IF v_solutions >= 50 THEN
      current_level := 3;
      next_threshold := 50;
    END IF;

  ELSIF p_badge_name = 'Expert' THEN
    progress := v_reputation;
    next_threshold := 1000;
    
    IF v_reputation >= 1000 THEN
      current_level := 1;
      next_threshold := 5000;
    END IF;
    
    IF v_reputation >= 5000 THEN
      current_level := 2;
      next_threshold := 10000;
    END IF;
    
    IF v_reputation >= 10000 THEN
      current_level := 3;
      next_threshold := 10000;
    END IF;
  END IF;
END;
$$;

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_and_award_achievements(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_badge record;
  v_progress record;
BEGIN
  -- Check each badge
  FOR v_badge IN SELECT * FROM user_badges
  LOOP
    -- Calculate progress
    SELECT 
      current_level,
      progress,
      next_threshold 
    INTO v_progress 
    FROM calculate_achievement_progress(p_user_id, v_badge.name);

    -- Award or update achievement if level > 0
    IF v_progress.current_level > 0 THEN
      INSERT INTO user_achievements (
        user_id,
        badge_id,
        level
      )
      VALUES (
        p_user_id,
        v_badge.id,
        v_progress.current_level
      )
      ON CONFLICT (user_id, badge_id)
      DO UPDATE SET
        level = EXCLUDED.level
      WHERE user_achievements.level < EXCLUDED.level;
    END IF;
  END LOOP;
END;
$$;

-- Create trigger for achievement checks
CREATE OR REPLACE FUNCTION trigger_check_achievements()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM check_and_award_achievements(NEW.id);
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS check_achievements_on_update ON profiles;

-- Create new trigger
CREATE TRIGGER check_achievements_on_update
  AFTER UPDATE OF reputation_score, total_solutions, total_posts ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_achievements();

-- Recalculate achievements for all users
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  FOR v_user_id IN SELECT id FROM profiles
  LOOP
    PERFORM check_and_award_achievements(v_user_id);
  END LOOP;
END $$;