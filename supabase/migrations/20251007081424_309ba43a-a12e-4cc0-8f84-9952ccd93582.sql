-- Create a function to get the company owner for a user
CREATE OR REPLACE FUNCTION public.get_company_owner(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- If user is a company owner (has company_profiles), return their own id
  -- If user is a team member, return the id of who invited them (the owner)
  SELECT COALESCE(
    (SELECT user_id FROM company_profiles WHERE user_id = _user_id LIMIT 1),
    (SELECT invited_by FROM team_members WHERE user_id = _user_id LIMIT 1)
  );
$$;

-- Create a function to check if two users are in the same company
CREATE OR REPLACE FUNCTION public.same_company(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_company_owner(auth.uid()) = public.get_company_owner(_user_id)
    OR auth.uid() = _user_id;
$$;

-- Update RLS policies for deals
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own deals" ON deals;
  DROP POLICY IF EXISTS "Users can create their own deals" ON deals;
  DROP POLICY IF EXISTS "Users can update their own deals" ON deals;
  DROP POLICY IF EXISTS "Users can delete their own deals" ON deals;
  DROP POLICY IF EXISTS "Team members can view deals" ON deals;
  DROP POLICY IF EXISTS "Team members can create deals" ON deals;
  DROP POLICY IF EXISTS "Team members can update deals" ON deals;
  DROP POLICY IF EXISTS "Team members can delete deals" ON deals;
END $$;

CREATE POLICY "Team members can view deals" ON deals
  FOR SELECT USING (public.same_company(user_id));

CREATE POLICY "Team members can create deals" ON deals
  FOR INSERT WITH CHECK (public.same_company(user_id));

CREATE POLICY "Team members can update deals" ON deals
  FOR UPDATE USING (public.same_company(user_id));

CREATE POLICY "Team members can delete deals" ON deals
  FOR DELETE USING (public.same_company(user_id));

-- Update RLS policies for portfolio_companies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own portfolio companies" ON portfolio_companies;
  DROP POLICY IF EXISTS "Users can insert their own portfolio companies" ON portfolio_companies;
  DROP POLICY IF EXISTS "Users can update their own portfolio companies" ON portfolio_companies;
  DROP POLICY IF EXISTS "Users can delete their own portfolio companies" ON portfolio_companies;
  DROP POLICY IF EXISTS "Team members can view portfolio companies" ON portfolio_companies;
  DROP POLICY IF EXISTS "Team members can create portfolio companies" ON portfolio_companies;
  DROP POLICY IF EXISTS "Team members can update portfolio companies" ON portfolio_companies;
  DROP POLICY IF EXISTS "Team members can delete portfolio companies" ON portfolio_companies;
END $$;

CREATE POLICY "Team members can view portfolio companies" ON portfolio_companies
  FOR SELECT USING (public.same_company(user_id));

CREATE POLICY "Team members can create portfolio companies" ON portfolio_companies
  FOR INSERT WITH CHECK (public.same_company(user_id));

CREATE POLICY "Team members can update portfolio companies" ON portfolio_companies
  FOR UPDATE USING (public.same_company(user_id));

CREATE POLICY "Team members can delete portfolio companies" ON portfolio_companies
  FOR DELETE USING (public.same_company(user_id));

-- Update RLS policies for contacts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own contacts" ON contacts;
  DROP POLICY IF EXISTS "Users can insert their own contacts" ON contacts;
  DROP POLICY IF EXISTS "Users can update their own contacts" ON contacts;
  DROP POLICY IF EXISTS "Users can delete their own contacts" ON contacts;
  DROP POLICY IF EXISTS "Team members can view contacts" ON contacts;
  DROP POLICY IF EXISTS "Team members can create contacts" ON contacts;
  DROP POLICY IF EXISTS "Team members can update contacts" ON contacts;
  DROP POLICY IF EXISTS "Team members can delete contacts" ON contacts;
END $$;

CREATE POLICY "Team members can view contacts" ON contacts
  FOR SELECT USING (public.same_company(user_id));

CREATE POLICY "Team members can create contacts" ON contacts
  FOR INSERT WITH CHECK (public.same_company(user_id));

CREATE POLICY "Team members can update contacts" ON contacts
  FOR UPDATE USING (public.same_company(user_id));

CREATE POLICY "Team members can delete contacts" ON contacts
  FOR DELETE USING (public.same_company(user_id));

-- Update RLS policies for activities
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own activities" ON activities;
  DROP POLICY IF EXISTS "Users can insert their own activities" ON activities;
  DROP POLICY IF EXISTS "Users can update their own activities" ON activities;
  DROP POLICY IF EXISTS "Users can delete their own activities" ON activities;
  DROP POLICY IF EXISTS "Team members can view activities" ON activities;
  DROP POLICY IF EXISTS "Team members can create activities" ON activities;
  DROP POLICY IF EXISTS "Team members can update activities" ON activities;
  DROP POLICY IF EXISTS "Team members can delete activities" ON activities;
END $$;

CREATE POLICY "Team members can view activities" ON activities
  FOR SELECT USING (public.same_company(user_id));

CREATE POLICY "Team members can create activities" ON activities
  FOR INSERT WITH CHECK (public.same_company(user_id));

CREATE POLICY "Team members can update activities" ON activities
  FOR UPDATE USING (public.same_company(user_id));

CREATE POLICY "Team members can delete activities" ON activities
  FOR DELETE USING (public.same_company(user_id));

-- Update RLS policies for journal_entries
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own journal entries" ON journal_entries;
  DROP POLICY IF EXISTS "Users can insert their own journal entries" ON journal_entries;
  DROP POLICY IF EXISTS "Users can update their own journal entries" ON journal_entries;
  DROP POLICY IF EXISTS "Users can delete their own journal entries" ON journal_entries;
  DROP POLICY IF EXISTS "Team members can view journal entries" ON journal_entries;
  DROP POLICY IF EXISTS "Team members can create journal entries" ON journal_entries;
  DROP POLICY IF EXISTS "Team members can update journal entries" ON journal_entries;
  DROP POLICY IF EXISTS "Team members can delete journal entries" ON journal_entries;
END $$;

CREATE POLICY "Team members can view journal entries" ON journal_entries
  FOR SELECT USING (public.same_company(user_id));

CREATE POLICY "Team members can create journal entries" ON journal_entries
  FOR INSERT WITH CHECK (public.same_company(user_id));

CREATE POLICY "Team members can update journal entries" ON journal_entries
  FOR UPDATE USING (public.same_company(user_id));

CREATE POLICY "Team members can delete journal entries" ON journal_entries
  FOR DELETE USING (public.same_company(user_id));

-- Update RLS policies for investors
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own investors" ON investors;
  DROP POLICY IF EXISTS "Users can insert their own investors" ON investors;
  DROP POLICY IF EXISTS "Users can update their own investors" ON investors;
  DROP POLICY IF EXISTS "Users can delete their own investors" ON investors;
  DROP POLICY IF EXISTS "Team members can view investors" ON investors;
  DROP POLICY IF EXISTS "Team members can create investors" ON investors;
  DROP POLICY IF EXISTS "Team members can update investors" ON investors;
  DROP POLICY IF EXISTS "Team members can delete investors" ON investors;
END $$;

CREATE POLICY "Team members can view investors" ON investors
  FOR SELECT USING (public.same_company(user_id));

CREATE POLICY "Team members can create investors" ON investors
  FOR INSERT WITH CHECK (public.same_company(user_id));

CREATE POLICY "Team members can update investors" ON investors
  FOR UPDATE USING (public.same_company(user_id));

CREATE POLICY "Team members can delete investors" ON investors
  FOR DELETE USING (public.same_company(user_id));

-- Update RLS policies for intermediaries
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own intermediaries" ON intermediaries;
  DROP POLICY IF EXISTS "Users can insert their own intermediaries" ON intermediaries;
  DROP POLICY IF EXISTS "Users can update their own intermediaries" ON intermediaries;
  DROP POLICY IF EXISTS "Users can delete their own intermediaries" ON intermediaries;
  DROP POLICY IF EXISTS "Team members can view intermediaries" ON intermediaries;
  DROP POLICY IF EXISTS "Team members can create intermediaries" ON intermediaries;
  DROP POLICY IF EXISTS "Team members can update intermediaries" ON intermediaries;
  DROP POLICY IF EXISTS "Team members can delete intermediaries" ON intermediaries;
END $$;

CREATE POLICY "Team members can view intermediaries" ON intermediaries
  FOR SELECT USING (public.same_company(user_id));

CREATE POLICY "Team members can create intermediaries" ON intermediaries
  FOR INSERT WITH CHECK (public.same_company(user_id));

CREATE POLICY "Team members can update intermediaries" ON intermediaries
  FOR UPDATE USING (public.same_company(user_id));

CREATE POLICY "Team members can delete intermediaries" ON intermediaries
  FOR DELETE USING (public.same_company(user_id));

-- Update RLS policies for funds
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own funds" ON funds;
  DROP POLICY IF EXISTS "Users can insert their own funds" ON funds;
  DROP POLICY IF EXISTS "Users can update their own funds" ON funds;
  DROP POLICY IF EXISTS "Users can delete their own funds" ON funds;
  DROP POLICY IF EXISTS "Team members can view funds" ON funds;
  DROP POLICY IF EXISTS "Team members can create funds" ON funds;
  DROP POLICY IF EXISTS "Team members can update funds" ON funds;
  DROP POLICY IF EXISTS "Team members can delete funds" ON funds;
END $$;

CREATE POLICY "Team members can view funds" ON funds
  FOR SELECT USING (public.same_company(user_id));

CREATE POLICY "Team members can create funds" ON funds
  FOR INSERT WITH CHECK (public.same_company(user_id));

CREATE POLICY "Team members can update funds" ON funds
  FOR UPDATE USING (public.same_company(user_id));

CREATE POLICY "Team members can delete funds" ON funds
  FOR DELETE USING (public.same_company(user_id));

-- Update team_members policies to allow team members to see each other
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own team members" ON team_members;
  DROP POLICY IF EXISTS "Team members can view all team members" ON team_members;
END $$;

CREATE POLICY "Team members can view all team members" ON team_members
  FOR SELECT USING (
    auth.uid() = invited_by 
    OR auth.uid() = user_id
    OR invited_by = public.get_company_owner(auth.uid())
    OR invited_by IN (SELECT invited_by FROM team_members WHERE user_id = auth.uid())
  );