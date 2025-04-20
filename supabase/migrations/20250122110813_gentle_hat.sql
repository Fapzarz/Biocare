/*
  # Health Consultation Platform Schema

  1. New Tables
    - `consultations` - For health consultation posts
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `author_id` (uuid, references auth.users)
      - `author_name` (text)
      - `author_type` (text: 'user' or 'doctor')
      - `category` (text)
      - `status` (text: 'open' or 'resolved')
      - `is_private` (boolean)
      - `likes` (integer)
      - `tags` (text[])
      - Timestamps

    - `consultation_responses` - For responses to consultations
      - `id` (uuid, primary key)
      - `consultation_id` (uuid, references consultations)
      - `author_id` (uuid, references auth.users)
      - `author_name` (text)
      - `author_type` (text: 'user' or 'doctor')
      - `content` (text)
      - `is_solution` (boolean)
      - `likes` (integer)
      - Timestamps

  2. Profile Extensions
    - Add doctor-specific fields to profiles
    - Add reputation system fields
    - Add verification status

  3. Security
    - Enable RLS on all tables
    - Create appropriate policies
    - Set up audit logging
*/

-- Create consultations table
CREATE TABLE IF NOT EXISTS public.consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_type text NOT NULL CHECK (author_type IN ('user', 'doctor')),
  category text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  is_private boolean DEFAULT false,
  likes integer DEFAULT 0,
  tags text[] DEFAULT '{}'::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create consultation_responses table
CREATE TABLE IF NOT EXISTS public.consultation_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid REFERENCES consultations(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_type text NOT NULL CHECK (author_type IN ('user', 'doctor')),
  content text NOT NULL,
  is_solution boolean DEFAULT false,
  likes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add new fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_doctor boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS specialization text,
ADD COLUMN IF NOT EXISTS license_number text,
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified')),
ADD COLUMN IF NOT EXISTS reputation_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS helpful_answers integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_consultations integer DEFAULT 0;

-- Enable RLS
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_responses ENABLE ROW LEVEL SECURITY;

-- Policies for consultations
CREATE POLICY "Users can read public consultations"
  ON consultations FOR SELECT
  TO public
  USING (NOT is_private);

CREATE POLICY "Users can read their own private consultations"
  ON consultations FOR SELECT
  TO authenticated
  USING (
    is_private AND (
      author_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND is_doctor = true
        AND verification_status = 'verified'
      )
    )
  );

CREATE POLICY "Users can create consultations"
  ON consultations FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update their own consultations"
  ON consultations FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete their own consultations"
  ON consultations FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- Policies for consultation_responses
CREATE POLICY "Anyone can read responses"
  ON consultation_responses FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM consultations
      WHERE id = consultation_id
      AND (NOT is_private OR author_id = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can create responses"
  ON consultation_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM consultations
      WHERE id = consultation_id
      AND (NOT is_private OR author_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own responses"
  ON consultation_responses FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete their own responses"
  ON consultation_responses FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_consultations_author_id ON consultations(author_id);
CREATE INDEX IF NOT EXISTS idx_consultations_category ON consultations(category);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON consultations(created_at);
CREATE INDEX IF NOT EXISTS idx_consultation_responses_consultation_id ON consultation_responses(consultation_id);
CREATE INDEX IF NOT EXISTS idx_consultation_responses_author_id ON consultation_responses(author_id);

-- Create function to update consultation statistics
CREATE OR REPLACE FUNCTION update_consultation_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles
    SET total_consultations = total_consultations + 1
    WHERE id = NEW.author_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles
    SET total_consultations = total_consultations - 1
    WHERE id = OLD.author_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for consultation statistics
CREATE TRIGGER update_consultation_stats_trigger
  AFTER INSERT OR DELETE ON consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_consultation_stats();

-- Create function to update helpful answers and reputation
CREATE OR REPLACE FUNCTION update_helpful_answer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_solution = true AND (OLD IS NULL OR OLD.is_solution = false) THEN
    UPDATE profiles
    SET 
      helpful_answers = helpful_answers + 1,
      reputation_score = reputation_score + 10
    WHERE id = NEW.author_id;
  ELSIF NEW.is_solution = false AND OLD.is_solution = true THEN
    UPDATE profiles
    SET 
      helpful_answers = helpful_answers - 1,
      reputation_score = reputation_score - 10
    WHERE id = NEW.author_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for helpful answer statistics
CREATE TRIGGER update_helpful_answer_stats_trigger
  AFTER INSERT OR UPDATE ON consultation_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_helpful_answer_stats();

-- Create function to handle likes
CREATE OR REPLACE FUNCTION handle_consultation_like()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.likes > OLD.likes THEN
    UPDATE profiles
    SET reputation_score = reputation_score + 1
    WHERE id = NEW.author_id;
  ELSIF NEW.likes < OLD.likes THEN
    UPDATE profiles
    SET reputation_score = reputation_score - 1
    WHERE id = NEW.author_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for likes
CREATE TRIGGER handle_consultation_like_trigger
  AFTER UPDATE OF likes ON consultations
  FOR EACH ROW
  EXECUTE FUNCTION handle_consultation_like();

CREATE TRIGGER handle_response_like_trigger
  AFTER UPDATE OF likes ON consultation_responses
  FOR EACH ROW
  EXECUTE FUNCTION handle_consultation_like();