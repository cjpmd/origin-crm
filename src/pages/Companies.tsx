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
import { Building2, Search, Plus, MapPin, Calendar, TrendingUp, Eye, Edit } from 'lucide-react';
import { mockPortfolioCompanies, mockKPIs, mockESGRatings, mockESGHistory, mockSectorBenchmarks, getESGRiskLevel } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import type { PortfolioCompany } from '@/types';
import { ESGRatingCard } from "@/components/ESG/ESGRatingCard";
import { ESGHistoryChart } from "@/components/ESG/ESGHistoryChart";
import { SectorBenchmarkChart } from "@/components/ESG/SectorBenchmarkChart";
import { MarketCapCard } from "@/components/Market/MarketCapCard";
import { StockPriceChart } from "@/components/Market/StockPriceChart";
import { ValuationMetrics } from "@/components/Market/ValuationMetrics";
import { ResearchTrigger } from "@/components/Research/ResearchTrigger";
import { useResearch } from "@/hooks/useResearch";
import { useNavigate } from "react-router-dom";

export default function Companies() {
  const [companies, setCompanies] = useState(mockPortfolioCompanies);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<PortfolioCompany | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<PortfolioCompany>>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const { startResearch, isStarting } = useResearch();
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `£${(amount / 1000000).toFixed(1)}M`;
  };

  const getKPIForCompany = (companyId: string) => {
    return mockKPIs.find(kpi => kpi.company_id === companyId);
  };

  const getGrowthRate = () => {
    // Mock growth rate calculation
    return (Math.random() * 40 - 10).toFixed(1);
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.sector?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = sectorFilter === 'all' || company.sector === sectorFilter;
    return matchesSearch && matchesSector;
  });

  const sectors = [...new Set(companies.map(c => c.sector))];

  const handleCreateCompany = () => {
    toast({ title: "Company added", description: "New portfolio company has been added successfully" });
    setIsDialogOpen(false);
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
      setEditFormData({
        name: company.name,
        sector: company.sector,
        geography: company.geography,
        investment_date: company.investment_date
      });
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdateCompany = () => {
    if (selectedCompany) {
      setCompanies(companies.map(c => 
        c.id === selectedCompany.id 
          ? { ...c, ...editFormData }
          : c
      ));
      toast({ title: "Company updated", description: "Company details have been updated successfully" });
      setIsEditDialogOpen(false);
      setSelectedCompany(null);
      setEditFormData({});
    }
  };

  const handleStartResearch = (companyId: string, depth: "quick" | "standard" | "forensic") => {
    startResearch({ companyId, depth });
    navigate(`/research/company/${companyId}`);
  };

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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Portfolio Company</DialogTitle>
              <DialogDescription>
                Add a new company to your portfolio
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input id="company-name" placeholder="TechCorp Ltd" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sector">Sector</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="FinTech">FinTech</SelectItem>
                      <SelectItem value="Consumer">Consumer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="geography">Geography</Label>
                  <Input id="geography" placeholder="London, UK" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="investment-date">Investment Date</Label>
                <Input id="investment-date" type="date" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Brief company description" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCompany}>
                Add Company
              </Button>
            </div>
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
            <div className="space-y-6">
              {/* Basic Company Info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Company Name</Label>
                  <p className="text-lg font-semibold">{selectedCompany.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Sector</Label>
                  <div className="mt-1">
                    <Badge variant="outline">{selectedCompany.sector || 'N/A'}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Geography</Label>
                  <p className="flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {selectedCompany.geography || 'N/A'}
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
                  <Label className="text-sm font-medium text-muted-foreground">Fund</Label>
                  <p>{selectedCompany.fund_id || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Exit Date</Label>
                  <p>{selectedCompany.exit_date ? formatDate(selectedCompany.exit_date) : 'Active'}</p>
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
                  <MarketCapCard company={selectedCompany} />
                  <StockPriceChart companyId={selectedCompany.id} companyName={selectedCompany.name} />
                </div>
              )}

              {/* KPI Section */}
              {(() => {
                const kpi = getKPIForCompany(selectedCompany.id);
                return kpi && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Key Performance Indicators</Label>
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
                    </div>
                    {selectedCompany.is_public && (
                      <ValuationMetrics kpi={kpi} companyName={selectedCompany.name} />
                    )}
                  </div>
                );
              })()}

              {/* ESG Section */}
              {(() => {
                const esgRating = mockESGRatings.find(r => r.company_id === selectedCompany.id);
                const esgHistory = mockESGHistory.filter(h => h.esg_rating_id === esgRating?.id);
                const sectorBenchmark = mockSectorBenchmarks.find(b => 
                  b.sector === selectedCompany.sector && 
                  b.geography === selectedCompany.geography
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
            </div>
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
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Company
            </DialogTitle>
            <DialogDescription>
              Update details for {selectedCompany?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-company-name">Company Name</Label>
              <Input 
                id="edit-company-name" 
                value={editFormData.name || ''}
                onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-sector">Sector</Label>
                <Select value={editFormData.sector || ''} onValueChange={(value) => setEditFormData({...editFormData, sector: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="FinTech">FinTech</SelectItem>
                    <SelectItem value="Consumer">Consumer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-geography">Geography</Label>
                <Input 
                  id="edit-geography" 
                  value={editFormData.geography || ''}
                  onChange={(e) => setEditFormData({...editFormData, geography: e.target.value})}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-investment-date">Investment Date</Label>
              <Input 
                id="edit-investment-date" 
                type="date" 
                value={editFormData.investment_date || ''}
                onChange={(e) => setEditFormData({...editFormData, investment_date: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCompany}>
              Update Company
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                    <SelectItem key={sector} value={sector}>{sector}</SelectItem>
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
            <div className="text-2xl font-bold">{mockPortfolioCompanies.length}</div>
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
              {formatCurrency(mockKPIs.reduce((sum, kpi) => sum + (kpi.revenue || 0), 0))}
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
              {formatCurrency(mockKPIs.reduce((sum, kpi) => sum + (kpi.ebitda || 0), 0))}
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
              {Math.round(mockKPIs.reduce((sum, kpi) => sum + (kpi.headcount || 0), 0) / mockKPIs.length)}
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Geography</TableHead>
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
                      <Badge variant="outline">{company.sector}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {company.geography}
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
                        {company.exit_date ? 'Exited' : 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
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
        </CardContent>
      </Card>
    </div>
  );
}