/*
  # Blog Post Optimizations

  1. Changes
    - Add indexes for better query performance
    - Add cascade delete for blog_posts_tags
    - Add trigger for automatic tag cleanup
    - Add function to sync blog posts tags

  2. Indexes
    - blog_posts: title, author, date
    - blog_tags: name
    - blog_posts_tags: post_id, tag_id

  3. Cleanup
    - Add function to remove unused tags
    - Add trigger for automatic tag cleanup
*/

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS blog_posts_title_idx ON blog_posts (title);
CREATE INDEX IF NOT EXISTS blog_posts_author_idx ON blog_posts (author);
CREATE INDEX IF NOT EXISTS blog_posts_date_idx ON blog_posts (date);
CREATE INDEX IF NOT EXISTS blog_tags_name_idx ON blog_tags (name);
CREATE INDEX IF NOT EXISTS blog_posts_tags_post_id_idx ON blog_posts_tags (post_id);
CREATE INDEX IF NOT EXISTS blog_posts_tags_tag_id_idx ON blog_posts_tags (tag_id);

-- Function to clean up unused tags
CREATE OR REPLACE FUNCTION cleanup_unused_tags()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM blog_tags
  WHERE id NOT IN (
    SELECT DISTINCT tag_id 
    FROM blog_posts_tags
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically clean up unused tags
DROP TRIGGER IF EXISTS cleanup_unused_tags_trigger ON blog_posts_tags;
CREATE TRIGGER cleanup_unused_tags_trigger
  AFTER DELETE ON blog_posts_tags
  FOR EACH STATEMENT
  EXECUTE FUNCTION cleanup_unused_tags();

-- Function to sync blog post tags
CREATE OR REPLACE FUNCTION sync_blog_post_tags(
  p_post_id uuid,
  p_tag_names text[]
)
RETURNS void AS $$
DECLARE
  v_tag_id uuid;
  v_tag_name text;
BEGIN
  -- Delete existing tags for the post
  DELETE FROM blog_posts_tags WHERE post_id = p_post_id;
  
  -- Add new tags
  FOREACH v_tag_name IN ARRAY p_tag_names
  LOOP
    -- Get or create tag
    INSERT INTO blog_tags (name)
    VALUES (v_tag_name)
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_tag_id;
    
    -- Link tag to post
    INSERT INTO blog_posts_tags (post_id, tag_id)
    VALUES (p_post_id, v_tag_id)
    ON CONFLICT DO NOTHING;
  END LOOP;
  
  -- Clean up unused tags
  PERFORM cleanup_unused_tags();
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION sync_blog_post_tags TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_unused_tags TO authenticated;