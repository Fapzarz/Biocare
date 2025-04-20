-- Create posts table for health consultations
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_type text NOT NULL CHECK (author_type IN ('user', 'doctor')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  category text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  likes integer DEFAULT 0,
  is_private boolean DEFAULT false,
  tags text[] DEFAULT '{}'::text[]
);

-- Create comments table for responses
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_type text NOT NULL CHECK (author_type IN ('user', 'doctor')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_solution boolean DEFAULT false,
  likes integer DEFAULT 0
);

-- Extend profiles table with additional fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS specialization text,
ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS reputation integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_posts integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_solutions integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS badges text[] DEFAULT '{}'::text[];

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policies for posts
CREATE POLICY "Users can read public posts"
  ON posts FOR SELECT
  TO public
  USING (NOT is_private);

CREATE POLICY "Users can read their own private posts"
  ON posts FOR SELECT
  TO authenticated
  USING (
    is_private AND (
      author_id = auth.uid() OR
      auth.uid() IN (
        SELECT id FROM auth.users 
        WHERE email = 'admin_Kj9#mP2$vL5@biocare.com'
      )
    )
  );

CREATE POLICY "Users can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update their own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- Policies for comments
CREATE POLICY "Anyone can read comments"
  ON comments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);

-- Create function to update post statistics
CREATE OR REPLACE FUNCTION update_post_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user's total posts
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles
    SET total_posts = total_posts + 1
    WHERE id = NEW.author_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles
    SET total_posts = total_posts - 1
    WHERE id = OLD.author_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for post statistics
CREATE TRIGGER update_post_stats_trigger
  AFTER INSERT OR DELETE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_post_stats();

-- Create function to update solution statistics
CREATE OR REPLACE FUNCTION update_solution_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_solution = true AND (OLD IS NULL OR OLD.is_solution = false) THEN
    UPDATE profiles
    SET total_solutions = total_solutions + 1
    WHERE id = NEW.author_id;
  ELSIF NEW.is_solution = false AND OLD.is_solution = true THEN
    UPDATE profiles
    SET total_solutions = total_solutions - 1
    WHERE id = NEW.author_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for solution statistics
CREATE TRIGGER update_solution_stats_trigger
  AFTER INSERT OR UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_solution_stats();