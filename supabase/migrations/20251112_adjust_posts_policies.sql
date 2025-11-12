-- Adjust RLS policies on public.posts to allow authorship-based CRUD
-- Context: current policies require 'editor' role for INSERT/UPDATE,
-- which blocks authenticated users without roles and causes
-- "violates row-level security policy" on draft creation.

-- Drop role-gated policies for posts
DROP POLICY IF EXISTS "Editors can create posts" ON public.posts;
DROP POLICY IF EXISTS "Editors can update posts" ON public.posts;

-- Keep admin-only delete, but also allow authors to delete their own
DROP POLICY IF EXISTS "Admins can delete posts" ON public.posts;

-- Create ownership-based policies
CREATE POLICY "Authors can insert own posts"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can update own posts"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Authors or admins can delete posts"
  ON public.posts FOR DELETE
  TO authenticated
  USING (author_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Broaden SELECT so authors can read drafts; keep published visibility
DROP POLICY IF EXISTS "Published posts are viewable by everyone" ON public.posts;

CREATE POLICY "Posts visible when published or by author/editor"
  ON public.posts FOR SELECT
  USING (
    (status = 'published' AND (publish_at IS NULL OR publish_at <= now()))
    OR author_id = auth.uid()
    OR public.can_edit_content(auth.uid())
  );

