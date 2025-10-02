import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useNewsRefresh = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const refreshNews = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to refresh news');
      }

      const { data, error } = await supabase.functions.invoke('auto-fetch-news', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate all news-related queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['entity-news'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast({
        title: "News Refreshed",
        description: "Successfully fetched latest news for your entities",
      });
    },
    onError: (error: Error) => {
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
