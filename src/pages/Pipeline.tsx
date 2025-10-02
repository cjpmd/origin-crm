import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDeals } from "@/hooks/useDeals";
import { useProfiles } from "@/hooks/useProfiles";
import { EditDealDialog } from "@/components/Pipeline/EditDealDialog";
import { DealDetailsDialog } from "@/components/Pipeline/DealDetailsDialog";
import { PromoteDealDialog } from "@/components/Pipeline/PromoteDealDialog";
import { CompanySearchDialog } from "@/components/Pipeline/CompanySearchDialog";
import { Plus, Search, Building2, User, Calendar, TrendingUp, LayoutGrid, LayoutList, RefreshCw } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const stages = ["Lead", "Qualified", "Meeting", "Proposal", "Negotiation", "Closing", "Closed Won", "Closed Lost"];

const stageColors: Record<string, string> = {
  "Lead": "bg-slate-50 border-slate-200 text-slate-700",
  "Qualified": "bg-blue-50 border-blue-200 text-blue-700",
  "Meeting": "bg-purple-50 border-purple-200 text-purple-700",
  "Proposal": "bg-amber-50 border-amber-200 text-amber-700",
  "Negotiation": "bg-orange-50 border-orange-200 text-orange-700",
  "Closing": "bg-indigo-50 border-indigo-200 text-indigo-700",
  "Closed Won": "bg-green-50 border-green-200 text-green-700",
  "Closed Lost": "bg-red-50 border-red-200 text-red-700"
};

