-- Create news_items table
CREATE TABLE IF NOT EXISTS public.news_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  author TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  sentiment_confidence NUMERIC CHECK (sentiment_confidence >= 0 AND sentiment_confidence <= 1),
  impact_level TEXT CHECK (impact_level IN ('high', 'medium', 'low')),
  relevance_score NUMERIC CHECK (relevance_score >= 0 AND relevance_score <= 100),
  category TEXT CHECK (category IN ('financial', 'sector', 'regulatory', 'social', 'market', 'product')),
  tags JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create news_sources table
CREATE TABLE IF NOT EXISTS public.news_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('api', 'rss', 'scraper')),
  api_config JSONB DEFAULT '{}'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT true,
  credibility_rating NUMERIC CHECK (credibility_rating >= 1 AND credibility_rating <= 10),
  fetch_frequency_hours INTEGER NOT NULL DEFAULT 6,
  last_fetch_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create news_entity_matches table
CREATE TABLE IF NOT EXISTS public.news_entity_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_item_id UUID NOT NULL REFERENCES public.news_items(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('company', 'investor', 'deal', 'sector', 'contact', 'intermediary')),
  entity_id UUID NOT NULL,
  match_confidence NUMERIC CHECK (match_confidence >= 0 AND match_confidence <= 1),
  match_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create news_alerts table
CREATE TABLE IF NOT EXISTS public.news_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  trigger_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  trigger_event_types TEXT[] DEFAULT ARRAY[]::TEXT[],
  watch_entity_type TEXT CHECK (watch_entity_type IN ('company', 'investor', 'sector', 'deal', 'all')),
  watch_entity_id UUID,
  min_impact_level TEXT CHECK (min_impact_level IN ('high', 'medium', 'low')),
  notification_channels TEXT[] DEFAULT ARRAY['in_app']::TEXT[],
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Extend ai_insights table
ALTER TABLE public.ai_insights 
  ADD COLUMN IF NOT EXISTS source_urls JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS event_type TEXT CHECK (event_type IN ('funding', 'acquisition', 'leadership', 'regulatory', 'product', 'market', 'research', 'summary', 'suggestion', 'news', 'competitor')),
  ADD COLUMN IF NOT EXISTS investor_id UUID REFERENCES public.investors(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_items_published_at ON public.news_items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_items_sentiment ON public.news_items(sentiment);
CREATE INDEX IF NOT EXISTS idx_news_items_user_id ON public.news_items(user_id);
CREATE INDEX IF NOT EXISTS idx_news_items_fetched_at ON public.news_items(fetched_at DESC);

CREATE INDEX IF NOT EXISTS idx_news_entity_matches_entity ON public.news_entity_matches(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_news_entity_matches_news_item ON public.news_entity_matches(news_item_id);

CREATE INDEX IF NOT EXISTS idx_news_alerts_user_id ON public.news_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_news_alerts_enabled ON public.news_alerts(enabled) WHERE enabled = true;

-- Enable RLS on all tables
ALTER TABLE public.news_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_entity_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for news_items
CREATE POLICY "Users can view global news"
  ON public.news_items
  FOR SELECT
  TO authenticated
  USING (user_id IS NULL);

CREATE POLICY "Users can view news for their entities"
  ON public.news_items
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.news_entity_matches nem
      WHERE nem.news_item_id = news_items.id
      AND (
        (nem.entity_type = 'company' AND EXISTS (SELECT 1 FROM public.portfolio_companies WHERE id = nem.entity_id AND user_id = auth.uid()))
        OR (nem.entity_type = 'investor' AND EXISTS (SELECT 1 FROM public.investors WHERE id = nem.entity_id AND user_id = auth.uid()))
        OR (nem.entity_type = 'deal' AND EXISTS (SELECT 1 FROM public.deals WHERE id = nem.entity_id AND user_id = auth.uid()))
        OR (nem.entity_type = 'contact' AND EXISTS (SELECT 1 FROM public.contacts WHERE id = nem.entity_id AND user_id = auth.uid()))
        OR (nem.entity_type = 'intermediary' AND EXISTS (SELECT 1 FROM public.intermediaries WHERE id = nem.entity_id AND user_id = auth.uid()))
      )
    )
  );

CREATE POLICY "Service role can manage all news items"
  ON public.news_items
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for news_sources
CREATE POLICY "All authenticated users can view news sources"
  ON public.news_sources
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage news sources"
  ON public.news_sources
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for news_entity_matches
CREATE POLICY "Users can view matches for their entities"
  ON public.news_entity_matches
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.news_items
      WHERE id = news_entity_matches.news_item_id
      AND (
        user_id IS NULL OR
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.news_entity_matches nem2
          WHERE nem2.news_item_id = news_items.id
          AND (
            (nem2.entity_type = 'company' AND EXISTS (SELECT 1 FROM public.portfolio_companies WHERE id = nem2.entity_id AND user_id = auth.uid()))
            OR (nem2.entity_type = 'investor' AND EXISTS (SELECT 1 FROM public.investors WHERE id = nem2.entity_id AND user_id = auth.uid()))
            OR (nem2.entity_type = 'deal' AND EXISTS (SELECT 1 FROM public.deals WHERE id = nem2.entity_id AND user_id = auth.uid()))
            OR (nem2.entity_type = 'contact' AND EXISTS (SELECT 1 FROM public.contacts WHERE id = nem2.entity_id AND user_id = auth.uid()))
            OR (nem2.entity_type = 'intermediary' AND EXISTS (SELECT 1 FROM public.intermediaries WHERE id = nem2.entity_id AND user_id = auth.uid()))
          )
        )
      )
    )
  );

CREATE POLICY "Service role can manage entity matches"
  ON public.news_entity_matches
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for news_alerts
CREATE POLICY "Users can view their own alerts"
  ON public.news_alerts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own alerts"
  ON public.news_alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own alerts"
  ON public.news_alerts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own alerts"
  ON public.news_alerts
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create trigger for updated_at on news_items
CREATE TRIGGER update_news_items_updated_at
  BEFORE UPDATE ON public.news_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for updated_at on news_sources
CREATE TRIGGER update_news_sources_updated_at
  BEFORE UPDATE ON public.news_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for updated_at on news_alerts
CREATE TRIGGER update_news_alerts_updated_at
  BEFORE UPDATE ON public.news_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();