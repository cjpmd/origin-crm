import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useInvestors, Investor } from "@/hooks/useInvestors";
import { EditInvestorDialog } from "@/components/Investors/EditInvestorDialog";
import { ViewInvestorDialog } from "@/components/Investors/ViewInvestorDialog";
import { InvestorActivityDialog } from "@/components/Investors/InvestorActivityDialog";
import { Plus, Search, LayoutGrid, LayoutList, Target, TrendingUp, DollarSign, Calendar, Activity, Pencil, Trash2, Filter, Maximize2, Settings2, Download, Mail } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const pipelineStages = ["Sourced", "Engaged", "Qualified", "Due Diligence", "Commitment Offered", "Committed", "Closed", "Nurture"];

const stageColors: Record<string, string> = {
  "Sourced": "bg-slate-50 border-slate-200 text-slate-700",
  "Engaged": "bg-blue-50 border-blue-200 text-blue-700",
  "Qualified": "bg-purple-50 border-purple-200 text-purple-700",
  "Due Diligence": "bg-amber-50 border-amber-200 text-amber-700",
  "Commitment Offered": "bg-cyan-50 border-cyan-200 text-cyan-700",
  "Committed": "bg-green-50 border-green-200 text-green-700",
  "Closed": "bg-emerald-50 border-emerald-200 text-emerald-700",
  "Nurture": "bg-gray-50 border-gray-200 text-gray-700"
};

const engagementColors: Record<string, string> = {
  "Cold": "bg-slate-100 text-slate-700",
  "Warm": "bg-amber-100 text-amber-700",
  "Hot": "bg-red-100 text-red-700"
};

