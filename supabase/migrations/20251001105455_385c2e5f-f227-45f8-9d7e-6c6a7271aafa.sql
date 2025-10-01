-- Activity logging tables for capturing all interactions
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('email', 'meeting', 'call', 'note', 'linkedin', 'research')),
  subject TEXT,
  body TEXT,
  activity_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  duration_minutes INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activity associations (link activities to companies, contacts, deals)
CREATE TABLE public.activity_associations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('company', 'contact', 'deal', 'fund', 'investor')),
  entity_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Relationship strength tracking
CREATE TABLE public.relationship_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.portfolio_companies(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  last_interaction TIMESTAMP WITH TIME ZONE,
  interaction_count INTEGER DEFAULT 0,
  recency_score NUMERIC DEFAULT 0,
  frequency_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT relationship_target CHECK (
    (contact_id IS NOT NULL AND company_id IS NULL) OR
    (contact_id IS NULL AND company_id IS NOT NULL)
  )
);

-- Network connections (who knows who)
CREATE TABLE public.network_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  to_contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  connection_strength INTEGER DEFAULT 50 CHECK (connection_strength >= 0 AND connection_strength <= 100),
  source TEXT, -- how we know about this connection
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(from_contact_id, to_contact_id)
);

-- Data enrichment tracking
CREATE TABLE public.enrichment_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('company', 'contact')),
  entity_id UUID NOT NULL,
  source TEXT NOT NULL, -- 'linkedin', 'clearbit', 'pitchbook', etc.
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  enriched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI research jobs and results
CREATE TABLE public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('company', 'contact', 'deal', 'sector')),
  entity_id UUID NOT NULL,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('research', 'summary', 'suggestion', 'news', 'competitor')),
  title TEXT,
  content TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  confidence_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Automation rules
CREATE TABLE public.automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('deal_stage_change', 'activity_logged', 'time_based', 'relationship_score')),
  trigger_conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_activities_user_date ON public.activities(user_id, activity_date DESC);
CREATE INDEX idx_activities_type ON public.activities(activity_type);
CREATE INDEX idx_activity_associations_entity ON public.activity_associations(entity_type, entity_id);
CREATE INDEX idx_relationship_scores_user ON public.relationship_scores(user_id);
CREATE INDEX idx_network_connections_contacts ON public.network_connections(from_contact_id, to_contact_id);
CREATE INDEX idx_enrichment_entity ON public.enrichment_data(entity_type, entity_id);
CREATE INDEX idx_ai_insights_entity ON public.ai_insights(entity_type, entity_id);

-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationship_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrichment_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activities
CREATE POLICY "Users can view their own activities"
  ON public.activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities"
  ON public.activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities"
  ON public.activities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities"
  ON public.activities FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for activity associations
CREATE POLICY "Users can view their activity associations"
  ON public.activity_associations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.activities
    WHERE activities.id = activity_associations.activity_id
    AND activities.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their activity associations"
  ON public.activity_associations FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.activities
    WHERE activities.id = activity_associations.activity_id
    AND activities.user_id = auth.uid()
  ));

-- RLS Policies for relationship scores
CREATE POLICY "Users can manage their own relationship scores"
  ON public.relationship_scores FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for network connections
CREATE POLICY "Users can manage their own network connections"
  ON public.network_connections FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for enrichment data
CREATE POLICY "Users can view enrichment data for their entities"
  ON public.enrichment_data FOR SELECT
  USING (
    (entity_type = 'company' AND EXISTS (
      SELECT 1 FROM public.portfolio_companies
      WHERE portfolio_companies.id = enrichment_data.entity_id
      AND portfolio_companies.user_id = auth.uid()
    )) OR
    (entity_type = 'contact' AND EXISTS (
      SELECT 1 FROM public.contacts
      WHERE contacts.id = enrichment_data.entity_id
      AND contacts.user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can insert enrichment data"
  ON public.enrichment_data FOR INSERT
  WITH CHECK (
    (entity_type = 'company' AND EXISTS (
      SELECT 1 FROM public.portfolio_companies
      WHERE portfolio_companies.id = enrichment_data.entity_id
      AND portfolio_companies.user_id = auth.uid()
    )) OR
    (entity_type = 'contact' AND EXISTS (
      SELECT 1 FROM public.contacts
      WHERE contacts.id = enrichment_data.entity_id
      AND contacts.user_id = auth.uid()
    ))
  );

-- RLS Policies for AI insights
CREATE POLICY "Users can manage their own AI insights"
  ON public.ai_insights FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for automation rules
CREATE POLICY "Users can manage their own automation rules"
  ON public.automation_rules FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_relationship_scores_updated_at
  BEFORE UPDATE ON public.relationship_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_network_connections_updated_at
  BEFORE UPDATE ON public.network_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_automation_rules_updated_at
  BEFORE UPDATE ON public.automation_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();