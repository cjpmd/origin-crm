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
  allNews: NewsItem[];
  totalCount: number;
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

      // Fetch news items matched to user's entities (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data: newsMatches, error: matchError } = await supabase
        .from('news_entity_matches')
        .select(`
          id,
          entity_type,
          entity_id,
          match_confidence,
          news_item_id,
          news_items (
            id,
            title,
            summary,
            content,
            source_name,
            source_url,
            author,
            published_at,
            fetched_at,
            sentiment,
            sentiment_confidence,
            impact_level,
            relevance_score,
            category,
            tags,
            metadata,
            created_at,
            updated_at
          )
        `)
        .gte('news_items.published_at', sevenDaysAgo)
        .order('news_items.published_at', { ascending: false });

      if (matchError) throw matchError;

      // Get user's entity IDs to filter
      const [portfolioRes, dealsRes, investorsRes] = await Promise.all([
        supabase.from('portfolio_companies').select('id').eq('user_id', userId),
        supabase.from('deals').select('id').eq('user_id', userId),
        supabase.from('investors').select('id').eq('user_id', userId)
      ]);

      const portfolioIds = new Set(portfolioRes.data?.map(c => c.id) || []);
      const dealIds = new Set(dealsRes.data?.map(d => d.id) || []);
      const investorIds = new Set(investorsRes.data?.map(i => i.id) || []);

      // Filter and categorize news
      const newsMap = new Map<string, { item: NewsItem; entities: Set<string> }>();

      for (const match of newsMatches || []) {
        const newsItem = match.news_items as unknown as NewsItem;
        if (!newsItem) continue;

        // Check if entity belongs to user
        let isRelevant = false;
        if (match.entity_type === 'company' && portfolioIds.has(match.entity_id)) {
          isRelevant = true;
        } else if (match.entity_type === 'deal' && dealIds.has(match.entity_id)) {
          isRelevant = true;
        } else if (match.entity_type === 'investor' && investorIds.has(match.entity_id)) {
          isRelevant = true;
        }

        if (!isRelevant) continue;

        // Deduplicate by news item ID
        if (!newsMap.has(newsItem.id)) {
          newsMap.set(newsItem.id, {
            item: newsItem,
            entities: new Set([match.entity_type])
          });
        } else {
          newsMap.get(newsItem.id)!.entities.add(match.entity_type);
        }
      }

      const allNews = Array.from(newsMap.values()).map(n => n.item);

      // Categorize
      const highImpactNews = allNews.filter(n => n.impact_level === 'high');
      
      const portfolioNews = Array.from(newsMap.entries())
        .filter(([_, v]) => v.entities.has('company'))
        .map(([_, v]) => v.item);
      
      const pipelineNews = Array.from(newsMap.entries())
        .filter(([_, v]) => v.entities.has('deal'))
        .map(([_, v]) => v.item);
      
      const investorNews = Array.from(newsMap.entries())
        .filter(([_, v]) => v.entities.has('investor'))
        .map(([_, v]) => v.item);

      const sectorNews = Array.from(newsMap.entries())
        .filter(([_, v]) => v.entities.has('sector'))
        .map(([_, v]) => v.item);

      return {
        highImpactNews,
        portfolioNews,
        pipelineNews,
        investorNews,
        sectorNews,
        allNews,
        totalCount: allNews.length
      };
    },
    enabled: !!userId,
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
    isLoading,
    error: error as Error | null,
  } as EntityNews;
};
