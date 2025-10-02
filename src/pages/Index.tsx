import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardCards } from '@/components/Dashboard/DashboardCards';
import { FundMetrics } from '@/components/Analytics/FundMetrics';
import { SmartSuggestionsCard } from '@/components/Intelligence/SmartSuggestionsCard';
import { PipelineAnalytics } from '@/components/Analytics/PipelineAnalytics';
import { useTasks } from '@/hooks/useTasks';
import { useDeals } from '@/hooks/useDeals';
import { useContacts } from '@/hooks/useContacts';
import { Checkbox } from '@/components/ui/checkbox';
import { NewsIntelligenceBanner } from '@/components/Dashboard/NewsIntelligenceBanner';

const Index = () => {
  const { tasks, updateTask } = useTasks();
  const { deals } = useDeals();
  const { contacts } = useContacts();
  
  const recentTasks = tasks.filter(task => task.status !== 'completed').slice(0, 3);

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

      {/* News Intelligence Banner */}
      <NewsIntelligenceBanner />

      {/* Key Metrics */}
      <DashboardCards />

      {/* Smart Suggestions */}
      <SmartSuggestionsCard />

      {/* Pipeline Analytics */}
      <PipelineAnalytics />

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
            {deals.slice(0, 4).map((deal) => (
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
            {contacts.slice(0, 4).map((contact) => (
              <div key={contact.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">{contact.portfolio_companies?.name || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{contact.role || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground">role</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Tasks</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/tasks">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3">
                <Checkbox 
                  checked={task.status === 'completed'}
                  onCheckedChange={(checked) => {
                    updateTask({ id: task.id, status: checked ? 'completed' : 'pending', completed_at: checked ? new Date().toISOString() : null });
                  }}
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                  </p>
                </div>
                <Badge variant={task.status === 'pending' ? 'destructive' : 'secondary'} className="text-xs">
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
