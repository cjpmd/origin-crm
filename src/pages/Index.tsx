import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockDeals, mockContacts, mockTasks } from '@/lib/mockData';
import { DashboardCards } from '@/components/Dashboard/DashboardCards';
import { FundMetrics } from '@/components/Analytics/FundMetrics';

const Index = () => {
  const recentTasks = mockTasks.filter(task => task.status !== 'done').slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your Private Equity CRM. Here's an overview of your deal flow and portfolio.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/pipeline">
              <Plus className="h-4 w-4 mr-2" />
              New Deal
            </Link>
          </Button>
          <Button asChild>
            <Link to="/contacts">
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <DashboardCards />

      {/* Fund Performance */}
      <FundMetrics />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Deals</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/pipeline">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockDeals.slice(0, 4).map((deal) => (
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Key Contacts</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/contacts">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockContacts.slice(0, 4).map((contact) => (
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Tasks</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/reports">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="font-medium text-sm">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                  </p>
                </div>
                <Badge variant={task.status === 'open' ? 'destructive' : 'secondary'} className="text-xs">
                  {task.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