export default function Pipeline() {
  const { deals, isLoading, createDeal, updateDeal, deleteDeal } = useDeals();
  const { profiles } = useProfiles();
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
  const [isFetchingAllLogos, setIsFetchingAllLogos] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [isCompanySearchOpen, setIsCompanySearchOpen] = useState(false);

  const handleFetchAllLogos = async () => {
    const dealsWithoutLogos = deals?.filter(d => d.website && !d.logo_url) || [];
    
    if (dealsWithoutLogos.length === 0) {
      toast.info('All deals with websites already have logos');
      return;
    }

    setIsFetchingAllLogos(true);
    toast.info(`Fetching logos for ${dealsWithoutLogos.length} deals...`);

    let successCount = 0;
    let failCount = 0;

    for (const deal of dealsWithoutLogos) {
      try {
        const { data, error } = await supabase.functions.invoke('fetch-company-logo', {
          body: { website: deal.website, dealId: deal.id }
        });

        if (error) throw error;
        if (data?.logoUrl) successCount++;
      } catch (error) {
        console.error(`Error fetching logo for ${deal.name}:`, error);
        failCount++;
      }
    }

    setIsFetchingAllLogos(false);
    toast.success(`Fetched ${successCount} logos successfully${failCount > 0 ? `, ${failCount} failed` : ''}`);
  };

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
    const profile = profiles?.find(p => p.id === ownerId);
    return profile;
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
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsCompanySearchOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            Search Companies
          </Button>
          <Button 
            variant="outline" 
            onClick={handleFetchAllLogos}
            disabled={isFetchingAllLogos}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetchingAllLogos ? 'animate-spin' : ''}`} />
            {isFetchingAllLogos ? 'Fetching Logos...' : 'Fetch All Logos'}
          </Button>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Deal
          </Button>
        </div>
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
        <div className="flex gap-3 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageDeals = dealsByStage[stage] || [];
            const stageValue = stageDeals.reduce((sum, deal) => sum + (Number(deal.valuation) || 0), 0);
            
            return (
              <div 
                key={stage} 
                className="flex-shrink-0 w-[280px]"
              >
                <Card 
                  className={`h-full flex flex-col border ${
                    dragOverStage === stage ? 'ring-2 ring-primary shadow-lg' : ''
                  } transition-all`}
                  onDragOver={(e) => handleDragOver(e, stage)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage)}
                >
                  <CardHeader className="pb-2 pt-3 px-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${stageColors[stage].replace('bg-', 'bg-').split(' ')[0].replace('bg-', 'bg-').replace('-50', '-500')}`} />
                        <CardTitle className="text-xs font-semibold uppercase tracking-wide truncate">{stage}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="text-xs font-medium h-5 px-1.5">
                        {stageDeals.length}
                      </Badge>
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground mt-1">
                      {formatCurrency(stageValue)}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2 overflow-y-auto flex-1 pt-2 px-3 pb-3" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                    {stageDeals.map((deal) => {
                      const owner = getOwnerInfo(deal.owner);
                      const isExpanded = expandedCardId === deal.id;
                      
                      return (
                        <Card
                          key={deal.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, deal)}
                          className={`p-3 cursor-pointer hover:shadow-md transition-all bg-card border ${
                            draggedDeal?.id === deal.id ? 'opacity-50' : ''
                          } ${isExpanded ? 'ring-2 ring-primary' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!draggedDeal) {
                              setExpandedCardId(isExpanded ? null : deal.id);
                            }
                          }}
                        >
                          <div className="space-y-2">
                            {/* Company Info */}
                            <div className="flex items-start gap-2">
                              <Avatar className="h-8 w-8 rounded-md flex-shrink-0">
                                {deal.logo_url ? (
                                  <AvatarImage src={deal.logo_url} alt={deal.name} className="object-cover" />
                                ) : null}
                                <AvatarFallback className="rounded-md bg-primary/10 text-xs">
                                  <Building2 className="h-4 w-4 text-primary" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm leading-tight truncate">{deal.name}</h4>
                                {deal.website && (
                                  <p className="text-xs text-muted-foreground truncate">{deal.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</p>
                                )}
                              </div>
                            </div>

                            {/* Owner */}
                            {owner && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Avatar className="h-4 w-4">
                                  {owner.avatar_url ? (
                                    <AvatarImage src={owner.avatar_url} alt={owner.full_name || ''} />
                                  ) : null}
                                  <AvatarFallback className="text-[8px]">
                                    {getInitials(owner.full_name || 'U')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="truncate">{owner.full_name}</span>
                              </div>
                            )}

                            {/* Amount - Prominent */}
                            {deal.valuation && (
                              <div className="text-base font-bold text-foreground">
                                {formatCurrency(deal.valuation)}
                              </div>
                            )}

                            {/* Expanded Content */}
                            {isExpanded && (
                              <div className="space-y-2 pt-2 border-t animate-in fade-in slide-in-from-top-2 duration-200">
                                {deal.expected_close_date && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Close Date</span>
                                    <span className="font-medium">
                                      {new Date(deal.expected_close_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                  </div>
                                )}
                                {deal.probability && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Probability</span>
                                    <Badge variant="outline" className="text-xs h-5">
                                      {deal.probability}%
                                    </Badge>
                                  </div>
                                )}
                                {deal.sector && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Sector</span>
                                    <span className="font-medium truncate ml-2">{deal.sector}</span>
                                  </div>
                                )}
                                {deal.notes && (
                                  <div className="text-xs">
                                    <span className="text-muted-foreground">Notes:</span>
                                    <p className="mt-1 text-foreground line-clamp-2">{deal.notes}</p>
                                  </div>
                                )}
                                
                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 h-7 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedCardId(null);
                                      setSelectedDeal(deal);
                                    }}
                                  >
                                    Open
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="flex-1 h-7 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedCardId(null);
                                      setEditingDeal(deal);
                                    }}
                                  >
                                    Edit
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                    {stageDeals.length === 0 && (
                      <div className="text-center py-8 px-2">
                        <div className="w-10 h-10 rounded-full bg-muted/50 mx-auto mb-2 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-muted-foreground/50" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Drop deals here
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
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
                        {deal.logo_url ? (
                          <AvatarImage src={deal.logo_url} alt={deal.name} className="object-cover" />
                        ) : null}
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
                            {owner.avatar_url ? (
                              <AvatarImage src={owner.avatar_url} alt={owner.full_name || ''} />
                            ) : null}
                            <AvatarFallback className="text-xs">
                              {getInitials(owner.full_name || 'U')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{owner.full_name}</span>
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
          onEdit={(deal) => {
            setSelectedDeal(null);
            setEditingDeal(deal);
          }}
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

      <CompanySearchDialog
        open={isCompanySearchOpen}
        onOpenChange={setIsCompanySearchOpen}
        onAddToPipeline={(company) => {
          createDeal({
            name: company.company_name,
            stage: "Lead",
            website: company.website_url,
            logo_url: company.logo_url,
            sector: company.industry,
            notes: [
              company.description,
              company.tagline ? `Tagline: ${company.tagline}` : '',
              company.location ? `Location: ${company.location}` : ''
            ].filter(Boolean).join('\n\n'),
          });
        }}
      />
    </div>
  );
}
