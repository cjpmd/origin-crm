import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, Search, Plus, MapPin, Calendar, TrendingUp } from 'lucide-react';
import { mockPortfolioCompanies, mockKPIs } from '@/lib/mockData';

export default function Companies() {
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
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Company
        </Button>
      </div>

      {/* Search and filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                className="pl-9"
              />
            </div>
            <Button variant="outline">Filter by Sector</Button>
            <Button variant="outline">Filter by Geography</Button>
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
                <TableHead>Investment Date</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>EBITDA</TableHead>
                <TableHead>Growth</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPortfolioCompanies.map((company) => {
                const kpi = getKPIForCompany(company.id);
                const growthRate = parseFloat(getGrowthRate());
                const isPositiveGrowth = growthRate > 0;
                
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
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                        <Button variant="outline" size="sm">
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