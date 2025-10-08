-- Drop the problematic policy
DROP POLICY IF EXISTS "View team members" ON team_members;

-- Create a security definer function to get the invited_by for the current user
CREATE OR REPLACE FUNCTION public.get_my_team_owner()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT invited_by FROM team_members WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Create a simple, non-recursive policy
CREATE POLICY "View team members" ON team_members
  FOR SELECT USING (
    -- Owner can see all team members they invited
    auth.uid() = invited_by
    -- OR team member can see others with the same owner
    OR invited_by = public.get_my_team_owner()
  );