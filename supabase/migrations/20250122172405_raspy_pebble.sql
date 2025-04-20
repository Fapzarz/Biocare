/*
  # Fix Profile and Achievements Schema

  1. Changes
    - Add foreign key relationship between profiles and user_achievements
    - Update profile queries to use proper joins
    - Add missing indexes for better performance

  2. Security
    - Maintain existing RLS policies
    - Add new policies for achievements
*/

-- Drop existing materialized view if exists to avoid conflicts
DROP MATERIALIZED VIEW IF EXISTS public.user_statistics;

-- Recreate user_achievements table with proper foreign key
DROP TABLE IF EXISTS public.user_achievements CASCADE;
CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES user_badges(id) ON DELETE CASCADE,
  level integer DEFAULT 1,
  awarded_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_badge_id ON user_achievements(badge_id);

-- Enable RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for user_achievements
CREATE POLICY "Users can view their own achievements"
ON user_achievements FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND email = 'admin_Kj9#mP2$vL5@biocare.com'
  )
);

CREATE POLICY "System can manage achievements"
ON user_achievements FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND email = 'admin_Kj9#mP2$vL5@biocare.com'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND email = 'admin_Kj9#mP2$vL5@biocare.com'
  )
);

-- Recreate materialized view with proper joins
CREATE MATERIALIZED VIEW public.user_statistics AS
SELECT 
  p.id,
  p.full_name,
  p.is_doctor,
  p.verification_status,
  COUNT(DISTINCT c.id) as total_consultations,
  COUNT(DISTINCT CASE WHEN c.status = 'resolved' THEN c.id END) as resolved_consultations,
  COUNT(DISTINCT cr.id) as total_responses,
  COUNT(DISTINCT CASE WHEN cr.is_solution THEN cr.id END) as solutions_provided,
  COALESCE(SUM(c.likes), 0) + COALESCE(SUM(cr.likes), 0) as total_likes,
  p.reputation_score
FROM profiles p
LEFT JOIN consultations c ON c.author_id = p.id
LEFT JOIN consultation_responses cr ON cr.author_id = p.id
GROUP BY p.id, p.full_name, p.is_doctor, p.verification_status, p.reputation_score;

-- Create unique index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_statistics_id ON public.user_statistics(id);

-- Grant necessary permissions
GRANT SELECT ON public.user_statistics TO authenticated;
GRANT SELECT ON public.user_statistics TO anon;
GRANT ALL ON public.user_achievements TO authenticated;

-- Function to refresh statistics
CREATE OR REPLACE FUNCTION public.refresh_user_statistics()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.user_statistics LIMIT 1) THEN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_statistics;
  ELSE
    REFRESH MATERIALIZED VIEW public.user_statistics;
  END IF;
  RETURN NULL;
END;
$$;