-- Phase 1: Extend investors table with pipeline fields
ALTER TABLE investors
ADD COLUMN IF NOT EXISTS pipeline_stage text DEFAULT 'Sourced',
ADD COLUMN IF NOT EXISTS sub_stage text,
ADD COLUMN IF NOT EXISTS expected_commitment numeric,
ADD COLUMN IF NOT EXISTS probability integer CHECK (probability >= 0 AND probability <= 100),
ADD COLUMN IF NOT EXISTS target_close_date date,
ADD COLUMN IF NOT EXISTS last_contact_date date,
ADD COLUMN IF NOT EXISTS relationship_strength integer DEFAULT 50 CHECK (relationship_strength >= 0 AND relationship_strength <= 100),
ADD COLUMN IF NOT EXISTS aum numeric,
ADD COLUMN IF NOT EXISTS fund_vintage text,
ADD COLUMN IF NOT EXISTS priority_score integer CHECK (priority_score >= 1 AND priority_score <= 5),
ADD COLUMN IF NOT EXISTS source text,
ADD COLUMN IF NOT EXISTS engagement_level text DEFAULT 'Cold';

-- Create investor_pipeline_activities table
CREATE TABLE IF NOT EXISTS investor_pipeline_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  investor_id uuid NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  subject text,
  body text,
  activity_date timestamp with time zone NOT NULL DEFAULT now(),
  duration_minutes integer,
  outcome text,
  next_action text,
  next_action_date date,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create investor_preferences table
CREATE TABLE IF NOT EXISTS investor_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL REFERENCES investors(id) ON DELETE CASCADE UNIQUE,
  preferred_fund_types text[],
  preferred_sectors text[],
  preferred_geographies text[],
  min_investment numeric,
  max_investment numeric,
  preferred_deal_structure text,
  esg_focus boolean DEFAULT false,
  co_investment_interest boolean DEFAULT false,
  reporting_frequency text,
  decision_timeline text,
  decision_makers jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create fundraising_targets table
CREATE TABLE IF NOT EXISTS fundraising_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  fund_id uuid REFERENCES funds(id) ON DELETE CASCADE,
  name text NOT NULL,
  target_amount numeric NOT NULL,
  minimum_amount numeric,
  committed_amount numeric DEFAULT 0,
  soft_circled_amount numeric DEFAULT 0,
  first_close_target_date date,
  final_close_target_date date,
  status text DEFAULT 'Planning',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create investor_documents table
CREATE TABLE IF NOT EXISTS investor_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  investor_id uuid NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  document_name text NOT NULL,
  document_url text,
  version integer DEFAULT 1,
  sent_date timestamp with time zone DEFAULT now(),
  viewed boolean DEFAULT false,
  view_count integer DEFAULT 0,
  last_viewed_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE investor_pipeline_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE fundraising_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for investor_pipeline_activities
CREATE POLICY "Team members can view activities"
ON investor_pipeline_activities FOR SELECT
USING (same_company(user_id));

CREATE POLICY "Team members can create activities"
ON investor_pipeline_activities FOR INSERT
WITH CHECK (same_company(user_id));

CREATE POLICY "Team members can update activities"
ON investor_pipeline_activities FOR UPDATE
USING (same_company(user_id));

CREATE POLICY "Team members can delete activities"
ON investor_pipeline_activities FOR DELETE
USING (same_company(user_id));

-- RLS Policies for investor_preferences
CREATE POLICY "Team members can view preferences"
ON investor_preferences FOR SELECT
USING (EXISTS (
  SELECT 1 FROM investors 
  WHERE investors.id = investor_preferences.investor_id 
  AND same_company(investors.user_id)
));

CREATE POLICY "Team members can manage preferences"
ON investor_preferences FOR ALL
USING (EXISTS (
  SELECT 1 FROM investors 
  WHERE investors.id = investor_preferences.investor_id 
  AND same_company(investors.user_id)
))
WITH CHECK (EXISTS (
  SELECT 1 FROM investors 
  WHERE investors.id = investor_preferences.investor_id 
  AND same_company(investors.user_id)
));

-- RLS Policies for fundraising_targets
CREATE POLICY "Team members can view targets"
ON fundraising_targets FOR SELECT
USING (same_company(user_id));

CREATE POLICY "Team members can manage targets"
ON fundraising_targets FOR ALL
USING (same_company(user_id))
WITH CHECK (same_company(user_id));

-- RLS Policies for investor_documents
CREATE POLICY "Team members can view documents"
ON investor_documents FOR SELECT
USING (same_company(user_id));

CREATE POLICY "Team members can manage documents"
ON investor_documents FOR ALL
USING (same_company(user_id))
WITH CHECK (same_company(user_id));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_investor_pipeline_activities_investor_id ON investor_pipeline_activities(investor_id);
CREATE INDEX IF NOT EXISTS idx_investor_pipeline_activities_user_id ON investor_pipeline_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_investor_pipeline_activities_activity_date ON investor_pipeline_activities(activity_date);
CREATE INDEX IF NOT EXISTS idx_investor_preferences_investor_id ON investor_preferences(investor_id);
CREATE INDEX IF NOT EXISTS idx_fundraising_targets_user_id ON fundraising_targets(user_id);
CREATE INDEX IF NOT EXISTS idx_fundraising_targets_fund_id ON fundraising_targets(fund_id);
CREATE INDEX IF NOT EXISTS idx_investor_documents_investor_id ON investor_documents(investor_id);
CREATE INDEX IF NOT EXISTS idx_investor_documents_user_id ON investor_documents(user_id);

-- Add updated_at trigger for new tables
CREATE TRIGGER update_investor_pipeline_activities_updated_at
  BEFORE UPDATE ON investor_pipeline_activities
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_investor_preferences_updated_at
  BEFORE UPDATE ON investor_preferences
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_fundraising_targets_updated_at
  BEFORE UPDATE ON fundraising_targets
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_investor_documents_updated_at
  BEFORE UPDATE ON investor_documents
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();