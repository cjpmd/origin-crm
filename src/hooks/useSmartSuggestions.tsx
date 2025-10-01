import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SmartSuggestion {
  id: string;
  type: 'next_step' | 'neglected_relationship' | 'warm_path' | 'deal_opportunity';
  title: string;
  description: string;
  entity_type?: string;
  entity_id?: string;
  priority: number;
  metadata?: any;
  created_at: string;
}

export const useSmartSuggestions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ["smart-suggestions"],
    queryFn: async () => {
      // Get user's activities and relationships to generate suggestions
      const { data: activities } = await supabase
        .from("activities")
        .select("*")
        .order("activity_date", { ascending: false })
        .limit(50);

      const { data: relationshipScores } = await supabase
        .from("relationship_scores")
        .select("*, contact:contact_id(name, email), company:company_id(name)")
        .order("score", { ascending: true })
        .limit(20);

      const { data: deals } = await supabase
        .from("deals")
        .select("*")
        .order("updated_at", { ascending: false });

      // Generate suggestions based on data
      const generatedSuggestions: SmartSuggestion[] = [];

      // Find neglected relationships (low score or no recent activity)
      relationshipScores?.forEach((score) => {
        if (score.score < 40 || !score.last_interaction) {
          generatedSuggestions.push({
            id: `neglected-${score.id}`,
            type: 'neglected_relationship',
            title: 'Relationship needs attention',
            description: `Reach out to ${score.contact?.name || score.company?.name} - relationship score is ${score.score}%`,
            entity_type: score.contact_id ? 'contact' : 'company',
            entity_id: score.contact_id || score.company_id || '',
            priority: 100 - score.score,
            metadata: score,
            created_at: new Date().toISOString(),
          });
        }
      });

      // Find deals without recent activity
      deals?.forEach((deal) => {
        const daysSinceUpdate = Math.floor(
          (Date.now() - new Date(deal.updated_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceUpdate > 7 && deal.stage !== 'Lost' && deal.stage !== 'Won') {
          generatedSuggestions.push({
            id: `deal-${deal.id}`,
            type: 'next_step',
            title: 'Deal needs follow-up',
            description: `${deal.name} hasn't been updated in ${daysSinceUpdate} days`,
            entity_type: 'deal',
            entity_id: deal.id,
            priority: Math.min(daysSinceUpdate, 100),
            metadata: deal,
            created_at: new Date().toISOString(),
          });
        }
      });

      // Sort by priority
      return generatedSuggestions.sort((a, b) => b.priority - a.priority).slice(0, 10);
    },
  });

  const dismissSuggestion = useMutation({
    mutationFn: async (suggestionId: string) => {
      // In a real implementation, store dismissed suggestions
      return suggestionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smart-suggestions"] });
      toast({
        title: "Suggestion dismissed",
      });
    },
  });

  return {
    suggestions,
    isLoading,
    dismissSuggestion: dismissSuggestion.mutateAsync,
  };
};