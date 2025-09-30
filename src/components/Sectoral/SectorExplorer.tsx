import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TreePine, TrendingUp, DollarSign, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSectors } from '@/hooks/useSectors';
import { Skeleton } from '@/components/ui/skeleton';

export function SectorExplorer() {
  const { sectors, isLoading } = useSectors();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sector Exposure Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sectors Available</CardTitle>
            <TreePine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sectors.length}</div>
            <p className="text-xs text-muted-foreground">Industry sectors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sectors.length}</div>
            <p className="text-xs text-muted-foreground">Active sectors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analysis Ready</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sectors.length}</div>
            <p className="text-xs text-muted-foreground">Sectors to analyze</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deep Research</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Available</div>
            <p className="text-xs text-muted-foreground">AI-powered insights</p>
          </CardContent>
        </Card>
      </div>

      {/* Sector List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TreePine className="h-5 w-5" />
            Industry Sectors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sectors.map((sector) => (
              <div key={sector.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button asChild variant="ghost" size="sm" className="h-auto p-0 font-medium">
                      <Link to={`/sectoral-analysis/${sector.id}`}>
                        {sector.name}
                      </Link>
                    </Button>
                    <Badge variant="secondary" className="text-xs">
                      Available
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {sector.description}
                    </div>
                  </div>
                </div>
                <Progress 
                  value={100} 
                  className="h-2"
                />
                <div className="text-xs text-muted-foreground">
                  <span>Click to explore {sector.name} sector analysis and run deep research</span>
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
            <CardTitle>Featured Sectors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sectors.slice(0, 3).map((sector) => (
                <div key={sector.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium">{sector.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {sector.description}
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/sectoral-analysis/${sector.id}`}>
                      Explore
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Sectors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sectors.slice(3, 6).map((sector) => (
                <div key={sector.id} className="flex items-center justify-between p-3 rounded-lg border border-dashed">
                  <div>
                    <div className="font-medium">{sector.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {sector.description}
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/sectoral-analysis/${sector.id}`}>
                      Explore
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
