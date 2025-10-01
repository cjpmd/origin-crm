-- Create intermediaries table for tracking bankers, brokers, advisors
CREATE TABLE public.intermediaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'broker', -- banker, broker, advisor, consultant, other
  firm TEXT,
  email TEXT,
  phone TEXT,
  linkedin TEXT,
  relationship_strength INTEGER DEFAULT 50 CHECK (relationship_strength >= 0 AND relationship_strength <= 100),
  last_contact_date DATE,
  total_deals_sourced INTEGER DEFAULT 0,
  successful_deals INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.intermediaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own intermediaries"
  ON public.intermediaries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own intermediaries"
  ON public.intermediaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own intermediaries"
  ON public.intermediaries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own intermediaries"
  ON public.intermediaries FOR DELETE
  USING (auth.uid() = user_id);

-- Create deal_sources table for attribution
CREATE TABLE public.deal_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  deal_id UUID NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'direct', -- direct, referral, intermediary, inbound, event, other
  intermediary_id UUID REFERENCES public.intermediaries(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  attribution_notes TEXT,
  source_quality_score INTEGER CHECK (source_quality_score >= 0 AND source_quality_score <= 100),
  introduction_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deal_sources ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own deal sources"
  ON public.deal_sources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deal sources"
  ON public.deal_sources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deal sources"
  ON public.deal_sources FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deal sources"
  ON public.deal_sources FOR DELETE
  USING (auth.uid() = user_id);

-- Create intermediary_coverage table for tracking sector coverage
CREATE TABLE public.intermediary_coverage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  intermediary_id UUID NOT NULL REFERENCES public.intermediaries(id) ON DELETE CASCADE,
  sector_id UUID REFERENCES public.sectors(id) ON DELETE SET NULL,
  coverage_strength INTEGER DEFAULT 50 CHECK (coverage_strength >= 0 AND coverage_strength <= 100),
  last_interaction_date DATE,
  interaction_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(intermediary_id, sector_id)
);

-- Enable RLS
ALTER TABLE public.intermediary_coverage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own intermediary coverage"
  ON public.intermediary_coverage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own intermediary coverage"
  ON public.intermediary_coverage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own intermediary coverage"
  ON public.intermediary_coverage FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own intermediary coverage"
  ON public.intermediary_coverage FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at on intermediaries
CREATE TRIGGER update_intermediaries_updated_at
  BEFORE UPDATE ON public.intermediaries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for updated_at on deal_sources
CREATE TRIGGER update_deal_sources_updated_at
  BEFORE UPDATE ON public.deal_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for updated_at on intermediary_coverage
CREATE TRIGGER update_intermediary_coverage_updated_at
  BEFORE UPDATE ON public.intermediary_coverage
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better query performance
CREATE INDEX idx_intermediaries_user_id ON public.intermediaries(user_id);
CREATE INDEX idx_intermediaries_type ON public.intermediaries(type);
CREATE INDEX idx_deal_sources_deal_id ON public.deal_sources(deal_id);
CREATE INDEX idx_deal_sources_intermediary_id ON public.deal_sources(intermediary_id);
CREATE INDEX idx_intermediary_coverage_intermediary_id ON public.intermediary_coverage(intermediary_id);
CREATE INDEX idx_intermediary_coverage_sector_id ON public.intermediary_coverage(sector_id);