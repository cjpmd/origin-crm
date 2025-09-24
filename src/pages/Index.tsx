import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import { mockDeals, mockContacts, mockPortfolioCompanies } from '@/lib/mockData';

const Index = () => {
  const totalDeals = mockDeals.length;
  const activePipeline = mockDeals.filter(d => d.stage !== 'exit').length;
  const totalContacts = mockContacts.length;
  const portfolioCompanies = mockPortfolioCompanies.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your Private Equity CRM. Here's an overview of your deal flow and portfolio.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Active Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePipeline}</div>
            <p className="text-xs text-muted-foreground">deals in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContacts}</div>
            <p className="text-xs text-muted-foreground">contacts managed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioCompanies}</div>
            <p className="text-xs text-muted-foreground">companies invested</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeals}</div>
            <p className="text-xs text-muted-foreground">all time</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Deals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockDeals.slice(0, 3).map((deal) => (
              <div key={deal.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{deal.name}</p>
                  <p className="text-sm text-muted-foreground">{deal.sector}</p>
                </div>
                <Badge variant="outline">{deal.stage}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Contacts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockContacts.slice(0, 3).map((contact) => (
              <div key={contact.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{contact.first_name} {contact.last_name}</p>
                  <p className="text-sm text-muted-foreground">{contact.company}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{contact.relationship_strength}/100</div>
                  <div className="text-xs text-muted-foreground">strength</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
