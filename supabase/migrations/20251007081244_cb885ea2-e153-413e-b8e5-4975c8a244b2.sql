-- Create a function to get the company owner for a user
CREATE OR REPLACE FUNCTION public.get_company_owner(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
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

-- Drop and recreate all RLS policies for team-based access

-- Deals
DROP POLICY IF EXISTS "Users can view their own deals" ON deals;
DROP POLICY IF EXISTS "Users can create their own deals" ON deals;
DROP POLICY IF EXISTS "Users can update their own deals" ON deals;
DROP POLICY IF EXISTS "Users can delete their own deals" ON deals;
DROP POLICY IF EXISTS "Team members can view deals" ON deals;
DROP POLICY IF EXISTS "Team members can create deals" ON deals;
DROP POLICY IF EXISTS "Team members can update deals" ON deals;
DROP POLICY IF EXISTS "Team members can delete deals" ON deals;

CREATE POLICY "Team members view deals" ON deals FOR SELECT USING (public.same_company(user_id));
CREATE POLICY "Team members create deals" ON deals FOR INSERT WITH CHECK (public.same_company(user_id));
CREATE POLICY "Team members update deals" ON deals FOR UPDATE USING (public.same_company(user_id));
CREATE POLICY "Team members delete deals" ON deals FOR DELETE USING (public.same_company(user_id));

-- Portfolio Companies
DROP POLICY IF EXISTS "Users can view their own portfolio companies" ON portfolio_companies;
DROP POLICY IF EXISTS "Users can insert their own portfolio companies" ON portfolio_companies;
DROP POLICY IF EXISTS "Users can update their own portfolio companies" ON portfolio_companies;
DROP POLICY IF EXISTS "Users can delete their own portfolio companies" ON portfolio_companies;
DROP POLICY IF EXISTS "Team members can view portfolio companies" ON portfolio_companies;
DROP POLICY IF EXISTS "Team members can create portfolio companies" ON portfolio_companies;
DROP POLICY IF EXISTS "Team members can update portfolio companies" ON portfolio_companies;
DROP POLICY IF EXISTS "Team members can delete portfolio companies" ON portfolio_companies;

CREATE POLICY "Team view portfolio" ON portfolio_companies FOR SELECT USING (public.same_company(user_id));
CREATE POLICY "Team create portfolio" ON portfolio_companies FOR INSERT WITH CHECK (public.same_company(user_id));
CREATE POLICY "Team update portfolio" ON portfolio_companies FOR UPDATE USING (public.same_company(user_id));
CREATE POLICY "Team delete portfolio" ON portfolio_companies FOR DELETE USING (public.same_company(user_id));

-- Contacts
DROP POLICY IF EXISTS "Users can view their own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can insert their own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can update their own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts" ON contacts;

CREATE POLICY "Team view contacts" ON contacts FOR SELECT USING (public.same_company(user_id));
CREATE POLICY "Team create contacts" ON contacts FOR INSERT WITH CHECK (public.same_company(user_id));
CREATE POLICY "Team update contacts" ON contacts FOR UPDATE USING (public.same_company(user_id));
CREATE POLICY "Team delete contacts" ON contacts FOR DELETE USING (public.same_company(user_id));

-- Activities
DROP POLICY IF EXISTS "Users can view their own activities" ON activities;
DROP POLICY IF EXISTS "Users can insert their own activities" ON activities;
DROP POLICY IF EXISTS "Users can update their own activities" ON activities;
DROP POLICY IF EXISTS "Users can delete their own activities" ON activities;

CREATE POLICY "Team view activities" ON activities FOR SELECT USING (public.same_company(user_id));
CREATE POLICY "Team create activities" ON activities FOR INSERT WITH CHECK (public.same_company(user_id));
CREATE POLICY "Team update activities" ON activities FOR UPDATE USING (public.same_company(user_id));
CREATE POLICY "Team delete activities" ON activities FOR DELETE USING (public.same_company(user_id));

-- Journal Entries
DROP POLICY IF EXISTS "Users can view their own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can insert their own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can update their own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can delete their own journal entries" ON journal_entries;

CREATE POLICY "Team view journal" ON journal_entries FOR SELECT USING (public.same_company(user_id));
CREATE POLICY "Team create journal" ON journal_entries FOR INSERT WITH CHECK (public.same_company(user_id));
CREATE POLICY "Team update journal" ON journal_entries FOR UPDATE USING (public.same_company(user_id));
CREATE POLICY "Team delete journal" ON journal_entries FOR DELETE USING (public.same_company(user_id));

-- Investors
DROP POLICY IF EXISTS "Users can view their own investors" ON investors;
DROP POLICY IF EXISTS "Users can insert their own investors" ON investors;
DROP POLICY IF EXISTS "Users can update their own investors" ON investors;
DROP POLICY IF EXISTS "Users can delete their own investors" ON investors;

CREATE POLICY "Team view investors" ON investors FOR SELECT USING (public.same_company(user_id));
CREATE POLICY "Team create investors" ON investors FOR INSERT WITH CHECK (public.same_company(user_id));
CREATE POLICY "Team update investors" ON investors FOR UPDATE USING (public.same_company(user_id));
CREATE POLICY "Team delete investors" ON investors FOR DELETE USING (public.same_company(user_id));

-- Intermediaries
DROP POLICY IF EXISTS "Users can view their own intermediaries" ON intermediaries;
DROP POLICY IF EXISTS "Users can insert their own intermediaries" ON intermediaries;
DROP POLICY IF EXISTS "Users can update their own intermediaries" ON intermediaries;
DROP POLICY IF EXISTS "Users can delete their own intermediaries" ON intermediaries;

CREATE POLICY "Team view intermediaries" ON intermediaries FOR SELECT USING (public.same_company(user_id));
CREATE POLICY "Team create intermediaries" ON intermediaries FOR INSERT WITH CHECK (public.same_company(user_id));
CREATE POLICY "Team update intermediaries" ON intermediaries FOR UPDATE USING (public.same_company(user_id));
CREATE POLICY "Team delete intermediaries" ON intermediaries FOR DELETE USING (public.same_company(user_id));

-- Funds
DROP POLICY IF EXISTS "Users can view their own funds" ON funds;
DROP POLICY IF EXISTS "Users can insert their own funds" ON funds;
DROP POLICY IF EXISTS "Users can update their own funds" ON funds;
DROP POLICY IF EXISTS "Users can delete their own funds" ON funds;

CREATE POLICY "Team view funds" ON funds FOR SELECT USING (public.same_company(user_id));
CREATE POLICY "Team create funds" ON funds FOR INSERT WITH CHECK (public.same_company(user_id));
CREATE POLICY "Team update funds" ON funds FOR UPDATE USING (public.same_company(user_id));
CREATE POLICY "Team delete funds" ON funds FOR DELETE USING (public.same_company(user_id));

-- Team Members - allow viewing all members in the same company
CREATE POLICY "Team view all members" ON team_members
  FOR SELECT USING (
    auth.uid() = invited_by 
    OR auth.uid() = user_id
    OR invited_by = public.get_company_owner(auth.uid())
    OR invited_by IN (SELECT invited_by FROM team_members WHERE user_id = auth.uid())
  );