import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TrendingUp, Users, Search, Plus, Building, User, CreditCard } from 'lucide-react';
import { mockFunds } from '@/lib/mockData';
import { FundMetrics } from '@/components/Analytics/FundMetrics';
import { useToast } from '@/hooks/use-toast';
import { useInvestors, Investor } from '@/hooks/useInvestors';
import { ViewInvestorDialog } from '@/components/Investors/ViewInvestorDialog';

export default function Investors() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    check_size: '',
    location: '',
    website: '',
    notes: '',
  });
  const { toast } = useToast();
  const { investors, createInvestor } = useInvestors();
  
  const formatCurrency = (amount: number) => {
    return `£${(amount / 1000000).toFixed(1)}M`;
  };

  const getInvestorTypeIcon = (type?: string) => {
    if (type?.toLowerCase().includes('institution')) return Building;
    if (type?.toLowerCase().includes('family')) return Users;
    return User;
  };

  const getInvestorTypeColor = (type?: string) => {
    if (type?.toLowerCase().includes('institution')) return 'bg-green-100 text-green-800';
    if (type?.toLowerCase().includes('family')) return 'bg-purple-100 text-purple-800';
    return 'bg-blue-100 text-blue-800';
  };

  const filteredInvestors = investors.filter(investor => {
    const matchesSearch = investor.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || investor.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleCreateInvestor = () => {
    if (!formData.name.trim()) return;
    createInvestor(formData);
    setFormData({ name: '', type: '', check_size: '', location: '', website: '', notes: '' });
    setIsDialogOpen(false);
  };

  const handleViewInvestor = (investor: Investor) => {
    setSelectedInvestor(investor);
    setIsViewDialogOpen(true);
  };

  const handleContactInvestor = (investor: Investor) => {
    if (investor.website) {
      window.open(investor.website.startsWith('http') ? investor.website : `https://${investor.website}`, '_blank');
    }
    toast({ 
      title: "Contact Investor", 
      description: `Initiating contact with ${investor.name}` 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investors & LPs</h1>
          <p className="text-muted-foreground">
            Manage investor relationships and fund commitments
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Investor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Investor</DialogTitle>
              <DialogDescription>
                Add a new investor or LP to your network
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="investor-name">Name</Label>
                <Input 
                  id="investor-name" 
                  placeholder="Investor name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Institutional">Institutional</SelectItem>
                      <SelectItem value="Family Office">Family Office</SelectItem>
                      <SelectItem value="Angel">Angel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="check-size">Check Size</Label>
                  <Input 
                    id="check-size" 
                    placeholder="£1M-£5M"
                    value={formData.check_size}
                    onChange={(e) => setFormData(prev => ({ ...prev, check_size: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    placeholder="London, UK"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    placeholder="example.com"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Additional notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateInvestor}>
                Add Investor
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="investors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="investors">Investors</TabsTrigger>
          <TabsTrigger value="funds">Fund Performance</TabsTrigger>
          <TabsTrigger value="commitments">Commitments</TabsTrigger>
        </TabsList>

        <TabsContent value="investors" className="space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search investors..."
                    className="pl-9"
                  />
                </div>
                <Button variant="outline">Filter by Type</Button>
                <Button variant="outline">Filter by Status</Button>
              </div>
            </CardContent>
          </Card>

          {/* Investor Statistics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{investors.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active relationships
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Institutions</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {investors.filter(inv => inv.type?.toLowerCase().includes('institution')).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Institutional investors
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Family Offices</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {investors.filter(inv => inv.type?.toLowerCase().includes('family')).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Family office relationships
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Investors Table */}
          <Card>
            <CardHeader>
              <CardTitle>Investor Directory</CardTitle>
              <CardDescription>
                Comprehensive view of all investor relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Investor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Check Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvestors.map((investor) => {
                    const TypeIcon = getInvestorTypeIcon(investor.type);
                    
                    return (
                      <TableRow key={investor.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <TypeIcon className="h-4 w-4 text-muted-foreground" />
                            {investor.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getInvestorTypeColor(investor.type)}>
                            {investor.type || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {investor.location || <span className="text-muted-foreground">N/A</span>}
                        </TableCell>
                        <TableCell>
                          {investor.check_size || <span className="text-muted-foreground">N/A</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">{investor.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewInvestor(investor)}
                            >
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleContactInvestor(investor)}
                            >
                              Contact
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
        </TabsContent>

        <TabsContent value="funds" className="space-y-6">
          <FundMetrics />
        </TabsContent>

        <TabsContent value="commitments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fund Commitments</CardTitle>
              <CardDescription>
                Track investor commitments and capital calls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockFunds.map((fund) => (
                  <div key={fund.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium">{fund.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Vintage {fund.vintage_year}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(fund.total_commitment || 0)} / {formatCurrency(fund.target_commitment || 0)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {((((fund.total_commitment || 0) / (fund.target_commitment || 1)) * 100).toFixed(0))}% committed
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Capital Called</div>
                          <div className="text-muted-foreground">£0.0M (0%)</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Distributions</div>
                          <div className="text-muted-foreground">£0.0M</div>
                        </div>
                      </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">LPs</div>
                            <div className="text-muted-foreground">{investors.length} investors</div>
                          </div>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ViewInvestorDialog
        investor={selectedInvestor}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        onContact={handleContactInvestor}
      />
    </div>
  );
}