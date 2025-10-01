import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PipelineMetrics {
  totalDeals: number;
  activeDeals: number;
  averageVelocity: number; // days to close
  conversionRate: number;
  stageDistribution: { stage: string; count: number; value: number }[];
  recentWins: number;
  recentLosses: number;
  topSources: { source: string; count: number }[];
}

export const usePipelineAnalytics = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["pipeline-analytics"],
    queryFn: async (): Promise<PipelineMetrics> => {
      const { data: deals } = await supabase
        .from("deals")
        .select("*")
        .order("created_at", { ascending: false });

      if (!deals) {
        return {
          totalDeals: 0,
          activeDeals: 0,
          averageVelocity: 0,
          conversionRate: 0,
          stageDistribution: [],
          recentWins: 0,
          recentLosses: 0,
          topSources: [],
        };
      }

      const totalDeals = deals.length;
      const activeDeals = deals.filter(d => 
        d.stage !== 'Won' && d.stage !== 'Lost'
      ).length;

      // Calculate conversion rate
      const closedDeals = deals.filter(d => 
        d.stage === 'Won' || d.stage === 'Lost'
      );
      const wonDeals = deals.filter(d => d.stage === 'Won');
      const conversionRate = closedDeals.length > 0 
        ? (wonDeals.length / closedDeals.length) * 100 
        : 0;

      // Calculate average velocity (simplified)
      const velocities = deals
        .filter(d => d.stage === 'Won' && d.promoted_at)
        .map(d => {
          const created = new Date(d.created_at).getTime();
          const promoted = new Date(d.promoted_at!).getTime();
          return (promoted - created) / (1000 * 60 * 60 * 24); // days
        });
      const averageVelocity = velocities.length > 0
        ? velocities.reduce((a, b) => a + b, 0) / velocities.length
        : 0;

      // Stage distribution
      const stageMap = new Map<string, { count: number; value: number }>();
      deals.forEach(deal => {
        const stage = deal.stage || 'Unknown';
        const current = stageMap.get(stage) || { count: 0, value: 0 };
        stageMap.set(stage, {
          count: current.count + 1,
          value: current.value + (deal.valuation || 0),
        });
      });

      const stageDistribution = Array.from(stageMap.entries()).map(([stage, data]) => ({
        stage,
        count: data.count,
        value: data.value,
      }));

      // Recent wins/losses (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentWins = deals.filter(d => 
        d.stage === 'Won' && 
        d.promoted_at && 
        new Date(d.promoted_at) > thirtyDaysAgo
      ).length;
      const recentLosses = deals.filter(d => 
        d.stage === 'Lost' && 
        d.updated_at && 
        new Date(d.updated_at) > thirtyDaysAgo
      ).length;

      // Top sources (simplified - would need source tracking)
      const sourceMap = new Map<string, number>();
      deals.forEach(deal => {
        const source = deal.owner || 'Unknown';
        sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
      });
      const topSources = Array.from(sourceMap.entries())
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalDeals,
        activeDeals,
        averageVelocity: Math.round(averageVelocity),
        conversionRate: Math.round(conversionRate),
        stageDistribution,
        recentWins,
        recentLosses,
        topSources,
      };
    },
  });

  return {
    metrics,
    isLoading,
  };
};