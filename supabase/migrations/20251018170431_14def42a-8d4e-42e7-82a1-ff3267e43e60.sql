-- Drop the restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create a new policy that allows all authenticated users to view all profiles
CREATE POLICY "Authenticated users can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);