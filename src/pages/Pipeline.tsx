import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, DollarSign, TrendingUp, Building2, Loader2 } from "lucide-react";
import { useDeals } from "@/hooks/useDeals";
import { Skeleton } from "@/components/ui/skeleton";

const dealStageConfig = [
  { id: "Lead", name: "Lead", color: "bg-slate-100 dark:bg-slate-800" },
  { id: "Qualified", name: "Qualified", color: "bg-blue-100 dark:bg-blue-900/30" },
  { id: "Due Diligence", name: "Due Diligence", color: "bg-purple-100 dark:bg-purple-900/30" },
  { id: "Negotiation", name: "Negotiation", color: "bg-orange-100 dark:bg-orange-900/30" },
  { id: "Closing", name: "Closing", color: "bg-green-100 dark:bg-green-900/30" },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function Pipeline() {
  const { deals, isLoading, createDeal, updateDeal, deleteDeal } = useDeals();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDeal, setNewDeal] = useState({
    name: "",
    stage: "Lead",
    valuation: "",
    probability: "",
    sector: "",
    owner: "",
  });
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);

  const dealsByStage = dealStageConfig.reduce((acc, stage) => {
    acc[stage.id] = deals.filter(deal => deal.stage === stage.id);
    return acc;
  }, {} as Record<string, typeof deals>);

  const handleCreateDeal = (stage?: string) => {
    createDeal({
      name: newDeal.name || `New Deal ${deals.length + 1}`,
      stage: stage || newDeal.stage,
      valuation: Number(newDeal.valuation) || undefined,
      probability: Number(newDeal.probability) || undefined,
      sector: newDeal.sector || undefined,
      owner: newDeal.owner || undefined,
    });

    setNewDeal({
      name: "",
      stage: "Lead",
      valuation: "",
      probability: "",
      sector: "",
      owner: "",
    });
    setIsDialogOpen(false);
  };

  const handleDragStart = (dealId: string) => {
    setDraggedDealId(dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stageId: string) => {
    if (!draggedDealId) return;

    updateDeal({
      id: draggedDealId,
      updates: { stage: stageId },
    });

    setDraggedDealId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

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
                  value={newDeal.name}
                  onChange={(e) => setNewDeal(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="valuation">Valuation ($)</Label>
                  <Input 
                    id="valuation" 
                    type="number" 
                    placeholder="5000000" 
                    value={newDeal.valuation}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, valuation: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="probability">Probability (%)</Label>
                  <Input 
                    id="probability" 
                    type="number" 
                    placeholder="70" 
                    min="0"
                    max="100"
                    value={newDeal.probability}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, probability: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sector">Sector</Label>
                <Input 
                  id="sector" 
                  placeholder="Technology" 
                  value={newDeal.sector}
                  onChange={(e) => setNewDeal(prev => ({ ...prev, sector: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="owner">Owner</Label>
                <Input 
                  id="owner" 
                  placeholder="John Doe" 
                  value={newDeal.owner}
                  onChange={(e) => setNewDeal(prev => ({ ...prev, owner: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleCreateDeal()}>Create Deal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {dealStageConfig.map((stage) => (
          <div
            key={stage.id}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(stage.id)}
          >
            <Card className={`${stage.color} border-2`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">{stage.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {dealsByStage[stage.id]?.length || 0} {dealsByStage[stage.id]?.length === 1 ? 'deal' : 'deals'}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {dealsByStage[stage.id]?.map((deal) => (
                  <Card
                    key={deal.id}
                    draggable
                    onDragStart={() => handleDragStart(deal.id)}
                    className={`cursor-move hover:shadow-lg transition-all bg-card border-border hover:border-primary/50 ${
                      draggedDealId === deal.id ? 'opacity-50' : ''
                    }`}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-base leading-tight">{deal.name}</h3>
                        
                        <div className="flex items-center gap-3 flex-wrap">
                          {deal.valuation && (
                            <div className="flex items-center text-sm font-medium">
                              <DollarSign className="h-3.5 w-3.5 mr-1 text-primary" />
                              <span>{formatCurrency(deal.valuation)}</span>
                            </div>
                          )}
                          {deal.probability !== null && deal.probability !== undefined && (
                            <div className="flex items-center text-sm font-medium">
                              <TrendingUp className="h-3.5 w-3.5 mr-1 text-success" />
                              <span>{deal.probability}%</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        {deal.sector && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Building2 className="h-3.5 w-3.5 mr-1" />
                            <span className="truncate max-w-[100px]">{deal.sector}</span>
                          </div>
                        )}
                        {deal.owner && (
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                              {getInitials(deal.owner)}
                            </div>
                            <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                              {deal.owner}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <Button
                  variant="outline"
                  className="w-full border-dashed hover:border-primary hover:bg-primary/5"
                  onClick={() => {
                    setNewDeal({ ...newDeal, stage: stage.id });
                    setIsDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Deal
                </Button>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
