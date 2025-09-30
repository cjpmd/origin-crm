import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, DollarSign, Building, Users, Leaf, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { mockSectors, getSectorById, getSectorBenchmark, getCompaniesInSector, getDealsInSector, mockKPIs } from '@/lib/mockData';
import { Sector } from '@/types';
import { PublicComparables } from '@/components/Market/PublicComparables';

interface SectorProfileProps {
  sectorId: string;
}

const chartConfig = {
  benchmark: { label: 'Sector Avg', color: 'hsl(var(--primary))' },
  company: { label: 'Company', color: 'hsl(var(--secondary))' },
  growth: { label: 'Revenue Growth %', color: 'hsl(var(--primary))' },
  margin: { label: 'EBITDA Margin %', color: 'hsl(var(--secondary))' },
  multiple: { label: 'Valuation Multiple', color: 'hsl(var(--accent))' }
};

export function SectorProfile({ sectorId }: SectorProfileProps) {
  const sector = getSectorById(sectorId);
  const benchmark = getSectorBenchmark(sectorId);
  const portfolioCompanies = getCompaniesInSector(sector?.name || '');
  const recentDeals = getDealsInSector(sector?.name || '');

  if (!sector) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Sector not found
          </div>
        </CardContent>
      </Card>
    );
  }

  // Financial benchmark chart data
  const benchmarkData = benchmark ? [
    {
      metric: 'Revenue Growth',
      value: benchmark.avg_revenue_growth,
      median: benchmark.median_revenue_growth,
      p75: benchmark.percentile_75_revenue_growth,
      p25: benchmark.percentile_25_revenue_growth
    },
    {
      metric: 'EBITDA Margin',
      value: benchmark.avg_ebitda_margin,
      median: benchmark.median_ebitda_margin,
      p75: benchmark.percentile_75_ebitda_margin,
      p25: benchmark.percentile_25_ebitda_margin
    },
    {
      metric: 'Valuation Multiple',
      value: benchmark.avg_valuation_multiple,
      median: benchmark.median_valuation_multiple,
      p75: benchmark.avg_valuation_multiple * 1.3,
      p25: benchmark.avg_valuation_multiple * 0.7
    }
  ] : [];

  // Company performance data for radar chart
  const companyPerformanceData = portfolioCompanies.map(company => {
    const kpis = mockKPIs.find(k => k.company_id === company.id);
    if (!kpis || !benchmark) return null;

    const revenueGrowthScore = Math.min(100, ((kpis.revenue || 0) / 1000000 / 12) * 100); // Mock growth calculation
    const ebitdaMarginScore = Math.min(100, ((kpis.ebitda || 0) / (kpis.revenue || 1)) * 100);
    
    return {
      company: company.name,
      'Revenue Growth': Math.min(100, revenueGrowthScore),
      'EBITDA Margin': Math.min(100, ebitdaMarginScore),
      'ESG Score': kpis.esg_score || 0,
      'Market Position': 75, // Mock score
      'Innovation': 80 // Mock score
    };
  }).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Sector Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{sector.name}</CardTitle>
              <p className="text-muted-foreground mt-2">{sector.description}</p>
            </div>
            <div className="text-right space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-bold text-green-600">{sector.cagr}% CAGR</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">${((sector.market_size || 0) / 1e9).toFixed(0)}B TAM</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
              <TabsTrigger value="companies">Companies</TabsTrigger>
              <TabsTrigger value="deals">Recent Deals</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Key Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {sector.key_trends?.map((trend, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-primary" />
                          <span className="text-sm">{trend}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top Market Players</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {sector.top_players?.map((player, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{player}</span>
                          <Badge variant="outline">Leader</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="benchmarks" className="space-y-4">
              {benchmark && (
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Benchmarks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig}>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={benchmarkData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="metric" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="p75" fill="hsl(var(--muted))" name="75th Percentile" />
                          <Bar dataKey="value" fill="hsl(var(--primary))" name="Average" />
                          <Bar dataKey="median" fill="hsl(var(--secondary))" name="Median" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="companies" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Companies ({portfolioCompanies.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {portfolioCompanies.length > 0 ? (
                    <div className="space-y-4">
                      {portfolioCompanies.map((company) => {
                        const kpis = mockKPIs.find(k => k.company_id === company.id);
                        return (
                          <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="font-medium">{company.name}</div>
                              <div className="text-sm text-muted-foreground">{company.geography}</div>
                              <div className="text-xs text-muted-foreground">
                                Invested: {company.investment_date}
                              </div>
                            </div>
                            {kpis && (
                              <div className="text-right space-y-1">
                                <div className="text-sm font-medium">
                                  ${(kpis.revenue / 1000000).toFixed(1)}M Revenue
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {kpis.headcount} Employees
                                </div>
                                <Badge variant={kpis.esg_score > 75 ? 'default' : kpis.esg_score > 60 ? 'secondary' : 'destructive'}>
                                  ESG: {kpis.esg_score}
                                </Badge>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No portfolio companies in this sector
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Deals ({recentDeals.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentDeals.length > 0 ? (
                    <div className="space-y-4">
                      {recentDeals.map((deal) => (
                        <div key={deal.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">{deal.name}</div>
                            <div className="text-sm text-muted-foreground">{deal.geography}</div>
                          </div>
                          <div className="text-right space-y-1">
                            <Badge variant="outline">{deal.stage}</Badge>
                            <div className="text-sm text-muted-foreground">
                              ${(deal.valuation || 0) / 1000000}M valuation
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {deal.probability}% probability
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No recent deals in this sector
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

        <TabsContent value="comparables" className="space-y-4">
          <PublicComparables sector={sector.name} />
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Market Dynamics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <Building className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold">{sector.top_players?.length || 0}</div>
                      <div className="text-sm text-muted-foreground">Major Players</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl font-bold">{sector.cagr}%</div>
                      <div className="text-sm text-muted-foreground">5Y CAGR</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-bold">${((sector.market_size || 0) / 1e9).toFixed(0)}B</div>
                      <div className="text-sm text-muted-foreground">Market Size</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}