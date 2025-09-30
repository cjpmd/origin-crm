-- Create sectors table (shared reference data)
CREATE TABLE IF NOT EXISTS public.sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sectors are viewable by authenticated users" ON public.sectors;
CREATE POLICY "Sectors are viewable by authenticated users"
  ON public.sectors FOR SELECT
  TO authenticated
  USING (true);

-- Create portfolio_companies table
CREATE TABLE IF NOT EXISTS public.portfolio_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sector_id UUID REFERENCES public.sectors(id),
  stage TEXT,
  investment_date DATE,
  investment_amount NUMERIC,
  ownership_percentage NUMERIC,
  valuation NUMERIC,
  location TEXT,
  website TEXT,
  description TEXT,
  status TEXT DEFAULT 'Active',
  is_public BOOLEAN DEFAULT false,
  stock_ticker TEXT,
  current_stock_price NUMERIC,
  market_cap NUMERIC,
  enterprise_value NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.portfolio_companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own portfolio companies" ON public.portfolio_companies;
DROP POLICY IF EXISTS "Users can insert their own portfolio companies" ON public.portfolio_companies;
DROP POLICY IF EXISTS "Users can update their own portfolio companies" ON public.portfolio_companies;
DROP POLICY IF EXISTS "Users can delete their own portfolio companies" ON public.portfolio_companies;

CREATE POLICY "Users can view their own portfolio companies"
  ON public.portfolio_companies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolio companies"
  ON public.portfolio_companies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio companies"
  ON public.portfolio_companies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolio companies"
  ON public.portfolio_companies FOR DELETE
  USING (auth.uid() = user_id);

-- Create contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.portfolio_companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  phone TEXT,
  linkedin TEXT,
  notes TEXT,
  last_contact_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can insert their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can update their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts" ON public.contacts;

CREATE POLICY "Users can view their own contacts"
  ON public.contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts"
  ON public.contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
  ON public.contacts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
  ON public.contacts FOR DELETE
  USING (auth.uid() = user_id);

-- Create investors table
CREATE TABLE IF NOT EXISTS public.investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  focus_sectors TEXT[],
  check_size TEXT,
  location TEXT,
  website TEXT,
  notes TEXT,
  status TEXT DEFAULT 'Prospect',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own investors" ON public.investors;
DROP POLICY IF EXISTS "Users can insert their own investors" ON public.investors;
DROP POLICY IF EXISTS "Users can update their own investors" ON public.investors;
DROP POLICY IF EXISTS "Users can delete their own investors" ON public.investors;

CREATE POLICY "Users can view their own investors"
  ON public.investors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own investors"
  ON public.investors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investors"
  ON public.investors FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investors"
  ON public.investors FOR DELETE
  USING (auth.uid() = user_id);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.portfolio_companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

CREATE POLICY "Users can view their own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Create esg_ratings table
CREATE TABLE IF NOT EXISTS public.esg_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.portfolio_companies(id) ON DELETE CASCADE,
  rating_date DATE NOT NULL,
  environmental_score NUMERIC,
  social_score NUMERIC,
  governance_score NUMERIC,
  overall_score NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.esg_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own esg ratings" ON public.esg_ratings;
DROP POLICY IF EXISTS "Users can insert their own esg ratings" ON public.esg_ratings;
DROP POLICY IF EXISTS "Users can update their own esg ratings" ON public.esg_ratings;
DROP POLICY IF EXISTS "Users can delete their own esg ratings" ON public.esg_ratings;

CREATE POLICY "Users can view their own esg ratings"
  ON public.esg_ratings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own esg ratings"
  ON public.esg_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own esg ratings"
  ON public.esg_ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own esg ratings"
  ON public.esg_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- Create market_data table (for historical stock prices)
CREATE TABLE IF NOT EXISTS public.market_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.portfolio_companies(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  open_price NUMERIC,
  close_price NUMERIC,
  high_price NUMERIC,
  low_price NUMERIC,
  volume BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, date)
);

ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view market data for their companies" ON public.market_data;

CREATE POLICY "Users can view market data for their companies"
  ON public.market_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_companies
      WHERE portfolio_companies.id = market_data.company_id
      AND portfolio_companies.user_id = auth.uid()
    )
  );

-- Create public_comparables table
CREATE TABLE IF NOT EXISTS public.public_comparables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id UUID REFERENCES public.sectors(id),
  name TEXT NOT NULL,
  ticker TEXT,
  market_cap NUMERIC,
  revenue NUMERIC,
  ebitda NUMERIC,
  pe_ratio NUMERIC,
  ev_revenue NUMERIC,
  ev_ebitda NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.public_comparables ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public comparables viewable by authenticated users" ON public.public_comparables;

CREATE POLICY "Public comparables viewable by authenticated users"
  ON public.public_comparables FOR SELECT
  TO authenticated
  USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers to all tables
DROP TRIGGER IF EXISTS set_updated_at ON public.portfolio_companies;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.portfolio_companies
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.contacts;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.investors;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.investors
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.tasks;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.esg_ratings;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.esg_ratings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.public_comparables;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.public_comparables
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert default sectors
INSERT INTO public.sectors (name, description) VALUES
  ('Technology', 'Software, hardware, and IT services'),
  ('Healthcare', 'Medical devices, pharmaceuticals, and healthcare services'),
  ('Financial Services', 'Banking, insurance, and fintech'),
  ('Consumer', 'Retail, e-commerce, and consumer products'),
  ('Industrial', 'Manufacturing and industrial services'),
  ('Energy', 'Renewable energy and traditional energy'),
  ('Real Estate', 'Property development and management'),
  ('Telecommunications', 'Communication services and infrastructure')
ON CONFLICT (name) DO NOTHING;