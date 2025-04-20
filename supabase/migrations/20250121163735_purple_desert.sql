/*
  # Initial Schema Setup

  1. New Tables
    - `diseases`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `type` (text)
      - `medication` (text)
      - `therapy` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `blog_posts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `excerpt` (text)
      - `image_url` (text)
      - `author` (text)
      - `date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `blog_tags`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)
    
    - `blog_posts_tags`
      - `post_id` (uuid, foreign key)
      - `tag_id` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users and public access where appropriate
*/

-- Create diseases table
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS diseases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    type text NOT NULL CHECK (type IN ('physical', 'mental')),
    medication text NOT NULL,
    therapy text NOT NULL DEFAULT '-',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Create blog_posts table
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS blog_posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    content text NOT NULL,
    excerpt text NOT NULL,
    image_url text NOT NULL,
    author text NOT NULL,
    date date NOT NULL DEFAULT CURRENT_DATE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Create blog_tags table
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS blog_tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Create blog_posts_tags junction table
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS blog_posts_tags (
    post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
    tag_id uuid REFERENCES blog_tags(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (post_id, tag_id)
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Enable Row Level Security
DO $$ BEGIN
  ALTER TABLE diseases ENABLE ROW LEVEL SECURITY;
  ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
  ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
  ALTER TABLE blog_posts_tags ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create policies for diseases
DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow public read access to diseases" ON diseases;
  CREATE POLICY "Allow public read access to diseases" 
    ON diseases FOR SELECT 
    TO public 
    USING (true);

  DROP POLICY IF EXISTS "Allow authenticated users to insert diseases" ON diseases;
  CREATE POLICY "Allow authenticated users to insert diseases" 
    ON diseases FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow authenticated users to update diseases" ON diseases;
  CREATE POLICY "Allow authenticated users to update diseases" 
    ON diseases FOR UPDATE 
    TO authenticated 
    USING (true);

  DROP POLICY IF EXISTS "Allow authenticated users to delete diseases" ON diseases;
  CREATE POLICY "Allow authenticated users to delete diseases" 
    ON diseases FOR DELETE 
    TO authenticated 
    USING (true);
END $$;

-- Create policies for blog_posts
DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow public read access to blog posts" ON blog_posts;
  CREATE POLICY "Allow public read access to blog posts" 
    ON blog_posts FOR SELECT 
    TO public 
    USING (true);

  DROP POLICY IF EXISTS "Allow authenticated users to manage blog posts" ON blog_posts;
  CREATE POLICY "Allow authenticated users to manage blog posts" 
    ON blog_posts FOR ALL 
    TO authenticated 
    USING (true)
    WITH CHECK (true);
END $$;

-- Create policies for blog_tags
DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow public read access to blog tags" ON blog_tags;
  CREATE POLICY "Allow public read access to blog tags" 
    ON blog_tags FOR SELECT 
    TO public 
    USING (true);

  DROP POLICY IF EXISTS "Allow authenticated users to manage blog tags" ON blog_tags;
  CREATE POLICY "Allow authenticated users to manage blog tags" 
    ON blog_tags FOR ALL 
    TO authenticated 
    USING (true)
    WITH CHECK (true);
END $$;

-- Create policies for blog_posts_tags
DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow public read access to blog posts tags" ON blog_posts_tags;
  CREATE POLICY "Allow public read access to blog posts tags" 
    ON blog_posts_tags FOR SELECT 
    TO public 
    USING (true);

  DROP POLICY IF EXISTS "Allow authenticated users to manage blog posts tags" ON blog_posts_tags;
  CREATE POLICY "Allow authenticated users to manage blog posts tags" 
    ON blog_posts_tags FOR ALL 
    TO authenticated 
    USING (true)
    WITH CHECK (true);
END $$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_diseases_updated_at ON diseases;
  CREATE TRIGGER update_diseases_updated_at
    BEFORE UPDATE ON diseases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

  DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
  CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
END $$;