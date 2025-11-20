-- Add category enum for blog post classification
CREATE TYPE public.post_category AS ENUM (
  'technical',
  'case-study',
  'installation',
  'maintenance',
  'sustainability',
  'industry-news'
);

-- Add SEO and categorization fields to posts table
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS category public.post_category DEFAULT 'technical',
ADD COLUMN IF NOT EXISTS meta_title VARCHAR(60),
ADD COLUMN IF NOT EXISTS meta_description VARCHAR(160),
ADD COLUMN IF NOT EXISTS keywords TEXT[],
ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER DEFAULT 0;

-- Create function to auto-calculate reading time based on body word count
CREATE OR REPLACE FUNCTION public.calculate_reading_time()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  word_count INTEGER;
  words_per_minute INTEGER := 200;
BEGIN
  -- Count words in body (split by spaces)
  word_count := array_length(regexp_split_to_array(NEW.body, '\s+'), 1);
  NEW.reading_time_minutes := GREATEST(1, CEIL(word_count::FLOAT / words_per_minute));
  RETURN NEW;
END;
$$;

-- Create trigger to auto-calculate reading time on insert/update
DROP TRIGGER IF EXISTS set_reading_time ON public.posts;
CREATE TRIGGER set_reading_time
BEFORE INSERT OR UPDATE OF body ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.calculate_reading_time();

-- Add indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_keywords ON public.posts USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_status_publish ON public.posts(status, publish_at) WHERE status = 'published';

-- Add index for tag searching
CREATE INDEX IF NOT EXISTS idx_posts_tags ON public.posts USING GIN(tags);

COMMENT ON COLUMN public.posts.meta_title IS 'SEO title tag (max 60 chars) for search engines';
COMMENT ON COLUMN public.posts.meta_description IS 'SEO meta description (max 160 chars) for search engine results';
COMMENT ON COLUMN public.posts.keywords IS 'HVAC-R industry keywords for SEO (ar-condicionado, climatização, VRF, etc)';
COMMENT ON COLUMN public.posts.category IS 'Blog post category for filtering and organization';
COMMENT ON COLUMN public.posts.reading_time_minutes IS 'Auto-calculated reading time based on word count';