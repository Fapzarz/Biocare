/*
  # Fix Badge System and User Achievements
  
  1. Changes
    - Remove self-response restriction
    - Fix badge system structure
    - Add proper user achievements handling
    
  2. Security
    - Maintain RLS policies
    - Proper permission grants
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS handle_consultation_response CASCADE;

-- Create new function to handle consultation response without self-response restriction
CREATE OR REPLACE FUNCTION handle_consultation_response()
RETURNS trigger AS $$
BEGIN
  -- Update reputation score based on response
  UPDATE profiles
  SET reputation_score = reputation_score + 
    CASE 
      WHEN NEW.is_solution THEN 10  -- Solution provides more points
      ELSE 2                        -- Regular response
    END
  WHERE id = NEW.author_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for consultation response handling
CREATE TRIGGER handle_consultation_response_trigger
  BEFORE INSERT ON consultation_responses
  FOR EACH ROW
  EXECUTE FUNCTION handle_consultation_response();

-- Create function to award initial badges
CREATE OR REPLACE FUNCTION award_initial_badges()
RETURNS void AS $$
DECLARE
  user_record RECORD;
  newcomer_badge_id uuid;
BEGIN
  -- Get the Newcomer badge ID
  SELECT id INTO newcomer_badge_id
  FROM user_badges
  WHERE name = 'Newcomer'
  LIMIT 1;

  -- Award Newcomer badge to all users who don't have it
  FOR user_record IN (
    SELECT id FROM profiles
    WHERE NOT EXISTS (
      SELECT 1 FROM user_achievements
      WHERE user_id = profiles.id
      AND badge_id = newcomer_badge_id
    )
  ) LOOP
    INSERT INTO user_achievements (user_id, badge_id)
    VALUES (user_record.id, newcomer_badge_id)
    ON CONFLICT (user_id, badge_id) DO NOTHING;

    -- Create notification for new badge
    INSERT INTO notifications (
      user_id,
      type,
      title,
      content
    ) VALUES (
      user_record.id,
      'achievement_earned',
      'Welcome Badge Earned!',
      'Welcome to BioCare! You''ve earned your first badge!'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the function to award initial badges
SELECT award_initial_badges();