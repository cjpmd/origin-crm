import { Newspaper } from "lucide-react";
import { NewsFeed } from "@/components/News/NewsFeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function News() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Newspaper className="h-8 w-8" />
            News Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered news monitoring and entity matching
          </p>
        </div>
      </div>

      <Tabs defaultValue="feed" className="space-y-6">
        <TabsList>
          <TabsTrigger value="feed">News Feed</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4">
          <NewsFeed />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="text-center py-12 text-muted-foreground">
            News alerts coming soon
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="text-center py-12 text-muted-foreground">
            AI-generated insights from news coming soon
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
