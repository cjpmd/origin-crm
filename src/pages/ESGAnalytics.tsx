import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { mockESGRatings, mockPortfolioCompanies, getESGRiskLevel } from "@/lib/mockData";
import { Leaf, Users, Shield, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { usePortfolioCompanies } from "@/hooks/usePortfolioCompanies";
import { useDeals } from "@/hooks/useDeals";

const chartConfig = {
  low: {
    label: "Low Risk",
    color: "hsl(var(--esg-low))",
  },
  medium: {
    label: "Medium Risk", 
    color: "hsl(var(--esg-medium))",
  },
  high: {
    label: "High Risk",
    color: "hsl(var(--esg-high))",
  },
};

export default function ESGAnalytics() {
  const { companies } = usePortfolioCompanies();
  const { deals } = useDeals();
  
  // Calculate portfolio ESG metrics (using mock data for now until ESG data exists in DB)
  const portfolioESGData = mockESGRatings.map(rating => {
    const company = companies.find(c => c.id === rating.company_id) || mockPortfolioCompanies.find(c => c.id === rating.company_id);
    const riskLevel = getESGRiskLevel(rating.overall_score);
    const sectorName = company && 'sectors' in company && company.sectors ? company.sectors.name : 
                       company && 'sector' in company ? company.sector : 'Unknown';
    return {
      ...rating,
      company_name: company?.name || 'Unknown',
      sector: sectorName,
      risk_level: riskLevel.value,
      source: 'portfolio'
    };
  });

  // Add pipeline deals with mock ESG data
  const pipelineESGData = deals.slice(0, 3).map(deal => {
    const mockScore = Math.floor(Math.random() * 40) + 50; // 50-90
    const riskLevel = getESGRiskLevel(mockScore);
    return {
      id: deal.id,
      company_id: deal.id,
      company_name: deal.name,
      sector: deal.sector || 'Unknown',
      overall_score: mockScore,
      e_score: Math.floor(Math.random() * 40) + 50,
      s_score: Math.floor(Math.random() * 40) + 50,
      g_score: Math.floor(Math.random() * 40) + 50,
      risk_level: riskLevel.value,
      source: 'pipeline'
    };
  });

  const allESGData = [...portfolioESGData, ...pipelineESGData];

  // Calculate risk distribution
  const riskDistribution = allESGData.reduce((acc, item) => {
    acc[item.risk_level] = (acc[item.risk_level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(riskDistribution).map(([risk, count]) => ({
    name: risk,
    value: count,
    label: chartConfig[risk as keyof typeof chartConfig]?.label || risk
  }));

  // Calculate average scores
  const avgOverallScore = Math.round(allESGData.reduce((sum, item) => sum + item.overall_score, 0) / allESGData.length);
  const avgEScore = Math.round(allESGData.reduce((sum, item) => sum + item.e_score, 0) / allESGData.length);
  const avgSScore = Math.round(allESGData.reduce((sum, item) => sum + item.s_score, 0) / allESGData.length);
  const avgGScore = Math.round(allESGData.reduce((sum, item) => sum + item.g_score, 0) / allESGData.length);

  // Sector breakdown
  const sectorData = allESGData.reduce((acc, item) => {
    const sector = item.sector;
    if (!acc[sector]) {
      acc[sector] = { count: 0, totalScore: 0 };
    }
    acc[sector].count += 1;
    acc[sector].totalScore += item.overall_score;
    return acc;
  }, {} as Record<string, { count: number; totalScore: number }>);

  const sectorChartData = Object.entries(sectorData).map(([sector, data]) => ({
    sector,
    avgScore: Math.round(data.totalScore / data.count),
    companies: data.count
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ESG Analytics</h1>
        <p className="text-muted-foreground">
          Environmental, Social, and Governance insights across portfolio and pipeline
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All ({allESGData.length})</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio ({portfolioESGData.length})</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline ({pipelineESGData.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Portfolio Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average ESG Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgOverallScore}</div>
                <p className="text-xs text-muted-foreground">
                  Across {allESGData.length} entities
                </p>
              </CardContent>
            </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Environmental</CardTitle>
            <Leaf className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEScore}</div>
            <Progress value={avgEScore} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Social</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSScore}</div>
            <Progress value={avgSScore} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Governance</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgGScore}</div>
            <Progress value={avgGScore} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>ESG Risk Distribution</CardTitle>
            <CardDescription>
              Portfolio companies by ESG risk level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`var(--color-${entry.name})`}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {Object.entries(riskDistribution).map(([risk, count]) => (
                <div key={risk} className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    {risk === 'low' && <CheckCircle className="h-4 w-4 text-esg-low" />}
                    {risk === 'medium' && <AlertTriangle className="h-4 w-4 text-esg-medium" />}
                    {risk === 'high' && <AlertTriangle className="h-4 w-4 text-esg-high" />}
                    <span className="font-semibold">{count}</span>
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">{risk} Risk</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sector Performance */}
        <Card>
          <CardHeader>
            <CardTitle>ESG by Sector</CardTitle>
            <CardDescription>
              Average ESG scores across portfolio sectors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorChartData} layout="horizontal">
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="sector" type="category" width={80} />
                  <ChartTooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid gap-2">
                              <div className="font-medium">{label}</div>
                              <div className="text-sm">
                                ESG Score: {payload[0].value}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {payload[0].payload.companies} companies
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="avgScore" 
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Company Rankings */}
      <Card>
        <CardHeader>
          <CardTitle>ESG Rankings</CardTitle>
          <CardDescription>
            ESG performance across portfolio and pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allESGData
              .sort((a, b) => b.overall_score - a.overall_score)
              .map((entity, index) => {
                const riskLevel = getESGRiskLevel(entity.overall_score);
                return (
                  <div key={entity.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{entity.company_name}</h4>
                          <Badge variant={entity.source === 'pipeline' ? 'outline' : 'secondary'}>
                            {entity.source}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{entity.sector}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">{entity.overall_score}</div>
                        <div className="text-xs text-muted-foreground">ESG Score</div>
                      </div>
                      <Badge variant="outline" className={`${riskLevel.color} border-current`}>
                        {riskLevel.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          {/* Similar layout but filtered for portfolioESGData */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolioESGData.map((entity, index) => {
                  const riskLevel = getESGRiskLevel(entity.overall_score);
                  return (
                    <div key={entity.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{entity.company_name}</h4>
                          <p className="text-sm text-muted-foreground">{entity.sector}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">{entity.overall_score}</div>
                          <div className="text-xs text-muted-foreground">ESG Score</div>
                        </div>
                        <Badge variant="outline" className={`${riskLevel.color} border-current`}>
                          {riskLevel.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          {/* Similar layout but filtered for pipelineESGData */}
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pipelineESGData.map((entity, index) => {
                  const riskLevel = getESGRiskLevel(entity.overall_score);
                  return (
                    <div key={entity.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{entity.company_name}</h4>
                          <p className="text-sm text-muted-foreground">{entity.sector}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">{entity.overall_score}</div>
                          <div className="text-xs text-muted-foreground">ESG Score</div>
                        </div>
                        <Badge variant="outline" className={`${riskLevel.color} border-current`}>
                          {riskLevel.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}