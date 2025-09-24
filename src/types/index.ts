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
  created_at: string;
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