import { Contact, Deal, Fund, Investor, PortfolioCompany, InvestorCommitment, PortfolioKPI, Task, Note, Document, ESGRating, ESGHistory, SectorBenchmark, ESGAlert } from '@/types';

export type { Task } from '@/types';

// Mock data for development
export const mockContacts: Contact[] = [
  {
    id: '1',
    first_name: 'Sarah',
    last_name: 'Chen',
    email: 'sarah.chen@techstartup.com',
    phone: '+1-555-0123',
    company: 'TechStartup Inc',
    title: 'CEO & Founder',
    relationship_strength: 85,
    last_contacted: '2024-01-20T10:30:00Z',
    created_at: '2024-01-15T08:00:00Z'
  },
  {
    id: '2',
    first_name: 'Michael',
    last_name: 'Rodriguez',
    email: 'mrodriguez@growthventures.com',
    phone: '+1-555-0456',
    company: 'Growth Ventures',
    title: 'Managing Partner',
    relationship_strength: 92,
    last_contacted: '2024-01-19T14:15:00Z',
    created_at: '2024-01-10T09:30:00Z'
  },
  {
    id: '3',
    first_name: 'Emily',
    last_name: 'Thompson',
    email: 'emily@fintech-solutions.com',
    phone: '+1-555-0789',
    company: 'FinTech Solutions',
    title: 'CTO',
    relationship_strength: 78,
    last_contacted: '2024-01-18T16:45:00Z',
    created_at: '2024-01-12T11:20:00Z'
  }
];

export const mockDeals: Deal[] = [
  {
    id: '1',
    name: 'TechStartup Inc Series B',
    stage: 'diligence',
    sector: 'SaaS',
    geography: 'North America',
    valuation: 50000000,
    owner_id: '1',
    probability: 75,
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-20T10:30:00Z'
  },
  {
    id: '2',
    name: 'FinTech Solutions Acquisition',
    stage: 'term_sheet',
    sector: 'FinTech',
    geography: 'Europe',
    valuation: 125000000,
    owner_id: '2',
    probability: 85,
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-19T15:20:00Z'
  },
  {
    id: '3',
    name: 'GreenTech Innovation',
    stage: 'sourcing',
    sector: 'CleanTech',
    geography: 'North America',
    valuation: 25000000,
    owner_id: '1',
    probability: 45,
    created_at: '2024-01-18T10:00:00Z',
    updated_at: '2024-01-18T10:00:00Z'
  }
];

export const mockFunds: Fund[] = [
  {
    id: '1',
    name: 'Growth Partners Fund III',
    vintage_year: 2023,
    target_commitment: 500000000,
    total_commitment: 475000000,
    created_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Innovation Ventures II',
    vintage_year: 2022,
    target_commitment: 300000000,
    total_commitment: 285000000,
    created_at: '2022-01-01T00:00:00Z'
  }
];

export const mockInvestors: Investor[] = [
  {
    id: '1',
    name: 'Pension Fund Alpha',
    type: 'institution',
    contact_id: '2',
    created_at: '2023-06-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Smith Family Office',
    type: 'family_office',
    contact_id: '3',
    created_at: '2023-07-15T00:00:00Z'
  }
];

export const mockPortfolioCompanies: PortfolioCompany[] = [
  {
    id: '1',
    name: 'DataFlow Analytics',
    sector: 'SaaS',
    geography: 'North America',
    investment_date: '2023-03-15',
    fund_id: '1',
    deal_id: '1',
    created_at: '2023-03-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'CloudSecure Pro',
    sector: 'Cybersecurity',
    geography: 'Europe',
    investment_date: '2023-06-20',
    fund_id: '1',
    deal_id: '2',
    created_at: '2023-06-20T00:00:00Z'
  }
];

export const mockKPIs: PortfolioKPI[] = [
  {
    id: '1',
    company_id: '1',
    period: '2024-01-01',
    revenue: 2500000,
    ebitda: 450000,
    arr: 3200000,
    headcount: 25,
    esg_score: 78,
    created_at: '2024-01-31T00:00:00Z'
  },
  {
    id: '2',
    company_id: '2',
    period: '2024-01-01',
    revenue: 1800000,
    ebitda: 320000,
    arr: 2100000,
    headcount: 18,
    esg_score: 82,
    created_at: '2024-01-31T00:00:00Z'
  }
];

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Schedule management presentation',
    description: 'Coordinate with TechStartup Inc management team for due diligence presentation',
    due_date: '2024-01-25',
    status: 'open',
    assigned_to: '1',
    related_deal: '1',
    created_at: '2024-01-20T00:00:00Z'
  },
  {
    id: '2',
    title: 'Review term sheet',
    description: 'Legal review of FinTech Solutions term sheet',
    due_date: '2024-01-23',
    status: 'in_progress',
    assigned_to: '2',
    related_deal: '2',
    created_at: '2024-01-19T00:00:00Z'
  }
];

