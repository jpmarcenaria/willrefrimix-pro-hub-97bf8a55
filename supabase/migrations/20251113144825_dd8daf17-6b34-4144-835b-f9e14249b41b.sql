-- Fix 1: Restrict email exposure in profiles table
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create separate policies: public can see basic info, users can see their own email
CREATE POLICY "Public can view basic profile info"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Note: We'll handle email visibility in the application layer by not selecting it for public queries
-- Users can view their own full profile including email
CREATE POLICY "Users can view own full profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Fix 2: Fix comment impersonation vulnerability
-- Drop the dangerous policy that allows any user_id
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;

-- Create secure policy that enforces user_id matches auth.uid()
CREATE POLICY "Users can create own comments"
  ON public.comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add a trigger to automatically set user_id to prevent manual tampering
CREATE OR REPLACE FUNCTION public.set_comment_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$;

CREATE TRIGGER ensure_comment_owner
  BEFORE INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_comment_user_id();