import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, PieChart, Calculator, Target } from 'lucide-react';
import { mockFunds, mockKPIs } from '@/lib/mockData';

export function FundMetrics() {
  const fund = mockFunds[0];
  const totalKPIs = mockKPIs.reduce((acc, kpi) => ({
    revenue: acc.revenue + (kpi.revenue || 0),
    ebitda: acc.ebitda + (kpi.ebitda || 0),
    arr: acc.arr + (kpi.arr || 0)
  }), { revenue: 0, ebitda: 0, arr: 0 });

  // Mock calculations for PE metrics
  const irr = 24.5; // Internal Rate of Return %
  const moic = 2.8; // Multiple of Invested Capital
  const dpi = 1.2; // Distributions to Paid-In capital
  const tvpi = 2.1; // Total Value to Paid-In capital

  const commitmentProgress = ((fund?.total_commitment || 0) / (fund?.target_commitment || 1)) * 100;

  const metrics = [
    {
      label: 'IRR',
      value: `${irr}%`,
      description: 'Internal Rate of Return',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      label: 'MOIC',
      value: `${moic}x`,
      description: 'Multiple of Invested Capital',
      trend: 'up',
      icon: Calculator,
      color: 'text-blue-600'
    },
    {
      label: 'DPI',
      value: `${dpi}x`,
      description: 'Distributions to Paid-In',
      trend: 'stable',
      icon: PieChart,
      color: 'text-orange-600'
    },
    {
      label: 'TVPI',
      value: `${tvpi}x`,
      description: 'Total Value to Paid-In',
      trend: 'up',
      icon: Target,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Fund Overview */}
      <Card>
        <CardHeader>
          <CardTitle>{fund?.name}</CardTitle>
          <CardDescription>
            Vintage {fund?.vintage_year} • Target £{((fund?.target_commitment || 0) / 1000000).toFixed(0)}M
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Commitment Progress</span>
                <span className="text-sm text-muted-foreground">
                  £{((fund?.total_commitment || 0) / 1000000).toFixed(0)}M / £{((fund?.target_commitment || 0) / 1000000).toFixed(0)}M
                </span>
              </div>
              <Progress value={commitmentProgress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span>{commitmentProgress.toFixed(0)}% committed</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
              <Badge 
                variant={metric.trend === 'up' ? 'default' : 'secondary'} 
                className="mt-2 text-xs"
              >
                {metric.trend === 'up' ? '↗ Trending up' : '→ Stable'}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Portfolio Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
          <CardDescription>Aggregated metrics from portfolio companies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-2xl font-bold">£{(totalKPIs.revenue / 1000000).toFixed(1)}M</div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </div>
            <div>
              <div className="text-2xl font-bold">£{(totalKPIs.ebitda / 1000000).toFixed(1)}M</div>
              <p className="text-xs text-muted-foreground">Total EBITDA</p>
            </div>
            <div>
              <div className="text-2xl font-bold">£{(totalKPIs.arr / 1000000).toFixed(1)}M</div>
              <p className="text-xs text-muted-foreground">Total ARR</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}