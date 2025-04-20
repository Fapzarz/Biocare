/*
  # Fix Materialized View for User Statistics

  1. Changes
    - Drop existing triggers and view safely
    - Recreate materialized view with proper permissions
    - Set up refresh mechanism
    
  2. Security
    - Proper permission grants
    - Security definer context for refresh function
*/

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS refresh_stats_on_consultation_change ON consultations;
DROP TRIGGER IF EXISTS refresh_stats_on_response_change ON consultation_responses;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.refresh_user_statistics();

-- Drop existing materialized view with CASCADE to handle dependencies
DROP MATERIALIZED VIEW IF EXISTS public.user_statistics CASCADE;

-- Create materialized view with proper ownership
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
GROUP BY p.id, p.full_name, p.is_doctor, p.verification_status, p.reputation_score
WITH NO DATA;

-- Create index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_statistics_id ON public.user_statistics(id);

-- Grant necessary permissions
GRANT SELECT ON public.user_statistics TO authenticated;
GRANT SELECT ON public.user_statistics TO anon;

-- Create function to refresh statistics with proper security context
CREATE OR REPLACE FUNCTION public.refresh_user_statistics()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- First refresh populates the view, subsequent refreshes can use CONCURRENTLY
  IF EXISTS (SELECT 1 FROM public.user_statistics LIMIT 1) THEN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_statistics;
  ELSE
    REFRESH MATERIALIZED VIEW public.user_statistics;
  END IF;
  RETURN NULL;
END;
$$;

-- Grant execute permission on the refresh function
GRANT EXECUTE ON FUNCTION public.refresh_user_statistics() TO authenticated;

-- Create triggers for automatic refresh
CREATE TRIGGER refresh_stats_on_consultation_change_new
  AFTER INSERT OR UPDATE OR DELETE ON consultations
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.refresh_user_statistics();

CREATE TRIGGER refresh_stats_on_response_change_new
  AFTER INSERT OR UPDATE OR DELETE ON consultation_responses
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.refresh_user_statistics();

-- Initial refresh
REFRESH MATERIALIZED VIEW public.user_statistics;