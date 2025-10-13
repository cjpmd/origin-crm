import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface InvestorPreference {
  id: string;
  investor_id: string;
  preferred_sectors?: string[];
  preferred_geographies?: string[];
  preferred_fund_types?: string[];
  min_investment?: number;
  max_investment?: number;
  decision_timeline?: string;
  decision_makers?: any;
  preferred_deal_structure?: string;
  reporting_frequency?: string;
  esg_focus?: boolean;
  co_investment_interest?: boolean;
  created_at: string;
  updated_at: string;
}

export function useInvestorPreferences(investorId?: string) {
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ["investor-preferences", investorId],
    queryFn: async () => {
      if (!investorId) return null;
      
      const { data, error } = await supabase
        .from("investor_preferences")
        .select("*")
        .eq("investor_id", investorId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data as InvestorPreference | null;
    },
    enabled: !!investorId,
  });

  const upsertPreferences = useMutation({
    mutationFn: async (prefs: Partial<InvestorPreference> & { investor_id: string }) => {
      const { data, error } = await supabase
        .from("investor_preferences")
        .upsert(prefs, { onConflict: 'investor_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investor-preferences"] });
      toast.success("Preferences saved successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save preferences");
    },
  });

  return {
    preferences,
    isLoading,
    upsertPreferences: upsertPreferences.mutate,
  };
}
