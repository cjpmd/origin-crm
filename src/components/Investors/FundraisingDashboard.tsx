import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useInvestors } from '@/hooks/useInvestors';
import { useCurrency } from '@/contexts/CurrencyContext';
import { TrendingUp, Target, Clock, Users, DollarSign, Percent } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const pipelineStages = ["Sourced", "Engaged", "Qualified", "Due Diligence", "Commitment Offered", "Committed", "Closed"];

export function FundraisingDashboard() {
  const { investors } = useInvestors();
  const { formatCurrency } = useCurrency();

  // Calculate metrics
  const totalInvestors = investors.length;
  const totalPipeline = investors.reduce((sum, inv) => sum + (inv.expected_commitment || 0), 0);
  const weightedPipeline = investors.reduce((sum, inv) => {
    const probability = (inv.probability || 0) / 100;
    return sum + ((inv.expected_commitment || 0) * probability);
  }, 0);

  const activeInvestors = investors.filter(inv => 
    ["Engaged", "Qualified", "Due Diligence", "Commitment Offered"].includes(inv.pipeline_stage || "")
  ).length;

  const avgProbability = investors.length > 0
    ? investors.reduce((sum, inv) => sum + (inv.probability || 0), 0) / investors.length
    : 0;

  const hotInvestors = investors.filter(inv => inv.engagement_level === 'Hot').length;

  // Stage distribution
  const stageDistribution = pipelineStages.map(stage => {
    const count = investors.filter(inv => inv.pipeline_stage === stage).length;
    const value = investors
      .filter(inv => inv.pipeline_stage === stage)
      .reduce((sum, inv) => sum + (inv.expected_commitment || 0), 0);
    return { stage, count, value };
  });

  // Conversion rate (Committed / Total)
  const committedCount = investors.filter(inv => inv.pipeline_stage === 'Committed' || inv.pipeline_stage === 'Closed').length;
  const conversionRate = totalInvestors > 0 ? (committedCount / totalInvestors) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Fundraising Pipeline</h2>
        <p className="text-muted-foreground">Overview of your investor pipeline and fundraising progress</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pipeline</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvestors}</div>
            <p className="text-xs text-muted-foreground">investors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPipeline)}</div>
            <p className="text-xs text-muted-foreground">expected commitments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weighted Pipeline</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(weightedPipeline)}</div>
            <p className="text-xs text-muted-foreground">probability-adjusted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeInvestors}</div>
            <p className="text-xs text-muted-foreground">in active stages</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Probability</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProbability.toFixed(1)}%</div>
            <Progress value={avgProbability} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hotInvestors}</div>
            <p className="text-xs text-muted-foreground">high engagement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{committedCount} committed</p>
          </CardContent>
        </Card>
      </div>

      {/* Stage Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stageDistribution.map((stage, index) => {
              const maxValue = Math.max(...stageDistribution.map(s => s.value));
              const widthPercent = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
              
              return (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stage.stage}</span>
                      <Badge variant="outline">{stage.count}</Badge>
                    </div>
                    <span className="text-muted-foreground">{formatCurrency(stage.value)}</span>
                  </div>
                  <div className="relative h-8 bg-muted rounded overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-primary transition-all"
                      style={{ width: `${widthPercent}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                      {widthPercent > 10 && formatCurrency(stage.value)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
