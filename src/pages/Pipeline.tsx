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
  const [stageDialogOpen, setStageDialogOpen] = useState<string | null>(null);
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sector: '',
    geography: '',
    valuation: '',
    description: ''
  });
  const { toast } = useToast();

  const dealsByStage = dealStageConfig.reduce((acc, stage) => {
    acc[stage.value] = deals.filter(deal => deal.stage === stage.value);
    return acc;
  }, {} as Record<string, Deal[]>);

  const createDeal = (stage?: string) => {
    if (!formData.name.trim()) return;
    
    const dealStage = (stage || 'sourcing') as Deal['stage'];
    const newDeal: Deal = {
      id: Date.now().toString(),
      name: formData.name,
      stage: dealStage,
      sector: formData.sector || 'Technology',
      geography: formData.geography || 'uk',
      valuation: formData.valuation ? parseInt(formData.valuation) : null,
      probability: dealStage === 'sourcing' ? 10 : dealStage === 'screening' ? 25 : dealStage === 'diligence' ? 50 : dealStage === 'term_sheet' ? 75 : dealStage === 'close' ? 100 : 5,
      owner_id: '1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setDeals(prev => [...prev, newDeal]);
    setFormData({ name: '', sector: '', geography: '', valuation: '', description: '' });
    setIsDialogOpen(false);
    setStageDialogOpen(null);
    toast({ title: "Deal created", description: `${newDeal.name} added to ${dealStageConfig.find(s => s.value === dealStage)?.label} stage` });
  };

  const handleDragStart = (e: React.DragEvent, deal: Deal) => {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    if (!draggedDeal || draggedDeal.stage === targetStage) return;

    const validStage = targetStage as Deal['stage'];
    setDeals(prev => prev.map(deal => 
      deal.id === draggedDeal.id 
        ? { ...deal, stage: validStage }
        : deal
    ));

    toast({ 
      title: "Deal moved", 
      description: `${draggedDeal.name} moved to ${dealStageConfig.find(s => s.value === validStage)?.label}` 
    });
    setDraggedDeal(null);
  };

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
                <Input 
                  id="deal-name" 
                  placeholder="Company name" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sector">Sector</Label>
                  <Select value={formData.sector} onValueChange={(value) => setFormData(prev => ({ ...prev, sector: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Financial Services">Financial Services</SelectItem>
                      <SelectItem value="Consumer Goods">Consumer Goods</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="geography">Geography</Label>
                  <Select value={formData.geography} onValueChange={(value) => setFormData(prev => ({ ...prev, geography: value }))}>
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
                <Input 
                  id="valuation" 
                  type="number" 
                  placeholder="50000000" 
                  value={formData.valuation}
                  onChange={(e) => setFormData(prev => ({ ...prev, valuation: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Brief deal description" 
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false);
                setFormData({ name: '', sector: '', geography: '', valuation: '', description: '' });
              }}>
                Cancel
              </Button>
              <Button onClick={() => createDeal()}>
                Create Deal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {dealStageConfig.map((stage) => (
          <div 
            key={stage.value} 
            className="space-y-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.value)}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                {stage.label}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {dealsByStage[stage.value]?.length || 0}
              </Badge>
            </div>

            <div className="space-y-3 min-h-32">
              {dealsByStage[stage.value]?.map((deal) => (
                <Card 
                  key={deal.id} 
                  className="cursor-move hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={(e) => handleDragStart(e, deal)}
                >
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

              <Dialog open={stageDialogOpen === stage.value} onOpenChange={(open) => setStageDialogOpen(open ? stage.value : null)}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full h-24 border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Deal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Deal to {stage.label}</DialogTitle>
                    <DialogDescription>
                      Create a new deal in the {stage.label.toLowerCase()} stage
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor={`deal-name-${stage.value}`}>Deal Name</Label>
                      <Input 
                        id={`deal-name-${stage.value}`}
                        placeholder="Company name" 
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Sector</Label>
                        <Select value={formData.sector} onValueChange={(value) => setFormData(prev => ({ ...prev, sector: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sector" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                            <SelectItem value="Financial Services">Financial Services</SelectItem>
                            <SelectItem value="Consumer Goods">Consumer Goods</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Geography</Label>
                        <Select value={formData.geography} onValueChange={(value) => setFormData(prev => ({ ...prev, geography: value }))}>
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
                      <Label>Valuation (£)</Label>
                      <Input 
                        type="number" 
                        placeholder="50000000" 
                        value={formData.valuation}
                        onChange={(e) => setFormData(prev => ({ ...prev, valuation: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => {
                      setStageDialogOpen(null);
                      setFormData({ name: '', sector: '', geography: '', valuation: '', description: '' });
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={() => createDeal(stage.value)}>
                      Create Deal
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}