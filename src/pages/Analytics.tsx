import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PipelineAnalytics } from "@/components/Analytics/PipelineAnalytics";
import { RelationshipAnalytics } from "@/components/Analytics/RelationshipAnalytics";
import { FundMetrics } from "@/components/Analytics/FundMetrics";
import { PortfolioCharts } from "@/components/Portfolio/PortfolioCharts";
import { BarChart3, Users, Briefcase, TrendingUp } from "lucide-react";

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive insights into your deal flow, relationships, and portfolio performance
        </p>
      </div>

      <Tabs defaultValue="pipeline" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pipeline" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="relationships" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Relationships
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="funds" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Funds
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4 mt-6">
          <PipelineAnalytics />
        </TabsContent>

        <TabsContent value="relationships" className="space-y-4 mt-6">
          <RelationshipAnalytics />
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4 mt-6">
          <PortfolioCharts />
        </TabsContent>

        <TabsContent value="funds" className="space-y-4 mt-6">
          <FundMetrics />
        </TabsContent>
      </Tabs>
    </div>
  );
}