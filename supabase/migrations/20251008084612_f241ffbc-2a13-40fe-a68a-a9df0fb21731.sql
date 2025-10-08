-- Fix team_members RLS to avoid recursion
-- Drop existing policies
DROP POLICY IF EXISTS "View team members from same company" ON team_members;
DROP POLICY IF EXISTS "Owner can insert team members" ON team_members;
DROP POLICY IF EXISTS "Owner can update team members" ON team_members;
DROP POLICY IF EXISTS "Owner can delete team members" ON team_members;

-- Create a function to get the company owner without triggering RLS
CREATE OR REPLACE FUNCTION public.get_team_owner_for_user(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT invited_by FROM team_members WHERE user_id = _user_id LIMIT 1;
$$;

-- Simple policies using the security definer function
CREATE POLICY "View team members" ON team_members
  FOR SELECT USING (
    -- User is the owner (invited_by matches their user_id)
    auth.uid() = invited_by
    -- OR user is a team member with the same owner
    OR public.get_team_owner_for_user(auth.uid()) = invited_by
    -- OR it's their own record
    OR auth.uid() = user_id
  );

CREATE POLICY "Owner can insert" ON team_members
  FOR INSERT WITH CHECK (auth.uid() = invited_by);

CREATE POLICY "Owner can update" ON team_members
  FOR UPDATE USING (auth.uid() = invited_by);

CREATE POLICY "Owner can delete" ON team_members
  FOR DELETE USING (auth.uid() = invited_by);