import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TrendingUp, Users, Search, Plus, Building, User, CreditCard, Edit, Trash2, DollarSign } from 'lucide-react';
import { FundMetrics } from '@/components/Analytics/FundMetrics';
import { useToast } from '@/hooks/use-toast';
import { useInvestors, Investor } from '@/hooks/useInvestors';
import { useFunds } from '@/hooks/useFunds';
import { useFundCommitments } from '@/hooks/useFundCommitments';
import { ViewInvestorDialog } from '@/components/Investors/ViewInvestorDialog';
import { EditInvestorDialog } from '@/components/Investors/EditInvestorDialog';

export default function Investors() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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
  const { investors, createInvestor, updateInvestor, deleteInvestor } = useInvestors();
  const { funds } = useFunds();
  const { commitments } = useFundCommitments();

  const formatCurrency = (amount: number) => {
    return `$${(amount / 1000000).toFixed(1)}M`;
  };

  const getInvestorTypeIcon = (type?: string) => {
    if (type?.toLowerCase().includes('institution')) return Building;
    if (type?.toLowerCase().includes('family')) return Users;
    return User;
  };

  const getInvestorTypeColor = (type?: string) => {
    if (type?.toLowerCase().includes('institution')) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (type?.toLowerCase().includes('family')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
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

  const handleEditInvestor = (investor: Investor) => {
    setSelectedInvestor(investor);
    setIsEditDialogOpen(true);
  };

  const handleSaveInvestor = (data: Partial<Investor> & { id: string }) => {
    updateInvestor(data);
  };

  const handleDeleteInvestor = (investor: Investor) => {
    setSelectedInvestor(investor);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedInvestor) {
      deleteInvestor(selectedInvestor.id);
      setIsDeleteDialogOpen(false);
      setSelectedInvestor(null);
    }
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

  const calculateFundMetrics = () => {
    const totalCommitments = commitments.reduce((sum, c) => sum + (c.commitment_amount || 0), 0);
    const totalCalled = commitments.reduce((sum, c) => sum + (c.called_amount || 0), 0);
    const totalDistributed = commitments.reduce((sum, c) => sum + (c.distributed_amount || 0), 0);
    
    return {
      totalCommitments,
      totalCalled,
      totalDistributed,
      callRate: totalCommitments > 0 ? (totalCalled / totalCommitments) * 100 : 0,
    };
  };

  const fundMetrics = calculateFundMetrics();

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
                    placeholder="$1M-$5M"
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
                    placeholder="New York, NY"
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
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
                              onClick={() => handleEditInvestor(investor)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleContactInvestor(investor)}
                            >
                              Contact
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteInvestor(investor)}
                            >
                              <Trash2 className="h-4 w-4" />
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
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Commitments</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(fundMetrics.totalCommitments / 1000000).toFixed(1)}M</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Capital Called</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(fundMetrics.totalCalled / 1000000).toFixed(1)}M</div>
                <p className="text-xs text-muted-foreground">{fundMetrics.callRate.toFixed(1)}% of commitments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Distributions</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(fundMetrics.totalDistributed / 1000000).toFixed(1)}M</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Funds</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{funds.length}</div>
              </CardContent>
            </Card>
          </div>
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
                {commitments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No commitments found. Add funds and commitments to track capital calls and distributions.
                  </p>
                ) : (
                  commitments.map((commitment) => (
                    <div key={commitment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium">{commitment.investors?.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Fund: {commitment.funds?.name || 'Unknown'}
                          </p>
                        </div>
                        <Badge variant={commitment.status === 'Active' ? 'default' : 'secondary'}>
                          {commitment.status}
                        </Badge>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-4 text-sm">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Commitment</div>
                            <div className="text-muted-foreground">${(commitment.commitment_amount / 1000000).toFixed(1)}M</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Called</div>
                            <div className="text-muted-foreground">${(commitment.called_amount / 1000000).toFixed(1)}M</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Distributed</div>
                            <div className="text-muted-foreground">${(commitment.distributed_amount / 1000000).toFixed(1)}M</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Remaining</div>
                            <div className="text-muted-foreground">
                              ${((commitment.commitment_amount - commitment.called_amount) / 1000000).toFixed(1)}M
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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

      <EditInvestorDialog
        investor={selectedInvestor}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveInvestor}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Investor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedInvestor?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}