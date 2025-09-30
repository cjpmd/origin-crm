-- Research jobs and evidence tracking
CREATE TABLE research_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url TEXT,
  company_id UUID REFERENCES portfolio_companies(id) ON DELETE CASCADE,
  sector_id UUID REFERENCES sectors(id) ON DELETE CASCADE,
  initiated_by UUID REFERENCES profiles(id),
  status TEXT CHECK (status IN ('pending','running','done','failed')) DEFAULT 'pending',
  depth TEXT CHECK (depth IN ('quick','standard','forensic')) DEFAULT 'standard',
  priority INT DEFAULT 50,
  params JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_research_jobs_status ON research_jobs (status, priority, created_at);
CREATE INDEX idx_research_jobs_company ON research_jobs (company_id);
CREATE INDEX idx_research_jobs_sector ON research_jobs (sector_id);

-- Evidence items collected during research
CREATE TABLE evidence_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_job_id UUID REFERENCES research_jobs(id) ON DELETE CASCADE,
  company_id UUID REFERENCES portfolio_companies(id),
  source_url TEXT,
  title TEXT,
  snippet TEXT,
  fetch_time TIMESTAMPTZ,
  author TEXT,
  outlet TEXT,
  type TEXT,
  verifiability_score NUMERIC,
  independence_score NUMERIC,
  recency_score NUMERIC,
  signal_quality NUMERIC,
  correlation_group TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_evidence_items_job ON evidence_items (research_job_id);
CREATE INDEX idx_evidence_items_company ON evidence_items (company_id);

-- Research reports with findings
CREATE TABLE research_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_job_id UUID REFERENCES research_jobs(id) ON DELETE CASCADE,
  title TEXT,
  summary TEXT,
  prior_probability NUMERIC,
  posterior_probability NUMERIC,
  confidence NUMERIC,
  key_drivers JSONB,
  structured_findings JSONB,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_research_reports_job ON research_reports (research_job_id);

-- Research alerts for monitoring
CREATE TABLE research_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES portfolio_companies(id) ON DELETE CASCADE,
  metric TEXT,
  condition JSONB,
  is_active BOOLEAN DEFAULT true,
  last_triggered TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_research_alerts_profile ON research_alerts (profile_id);
CREATE INDEX idx_research_alerts_company ON research_alerts (company_id);

-- Enable RLS
ALTER TABLE research_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for research_jobs
CREATE POLICY "Users can view research jobs they initiated"
  ON research_jobs FOR SELECT
  USING (auth.uid() = initiated_by);

CREATE POLICY "Users can create their own research jobs"
  ON research_jobs FOR INSERT
  WITH CHECK (auth.uid() = initiated_by);

CREATE POLICY "Users can update their own research jobs"
  ON research_jobs FOR UPDATE
  USING (auth.uid() = initiated_by);

-- RLS Policies for evidence_items
CREATE POLICY "Users can view evidence from their jobs"
  ON evidence_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM research_jobs
      WHERE research_jobs.id = evidence_items.research_job_id
      AND research_jobs.initiated_by = auth.uid()
    )
  );

-- RLS Policies for research_reports
CREATE POLICY "Users can view reports from their jobs"
  ON research_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM research_jobs
      WHERE research_jobs.id = research_reports.research_job_id
      AND research_jobs.initiated_by = auth.uid()
    )
  );

-- RLS Policies for research_alerts
CREATE POLICY "Users can view their own alerts"
  ON research_alerts FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can create their own alerts"
  ON research_alerts FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own alerts"
  ON research_alerts FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own alerts"
  ON research_alerts FOR DELETE
  USING (auth.uid() = profile_id);