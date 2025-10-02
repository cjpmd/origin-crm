import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  source_name: string;
  source_url: string;
  author?: string;
  published_at: string;
  fetched_at: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  sentiment_confidence?: number;
  impact_level?: 'high' | 'medium' | 'low';
  relevance_score?: number;
  category?: 'financial' | 'sector' | 'regulatory' | 'social' | 'market' | 'product';
  tags?: any;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface NewsFilters {
  sentiment?: string;
  impact_level?: string;
  category?: string;
  search?: string;
}

export const useNews = (filters?: NewsFilters) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: news = [], isLoading } = useQuery({
    queryKey: ["news", filters],
    queryFn: async () => {
      let query = supabase
        .from("news_items")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(50);

      if (filters?.sentiment) {
        query = query.eq("sentiment", filters.sentiment);
      }

      if (filters?.impact_level) {
        query = query.eq("impact_level", filters.impact_level);
      }

      if (filters?.category) {
        query = query.eq("category", filters.category);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,summary.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as NewsItem[];
    },
  });

  const fetchNews = useMutation({
    mutationFn: async (params: { query?: string; category?: string; limit?: number }) => {
      const { data, error } = await supabase.functions.invoke('fetch-news', {
        body: params,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
      toast({
        title: "Success",
        description: "News fetched successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const matchNewsEntities = useMutation({
    mutationFn: async (newsItemId: string) => {
      const { data, error } = await supabase.functions.invoke('match-news-entities', {
        body: { newsItemId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "News matched to entities",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    news,
    isLoading,
    fetchNews: fetchNews.mutateAsync,
    isFetching: fetchNews.isPending,
    matchNewsEntities: matchNewsEntities.mutateAsync,
    isMatching: matchNewsEntities.isPending,
  };
};
