import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, PieChart, Calculator, Target } from 'lucide-react';
import { useFunds } from '@/hooks/useFunds';
import { useFundCommitments } from '@/hooks/useFundCommitments';
import { usePortfolioKPIs } from '@/hooks/usePortfolioKPIs';
import { usePortfolioCompanies } from '@/hooks/usePortfolioCompanies';
import { useCurrency } from '@/contexts/CurrencyContext';

export function FundMetrics() {
  const { formatCurrency } = useCurrency();
  const { funds, isLoading: fundsLoading } = useFunds();
  const fund = funds[0]; // Default to first fund
  const { commitments } = useFundCommitments(fund?.id);
  const { kpis } = usePortfolioKPIs();
  const { companies } = usePortfolioCompanies();

  // Calculate actual totals from portfolio companies linked to this fund
  const fundCompanies = companies.filter(c => c.fund_id === fund?.id);
  const fundCompanyIds = fundCompanies.map(c => c.id);
  const fundKPIs = kpis.filter(kpi => fundCompanyIds.includes(kpi.company_id));
  
  const totalKPIs = fundKPIs.reduce((acc, kpi) => ({
    revenue: acc.revenue + (kpi.revenue || 0),
    ebitda: acc.ebitda + (kpi.ebitda || 0),
    arr: acc.arr + (kpi.arr || 0)
  }), { revenue: 0, ebitda: 0, arr: 0 });

  // Calculate actual commitment metrics
  const totalCommitment = commitments.reduce((sum, c) => sum + c.commitment_amount, 0);
  const totalCalled = commitments.reduce((sum, c) => sum + (c.called_amount || 0), 0);
  const totalDistributed = commitments.reduce((sum, c) => sum + (c.distributed_amount || 0), 0);

  // Calculate PE metrics (simplified calculations)
  const investedCapital = totalCalled || 1;
  const currentValue = fundCompanies.reduce((sum, c) => sum + (c.valuation || 0), 0);
  const dpi = totalDistributed / investedCapital; // Distributions to Paid-In
  const rvpi = currentValue / investedCapital; // Residual Value to Paid-In
  const tvpi = dpi + rvpi; // Total Value to Paid-In
  const moic = tvpi; // Multiple of Invested Capital
  
  // Simplified IRR calculation (would need actual cash flow dates for precision)
  const years = fund?.vintage_year ? new Date().getFullYear() - fund.vintage_year : 1;
  const irr = years > 0 ? ((Math.pow(moic, 1/years) - 1) * 100) : 0;

  const commitmentProgress = fund?.fund_size ? (totalCommitment / fund.fund_size) * 100 : 0;

  if (fundsLoading || !fund) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">No fund data available. Create a fund to get started.</p>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      label: 'IRR',
      value: `${irr.toFixed(1)}%`,
      description: 'Internal Rate of Return',
      trend: irr > (fund.target_irr || 0) ? 'up' : 'stable',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      label: 'MOIC',
      value: `${moic.toFixed(1)}x`,
      description: 'Multiple of Invested Capital',
      trend: moic > (fund.target_moic || 1) ? 'up' : 'stable',
      icon: Calculator,
      color: 'text-blue-600'
    },
    {
      label: 'DPI',
      value: `${dpi.toFixed(2)}x`,
      description: 'Distributions to Paid-In',
      trend: 'stable',
      icon: PieChart,
      color: 'text-orange-600'
    },
    {
      label: 'TVPI',
      value: `${tvpi.toFixed(2)}x`,
      description: 'Total Value to Paid-In',
      trend: tvpi > 1 ? 'up' : 'stable',
      icon: Target,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Fund Overview */}
      <Card>
        <CardHeader>
          <CardTitle>{fund.name}</CardTitle>
          <CardDescription>
            {fund.strategy && <span>{fund.strategy} • </span>}
            Vintage {fund.vintage_year} • Fund Size {formatCurrency(fund.fund_size)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Commitment Progress</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(totalCommitment)} / {formatCurrency(fund.fund_size)}
                </span>
              </div>
              <Progress value={commitmentProgress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span>{commitmentProgress.toFixed(0)}% committed</span>
                <span>100%</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-xs text-muted-foreground">Capital Called</p>
                <p className="text-lg font-semibold">{formatCurrency(totalCalled)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Distributed</p>
                <p className="text-lg font-semibold">{formatCurrency(totalDistributed)}</p>
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
              <div className="text-2xl font-bold">{formatCurrency(totalKPIs.revenue)}</div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{formatCurrency(totalKPIs.ebitda)}</div>
              <p className="text-xs text-muted-foreground">Total EBITDA</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{formatCurrency(totalKPIs.arr)}</div>
              <p className="text-xs text-muted-foreground">Total ARR</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}