import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Calendar, TrendingUp, BarChart3, PieChart, Users, Building2 } from 'lucide-react';
import { PortfolioCharts } from '@/components/Portfolio/PortfolioCharts';

export default function Reports() {
  const reportTemplates = [
    {
      id: '1',
      name: 'Quarterly LP Report',
      description: 'Comprehensive quarterly update for limited partners',
      type: 'LP Communication',
      frequency: 'Quarterly',
      lastGenerated: '2024-01-15',
      status: 'Ready'
    },
    {
      id: '2',
      name: 'Deal Pipeline Summary',
      description: 'Current pipeline status and deal flow analysis',
      type: 'Internal',
      frequency: 'Monthly',
      lastGenerated: '2024-01-20',
      status: 'Ready'
    },
    {
      id: '3',
      name: 'Portfolio Performance',
      description: 'Portfolio company KPIs and performance metrics', 
      type: 'Investment Committee',
      frequency: 'Monthly',
      lastGenerated: '2024-01-18',
      status: 'Ready'
    },
    {
      id: '4',
      name: 'Fund Performance Summary',
      description: 'IRR, MOIC, and fund-level metrics',
      type: 'LP Communication',
      frequency: 'Quarterly',
      lastGenerated: '2024-01-10',
      status: 'Draft'
    }
  ];

  const quickReports = [
    {
      title: 'Deal Flow Report',
      description: 'Last 30 days pipeline activity',
      icon: BarChart3,
      metrics: { deals: 12, value: '£156M' }
    },
    {
      title: 'Contact Activity',
      description: 'Relationship engagement summary',
      icon: Users,
      metrics: { contacts: 89, meetings: 24 }
    },
    {
      title: 'Portfolio Update',
      description: 'Company performance snapshot',
      icon: Building2,
      metrics: { companies: 8, growth: '+12%' }
    },
    {
      title: 'Fund Metrics',
      description: 'Current fund performance',  
      icon: TrendingUp,
      metrics: { irr: '24.5%', moic: '2.8x' }
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ready':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Generate reports and analyze portfolio performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Export Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="ppt">PowerPoint</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
          <TabsTrigger value="quick">Quick Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          {/* Report Templates */}
          <div className="grid gap-4">
            {reportTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {template.frequency}
                          </div>
                          <span>Last: {formatDate(template.lastGenerated)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{template.type}</Badge>
                      <Badge className={getStatusColor(template.status)}>
                        {template.status}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button size="sm" className="gap-2">
                          <Download className="h-3 w-3" />
                          Generate
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Create New Template */}
          <Card className="border-dashed">
            <CardContent className="p-6">
              <div className="text-center space-y-2">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
                <h3 className="font-medium">Create New Template</h3>
                <p className="text-sm text-muted-foreground">
                  Build custom report templates for your specific needs
                </p>
                <Button variant="outline" className="mt-4">
                  Create Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <PortfolioCharts />
        </TabsContent>

        <TabsContent value="quick" className="space-y-6">
          {/* Quick Reports Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {quickReports.map((report, index) => {
              const Icon = report.icon;
              return (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{report.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {report.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        {Object.entries(report.metrics).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="text-muted-foreground capitalize">{key}: </span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-3 w-3" />
                        Export
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Scheduled Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>
                Automatically generated reports based on your schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Weekly Pipeline Update</div>
                      <div className="text-sm text-muted-foreground">Every Monday at 9:00 AM</div>
                    </div>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Monthly Portfolio Summary</div>
                      <div className="text-sm text-muted-foreground">First Monday of each month</div>
                    </div>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Quarterly LP Report</div>
                      <div className="text-sm text-muted-foreground">End of each quarter</div>
                    </div>
                  </div>
                  <Badge variant="secondary">Paused</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}