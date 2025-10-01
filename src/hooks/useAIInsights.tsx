import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AIInsight {
  id: string;
  user_id: string;
  entity_type: 'company' | 'contact' | 'deal' | 'sector';
  entity_id: string;
  insight_type: 'research' | 'summary' | 'suggestion' | 'news' | 'competitor';
  title?: string;
  content: string;
  metadata?: any;
  confidence_score?: number;
  created_at: string;
  expires_at?: string;
}

export const useAIInsights = (entityType?: string, entityId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: insights = [], isLoading } = useQuery({
    queryKey: ["ai-insights", entityType, entityId],
    queryFn: async () => {
      let query = supabase
        .from("ai_insights")
        .select("*")
        .order("created_at", { ascending: false });

      if (entityType && entityId) {
        query = query.eq("entity_type", entityType).eq("entity_id", entityId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AIInsight[];
    },
  });

  const generateInsight = useMutation({
    mutationFn: async (params: {
      entityType: string;
      entityId: string;
      insightType: AIInsight['insight_type'];
      query?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('ai-research', {
        body: params,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-insights"] });
      toast({
        title: "Success",
        description: "AI insight generated successfully",
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
    insights,
    isLoading,
    generateInsight: generateInsight.mutateAsync,
    isGenerating: generateInsight.isPending,
  };
};