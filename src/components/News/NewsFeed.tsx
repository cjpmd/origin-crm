import { useState } from "react";
import { useNews } from "@/hooks/useNews";
import { NewsCard } from "./NewsCard";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, Link } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export const NewsFeed = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sentiment, setSentiment] = useState<string | undefined>();
  const [impactLevel, setImpactLevel] = useState<string | undefined>();
  const [category, setCategory] = useState<string | undefined>();

  const { news, isLoading, fetchNews, isFetching, matchNewsEntities, isMatching } = useNews({
    search: searchQuery,
    sentiment,
    impact_level: impactLevel,
    category,
  });

  const handleFetchNews = async () => {
    await fetchNews({
      query: searchQuery || undefined,
      category,
      limit: 20,
    });
  };

  const handleMatchNews = async (newsId: string) => {
    await matchNewsEntities(newsId);
  };

  const handleBatchMatch = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('batch-match-news');
      
      if (error) throw error;
      
      console.log('Batch matching complete:', data);
    } catch (error) {
      console.error('Error batch matching news:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={handleFetchNews} disabled={isFetching}>
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Fetch News
          </Button>
          <Button onClick={handleBatchMatch} variant="outline">
            <Link className="h-4 w-4 mr-2" />
            Match All News
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select value={sentiment} onValueChange={setSentiment}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
            </SelectContent>
          </Select>

          <Select value={impactLevel} onValueChange={setImpactLevel}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Impact Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="sector">Sector</SelectItem>
              <SelectItem value="regulatory">Regulatory</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="market">Market</SelectItem>
              <SelectItem value="product">Product</SelectItem>
            </SelectContent>
          </Select>

          {(sentiment || impactLevel || category || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSentiment(undefined);
                setImpactLevel(undefined);
                setCategory(undefined);
                setSearchQuery("");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {news.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No news items found. Click "Fetch News" to load news.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {news.map((item) => (
            <NewsCard 
              key={item.id} 
              news={item} 
              onMatch={() => handleMatchNews(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
