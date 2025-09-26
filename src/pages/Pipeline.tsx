import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MoreHorizontal, Plus } from 'lucide-react';
import { mockDeals, dealStageConfig } from '@/lib/mockData';
import { Deal } from '@/types';
import { useToast } from '@/hooks/use-toast';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function Pipeline() {
  const [deals, setDeals] = useState<Deal[]>(mockDeals);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Deal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Deal</DialogTitle>
              <DialogDescription>
                Add a new investment opportunity to your pipeline
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="deal-name">Deal Name</Label>
                <Input id="deal-name" placeholder="Company name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sector">Sector</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Financial Services</SelectItem>
                      <SelectItem value="consumer">Consumer Goods</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="geography">Geography</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="eu">Europe</SelectItem>
                      <SelectItem value="us">United States</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="valuation">Valuation (£)</Label>
                <Input id="valuation" type="number" placeholder="50000000" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Brief deal description" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast({ title: "Deal created", description: "New deal added to pipeline" });
                setIsDialogOpen(false);
              }}>
                Create Deal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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