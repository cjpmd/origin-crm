// Core data types for the PE CRM based on the Supabase schema

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'deal_team' | 'investor_relations' | 'lp';
  created_at: string;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  relationship_strength: number; // 1-100
  last_contacted?: string;
  created_at: string;
}

export interface ContactRelationship {
  id: string;
  contact_id: string;
  related_contact_id: string;
  relationship_type: string;
  strength: number;
  created_at: string;
}

export interface Deal {
  id: string;
  name: string;
  stage: 'sourcing' | 'screening' | 'diligence' | 'term_sheet' | 'close' | 'exit';
  sector?: string;
  geography?: string;
  valuation?: number;
  owner_id?: string;
  probability: number; // % close probability
  created_at: string;
  updated_at: string;
}

export interface DealContact {
  id: string;
  deal_id: string;
  contact_id: string;
  role: string;
}

export interface Fund {
  id: string;
  name: string;
  vintage_year?: number;
  target_commitment?: number;
  total_commitment?: number;
  created_at: string;
}

export interface Investor {
  id: string;
  name: string;
  type: 'individual' | 'institution' | 'family_office';
  contact_id?: string;
  created_at: string;
}

export interface InvestorCommitment {
  id: string;
  fund_id: string;
  investor_id: string;
  commitment_amount: number;
  capital_called: number;
  distributions: number;
  created_at: string;
}

export interface PortfolioCompany {
  id: string;
  name: string;
  sector?: string;
  geography?: string;
  investment_date?: string;
  exit_date?: string;
  fund_id?: string;
  deal_id?: string;
  is_public?: boolean;
  stock_ticker?: string;
  current_stock_price?: number;
  market_cap?: number;
  enterprise_value?: number;
  created_at: string;
}

export interface MarketData {
  id: string;
  company_id: string;
  date: string;
  stock_price: number;
  volume?: number;
  market_cap: number;
  created_at: string;
}

export interface PublicComparable {
  id: string;
  name: string;
  ticker: string;
  sector: string;
  market_cap: number;
  enterprise_value: number;
  revenue: number;
  ebitda: number;
  pe_ratio?: number;
  ev_revenue_multiple?: number;
  ev_ebitda_multiple?: number;
  stock_price: number;
  price_change_1d?: number;
}

export interface PortfolioKPI {
  id: string;
  company_id: string;
  period: string;
  revenue?: number;
  ebitda?: number;
  arr?: number;
  headcount?: number;
  esg_score?: number;
  ev_revenue_multiple?: number;
  ev_ebitda_multiple?: number;
  pe_ratio?: number;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: 'open' | 'in_progress' | 'done';
  assigned_to?: string;
  related_deal?: string;
  related_investor?: string;
  related_company?: string;
  created_at: string;
}

export interface Note {
  id: string;
  content: string;
  author_id: string;
  deal_id?: string;
  investor_id?: string;
  company_id?: string;
  created_at: string;
}

export interface Document {
  id: string;
  name: string;
  file_url: string;
  uploaded_by: string;
  deal_id?: string;
  investor_id?: string;
  company_id?: string;
  created_at: string;
}

// ESG Types
export interface ESGRating {
  id: string;
  company_id: string;
  provider: string;
  overall_score: number; // 0-100
  e_score: number; // Environment
  s_score: number; // Social
  g_score: number; // Governance
  climate_score?: number;
  supply_chain_score?: number;
  human_rights_score?: number;
  governance_transparency?: number;
  last_updated: string;
  created_at: string;
}

export interface ESGHistory {
  id: string;
  esg_rating_id: string;
  date: string;
  overall_score: number;
  e_score: number;
  s_score: number;
  g_score: number;
  created_at: string;
}

export interface SectorBenchmark {
  id: string;
  sector: string;
  geography: string;
  provider: string;
  average_overall: number;
  median_overall: number;
  percentile_75: number;
  percentile_25: number;
  last_updated: string;
  created_at: string;
}

export interface ESGAlert {
  id: string;
  profile_id: string;
  company_id: string;
  provider: string;
  threshold_change: number;
  last_notified?: string;
  is_active: boolean;
  created_at: string;
}

// Sectoral Analysis Types
export interface Sector {
  id: string;
  name: string;
  parent_id?: string;
  description: string;
  key_trends?: string[];
  top_players?: string[];
  market_size?: number;
  cagr?: number;
  created_at: string;
}

export interface SectorFinancialBenchmark {
  id: string;
  sector_id: string;
  period: string;
  avg_revenue_growth: number;
  avg_ebitda_margin: number;
  avg_valuation_multiple: number;
  median_revenue_growth: number;
  median_ebitda_margin: number;
  median_valuation_multiple: number;
  percentile_75_revenue_growth: number;
  percentile_25_revenue_growth: number;
  percentile_75_ebitda_margin: number;
  percentile_25_ebitda_margin: number;
  created_at: string;
}

export interface SectorScenario {
  id: string;
  sector_id: string;
  name: string;
  assumption_growth: number;
  assumption_margin: number;
  assumption_multiple: number;
  created_by: string;
  created_at: string;
}

// UI Helper Types
export interface DealStageConfig {
  value: Deal['stage'];
  label: string;
  color: string;
}

export interface RelationshipStrengthConfig {
  min: number;
  max: number;
  label: string;
  color: string;
}

export interface ESGRiskLevel {
  value: 'low' | 'medium' | 'high';
  label: string;
  color: string;
  range: { min: number; max: number };
}