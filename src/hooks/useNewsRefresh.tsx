import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useNewsRefresh = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const refreshNews = useMutation({
    mutationFn: async () => {
      console.log('Starting news refresh...');
      
      // Step 1: Fetch new news
      const { data: fetchData, error: fetchError } = await supabase.functions.invoke('auto-fetch-news');
      if (fetchError) {
        console.error('Fetch news error:', fetchError);
        throw new Error('Failed to fetch news: ' + fetchError.message);
      }
      console.log('Fetch news result:', fetchData);

      // Step 2: Match unmatched news items to entities
      const { data: matchData, error: matchError } = await supabase.functions.invoke('batch-match-news', {
        body: { limit: 100 }
      });
      if (matchError) {
        console.error('Match news error:', matchError);
        // Don't throw here, as fetching succeeded
      }
      console.log('Match news result:', matchData);

      return { fetchData, matchData };
    },
    onSuccess: (data) => {
      // Invalidate all news-related queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['entity-news'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
      
      const matchCount = data.matchData?.matchCount || 0;
      const newsCount = data.matchData?.newsCount || 0;
      
      toast({
        title: "News Refreshed",
        description: `Fetched latest news and matched ${matchCount} items to ${newsCount} articles`,
      });
    },
    onError: (error: Error) => {
      console.error('Refresh error:', error);
      toast({
        title: "Refresh Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    refreshNews: refreshNews.mutate,
    isRefreshing: refreshNews.isPending,
  };
};
