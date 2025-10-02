import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import { NewsItem } from "@/hooks/useNews";
import { formatDistanceToNow } from "date-fns";

interface NewsCardProps {
  news: NewsItem;
  onMatch?: () => void;
}

export const NewsCard = ({ news, onMatch }: NewsCardProps) => {
  const getSentimentIcon = () => {
    switch (news.sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSentimentColor = () => {
    switch (news.sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'negative':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getImpactColor = () => {
    switch (news.impact_level) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight">{news.title}</CardTitle>
          {getSentimentIcon()}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {news.sentiment && (
            <Badge variant="secondary" className={getSentimentColor()}>
              {news.sentiment}
            </Badge>
          )}
          {news.impact_level && (
            <Badge variant="secondary" className={getImpactColor()}>
              {news.impact_level} impact
            </Badge>
          )}
          {news.category && (
            <Badge variant="outline">{news.category}</Badge>
          )}
          {news.relevance_score && news.relevance_score > 70 && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
              {news.relevance_score}% relevant
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{news.summary}</p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div>
            <span className="font-medium">{news.source_name}</span>
            {news.author && <span> • {news.author}</span>}
          </div>
          <span>{formatDistanceToNow(new Date(news.published_at), { addSuffix: true })}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a href={news.source_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" />
              Read More
            </a>
          </Button>
          {onMatch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMatch}
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              Match Entities
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
