import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { mockKPIs, mockPortfolioCompanies } from '@/lib/mockData';

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
  // Prepare chart data
  const revenueData = mockKPIs.map(kpi => ({
    period: new Date(kpi.period).toLocaleDateString('en-US', { month: 'short' }),
    revenue: (kpi.revenue || 0) / 1000000,
    ebitda: (kpi.ebitda || 0) / 1000000,
    arr: (kpi.arr || 0) / 1000000,
  }));

  const sectorData = mockPortfolioCompanies.reduce((acc, company) => {
    const sector = company.sector || 'Other';
    acc[sector] = (acc[sector] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(sectorData).map(([sector, count], index) => ({
    name: sector,
    value: count,
    color: `hsl(${index * 137.5 % 360}, 70%, 50%)`
  }));

  // Risk indicators based on performance
  const riskCompanies = mockPortfolioCompanies.map(company => {
    const kpi = mockKPIs.find(k => k.company_id === company.id);
    const revenueGrowth = Math.random() * 40 - 10; // Mock growth rate
    const risk = revenueGrowth < 0 ? 'high' : revenueGrowth < 10 ? 'medium' : 'low';
    
    return {
      ...company,
      revenueGrowth,
      risk,
      kpi
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
      {/* Revenue and Performance Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Monthly revenue and EBITDA performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <XAxis dataKey="period" />
                  <YAxis />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: number) => [`£${value.toFixed(1)}M`, '']}
                  />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                  <Bar dataKey="ebitda" fill="var(--color-ebitda)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ARR Growth</CardTitle>
            <CardDescription>Annual Recurring Revenue trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <XAxis dataKey="period" />
                  <YAxis />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: number) => [`£${value.toFixed(1)}M`, 'ARR']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="arr" 
                    stroke="var(--color-arr)" 
                    strokeWidth={3}
                    dot={{ fill: 'var(--color-arr)', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
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
                          <div className="text-sm opacity-75">{company.sector}</div>
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