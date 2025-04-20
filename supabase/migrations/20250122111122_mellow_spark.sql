/*
  # Enhance Consultation System

  This migration adds additional features to the consultation system:
  
  1. New Features
    - Doctor verification requests
    - User badges and achievements
    - Consultation categories
    - Notification system
  
  2. Security
    - Additional RLS policies
    - Doctor verification checks
  
  3. Performance
    - Additional indexes
    - Materialized views for statistics
*/

-- Create doctor verification requests table
CREATE TABLE IF NOT EXISTS public.doctor_verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  license_number text NOT NULL,
  license_document_url text NOT NULL,
  specialization text NOT NULL,
  hospital_name text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  submitted_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  processed_by uuid REFERENCES auth.users(id)
);

-- Create user badges table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  icon_name text NOT NULL,
  required_score integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id uuid REFERENCES user_badges(id) ON DELETE CASCADE,
  awarded_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

-- Create consultation categories table
CREATE TABLE IF NOT EXISTS public.consultation_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  icon_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('new_response', 'solution_marked', 'verification_status', 'achievement_earned')),
  title text NOT NULL,
  content text NOT NULL,
  link text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE doctor_verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies for doctor verification requests
CREATE POLICY "Doctors can view their own verification requests"
  ON doctor_verification_requests FOR SELECT
  TO authenticated
  USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can create verification requests"
  ON doctor_verification_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    doctor_id = auth.uid() AND
    NOT EXISTS (
      SELECT 1 FROM doctor_verification_requests
      WHERE doctor_id = auth.uid() AND status = 'pending'
    )
  );

-- Policies for user badges and achievements
CREATE POLICY "Anyone can view badges"
  ON user_badges FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policies for consultation categories
CREATE POLICY "Anyone can view categories"
  ON consultation_categories FOR SELECT
  TO public
  USING (true);

-- Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_doctor_verification_requests_status ON doctor_verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Create materialized view for user statistics
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

-- Create function to refresh statistics
CREATE OR REPLACE FUNCTION refresh_user_statistics()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_statistics;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to refresh statistics
CREATE TRIGGER refresh_stats_on_consultation_change
  AFTER INSERT OR UPDATE OR DELETE ON consultations
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_user_statistics();

CREATE TRIGGER refresh_stats_on_response_change
  AFTER INSERT OR UPDATE OR DELETE ON consultation_responses
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_user_statistics();

-- Insert default badges
INSERT INTO user_badges (name, description, icon_name, required_score) VALUES
('Newcomer', 'Posted first consultation', 'Star', 0),
('Helper', 'Provided 10 helpful responses', 'Heart', 100),
('Problem Solver', 'Had 5 responses marked as solutions', 'CheckCircle', 200),
('Expert', 'Achieved 1000 reputation points', 'Award', 1000),
('Top Contributor', 'Provided 100 helpful responses', 'Trophy', 2000);

-- Insert default categories
INSERT INTO consultation_categories (name, description, icon_name) VALUES
('General Health', 'General health questions and concerns', 'Heart'),
('Mental Health', 'Mental health and well-being', 'Brain'),
('Chronic Conditions', 'Long-term health conditions', 'Activity'),
('Emergency', 'Urgent medical concerns', 'AlertTriangle'),
('Lifestyle', 'Diet, exercise, and wellness', 'Leaf'),
('Pediatrics', 'Child health and development', 'Baby'),
('Womens Health', 'Female health and wellness', 'Female'),
('Mens Health', 'Male health and wellness', 'Male'),
('Dental', 'Oral health and dental care', 'Tooth'),
('Eye Care', 'Vision and eye health', 'Eye');