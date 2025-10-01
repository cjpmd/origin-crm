import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDeals } from "@/hooks/useDeals";
import { useContacts } from "@/hooks/useContacts";
import { EditDealDialog } from "@/components/Pipeline/EditDealDialog";
import { DealDetailsDialog } from "@/components/Pipeline/DealDetailsDialog";
import { PromoteDealDialog } from "@/components/Pipeline/PromoteDealDialog";
import { Plus, Search, Building2, User, Calendar, TrendingUp, LayoutGrid, LayoutList } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

const stages = ["Lead", "Qualified", "Meeting", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

const stageColors: Record<string, string> = {
  "Lead": "bg-slate-100 border-slate-300 text-slate-700",
  "Qualified": "bg-blue-100 border-blue-300 text-blue-700",
  "Meeting": "bg-purple-100 border-purple-300 text-purple-700",
  "Proposal": "bg-amber-100 border-amber-300 text-amber-700",
  "Negotiation": "bg-orange-100 border-orange-300 text-orange-700",
  "Closed Won": "bg-green-100 border-green-300 text-green-700",
  "Closed Lost": "bg-red-100 border-red-300 text-red-700"
};

export default function Pipeline() {
  const { deals, isLoading, createDeal, updateDeal, deleteDeal } = useDeals();
  const { contacts } = useContacts();
  const { formatCurrency } = useCurrency();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [promotingDeal, setPromotingDeal] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStage, setFilterStage] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [draggedDeal, setDraggedDeal] = useState<any>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, deal: any) => {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stage);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    setDragOverStage(null);
    
    if (draggedDeal && draggedDeal.stage !== targetStage) {
      await updateDeal({
        id: draggedDeal.id,
        updates: { stage: targetStage }
      });
    }
    setDraggedDeal(null);
  };

  const filteredDeals = deals?.filter((deal) => {
    const matchesSearch = deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         deal.sector?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = filterStage === "all" || deal.stage === filterStage;
    return matchesSearch && matchesStage;
  });

  const dealsByStage = stages.reduce((acc, stage) => {
    acc[stage] = filteredDeals?.filter((d) => d.stage === stage) || [];
    return acc;
  }, {} as Record<string, any[]>);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getOwnerInfo = (ownerId: string) => {
    const contact = contacts?.find(c => c.id === ownerId);
    return contact;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pipeline</h1>
          <p className="text-muted-foreground">
            Track and manage your deal pipeline
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Deal
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStage} onValueChange={setFilterStage}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {stages.map((stage) => (
                  <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "board" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("board")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Board */}
      {viewMode === "board" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {stages.map((stage) => {
            const stageDeals = dealsByStage[stage] || [];
            const stageValue = stageDeals.reduce((sum, deal) => sum + (Number(deal.valuation) || 0), 0);
            
            return (
              <Card 
                key={stage} 
                className={`border-2 ${stageColors[stage]} ${dragOverStage === stage ? 'ring-2 ring-primary' : ''}`}
                onDragOver={(e) => handleDragOver(e, stage)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">{stage}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {stageDeals.length}
                    </Badge>
                  </div>
                  <p className="text-xs font-medium mt-1">
                    {formatCurrency(stageValue)}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                  {stageDeals.map((deal) => {
                    const owner = getOwnerInfo(deal.owner);
                    return (
                      <Card
                        key={deal.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal)}
                        className={`p-3 cursor-move hover:shadow-md transition-shadow bg-background ${
                          draggedDeal?.id === deal.id ? 'opacity-50' : ''
                        }`}
                        onClick={(e) => {
                          if (!draggedDeal) setSelectedDeal(deal);
                        }}
                      >
                        <div className="space-y-3">
                          {/* Company Logo/Icon */}
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <Avatar className="h-10 w-10 rounded-lg">
                                <AvatarFallback className="rounded-lg bg-primary/10">
                                  <Building2 className="h-5 w-5 text-primary" />
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm truncate">{deal.name}</h4>
                              {deal.sector && (
                                <p className="text-xs text-muted-foreground">{deal.sector}</p>
                              )}
                            </div>
                          </div>

                          {/* Deal Value */}
                          {deal.valuation && (
                            <div className="flex items-center gap-1 text-sm font-semibold">
                              <TrendingUp className="h-3 w-3 text-green-600" />
                              {formatCurrency(deal.valuation)}
                            </div>
                          )}

                          {/* Owner and Last Contact */}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            {owner ? (
                              <div className="flex items-center gap-1">
                                <Avatar className="h-4 w-4">
                                  <AvatarFallback className="text-[8px]">
                                    {getInitials(owner.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{owner.name}</span>
                              </div>
                            ) : (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Unassigned
                              </span>
                            )}
                            {deal.expected_close_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(deal.expected_close_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </div>
                            )}
                          </div>

                          {/* Probability Badge */}
                          {deal.probability && (
                            <Badge variant="outline" className="text-xs">
                              {deal.probability}% probability
                            </Badge>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                  {stageDeals.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-8">
                      No deals in this stage
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredDeals?.map((deal) => {
                const owner = getOwnerInfo(deal.owner);
                return (
                  <div
                    key={deal.id}
                    className="p-4 hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => setSelectedDeal(deal)}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 rounded-lg">
                        <AvatarFallback className="rounded-lg bg-primary/10">
                          <Building2 className="h-6 w-6 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold">{deal.name}</h4>
                        <p className="text-sm text-muted-foreground">{deal.sector}</p>
                      </div>
                      <Badge className={stageColors[deal.stage]}>{deal.stage}</Badge>
                      {deal.valuation && (
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(deal.valuation)}</p>
                          {deal.probability && (
                            <p className="text-xs text-muted-foreground">{deal.probability}% probability</p>
                          )}
                        </div>
                      )}
                      {owner && (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {getInitials(owner.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{owner.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {isAddOpen && (
        <EditDealDialog
          deal={{} as any}
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          onSave={async (data) => {
            await createDeal(data as any);
            setIsAddOpen(false);
          }}
        />
      )}

      {editingDeal && (
        <EditDealDialog
          deal={editingDeal}
          open={!!editingDeal}
          onOpenChange={(open) => !open && setEditingDeal(null)}
          onSave={async (data) => {
            await updateDeal({ id: editingDeal.id, updates: data });
            setEditingDeal(null);
          }}
        />
      )}

      {selectedDeal && (
        <DealDetailsDialog
          deal={selectedDeal}
          open={!!selectedDeal}
          onOpenChange={(open) => !open && setSelectedDeal(null)}
        />
      )}

      {promotingDeal && (
        <PromoteDealDialog
          deal={promotingDeal}
          open={!!promotingDeal}
          onOpenChange={(open) => !open && setPromotingDeal(null)}
          onSuccess={() => setPromotingDeal(null)}
        />
      )}
    </div>
  );
}
