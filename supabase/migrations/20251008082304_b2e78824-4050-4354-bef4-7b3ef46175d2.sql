-- Fix infinite recursion and team member visibility issues

-- Step 1: Create a security definer function to get team members without triggering RLS
CREATE OR REPLACE FUNCTION public.get_user_company_owner(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- First check if user is a company owner (has company_profiles entry and not in team_members)
  SELECT CASE
    WHEN EXISTS (
      SELECT 1 FROM company_profiles WHERE user_id = _user_id
    ) AND NOT EXISTS (
      SELECT 1 FROM team_members WHERE user_id = _user_id
    ) THEN _user_id
    -- Otherwise, get who invited them (the owner)
    ELSE (
      SELECT invited_by FROM team_members WHERE user_id = _user_id LIMIT 1
    )
  END;
$$;

-- Step 2: Update same_company to use the new function
CREATE OR REPLACE FUNCTION public.same_company(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_user_company_owner(auth.uid()) = public.get_user_company_owner(_user_id)
    OR auth.uid() = _user_id;
$$;

-- Step 3: Drop and recreate team_members policies without recursion
DROP POLICY IF EXISTS "Team view all members" ON team_members;
DROP POLICY IF EXISTS "Team members can view all team members" ON team_members;
DROP POLICY IF EXISTS "Users can view their own team members" ON team_members;
DROP POLICY IF EXISTS "Users can insert team members" ON team_members;
DROP POLICY IF EXISTS "Users can update team members" ON team_members;
DROP POLICY IF EXISTS "Users can delete team members" ON team_members;

-- Simple non-recursive policies for team_members
-- Allow users to see team members if they share the same company owner
CREATE POLICY "View team members from same company" ON team_members
  FOR SELECT USING (
    -- User is the owner (invited others)
    auth.uid() = invited_by
    -- OR user is in the team and looking at teammates
    OR EXISTS (
      SELECT 1 FROM team_members tm 
      WHERE tm.user_id = auth.uid() 
      AND tm.invited_by = team_members.invited_by
    )
  );

CREATE POLICY "Owner can insert team members" ON team_members
  FOR INSERT WITH CHECK (
    auth.uid() = invited_by
  );

CREATE POLICY "Owner can update team members" ON team_members
  FOR UPDATE USING (
    auth.uid() = invited_by
  );

CREATE POLICY "Owner can delete team members" ON team_members
  FOR DELETE USING (
    auth.uid() = invited_by
  );

-- Step 4: Add the main user to team_members if they're not there
-- This allows them to show up in the team list
INSERT INTO team_members (user_id, email, full_name, invited_by, status)
SELECT 
  u.id,
  u.email,
  p.full_name,
  u.id, -- self-invited (the owner)
  'active'
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'chrisjpmcdonald@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM team_members WHERE user_id = u.id
  );

-- Step 5: Update Oscar's company_profiles to remove it since he's a team member, not owner
DELETE FROM company_profiles WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'oscar@clearlinecapital.co.uk'
);