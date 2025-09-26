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
import { TrendingUp, Users, Search, Plus, Building, User, CreditCard } from 'lucide-react';
import { mockInvestors, mockFunds, mockContacts } from '@/lib/mockData';
import { FundMetrics } from '@/components/Analytics/FundMetrics';
import { useToast } from '@/hooks/use-toast';

export default function Investors() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'individual' | 'institution' | 'family_office'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const formatCurrency = (amount: number) => {
    return `£${(amount / 1000000).toFixed(1)}M`;
  };

  const getContactForInvestor = (contactId?: string) => {
    return mockContacts.find(contact => contact.id === contactId);
  };

  const getInvestorTypeIcon = (type: 'individual' | 'institution' | 'family_office') => {
    switch (type) {
      case 'individual':
        return User;
      case 'institution':
        return Building;
      case 'family_office':
        return Users;
      default:
        return User;
    }
  };

  const getInvestorTypeColor = (type: 'individual' | 'institution' | 'family_office') => {
    switch (type) {
      case 'individual':
        return 'bg-blue-100 text-blue-800';
      case 'institution':
        return 'bg-green-100 text-green-800';
      case 'family_office':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInvestors = mockInvestors.filter(investor => {
    const contact = getContactForInvestor(investor.contact_id);
    const matchesSearch = investor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || investor.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleCreateInvestor = () => {
    toast({ title: "Investor added", description: "New investor has been added to your network" });
    setIsDialogOpen(false);
  };

  const handleViewInvestor = (investorId: string) => {
    toast({ title: "Investor details", description: "Investor profile view will be implemented" });
  };

  const handleEditInvestor = (investorId: string) => {
    toast({ title: "Edit investor", description: "Investor editing functionality will be implemented" });
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
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Investor
        </Button>
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
                <div className="text-2xl font-bold">{mockInvestors.length}</div>
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
                  {mockInvestors.filter(inv => inv.type === 'institution').length}
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
                  {mockInvestors.filter(inv => inv.type === 'family_office').length}
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
                    <TableHead>Contact</TableHead>
                    <TableHead>Relationship</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockInvestors.map((investor) => {
                    const contact = getContactForInvestor(investor.contact_id);
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
                            {investor.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {contact ? (
                            <div>
                              <div className="font-medium">{contact.first_name} {contact.last_name}</div>
                              <div className="text-sm text-muted-foreground">{contact.email}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No contact assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {contact && (
                            <Badge 
                              variant="outline"
                              className={
                                contact.relationship_strength > 70 ? 'border-green-200 text-green-700' :
                                contact.relationship_strength > 40 ? 'border-yellow-200 text-yellow-700' :
                                'border-red-200 text-red-700'
                              }
                            >
                              {contact.relationship_strength > 70 ? 'Strong' :
                               contact.relationship_strength > 40 ? 'Medium' : 'Weak'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">Active</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                            <Button variant="outline" size="sm">
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
                          <div className="text-muted-foreground">{mockInvestors.length} investors</div>
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
    </div>
  );
}