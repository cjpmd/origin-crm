import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DealSource {
  id: string;
  user_id: string;
  deal_id: string;
  source_type: string;
  intermediary_id?: string;
  contact_id?: string;
  attribution_notes?: string;
  source_quality_score?: number;
  introduction_date?: string;
  created_at: string;
  updated_at: string;
}

export function useDealSources(dealId?: string) {
  const queryClient = useQueryClient();

  const { data: dealSources = [], isLoading } = useQuery({
    queryKey: ["deal-sources", dealId],
    queryFn: async () => {
      let query = supabase
        .from("deal_sources")
        .select(`
          *,
          intermediary:intermediaries(name, firm, type),
          contact:contacts(name, email)
        `);

      if (dealId) {
        query = query.eq("deal_id", dealId);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!dealId,
  });

  const createDealSource = useMutation({
    mutationFn: async (newSource: Omit<DealSource, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("deal_sources")
        .insert([{ ...newSource, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal-sources"] });
      toast.success("Deal source added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add deal source");
    },
  });

  const updateDealSource = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DealSource> }) => {
      const { data, error } = await supabase
        .from("deal_sources")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal-sources"] });
      toast.success("Deal source updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update deal source");
    },
  });

  const deleteDealSource = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("deal_sources").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal-sources"] });
      toast.success("Deal source deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete deal source");
    },
  });

  return {
    dealSources,
    isLoading,
    createDealSource: createDealSource.mutate,
    updateDealSource: updateDealSource.mutate,
    deleteDealSource: deleteDealSource.mutate,
    isCreating: createDealSource.isPending,
    isUpdating: updateDealSource.isPending,
    isDeleting: deleteDealSource.isPending,
  };
}
