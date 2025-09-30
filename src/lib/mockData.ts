import { Contact, Deal, Fund, Investor, PortfolioCompany, InvestorCommitment, PortfolioKPI, Task, Note, Document, ESGRating, ESGHistory, SectorBenchmark, ESGAlert, Sector, SectorFinancialBenchmark, SectorScenario, MarketData, PublicComparable } from '@/types';

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
    is_public: true,
    stock_ticker: 'DFLW',
    current_stock_price: 142.50,
    market_cap: 7200000000,
    enterprise_value: 7800000000,
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
    is_public: false,
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
    ev_revenue_multiple: 3.1,
    ev_ebitda_multiple: 17.3,
    pe_ratio: 50.5,
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

// Sectoral Analysis Mock Data
export const mockSectors: Sector[] = [
  {
    id: '1',
    name: 'Technology',
    description: 'Software, hardware, and technology services companies',
    key_trends: ['AI/ML adoption', 'Cloud migration', 'Cybersecurity growth'],
    top_players: ['Microsoft', 'Apple', 'Google'],
    market_size: 5200000000000,
    cagr: 8.2,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'SaaS',
    parent_id: '1',
    description: 'Software-as-a-Service platforms and applications',
    key_trends: ['Vertical SaaS growth', 'AI integration', 'Usage-based pricing'],
    top_players: ['Salesforce', 'ServiceNow', 'Workday'],
    market_size: 195000000000,
    cagr: 18.7,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Cybersecurity',
    parent_id: '1',
    description: 'Information security and cyber defense solutions',
    key_trends: ['Zero Trust architecture', 'Cloud security', 'AI-powered threats'],
    top_players: ['CrowdStrike', 'Palo Alto Networks', 'Fortinet'],
    market_size: 156000000000,
    cagr: 12.5,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'FinTech',
    parent_id: '1',
    description: 'Financial technology and digital payment solutions',
    key_trends: ['DeFi growth', 'Embedded finance', 'RegTech expansion'],
    top_players: ['Square', 'Stripe', 'PayPal'],
    market_size: 110000000000,
    cagr: 20.3,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'Healthcare',
    description: 'Healthcare services, medical devices, and biotechnology',
    key_trends: ['Telemedicine adoption', 'AI diagnostics', 'Personalized medicine'],
    top_players: ['Johnson & Johnson', 'Pfizer', 'UnitedHealth'],
    market_size: 4500000000000,
    cagr: 5.8,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    name: 'CleanTech',
    description: 'Clean technology and renewable energy solutions',
    key_trends: ['Solar cost reduction', 'Battery technology', 'Green hydrogen'],
    top_players: ['Tesla', 'First Solar', 'Vestas'],
    market_size: 85000000000,
    cagr: 15.1,
    created_at: '2024-01-01T00:00:00Z'
  }
];

export const mockSectorFinancialBenchmarks: SectorFinancialBenchmark[] = [
  {
    id: '1',
    sector_id: '2', // SaaS
    period: '2024-01-01',
    avg_revenue_growth: 25.5,
    avg_ebitda_margin: 18.2,
    avg_valuation_multiple: 8.5,
    median_revenue_growth: 22.0,
    median_ebitda_margin: 15.5,
    median_valuation_multiple: 7.2,
    percentile_75_revenue_growth: 35.0,
    percentile_25_revenue_growth: 12.0,
    percentile_75_ebitda_margin: 25.0,
    percentile_25_ebitda_margin: 8.0,
    created_at: '2024-01-31T00:00:00Z'
  },
  {
    id: '2',
    sector_id: '3', // Cybersecurity
    period: '2024-01-01',
    avg_revenue_growth: 18.7,
    avg_ebitda_margin: 22.1,
    avg_valuation_multiple: 9.2,
    median_revenue_growth: 16.5,
    median_ebitda_margin: 20.0,
    median_valuation_multiple: 8.8,
    percentile_75_revenue_growth: 28.0,
    percentile_25_revenue_growth: 8.0,
    percentile_75_ebitda_margin: 30.0,
    percentile_25_ebitda_margin: 12.0,
    created_at: '2024-01-31T00:00:00Z'
  },
  {
    id: '3',
    sector_id: '4', // FinTech
    period: '2024-01-01',
    avg_revenue_growth: 32.1,
    avg_ebitda_margin: 12.8,
    avg_valuation_multiple: 6.5,
    median_revenue_growth: 28.0,
    median_ebitda_margin: 10.5,
    median_valuation_multiple: 5.8,
    percentile_75_revenue_growth: 45.0,
    percentile_25_revenue_growth: 15.0,
    percentile_75_ebitda_margin: 18.0,
    percentile_25_ebitda_margin: 5.0,
    created_at: '2024-01-31T00:00:00Z'
  },
  {
    id: '4',
    sector_id: '5', // Healthcare
    period: '2024-01-01',
    avg_revenue_growth: 8.2,
    avg_ebitda_margin: 28.5,
    avg_valuation_multiple: 12.1,
    median_revenue_growth: 7.5,
    median_ebitda_margin: 26.0,
    median_valuation_multiple: 11.5,
    percentile_75_revenue_growth: 12.0,
    percentile_25_revenue_growth: 4.0,
    percentile_75_ebitda_margin: 35.0,
    percentile_25_ebitda_margin: 18.0,
    created_at: '2024-01-31T00:00:00Z'
  },
  {
    id: '5',
    sector_id: '6', // CleanTech
    period: '2024-01-01',
    avg_revenue_growth: 42.8,
    avg_ebitda_margin: 8.1,
    avg_valuation_multiple: 4.2,
    median_revenue_growth: 38.0,
    median_ebitda_margin: 6.5,
    median_valuation_multiple: 3.8,
    percentile_75_revenue_growth: 65.0,
    percentile_25_revenue_growth: 18.0,
    percentile_75_ebitda_margin: 15.0,
    percentile_25_ebitda_margin: -2.0,
    created_at: '2024-01-31T00:00:00Z'
  }
];

