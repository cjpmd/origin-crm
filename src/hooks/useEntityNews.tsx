import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import type { NewsItem } from "./useNews";

export interface EntityNews {
  highImpactNews: NewsItem[];
  portfolioNews: NewsItem[];
  pipelineNews: NewsItem[];
  investorNews: NewsItem[];
  sectorNews: NewsItem[];
  allNews: (NewsItem & { isRelevantToUser?: boolean; entityTypes?: Set<string> })[];
  totalCount: number;
  relevantCount: number;
  isLoading: boolean;
  error: Error | null;
}

export const useEntityNews = () => {
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const userId = session?.user?.id;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["entity-news", userId],
    queryFn: async () => {
      if (!userId) return null;

      // Fetch recent news items (last 30 days for dashboard relevance)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data: allNewsItems, error: newsError } = await supabase
        .from('news_items')
        .select('*')
        .gte('published_at', thirtyDaysAgo)
        .order('published_at', { ascending: false });

      if (newsError) throw newsError;

      // Get user's entity IDs
      const [portfolioRes, dealsRes, investorsRes] = await Promise.all([
        supabase.from('portfolio_companies').select('id, sector_id').eq('user_id', userId),
        supabase.from('deals').select('id, sector_id').eq('user_id', userId),
        supabase.from('investors').select('id').eq('user_id', userId)
      ]);

      const portfolioIds = new Set(portfolioRes.data?.map(c => c.id) || []);
      const dealIds = new Set(dealsRes.data?.map(d => d.id) || []);
      const investorIds = new Set(investorsRes.data?.map(i => i.id) || []);
      
      // Get unique sector IDs from companies and deals
      const sectorIds = new Set<string>();
      (portfolioRes.data || []).forEach((c: any) => {
        if (c.sector_id) sectorIds.add(c.sector_id);
      });
      (dealsRes.data || []).forEach((d: any) => {
        if (d.sector_id) sectorIds.add(d.sector_id);
      });

      // Fetch matches for user's entities
      const allEntityIds = [
        ...Array.from(portfolioIds),
        ...Array.from(dealIds),
        ...Array.from(investorIds),
        ...Array.from(sectorIds)
      ].filter(Boolean);

      const { data: newsMatches } = allEntityIds.length > 0 
        ? await supabase
            .from('news_entity_matches')
            .select('news_item_id, entity_type, entity_id')
            .in('entity_id', allEntityIds)
        : { data: [] };

      // Create a map of news items with their relevant entity types
      const matchMap = new Map<string, Set<string>>();
      for (const match of newsMatches || []) {
        if (!matchMap.has(match.news_item_id)) {
          matchMap.set(match.news_item_id, new Set());
        }
        matchMap.get(match.news_item_id)!.add(match.entity_type);
      }

      // Mark news items as relevant and categorize
      const allNews = (allNewsItems || []).map(item => ({
        ...item,
        isRelevantToUser: matchMap.has(item.id),
        entityTypes: matchMap.get(item.id) || new Set()
      }));

      const relevantNews = allNews.filter(n => n.isRelevantToUser);
      // Show ALL high impact news, not just relevant ones
      const highImpactNews = allNews.filter(n => n.impact_level === 'high');
      const portfolioNews = relevantNews.filter(n => n.entityTypes.has('company'));
      const pipelineNews = relevantNews.filter(n => n.entityTypes.has('deal'));
      const investorNews = relevantNews.filter(n => n.entityTypes.has('investor'));
      const sectorNews = relevantNews.filter(n => n.entityTypes.has('sector'));

      return {
        highImpactNews,
        portfolioNews,
        pipelineNews,
        investorNews,
        sectorNews,
        allNews,
        totalCount: allNews.length,
        relevantCount: relevantNews.length
      };
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Real-time subscription for new news
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('entity-news-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'news_entity_matches'
        },
        () => {
          console.log('New news entity match detected, refetching...');
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refetch]);

  return {
    highImpactNews: data?.highImpactNews || [],
    portfolioNews: data?.portfolioNews || [],
    pipelineNews: data?.pipelineNews || [],
    investorNews: data?.investorNews || [],
    sectorNews: data?.sectorNews || [],
    allNews: data?.allNews || [],
    totalCount: data?.totalCount || 0,
    relevantCount: data?.relevantCount || 0,
    isLoading,
    error: error as Error | null,
  } as EntityNews;
};