export default function InvestorPipeline() {
  const { investors, isLoading, createInvestor, updateInvestor, deleteInvestor } = useInvestors();
  const { formatCurrency } = useCurrency();
  const [editingInvestor, setEditingInvestor] = useState<Investor | null>(null);
  const [viewingInvestor, setViewingInvestor] = useState<Investor | null>(null);
  const [activityInvestor, setActivityInvestor] = useState<Investor | null>(null);
  const [deletingInvestor, setDeletingInvestor] = useState<Investor | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStage, setFilterStage] = useState<string>("all");
  const [filterEngagement, setFilterEngagement] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [draggedInvestor, setDraggedInvestor] = useState<Investor | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [selectedInvestors, setSelectedInvestors] = useState<Set<string>>(new Set());
  const [hiddenStages, setHiddenStages] = useState<Set<string>>(new Set());
  const [isCompactView, setIsCompactView] = useState(false);
  const [showQuickFilters, setShowQuickFilters] = useState(false);

  const handleDragStart = (e: React.DragEvent, investor: any) => {
    setDraggedInvestor(investor);
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
    
    if (draggedInvestor && draggedInvestor.pipeline_stage !== targetStage) {
      await updateInvestor({
        id: draggedInvestor.id,
        pipeline_stage: targetStage
      });
      toast.success(`Moved ${draggedInvestor.name} to ${targetStage}`);
    }
    setDraggedInvestor(null);
  };

  const handleSaveInvestor = async (data: Partial<Investor> & { id?: string }) => {
    if (data.id) {
      await updateInvestor(data as Partial<Investor> & { id: string });
    } else {
      await createInvestor(data as Omit<Partial<Investor>, 'user_id' | 'id' | 'created_at' | 'updated_at'> & { name: string });
    }
  };

  const handleDeleteInvestor = async () => {
    if (deletingInvestor) {
      await deleteInvestor(deletingInvestor.id);
      setDeletingInvestor(null);
    }
  };

  const toggleInvestorSelection = (investorId: string) => {
    const newSet = new Set(selectedInvestors);
    if (newSet.has(investorId)) {
      newSet.delete(investorId);
    } else {
      newSet.add(investorId);
    }
    setSelectedInvestors(newSet);
  };

  const handleBulkMove = async (targetStage: string) => {
    const promises = Array.from(selectedInvestors).map(id => 
      updateInvestor({ id, pipeline_stage: targetStage })
    );
    await Promise.all(promises);
    toast.success(`Moved ${selectedInvestors.size} investors to ${targetStage}`);
    setSelectedInvestors(new Set());
  };

  const toggleStageVisibility = (stage: string) => {
    const newSet = new Set(hiddenStages);
    if (newSet.has(stage)) {
      newSet.delete(stage);
    } else {
      newSet.add(stage);
    }
    setHiddenStages(newSet);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Type', 'Stage', 'Engagement', 'Expected Commitment', 'Probability', 'Target Close'];
    const rows = filteredInvestors.map(inv => [
      inv.name,
      inv.type || '',
      inv.pipeline_stage || '',
      inv.engagement_level || '',
      inv.expected_commitment || '',
      inv.probability || '',
      inv.target_close_date || ''
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'investor-pipeline.csv';
    a.click();
    toast.success('Pipeline exported successfully');
  };

  const filteredInvestors = investors?.filter(investor => {
    const matchesSearch = investor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         investor.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = filterStage === "all" || investor.pipeline_stage === filterStage;
    const matchesEngagement = filterEngagement === "all" || investor.engagement_level === filterEngagement;
    return matchesSearch && matchesStage && matchesEngagement;
  }) || [];

  const getInvestorsByStage = (stage: string) => {
    return filteredInvestors.filter(inv => (inv.pipeline_stage || "Sourced") === stage);
  };

  // Calculate pipeline metrics
  const totalPipelineValue = filteredInvestors.reduce((sum, inv) => sum + (inv.expected_commitment || 0), 0);
  const weightedPipelineValue = filteredInvestors.reduce((sum, inv) => {
    const probability = (inv.probability || 0) / 100;
    return sum + ((inv.expected_commitment || 0) * probability);
  }, 0);
  const activeInvestors = filteredInvestors.filter(inv => 
    ["Engaged", "Qualified", "Due Diligence", "Commitment Offered"].includes(inv.pipeline_stage || "")
  ).length;

  // Render list view
  const renderListView = () => (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Investor Pipeline</h1>
            <p className="text-muted-foreground">Track and manage prospective investor relationships</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Investor
            </Button>
            <Button
              variant={viewMode === "board" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("board")}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Board
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <LayoutList className="h-4 w-4 mr-2" />
              List
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pipeline</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredInvestors.length}</div>
              <p className="text-xs text-muted-foreground">investors in pipeline</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expected Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPipelineValue)}</div>
              <p className="text-xs text-muted-foreground">total expected commitments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weighted Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(weightedPipelineValue)}</div>
              <p className="text-xs text-muted-foreground">probability-weighted</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Investors</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeInvestors}</div>
              <p className="text-xs text-muted-foreground">in active stages</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Actions */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search investors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={filterStage} onValueChange={setFilterStage}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {pipelineStages.map(stage => (
                <SelectItem key={stage} value={stage}>{stage}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterEngagement} onValueChange={setFilterEngagement}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Engagement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Engagement</SelectItem>
              <SelectItem value="Cold">Cold</SelectItem>
              <SelectItem value="Warm">Warm</SelectItem>
              <SelectItem value="Hot">Hot</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* List View Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Investor</th>
                    <th className="text-left p-4 font-medium">Stage</th>
                    <th className="text-left p-4 font-medium">Engagement</th>
                    <th className="text-left p-4 font-medium">Expected</th>
                    <th className="text-left p-4 font-medium">Probability</th>
                    <th className="text-left p-4 font-medium">Priority</th>
                    <th className="text-left p-4 font-medium">Target Close</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvestors.map(investor => (
                    <tr 
                      key={investor.id} 
                      className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setViewingInvestor(investor)}
                    >
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{investor.name}</div>
                          <div className="text-sm text-muted-foreground">{investor.type || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className={stageColors[investor.pipeline_stage || "Sourced"]}>
                          {investor.pipeline_stage || "Sourced"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className={engagementColors[investor.engagement_level || "Cold"]}>
                          {investor.engagement_level || "Cold"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {investor.expected_commitment ? formatCurrency(investor.expected_commitment) : '-'}
                      </td>
                      <td className="p-4">
                        {investor.probability ? `${investor.probability}%` : '-'}
                      </td>
                      <td className="p-4">
                        {investor.priority_score ? `★ ${investor.priority_score}` : '-'}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {investor.target_close_date ? new Date(investor.target_close_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivityInvestor(investor);
                            }}
                          >
                            <Activity className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingInvestor(investor);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingInvestor(investor);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredInvestors.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted-foreground">
                        No investors found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <EditInvestorDialog
          investor={editingInvestor}
          open={!!editingInvestor}
          onOpenChange={(open) => !open && setEditingInvestor(null)}
          onSave={handleSaveInvestor}
        />

        <EditInvestorDialog
          investor={null}
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSave={handleSaveInvestor}
        />

        {viewingInvestor && (
          <ViewInvestorDialog
            investor={viewingInvestor}
            open={!!viewingInvestor}
            onOpenChange={(open) => !open && setViewingInvestor(null)}
            onContact={() => {
              setActivityInvestor(viewingInvestor);
              setViewingInvestor(null);
            }}
          />
        )}

        {activityInvestor && (
          <InvestorActivityDialog
            investorId={activityInvestor.id}
            investorName={activityInvestor.name}
            open={!!activityInvestor}
            onOpenChange={(open) => !open && setActivityInvestor(null)}
          />
        )}

        <AlertDialog open={!!deletingInvestor} onOpenChange={(open) => !open && setDeletingInvestor(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Investor</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {deletingInvestor?.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteInvestor} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );

  // Render board view
  const renderBoardView = () => (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Investor Pipeline</h1>
            <p className="text-muted-foreground">Track and manage prospective investor relationships</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Investor
            </Button>
          <Button
            variant={viewMode === "board" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("board")}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Board
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <LayoutList className="h-4 w-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pipeline</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredInvestors.length}</div>
            <p className="text-xs text-muted-foreground">investors in pipeline</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPipelineValue)}</div>
            <p className="text-xs text-muted-foreground">total expected commitments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weighted Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(weightedPipelineValue)}</div>
            <p className="text-xs text-muted-foreground">probability-weighted</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investors</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeInvestors}</div>
            <p className="text-xs text-muted-foreground">in active stages</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Tools */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search investors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <Button
          variant={showQuickFilters ? "secondary" : "outline"}
          size="sm"
          onClick={() => setShowQuickFilters(!showQuickFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Quick Filters
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings2 className="h-4 w-4 mr-2" />
              Customize
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">View Options</h4>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm">Compact View</label>
                  <Checkbox 
                    checked={isCompactView} 
                    onCheckedChange={(checked) => setIsCompactView(!!checked)}
                  />
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-3">Visible Stages</h4>
                {pipelineStages.map(stage => (
                  <div key={stage} className="flex items-center justify-between mb-2">
                    <label className="text-sm">{stage}</label>
                    <Checkbox 
                      checked={!hiddenStages.has(stage)} 
                      onCheckedChange={() => toggleStageVisibility(stage)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {selectedInvestors.size > 0 && (
          <>
            <Separator orientation="vertical" className="h-8" />
            <Badge variant="secondary">{selectedInvestors.size} selected</Badge>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  Bulk Move
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="space-y-1">
                  {pipelineStages.map(stage => (
                    <Button
                      key={stage}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleBulkMove(stage)}
                    >
                      {stage}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedInvestors(new Set())}
            >
              Clear
            </Button>
          </>
        )}

        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {showQuickFilters && (
        <Card className="animate-fade-in">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterEngagement === "Hot" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterEngagement(filterEngagement === "Hot" ? "all" : "Hot")}
              >
                🔥 Hot Leads
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const highProbability = investors.filter(i => (i.probability || 0) >= 70);
                  if (highProbability.length > 0) {
                    setSearchQuery(highProbability[0].name);
                  }
                }}
              >
                📈 High Probability (≥70%)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const highPriority = investors.filter(i => (i.priority_score || 0) >= 4);
                  if (highPriority.length > 0) {
                    setSearchQuery(highPriority[0].name);
                  }
                }}
              >
                ⭐ High Priority
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery('')}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kanban Board */}
      <div className="w-full overflow-x-auto pb-4 -mx-6 px-6">
        <div className={`grid gap-3 ${isCompactView ? 'grid-cols-4' : 'grid-cols-3 xl:grid-cols-4'} min-w-max`} style={{ gridAutoColumns: isCompactView ? 'minmax(240px, 1fr)' : 'minmax(280px, 1fr)' }}>
          {pipelineStages.filter(stage => !hiddenStages.has(stage)).map((stage) => {
            const stageInvestors = getInvestorsByStage(stage);
            const stageValue = stageInvestors.reduce((sum, inv) => sum + (inv.expected_commitment || 0), 0);
            
            return (
              <div
                key={stage}
                className={`transition-all ${dragOverStage === stage ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                onDragOver={(e) => handleDragOver(e, stage)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage)}
              >
                <Card className={`${stageColors[stage]} border-2 h-full flex flex-col`}>
                  <CardHeader className={isCompactView ? "pb-2 p-3" : "pb-3"}>
                    <div className="flex items-center justify-between">
                      <CardTitle className={isCompactView ? "text-xs font-semibold" : "text-sm font-semibold"}>{stage}</CardTitle>
                      <Badge variant="secondary" className={isCompactView ? "text-xs h-5" : ""}>{stageInvestors.length}</Badge>
                    </div>
                    {stageValue > 0 && (
                      <p className="text-xs text-muted-foreground truncate">{formatCurrency(stageValue)}</p>
                    )}
                  </CardHeader>
                  <CardContent className={`space-y-2 flex-1 overflow-y-auto ${isCompactView ? 'p-2 max-h-[600px]' : 'max-h-[700px]'}`}>
                    {stageInvestors.map((investor) => (
                      <Card
                        key={investor.id}
                        className="group cursor-move hover:shadow-lg transition-all bg-card relative hover:scale-[1.02]"
                        draggable
                        onDragStart={(e) => handleDragStart(e, investor)}
                      >
                        <CardContent className={isCompactView ? "p-2 space-y-1.5" : "p-3 space-y-2"} onClick={() => setViewingInvestor(investor)}>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                            <Checkbox
                              checked={selectedInvestors.has(investor.id)}
                              onCheckedChange={() => toggleInvestorSelection(investor.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="h-4 w-4"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingInvestor(investor);
                              }}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingInvestor(investor);
                              }}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                          <div className="flex items-start justify-between pr-20">
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-semibold truncate ${isCompactView ? 'text-xs' : 'text-sm'}`}>{investor.name}</h4>
                              <p className={`text-muted-foreground truncate ${isCompactView ? 'text-[10px]' : 'text-xs'}`}>{investor.type || 'N/A'}</p>
                            </div>
                          </div>

                          {investor.engagement_level && (
                            <Badge variant="outline" className={`${engagementColors[investor.engagement_level]} ${isCompactView ? 'text-[10px] h-4 px-1' : 'text-xs'}`}>
                              {investor.engagement_level}
                            </Badge>
                          )}
                          
                          {investor.expected_commitment && (
                            <div className={`flex items-center justify-between ${isCompactView ? 'text-[10px]' : 'text-xs'}`}>
                              <span className="text-muted-foreground">Expected:</span>
                              <span className="font-semibold">{formatCurrency(investor.expected_commitment)}</span>
                            </div>
                          )}
                          
                          {investor.probability !== null && investor.probability !== undefined && (
                            <div className="flex items-center gap-2">
                              <div className={`flex-1 bg-muted rounded-full overflow-hidden ${isCompactView ? 'h-1' : 'h-1.5'}`}>
                                <div 
                                  className="bg-primary h-full transition-all"
                                  style={{ width: `${investor.probability}%` }}
                                />
                              </div>
                              <span className={`text-muted-foreground ${isCompactView ? 'text-[10px]' : 'text-xs'}`}>{investor.probability}%</span>
                            </div>
                          )}
                          
                          {!isCompactView && investor.priority_score && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Priority:</span>
                              <span className="text-amber-500">{'★'.repeat(investor.priority_score)}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    
                    {stageInvestors.length === 0 && (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        No investors in this stage
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      <EditInvestorDialog
        investor={editingInvestor}
        open={!!editingInvestor}
        onOpenChange={(open) => !open && setEditingInvestor(null)}
        onSave={handleSaveInvestor}
      />

      <EditInvestorDialog
        investor={null}
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleSaveInvestor}
      />

      {viewingInvestor && (
        <ViewInvestorDialog
          investor={viewingInvestor}
          open={!!viewingInvestor}
          onOpenChange={(open) => !open && setViewingInvestor(null)}
          onContact={() => {
            setActivityInvestor(viewingInvestor);
            setViewingInvestor(null);
          }}
        />
      )}

      {activityInvestor && (
        <InvestorActivityDialog
          investorId={activityInvestor.id}
          investorName={activityInvestor.name}
          open={!!activityInvestor}
          onOpenChange={(open) => !open && setActivityInvestor(null)}
        />
      )}

      <AlertDialog open={!!deletingInvestor} onOpenChange={(open) => !open && setDeletingInvestor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Investor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingInvestor?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteInvestor} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  return viewMode === "list" ? renderListView() : renderBoardView();
}
