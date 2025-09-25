import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, Building2, Target, DollarSign } from 'lucide-react';
import { mockDeals, mockContacts, mockInvestors, mockPortfolioCompanies } from '@/lib/mockData';

export function DashboardCards() {
  const totalDeals = mockDeals.length;
  const activeDeals = mockDeals.filter(deal => !['exit', 'close'].includes(deal.stage)).length;
  const totalContacts = mockContacts.length;
  const totalInvestors = mockInvestors.length;
  const portfolioCompanies = mockPortfolioCompanies.length;
  
  const dealValue = mockDeals.reduce((sum, deal) => sum + (deal.valuation || 0), 0);
  const avgDealSize = dealValue / totalDeals;

  const cards = [
    {
      title: 'Active Deals',
      value: activeDeals,
      total: totalDeals,
      description: 'deals in pipeline',
      icon: Target,
      trend: 'up',
      change: '+12%'
    },
    {
      title: 'Total Contacts',
      value: totalContacts,
      description: 'relationship network',
      icon: Users,
      trend: 'up',
      change: '+8%'
    },
    {
      title: 'Portfolio Companies',
      value: portfolioCompanies,
      description: 'active investments',
      icon: Building2,
      trend: 'up',
      change: '+2%'
    },
    {
      title: 'Average Deal Size',
      value: `£${(avgDealSize / 1000000).toFixed(1)}M`,
      description: 'current pipeline',
      icon: DollarSign,
      trend: 'up',
      change: '+15%'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index} className="border-border/50 hover:border-border transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {card.value}
              {card.total && (
                <span className="text-sm font-normal text-muted-foreground">
                  /{card.total}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>{card.description}</span>
              <Badge variant="secondary" className="h-4 px-1 text-xs">
                {card.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {card.change}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}