/*
  # Remove Blog Features

  This migration safely removes blog-related tables and their dependencies,
  using defensive programming to avoid errors if objects don't exist.
*/

DO $$ 
BEGIN
  -- Drop blog-related tables if they exist
  DROP TABLE IF EXISTS public.blog_posts_tags CASCADE;
  DROP TABLE IF EXISTS public.blog_tags CASCADE;
  DROP TABLE IF EXISTS public.blog_posts CASCADE;

  -- Drop blog-related functions and triggers
  -- We wrap each in its own block to continue if one fails
  BEGIN
    DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
  EXCEPTION WHEN OTHERS THEN
    -- Do nothing, trigger doesn't exist
  END;

  -- Drop policies if they exist
  BEGIN
    DROP POLICY IF EXISTS "Anyone can read blog posts" ON public.blog_posts;
  EXCEPTION WHEN OTHERS THEN
    -- Do nothing, policy doesn't exist
  END;

  BEGIN
    DROP POLICY IF EXISTS "Authenticated users can create blog posts" ON public.blog_posts;
  EXCEPTION WHEN OTHERS THEN
    -- Do nothing, policy doesn't exist
  END;

  BEGIN
    DROP POLICY IF EXISTS "Authenticated users can update their own blog posts" ON public.blog_posts;
  EXCEPTION WHEN OTHERS THEN
    -- Do nothing, policy doesn't exist
  END;

  BEGIN
    DROP POLICY IF EXISTS "Authenticated users can delete their own blog posts" ON public.blog_posts;
  EXCEPTION WHEN OTHERS THEN
    -- Do nothing, policy doesn't exist
  END;

  -- Drop indexes if they exist
  BEGIN
    DROP INDEX IF EXISTS public.idx_blog_posts_date;
  EXCEPTION WHEN OTHERS THEN
    -- Do nothing, index doesn't exist
  END;

  BEGIN
    DROP INDEX IF EXISTS public.idx_blog_posts_author;
  EXCEPTION WHEN OTHERS THEN
    -- Do nothing, index doesn't exist
  END;

  BEGIN
    DROP INDEX IF EXISTS public.blog_posts_title_idx;
  EXCEPTION WHEN OTHERS THEN
    -- Do nothing, index doesn't exist
  END;

  BEGIN
    DROP INDEX IF EXISTS public.blog_posts_author_idx;
  EXCEPTION WHEN OTHERS THEN
    -- Do nothing, index doesn't exist
  END;

  BEGIN
    DROP INDEX IF EXISTS public.blog_posts_date_idx;
  EXCEPTION WHEN OTHERS THEN
    -- Do nothing, index doesn't exist
  END;

  BEGIN
    DROP INDEX IF EXISTS public.blog_tags_name_idx;
  EXCEPTION WHEN OTHERS THEN
    -- Do nothing, index doesn't exist
  END;

  BEGIN
    DROP INDEX IF EXISTS public.blog_posts_tags_post_id_idx;
  EXCEPTION WHEN OTHERS THEN
    -- Do nothing, index doesn't exist
  END;

  BEGIN
    DROP INDEX IF EXISTS public.blog_posts_tags_tag_id_idx;
  EXCEPTION WHEN OTHERS THEN
    -- Do nothing, index doesn't exist
  END;

END $$;