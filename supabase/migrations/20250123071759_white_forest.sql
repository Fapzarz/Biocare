-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS calculate_achievement_progress CASCADE;
DROP FUNCTION IF EXISTS check_and_award_achievements CASCADE;
DROP FUNCTION IF EXISTS trigger_check_achievements CASCADE;

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
    -- Level 1: 0 points, Level 2: 50 points, Level 3: 100 points
    IF v_reputation >= 100 THEN
      current_level := 3;
      progress := v_reputation;
      next_threshold := 100;
    ELSIF v_reputation >= 50 THEN
      current_level := 2;
      progress := v_reputation;
      next_threshold := 100;
    ELSE
      current_level := 1;
      progress := v_reputation;
      next_threshold := 50;
    END IF;

  ELSIF p_badge_name = 'Helper' THEN
    -- Level 1: 10 responses, Level 2: 50 responses, Level 3: 100 responses
    IF v_responses >= 100 THEN
      current_level := 3;
      progress := v_responses;
      next_threshold := 100;
    ELSIF v_responses >= 50 THEN
      current_level := 2;
      progress := v_responses;
      next_threshold := 100;
    ELSIF v_responses >= 10 THEN
      current_level := 1;
      progress := v_responses;
      next_threshold := 50;
    ELSE
      current_level := 0;
      progress := v_responses;
      next_threshold := 10;
    END IF;

  ELSIF p_badge_name = 'Problem Solver' THEN
    -- Level 1: 5 solutions, Level 2: 25 solutions, Level 3: 50 solutions
    IF v_solutions >= 50 THEN
      current_level := 3;
      progress := v_solutions;
      next_threshold := 50;
    ELSIF v_solutions >= 25 THEN
      current_level := 2;
      progress := v_solutions;
      next_threshold := 50;
    ELSIF v_solutions >= 5 THEN
      current_level := 1;
      progress := v_solutions;
      next_threshold := 25;
    ELSE
      current_level := 0;
      progress := v_solutions;
      next_threshold := 5;
    END IF;

  ELSIF p_badge_name = 'Expert' THEN
    -- Level 1: 1000 points, Level 2: 5000 points, Level 3: 10000 points
    IF v_reputation >= 10000 THEN
      current_level := 3;
      progress := v_reputation;
      next_threshold := 10000;
    ELSIF v_reputation >= 5000 THEN
      current_level := 2;
      progress := v_reputation;
      next_threshold := 10000;
    ELSIF v_reputation >= 1000 THEN
      current_level := 1;
      progress := v_reputation;
      next_threshold := 5000;
    ELSE
      current_level := 0;
      progress := v_reputation;
      next_threshold := 1000;
    END IF;

  ELSE
    -- Default case for unknown badge types
    current_level := 0;
    progress := 0;
    next_threshold := 0;
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
    SELECT * INTO v_progress 
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

-- Create trigger function for achievement checks
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

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION calculate_achievement_progress TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_award_achievements TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_check_achievements TO authenticated;

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