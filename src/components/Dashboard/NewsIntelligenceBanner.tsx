import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEntityNews } from "@/hooks/useEntityNews";
import { useNewsRefresh } from "@/hooks/useNewsRefresh";
import { ArrowRight, TrendingUp, Building2, Target, Users, Newspaper, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

export const NewsIntelligenceBanner = () => {
  const { 
    highImpactNews, 
    portfolioNews, 
    pipelineNews, 
    investorNews,
    totalCount,
    isLoading 
  } = useEntityNews();
  
  const { refreshNews, isRefreshing } = useNewsRefresh();

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            News Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading news feed...</p>
        </CardContent>
      </Card>
    );
  }

  if (totalCount === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            News Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            No news items found. The system will automatically fetch news for your portfolio companies, pipeline deals, and investors.
          </p>
          <Link to="/news">
            <Button variant="outline" size="sm">
              Manage News Settings <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500';
      case 'negative': return 'bg-red-500';
      case 'neutral': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getImpactColor = (impact?: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card className="mb-6 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            News Intelligence - Live Feed
            {totalCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {totalCount} items
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refreshNews()}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh News
                </>
              )}
            </Button>
            <Link to="/news">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="high-impact" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="high-impact" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              High Impact ({highImpactNews.length})
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              Portfolio ({portfolioNews.length})
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Pipeline ({pipelineNews.length})
            </TabsTrigger>
            <TabsTrigger value="investors" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Investors ({investorNews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="high-impact">
            <NewsSection news={highImpactNews} getSentimentColor={getSentimentColor} getImpactColor={getImpactColor} />
          </TabsContent>

          <TabsContent value="portfolio">
            <NewsSection news={portfolioNews} getSentimentColor={getSentimentColor} getImpactColor={getImpactColor} />
          </TabsContent>

          <TabsContent value="pipeline">
            <NewsSection news={pipelineNews} getSentimentColor={getSentimentColor} getImpactColor={getImpactColor} />
          </TabsContent>

          <TabsContent value="investors">
            <NewsSection news={investorNews} getSentimentColor={getSentimentColor} getImpactColor={getImpactColor} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const NewsSection = ({ news, getSentimentColor, getImpactColor }: any) => {
  if (news.length === 0) {
    return <p className="text-sm text-muted-foreground">No news items in this category</p>;
  }

  return (
    <ScrollArea className="h-[280px] pr-4">
      <div className="space-y-3">
        {news.slice(0, 5).map((item: any) => (
          <div 
            key={item.id} 
            className="border rounded-lg p-3 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${getSentimentColor(item.sentiment)}`} />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {item.impact_level && (
                    <Badge variant={getImpactColor(item.impact_level)} className="text-xs">
                      {item.impact_level?.toUpperCase()}
                    </Badge>
                  )}
                  {item.category && (
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}
                  </span>
                </div>
                <h4 className="font-medium text-sm leading-tight">{item.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">{item.summary}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-muted-foreground">{item.source_name}</span>
                  {item.source_url && item.source_url !== 'https://example.com' && (
                    <a 
                      href={item.source_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      Read more →
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
