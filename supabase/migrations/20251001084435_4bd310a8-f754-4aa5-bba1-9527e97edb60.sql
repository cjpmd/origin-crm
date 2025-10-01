-- Create portfolio_kpis table for tracking company financial metrics
CREATE TABLE public.portfolio_kpis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.portfolio_companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  revenue NUMERIC,
  ebitda NUMERIC,
  ebitda_margin NUMERIC,
  arr NUMERIC,
  headcount INTEGER,
  revenue_growth NUMERIC,
  customer_count INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.portfolio_kpis ENABLE ROW LEVEL SECURITY;

-- Create policies for portfolio_kpis
CREATE POLICY "Users can view their own portfolio kpis"
  ON public.portfolio_kpis
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolio kpis"
  ON public.portfolio_kpis
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio kpis"
  ON public.portfolio_kpis
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolio kpis"
  ON public.portfolio_kpis
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX idx_portfolio_kpis_company_id ON public.portfolio_kpis(company_id);
CREATE INDEX idx_portfolio_kpis_user_id ON public.portfolio_kpis(user_id);
CREATE INDEX idx_portfolio_kpis_period ON public.portfolio_kpis(period_start, period_end);

-- Add trigger for updated_at
CREATE TRIGGER update_portfolio_kpis_updated_at
  BEFORE UPDATE ON public.portfolio_kpis
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add fund_id and deal_id columns to portfolio_companies if not exists
ALTER TABLE public.portfolio_companies 
  ADD COLUMN IF NOT EXISTS fund_id UUID REFERENCES public.funds(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS exit_date DATE;

-- Create indexes for the new foreign keys
CREATE INDEX IF NOT EXISTS idx_portfolio_companies_fund_id ON public.portfolio_companies(fund_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_companies_deal_id ON public.portfolio_companies(deal_id);