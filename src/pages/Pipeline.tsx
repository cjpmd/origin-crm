import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MoreHorizontal, Plus } from 'lucide-react';
import { mockDeals, dealStageConfig } from '@/lib/mockData';
import { Deal } from '@/types';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function Pipeline() {
  const [deals] = useState<Deal[]>(mockDeals);

  const dealsByStage = dealStageConfig.reduce((acc, stage) => {
    acc[stage.value] = deals.filter(deal => deal.stage === stage.value);
    return acc;
  }, {} as Record<string, Deal[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deal Pipeline</h1>
          <p className="text-muted-foreground">
            Track and manage your investment opportunities
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Deal
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {dealStageConfig.map((stage) => (
          <div key={stage.value} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                {stage.label}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {dealsByStage[stage.value]?.length || 0}
              </Badge>
            </div>

            <div className="space-y-3">
              {dealsByStage[stage.value]?.map((deal) => (
                <Card key={deal.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-medium leading-tight">
                        {deal.name}
                      </CardTitle>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Valuation</span>
                        <span className="font-medium">
                          {deal.valuation ? formatCurrency(deal.valuation) : 'TBD'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Probability</span>
                        <span className="font-medium">{deal.probability}%</span>
                      </div>

                      {deal.sector && (
                        <Badge variant="outline" className="text-xs">
                          {deal.sector}
                        </Badge>
                      )}

                      <div className="flex items-center gap-2 pt-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {deal.owner_id === '1' ? 'SC' : 'MR'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {deal.owner_id === '1' ? 'Sarah Chen' : 'Michael Rodriguez'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button 
                variant="outline" 
                className="w-full h-24 border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Deal
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}