-- Update blog_posts table structure
ALTER TABLE blog_posts
ALTER COLUMN date TYPE timestamptz USING date::timestamptz;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_date ON blog_posts(date);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author);

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Allow authenticated users to manage blog posts" ON blog_posts;

-- Create more specific policies
CREATE POLICY "Anyone can read blog posts"
ON blog_posts FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can create blog posts"
ON blog_posts FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update their own blog posts"
ON blog_posts FOR UPDATE
TO authenticated
USING (auth.uid() IN (
  SELECT id FROM auth.users WHERE email = 'admin_Kj9#mP2$vL5@biocare.com'
))
WITH CHECK (auth.uid() IN (
  SELECT id FROM auth.users WHERE email = 'admin_Kj9#mP2$vL5@biocare.com'
));

CREATE POLICY "Authenticated users can delete their own blog posts"
ON blog_posts FOR DELETE
TO authenticated
USING (auth.uid() IN (
  SELECT id FROM auth.users WHERE email = 'admin_Kj9#mP2$vL5@biocare.com'
));

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();