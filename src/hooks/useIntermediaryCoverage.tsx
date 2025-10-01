import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface IntermediaryCoverage {
  id: string;
  user_id: string;
  intermediary_id: string;
  sector_id?: string;
  coverage_strength?: number;
  last_interaction_date?: string;
  interaction_count?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export function useIntermediaryCoverage(intermediaryId?: string) {
  const queryClient = useQueryClient();

  const { data: coverage = [], isLoading } = useQuery({
    queryKey: ["intermediary-coverage", intermediaryId],
    queryFn: async () => {
      let query = supabase
        .from("intermediary_coverage")
        .select(`
          *,
          intermediary:intermediaries(name, firm, type),
          sector:sectors(name)
        `);

      if (intermediaryId) {
        query = query.eq("intermediary_id", intermediaryId);
      }

      const { data, error } = await query.order("coverage_strength", { ascending: false });

      if (error) throw error;
      return data as any[];
    },
  });

  const createCoverage = useMutation({
    mutationFn: async (newCoverage: Omit<IntermediaryCoverage, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("intermediary_coverage")
        .insert([{ ...newCoverage, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intermediary-coverage"] });
      toast.success("Coverage added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add coverage");
    },
  });

  const updateCoverage = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<IntermediaryCoverage> }) => {
      const { data, error } = await supabase
        .from("intermediary_coverage")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intermediary-coverage"] });
      toast.success("Coverage updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update coverage");
    },
  });

  const deleteCoverage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("intermediary_coverage").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intermediary-coverage"] });
      toast.success("Coverage deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete coverage");
    },
  });

  return {
    coverage,
    isLoading,
    createCoverage: createCoverage.mutate,
    updateCoverage: updateCoverage.mutate,
    deleteCoverage: deleteCoverage.mutate,
    isCreating: createCoverage.isPending,
    isUpdating: updateCoverage.isPending,
    isDeleting: deleteCoverage.isPending,
  };
}
