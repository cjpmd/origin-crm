-- Fix duplicate team member issue by simplifying RLS policy
DROP POLICY IF EXISTS "View team members" ON team_members;

-- Create a simpler policy that doesn't cause duplicates
CREATE POLICY "View team members" ON team_members
  FOR SELECT USING (
    -- Owner can see all team members they invited
    auth.uid() = invited_by
    -- OR team member can see others with same owner
    OR invited_by IN (
      SELECT tm.invited_by 
      FROM team_members tm 
      WHERE tm.user_id = auth.uid()
      LIMIT 1
    )
  );