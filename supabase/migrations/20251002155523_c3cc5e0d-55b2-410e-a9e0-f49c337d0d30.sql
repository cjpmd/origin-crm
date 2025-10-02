
-- Drop the problematic index on avatar_url
-- This index is not needed for performance and causes issues with long URLs
DROP INDEX IF EXISTS public.idx_profiles_avatar;