export const mockSectorScenarios: SectorScenario[] = [
  {
    id: '1',
    sector_id: '2',
    name: 'Bull Case - AI Acceleration',
    assumption_growth: 35.0,
    assumption_margin: 22.0,
    assumption_multiple: 12.0,
    created_by: '1',
    created_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    sector_id: '2',
    name: 'Bear Case - Market Saturation',
    assumption_growth: 12.0,
    assumption_margin: 15.0,
    assumption_multiple: 6.0,
    created_by: '1',
    created_at: '2024-01-15T00:00:00Z'
  }
];

// Helper functions for sectoral analysis
export const getSectorById = (sectorId: string): Sector | undefined => {
  return mockSectors.find(sector => sector.id === sectorId);
};

export const getSectorBenchmark = (sectorId: string): SectorFinancialBenchmark | undefined => {
  return mockSectorFinancialBenchmarks.find(benchmark => benchmark.sector_id === sectorId);
};

export const getCompaniesInSector = (sectorName: string): PortfolioCompany[] => {
  return mockPortfolioCompanies.filter(company => company.sector === sectorName);
};

export const getDealsInSector = (sectorName: string): Deal[] => {
  return mockDeals.filter(deal => deal.sector === sectorName);
};

// Market Data
export const mockMarketData: MarketData[] = [
  { id: '1', company_id: '1', date: '2025-01-15', stock_price: 142.50, volume: 1250000, market_cap: 7200000000, created_at: '2025-01-15T16:00:00Z' },
  { id: '2', company_id: '1', date: '2025-01-14', stock_price: 139.80, volume: 1180000, market_cap: 7050000000, created_at: '2025-01-14T16:00:00Z' },
  { id: '3', company_id: '1', date: '2025-01-13', stock_price: 137.50, volume: 980000, market_cap: 6920000000, created_at: '2025-01-13T16:00:00Z' },
  { id: '4', company_id: '1', date: '2025-01-10', stock_price: 135.20, volume: 1050000, market_cap: 6810000000, created_at: '2025-01-10T16:00:00Z' },
  { id: '5', company_id: '1', date: '2025-01-09', stock_price: 133.40, volume: 890000, market_cap: 6720000000, created_at: '2025-01-09T16:00:00Z' },
];

export const mockPublicComparables: PublicComparable[] = [
  {
    id: '1',
    name: 'Microsoft Corporation',
    ticker: 'MSFT',
    sector: 'SaaS',
    market_cap: 3100000000000,
    enterprise_value: 3050000000000,
    revenue: 211000000000,
    ebitda: 89000000000,
    pe_ratio: 35.8,
    ev_revenue_multiple: 14.5,
    ev_ebitda_multiple: 34.3,
    stock_price: 415.20,
    price_change_1d: 1.2,
  },
  {
    id: '2',
    name: 'Salesforce Inc',
    ticker: 'CRM',
    sector: 'SaaS',
    market_cap: 285000000000,
    enterprise_value: 275000000000,
    revenue: 34000000000,
    ebitda: 7200000000,
    pe_ratio: 42.5,
    ev_revenue_multiple: 8.1,
    ev_ebitda_multiple: 38.2,
    stock_price: 289.50,
    price_change_1d: -0.8,
  },
  {
    id: '3',
    name: 'CrowdStrike Holdings',
    ticker: 'CRWD',
    sector: 'Cybersecurity',
    market_cap: 78000000000,
    enterprise_value: 76000000000,
    revenue: 3000000000,
    ebitda: 450000000,
    pe_ratio: 385.5,
    ev_revenue_multiple: 25.3,
    ev_ebitda_multiple: 168.9,
    stock_price: 325.40,
    price_change_1d: 2.3,
  },
  {
    id: '4',
    name: 'Palo Alto Networks',
    ticker: 'PANW',
    sector: 'Cybersecurity',
    market_cap: 115000000000,
    enterprise_value: 112000000000,
    revenue: 6800000000,
    ebitda: 1200000000,
    pe_ratio: 52.8,
    ev_revenue_multiple: 16.5,
    ev_ebitda_multiple: 93.3,
    stock_price: 363.75,
    price_change_1d: -1.1,
  },
];