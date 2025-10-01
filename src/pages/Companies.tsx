import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, Search, Plus, MapPin, Calendar, TrendingUp, Eye, Edit, BarChart3 } from 'lucide-react';
import { mockKPIs, mockESGRatings, mockESGHistory, mockSectorBenchmarks, getESGRiskLevel } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { useSectors } from '@/hooks/useSectors';
import { usePortfolioCompanies } from '@/hooks/usePortfolioCompanies';
import { usePortfolioKPIs } from '@/hooks/usePortfolioKPIs';
import { useFunds } from '@/hooks/useFunds';
import { useDeals } from '@/hooks/useDeals';
import { useCurrency } from '@/contexts/CurrencyContext';
import type { PortfolioCompany } from '@/hooks/usePortfolioCompanies';
import { ESGRatingCard } from "@/components/ESG/ESGRatingCard";
import { ESGHistoryChart } from "@/components/ESG/ESGHistoryChart";
import { SectorBenchmarkChart } from "@/components/ESG/SectorBenchmarkChart";
import { MarketCapCard } from "@/components/Market/MarketCapCard";
import { StockPriceChart } from "@/components/Market/StockPriceChart";
import { ValuationMetrics } from "@/components/Market/ValuationMetrics";
import { ResearchTrigger } from "@/components/Research/ResearchTrigger";
import { KPIManagementDialog } from "@/components/Portfolio/KPIManagementDialog";
import { EditCompanyDialog } from "@/components/Companies/EditCompanyDialog";
import { AIInsightCard } from "@/components/Intelligence/AIInsightCard";
import { ActivityTimeline } from "@/components/Activity/ActivityTimeline";
import { useResearch } from "@/hooks/useResearch";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Companies() {
  const { formatCurrency } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isKPIDialogOpen, setIsKPIDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<PortfolioCompany | null>(null);
  const [formData, setFormData] = useState<Partial<PortfolioCompany>>({
    name: '',
    sector_id: '',
    stage: 'Seed',
    investment_date: '',
    investment_amount: undefined,
    ownership_percentage: undefined,
    valuation: undefined,
    location: '',
    website: '',
    description: '',
    status: 'Active',
    is_public: false,
    stock_ticker: '',
    current_stock_price: undefined,
    market_cap: undefined,
    enterprise_value: undefined,
    fund_id: '',
    deal_id: '',
    exit_date: '',
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { startResearch, isStarting } = useResearch();
  const { sectors } = useSectors();
  const { companies, isLoading, createCompany, updateCompany } = usePortfolioCompanies();
  const { kpis } = usePortfolioKPIs();
  const { funds } = useFunds();
  const { deals } = useDeals();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getKPIForCompany = (companyId: string) => {
    const companyKPIs = kpis.filter(kpi => kpi.company_id === companyId);
    return companyKPIs.length > 0 ? companyKPIs[0] : mockKPIs.find(kpi => kpi.company_id === companyId);
  };

  const getGrowthRate = () => {
    return (Math.random() * 40 - 10).toFixed(1);
  };

  const filteredCompanies = companies.filter(company => {
    const sectorName = sectors.find(s => s.id === company.sector_id)?.name || '';
    const matchesSearch = company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sectorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = sectorFilter === 'all' || company.sector_id === sectorFilter;
    return matchesSearch && matchesSector;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      sector_id: '',
      stage: 'Seed',
      investment_date: '',
      investment_amount: undefined,
      ownership_percentage: undefined,
      valuation: undefined,
      location: '',
      website: '',
      description: '',
      status: 'Active',
      is_public: false,
      stock_ticker: '',
      current_stock_price: undefined,
      market_cap: undefined,
      enterprise_value: undefined,
      fund_id: '',
      deal_id: '',
      exit_date: '',
    });
    setSelectedCompany(null);
  };

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast({ title: "Error", description: "Company name is required", variant: "destructive" });
      return;
    }
    
    createCompany({
      name: formData.name,
      sector_id: formData.sector_id || undefined,
      stage: formData.stage || undefined,
      investment_date: formData.investment_date || undefined,
      investment_amount: formData.investment_amount || undefined,
      ownership_percentage: formData.ownership_percentage || undefined,
      valuation: formData.valuation || undefined,
      location: formData.location || undefined,
      website: formData.website || undefined,
      description: formData.description || undefined,
      status: formData.status || 'Active',
      is_public: formData.is_public || false,
      stock_ticker: formData.stock_ticker || undefined,
      current_stock_price: formData.current_stock_price || undefined,
      market_cap: formData.market_cap || undefined,
      enterprise_value: formData.enterprise_value || undefined,
      fund_id: formData.fund_id || undefined,
      deal_id: formData.deal_id || undefined,
      exit_date: formData.exit_date || undefined,
    });
    setIsDialogOpen(false);
    resetForm();
  };

  const handleViewCompany = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      setSelectedCompany(company);
      setIsViewDialogOpen(true);
    }
  };

  const handleEditCompany = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      setSelectedCompany(company);
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdateCompany = (data: any) => {
    if (selectedCompany) {
      updateCompany({
        id: selectedCompany.id,
        ...data
      });
      setIsEditDialogOpen(false);
      setSelectedCompany(null);
    }
  };

  const handleManageKPIs = (company: PortfolioCompany) => {
    setSelectedCompany(company);
    setIsKPIDialogOpen(true);
  };

  const handleStartResearch = (companyId: string, depth: "quick" | "standard" | "forensic") => {
    startResearch({ companyId, depth });
    navigate(`/research/company/${companyId}`);
  };

  const CompanyFormFields = () => (
    <>
      <div className="grid gap-2">
        <Label htmlFor="company-name">Company Name *</Label>
        <Input 
          id="company-name" 
          placeholder="TechCorp Ltd" 
          value={formData.name || ''}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="sector">Sector</Label>
          <Select value={formData.sector_id || ''} onValueChange={(value) => setFormData({...formData, sector_id: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select sector" />
            </SelectTrigger>
            <SelectContent>
              {sectors.map(sector => (
                <SelectItem key={sector.id} value={sector.id}>{sector.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="stage">Stage</Label>
          <Select value={formData.stage || ''} onValueChange={(value) => setFormData({...formData, stage: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Seed">Seed</SelectItem>
              <SelectItem value="Series A">Series A</SelectItem>
              <SelectItem value="Series B">Series B</SelectItem>
              <SelectItem value="Series C">Series C</SelectItem>
              <SelectItem value="Series D+">Series D+</SelectItem>
              <SelectItem value="Growth">Growth</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="location">Location</Label>
          <Input 
            id="location" 
            placeholder="London, UK"
            value={formData.location || ''}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="website">Website</Label>
          <Input 
            id="website" 
            type="url"
            placeholder="https://example.com"
            value={formData.website || ''}
            onChange={(e) => setFormData({...formData, website: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="investment-date">Investment Date</Label>
          <Input 
            id="investment-date" 
            type="date"
            value={formData.investment_date || ''}
            onChange={(e) => setFormData({...formData, investment_date: e.target.value})}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="investment-amount">Investment Amount ($)</Label>
          <Input 
            id="investment-amount" 
            type="number"
            step="0.01"
            placeholder="1000000"
            value={formData.investment_amount || ''}
            onChange={(e) => setFormData({...formData, investment_amount: parseFloat(e.target.value) || undefined})}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="ownership">Ownership %</Label>
          <Input 
            id="ownership" 
            type="number"
            step="0.01"
            placeholder="15"
            value={formData.ownership_percentage || ''}
            onChange={(e) => setFormData({...formData, ownership_percentage: parseFloat(e.target.value) || undefined})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="valuation">Valuation ($)</Label>
          <Input 
            id="valuation" 
            type="number"
            step="0.01"
            placeholder="10000000"
            value={formData.valuation || ''}
            onChange={(e) => setFormData({...formData, valuation: parseFloat(e.target.value) || undefined})}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status || 'Active'} onValueChange={(value) => setFormData({...formData, status: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Exited">Exited</SelectItem>
              <SelectItem value="Written Off">Written Off</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="fund">Fund</Label>
          <Select value={formData.fund_id || ''} onValueChange={(value) => setFormData({...formData, fund_id: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select fund" />
            </SelectTrigger>
            <SelectContent>
              {funds.map(fund => (
                <SelectItem key={fund.id} value={fund.id}>{fund.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="deal">Related Deal</Label>
          <Select value={formData.deal_id || ''} onValueChange={(value) => setFormData({...formData, deal_id: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select deal" />
            </SelectTrigger>
            <SelectContent>
              {deals.map(deal => (
                <SelectItem key={deal.id} value={deal.id}>{deal.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="is-public" 
          checked={formData.is_public || false}
          onCheckedChange={(checked) => setFormData({...formData, is_public: checked as boolean})}
        />
        <Label htmlFor="is-public" className="cursor-pointer">
          This is a public company
        </Label>
      </div>

      {formData.is_public && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="ticker">Stock Ticker</Label>
              <Input 
                id="ticker" 
                placeholder="AAPL"
                value={formData.stock_ticker || ''}
                onChange={(e) => setFormData({...formData, stock_ticker: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stock-price">Current Price ($)</Label>
              <Input 
                id="stock-price" 
                type="number"
                step="0.01"
                placeholder="150.00"
                value={formData.current_stock_price || ''}
                onChange={(e) => setFormData({...formData, current_stock_price: parseFloat(e.target.value) || undefined})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="market-cap">Market Cap ($)</Label>
              <Input 
                id="market-cap" 
                type="number"
                step="0.01"
                placeholder="1000000000"
                value={formData.market_cap || ''}
                onChange={(e) => setFormData({...formData, market_cap: parseFloat(e.target.value) || undefined})}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ev">Enterprise Value ($)</Label>
            <Input 
              id="ev" 
              type="number"
              step="0.01"
              placeholder="1200000000"
              value={formData.enterprise_value || ''}
              onChange={(e) => setFormData({...formData, enterprise_value: parseFloat(e.target.value) || undefined})}
            />
          </div>
        </>
      )}

      {formData.status === 'Exited' && (
        <div className="grid gap-2">
          <Label htmlFor="exit-date">Exit Date</Label>
          <Input 
            id="exit-date" 
            type="date"
            value={formData.exit_date || ''}
            onChange={(e) => setFormData({...formData, exit_date: e.target.value})}
          />
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          placeholder="Brief company description"
          value={formData.description || ''}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">
            Portfolio companies and investment tracking
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Portfolio Company</DialogTitle>
              <DialogDescription>
                Add a new company to your portfolio
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCompany} className="grid gap-4 py-4">
              <CompanyFormFields />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Company
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* View Company Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Company Details
            </DialogTitle>
            <DialogDescription>
              Comprehensive view of {selectedCompany?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedCompany && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="intelligence">AI Intelligence</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-4">
                {/* Basic Company Info */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Company Name</Label>
                    <p className="text-lg font-semibold">{selectedCompany.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Sector</Label>
                    <div className="mt-1">
                      <Badge variant="outline">{selectedCompany.sectors?.name || 'N/A'}</Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                    <p className="flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {selectedCompany.location || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Investment Date</Label>
                    <p className="flex items-center gap-1 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {selectedCompany.investment_date ? formatDate(selectedCompany.investment_date) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <Badge variant={selectedCompany.is_public ? "default" : "secondary"}>
                      {selectedCompany.is_public ? "Public" : "Private"}
                    </Badge>
                  </div>
                  {selectedCompany.is_public && selectedCompany.stock_ticker && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Stock Ticker</Label>
                      <Badge variant="outline" className="mt-1">{selectedCompany.stock_ticker}</Badge>
                    </div>
                  )}
                </div>

                {/* Market Data Section */}
                {selectedCompany.is_public && (
                  <div className="grid grid-cols-2 gap-4">
                    <MarketCapCard company={selectedCompany as any} />
                    <StockPriceChart companyId={selectedCompany.id} companyName={selectedCompany.name} />
                  </div>
                )}

                {/* KPI Section */}
                {(() => {
                  const kpi = getKPIForCompany(selectedCompany.id);
                  return kpi && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium text-muted-foreground">Key Performance Indicators</Label>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleManageKPIs(selectedCompany)}
                          className="gap-2"
                        >
                          <BarChart3 className="h-4 w-4" />
                          Manage KPIs
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-2 p-4 bg-muted/50 rounded-lg">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{formatCurrency(kpi.revenue || 0)}</p>
                          <p className="text-sm text-muted-foreground">Revenue</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{formatCurrency(kpi.ebitda || 0)}</p>
                          <p className="text-sm text-muted-foreground">EBITDA</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{kpi.headcount || 0}</p>
                          <p className="text-sm text-muted-foreground">Headcount</p>
                        </div>
                      </div>
                      {selectedCompany.is_public && (
                        <ValuationMetrics kpi={kpi as any} companyName={selectedCompany.name} />
                      )}
                    </div>
                  );
                })()}

                {/* ESG Section */}
                {(() => {
                  const esgRating = mockESGRatings.find(r => r.company_id === selectedCompany.id);
                  const esgHistory = mockESGHistory.filter(h => h.esg_rating_id === esgRating?.id);
                  const sectorName = selectedCompany.sectors?.name;
                  const sectorBenchmark = mockSectorBenchmarks.find(b => 
                    b.sector === sectorName && 
                    b.geography === selectedCompany.location
                  );

                  return esgRating ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">ESG Analysis</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <ESGRatingCard rating={esgRating} />
                        {esgHistory.length > 0 && (
                          <ESGHistoryChart history={esgHistory} />
                        )}
                        {sectorBenchmark && (
                          <SectorBenchmarkChart 
                            benchmark={sectorBenchmark} 
                            companyRating={esgRating} 
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed rounded-lg">
                      <p className="text-muted-foreground">No ESG data available for this company</p>
                    </div>
                  );
                })()}
              </TabsContent>

              <TabsContent value="intelligence" className="mt-4">
                <AIInsightCard entityType="company" entityId={selectedCompany.id} />
              </TabsContent>

              <TabsContent value="activity" className="mt-4">
                <ActivityTimeline entityType="company" entityId={selectedCompany.id} />
              </TabsContent>
            </Tabs>
          )}
          <div className="flex justify-between gap-2">
            <ResearchTrigger
              companyId={selectedCompany?.id}
              onStart={(depth) => selectedCompany && handleStartResearch(selectedCompany.id, depth)}
              isLoading={isStarting}
            />
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Company Dialog */}
      {selectedCompany && (
        <EditCompanyDialog
          company={selectedCompany}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleUpdateCompany}
        />
      )}

      {/* KPI Management Dialog */}
      {selectedCompany && (
        <KPIManagementDialog
          open={isKPIDialogOpen}
          onOpenChange={setIsKPIDialogOpen}
          companyId={selectedCompany.id}
          companyName={selectedCompany.name}
        />
      )}

      {/* Search and filters */}
      <Card>
        <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search companies..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {sectors.map(sector => (
                    <SelectItem key={sector.id} value={sector.id}>{sector.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
        </CardContent>
      </Card>

      {/* Statistics Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
            <p className="text-xs text-muted-foreground">
              Active investments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(kpis.reduce((sum, kpi) => sum + (kpi.revenue || 0), 0) || mockKPIs.reduce((sum, kpi) => sum + (kpi.revenue || 0), 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Combined portfolio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total EBITDA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(kpis.reduce((sum, kpi) => sum + (kpi.ebitda || 0), 0) || mockKPIs.reduce((sum, kpi) => sum + (kpi.ebitda || 0), 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Portfolio EBITDA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Headcount</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((kpis.reduce((sum, kpi) => sum + (kpi.headcount || 0), 0) || mockKPIs.reduce((sum, kpi) => sum + (kpi.headcount || 0), 0)) / (kpis.length || mockKPIs.length || 1))}
            </div>
            <p className="text-xs text-muted-foreground">
              Employees per company
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Companies</CardTitle>
          <CardDescription>
            Overview of all portfolio companies and their key metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading companies...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>ESG Score</TableHead>
                  <TableHead>Investment Date</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>EBITDA</TableHead>
                  <TableHead>Growth</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => {
                  const kpi = getKPIForCompany(company.id);
                  const growthRate = parseFloat(getGrowthRate());
                  const isPositiveGrowth = growthRate > 0;
                  const esgRating = mockESGRatings.find(r => r.company_id === company.id);
                  const riskLevel = esgRating ? getESGRiskLevel(esgRating.overall_score) : null;
                  
                  return (
                    <TableRow key={company.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {company.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{company.sectors?.name || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {company.location || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {esgRating ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{esgRating.overall_score}</span>
                            <Badge variant="outline" className={`${riskLevel?.color} border-current text-xs`}>
                              {riskLevel?.label.split(' ')[0]}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {company.investment_date ? formatDate(company.investment_date) : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {kpi?.revenue ? formatCurrency(kpi.revenue) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {kpi?.ebitda ? formatCurrency(kpi.ebitda) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={isPositiveGrowth ? "default" : "destructive"}
                          className="gap-1"
                        >
                          <TrendingUp className={`h-3 w-3 ${isPositiveGrowth ? '' : 'rotate-180'}`} />
                          {isPositiveGrowth ? '+' : ''}{growthRate}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={company.exit_date ? "secondary" : "default"}>
                          {company.exit_date ? 'Exited' : company.status || 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleManageKPIs(company)}
                            className="gap-1"
                          >
                            <BarChart3 className="h-4 w-4" />
                            KPIs
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewCompany(company.id)}
                            className="gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditCompany(company.id)}
                            className="gap-1"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
