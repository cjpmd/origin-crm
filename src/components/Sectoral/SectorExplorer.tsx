import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TreePine, TrendingUp, DollarSign, Users, Leaf } from 'lucide-react';
import { mockSectors, mockPortfolioCompanies, mockDeals, getSectorBenchmark } from '@/lib/mockData';
import { Link } from 'react-router-dom';

export function SectorExplorer() {
  // Calculate sector exposure from portfolio and pipeline
  const sectorStats = mockSectors.map(sector => {
    const portfolioCount = mockPortfolioCompanies.filter(company => company.sector === sector.name).length;
    const pipelineCount = mockDeals.filter(deal => deal.sector === sector.name).length;
    const benchmark = getSectorBenchmark(sector.id);
    
    return {
      ...sector,
      portfolioCount,
      pipelineCount,
      totalExposure: portfolioCount + pipelineCount,
      benchmark
    };
  });

  const maxExposure = Math.max(...sectorStats.map(s => s.totalExposure));

  return (
    <div className="space-y-6">
      {/* Sector Exposure Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sectors Covered</CardTitle>
            <TreePine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSectors.length}</div>
            <p className="text-xs text-muted-foreground">Across portfolio & pipeline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(sectorStats.reduce((sum, s) => sum + (s.cagr || 0), 0) / sectorStats.length).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Weighted avg CAGR</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Market Size</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(sectorStats.reduce((sum, s) => sum + (s.market_size || 0), 0) / 1e12).toFixed(1)}T
            </div>
            <p className="text-xs text-muted-foreground">Combined TAM</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Coverage</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sectorStats.filter(s => s.portfolioCount > 0).length}/{mockSectors.length}
            </div>
            <p className="text-xs text-muted-foreground">Sectors with holdings</p>
          </CardContent>
        </Card>
      </div>

      {/* Sector Heat Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TreePine className="h-5 w-5" />
            Sector Exposure Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sectorStats.map((sector) => (
              <div key={sector.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button asChild variant="ghost" size="sm" className="h-auto p-0 font-medium">
                      <Link to={`/sectoral-analysis/${sector.id}`}>
                        {sector.name}
                      </Link>
                    </Button>
                    <div className="flex gap-2">
                      {sector.portfolioCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {sector.portfolioCount} Portfolio
                        </Badge>
                      )}
                      {sector.pipelineCount > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {sector.pipelineCount} Pipeline
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm font-medium">
                      {sector.cagr}% CAGR
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${((sector.market_size || 0) / 1e9).toFixed(0)}B TAM
                    </div>
                  </div>
                </div>
                <Progress 
                  value={maxExposure > 0 ? (sector.totalExposure / maxExposure) * 100 : 0} 
                  className="h-2"
                />
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>Total Exposure: {sector.totalExposure}</span>
                  {sector.benchmark && (
                    <span>Avg Rev Growth: {sector.benchmark.avg_revenue_growth}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Sector Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>High Growth Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sectorStats
                .filter(s => (s.cagr || 0) > 15)
                .sort((a, b) => (b.cagr || 0) - (a.cagr || 0))
                .slice(0, 3)
                .map((sector) => (
                  <div key={sector.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="font-medium">{sector.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {sector.key_trends?.slice(0, 2).join(', ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{sector.cagr}%</div>
                      <div className="text-xs text-muted-foreground">CAGR</div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Underrepresented Sectors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sectorStats
                .filter(s => s.totalExposure === 0 && (s.cagr || 0) > 10)
                .sort((a, b) => (b.cagr || 0) - (a.cagr || 0))
                .slice(0, 3)
                .map((sector) => (
                  <div key={sector.id} className="flex items-center justify-between p-3 rounded-lg border border-dashed">
                    <div>
                      <div className="font-medium">{sector.name}</div>
                      <div className="text-sm text-muted-foreground">
                        No current exposure
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">{sector.cagr}%</div>
                      <div className="text-xs text-muted-foreground">Growth</div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}