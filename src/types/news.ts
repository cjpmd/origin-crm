export interface NewsItem {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  source_name: string;
  source_url: string;
  author?: string;
  published_at: string;
  fetched_at: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  sentiment_confidence?: number;
  impact_level?: 'high' | 'medium' | 'low';
  relevance_score?: number;
  category?: 'financial' | 'sector' | 'regulatory' | 'social' | 'market' | 'product';
  tags?: string[];
  metadata?: any;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface NewsSource {
  id: string;
  name: string;
  type: 'api' | 'rss' | 'scraper';
  api_config?: any;
  enabled: boolean;
  credibility_rating?: number;
  fetch_frequency_hours: number;
  last_fetch_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NewsEntityMatch {
  id: string;
  news_item_id: string;
  entity_type: 'company' | 'investor' | 'deal' | 'sector' | 'contact' | 'intermediary';
  entity_id: string;
  match_confidence?: number;
  match_reason?: string;
  created_at: string;
}

export interface NewsAlert {
  id: string;
  user_id: string;
  name: string;
  enabled: boolean;
  trigger_keywords?: string[];
  trigger_event_types?: string[];
  watch_entity_type?: 'company' | 'investor' | 'sector' | 'deal' | 'all';
  watch_entity_id?: string;
  min_impact_level?: 'high' | 'medium' | 'low';
  notification_channels?: string[];
  last_triggered_at?: string;
  created_at: string;
  updated_at: string;
}