export const dealStageConfig = [
  { value: 'sourcing' as const, label: 'Sourcing', color: 'bg-gray-100 text-gray-800' },
  { value: 'screening' as const, label: 'Screening', color: 'bg-blue-100 text-blue-800' },
  { value: 'diligence' as const, label: 'Due Diligence', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'term_sheet' as const, label: 'Term Sheet', color: 'bg-orange-100 text-orange-800' },
  { value: 'close' as const, label: 'Closing', color: 'bg-green-100 text-green-800' },
  { value: 'exit' as const, label: 'Exit', color: 'bg-purple-100 text-purple-800' }
];

export const relationshipStrengthConfig = [
  { min: 0, max: 33, label: 'Weak', color: 'text-red-600' },
  { min: 34, max: 66, label: 'Medium', color: 'text-yellow-600' },
  { min: 67, max: 100, label: 'Strong', color: 'text-green-600' }
];

// ESG Mock Data
export const mockESGRatings: ESGRating[] = [
  {
    id: '1',
    company_id: '1', // DataFlow Analytics
    provider: 'CSRHub',
    overall_score: 78,
    e_score: 82,
    s_score: 75,
    g_score: 77,
    climate_score: 85,
    supply_chain_score: 70,
    human_rights_score: 78,
    governance_transparency: 80,
    last_updated: '2024-01-01T00:00:00Z',
    created_at: '2023-03-15T00:00:00Z'
  },
  {
    id: '2',
    company_id: '2', // CloudSecure Pro
    provider: 'CSRHub',
    overall_score: 65,
    e_score: 60,
    s_score: 68,
    g_score: 67,
    climate_score: 58,
    supply_chain_score: 72,
    human_rights_score: 65,
    governance_transparency: 70,
    last_updated: '2024-01-01T00:00:00Z',
    created_at: '2023-06-20T00:00:00Z'
  }
];

export const mockESGHistory: ESGHistory[] = [
  {
    id: '1',
    esg_rating_id: '1',
    date: '2023-12-01',
    overall_score: 75,
    e_score: 78,
    s_score: 72,
    g_score: 75,
    created_at: '2023-12-01T00:00:00Z'
  },
  {
    id: '2',
    esg_rating_id: '1',
    date: '2024-01-01',
    overall_score: 78,
    e_score: 82,
    s_score: 75,
    g_score: 77,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    esg_rating_id: '2',
    date: '2023-12-01',
    overall_score: 62,
    e_score: 58,
    s_score: 65,
    g_score: 64,
    created_at: '2023-12-01T00:00:00Z'
  },
  {
    id: '4',
    esg_rating_id: '2',
    date: '2024-01-01',
    overall_score: 65,
    e_score: 60,
    s_score: 68,
    g_score: 67,
    created_at: '2024-01-01T00:00:00Z'
  }
];

export const mockSectorBenchmarks: SectorBenchmark[] = [
  {
    id: '1',
    sector: 'SaaS',
    geography: 'North America',
    provider: 'CSRHub',
    average_overall: 72,
    median_overall: 75,
    percentile_75: 82,
    percentile_25: 65,
    last_updated: '2024-01-01T00:00:00Z',
    created_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    sector: 'Cybersecurity',
    geography: 'Europe',
    provider: 'CSRHub',
    average_overall: 68,
    median_overall: 70,
    percentile_75: 78,
    percentile_25: 62,
    last_updated: '2024-01-01T00:00:00Z',
    created_at: '2023-01-01T00:00:00Z'
  }
];

export const esgRiskLevels = [
  { value: 'low' as const, label: 'Low Risk', color: 'text-esg-low', range: { min: 75, max: 100 } },
  { value: 'medium' as const, label: 'Medium Risk', color: 'text-esg-medium', range: { min: 50, max: 74 } },
  { value: 'high' as const, label: 'High Risk', color: 'text-esg-high', range: { min: 0, max: 49 } }
];

export const getESGRiskLevel = (score: number) => {
  return esgRiskLevels.find(level => score >= level.range.min && score <= level.range.max) || esgRiskLevels[1];
};