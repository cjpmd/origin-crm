import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { usePortfolioCompanies } from '@/hooks/usePortfolioCompanies';
import { useDeals } from '@/hooks/useDeals';

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--primary))',
  },
  ebitda: {
    label: 'EBITDA', 
    color: 'hsl(var(--secondary))',
  },
  arr: {
    label: 'ARR',
    color: 'hsl(var(--accent))',
  },
};

export function PortfolioCharts() {
  const { analytics, isLoading: analyticsLoading } = useAnalytics();
  const { companies, isLoading: companiesLoading } = usePortfolioCompanies();
  const { deals, isLoading: dealsLoading } = useDeals();

  if (analyticsLoading || companiesLoading || dealsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">No data available</div>
      </div>
    );
  }

  // Prepare sector distribution data
  const sectorData = analytics.portfolio.bySector;
  const pieData = Object.entries(sectorData).map(([sector, count], index) => ({
    name: sector,
    value: count,
    color: `hsl(${index * 137.5 % 360}, 70%, 50%)`
  }));

  // Prepare deal stage data
  const stageData = Object.entries(analytics.dealFlow.byStage).map(([stage, count]) => ({
    stage: stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count
  }));

  // Calculate risk indicators for companies
  const riskCompanies = companies.map(company => {
    const revenueGrowth = Math.random() * 40 - 10; // TODO: Calculate from actual KPIs when available
    const risk = revenueGrowth < 0 ? 'high' : revenueGrowth < 10 ? 'medium' : 'low';
    
    return {
      ...company,
      revenueGrowth,
      risk,
    };
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high': return AlertTriangle;
      case 'medium': return TrendingDown;
      case 'low': return CheckCircle;
      default: return TrendingUp;
    }
  };

  return (
    <div className="space-y-6">
      {/* Deal Flow and Performance Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Deal Pipeline by Stage</CardTitle>
            <CardDescription>Current deals distribution across stages</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageData}>
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: number) => [`${value} deals`, '']}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Metrics Overview</CardTitle>
            <CardDescription>Portfolio and pipeline summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Total Deal Value</div>
                  <div className="text-2xl font-bold">
                    £{(analytics.dealFlow.totalValue / 1000000).toFixed(1)}M
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Portfolio Companies</div>
                  <div className="text-2xl font-bold">{analytics.portfolio.totalCompanies}</div>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Active Contacts</div>
                  <div className="text-2xl font-bold">{analytics.contacts.total}</div>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sector Distribution and Risk Dashboard */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio by Sector</CardTitle>
            <CardDescription>Distribution of investments across sectors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Dashboard</CardTitle>
            <CardDescription>Portfolio company risk indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {riskCompanies.map((company) => {
                const RiskIcon = getRiskIcon(company.risk);
                return (
                  <div 
                    key={company.id}
                    className={`p-3 rounded-lg border ${getRiskColor(company.risk)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <RiskIcon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{company.name}</div>
                          <div className="text-sm opacity-75">{company.sectors?.name || 'Other'}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {company.revenueGrowth > 0 ? '+' : ''}{company.revenueGrowth.toFixed(1)}%
                        </div>
                        <div className="text-sm opacity-75">Growth</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance Summary</CardTitle>
          <CardDescription>Key metrics across all portfolio companies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {riskCompanies.filter(c => c.risk === 'low').length}
              </div>
              <div className="text-sm text-muted-foreground">Low Risk</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {riskCompanies.filter(c => c.risk === 'medium').length}
              </div>
              <div className="text-sm text-muted-foreground">Medium Risk</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {riskCompanies.filter(c => c.risk === 'high').length}
              </div>
              <div className="text-sm text-muted-foreground">High Risk</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">
                +{(riskCompanies.reduce((sum, c) => sum + c.revenueGrowth, 0) / riskCompanies.length).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Growth</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}