import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FundCommitment {
  id: string;
  fund_id: string;
  investor_id: string;
  commitment_amount: number;
  committed_date?: string;
  called_amount: number;
  distributed_amount: number;
  remaining_commitment?: number;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  investors?: {
    id: string;
    name: string;
  };
  funds?: {
    id: string;
    name: string;
  };
}

export function useFundCommitments(fundId?: string) {
  const queryClient = useQueryClient();

  const { data: commitments = [], isLoading } = useQuery({
    queryKey: ["fund_commitments", fundId],
    queryFn: async () => {
      let query = supabase
        .from("fund_commitments")
        .select(`
          *,
          investors (id, name),
          funds (id, name)
        `);
      
      if (fundId) {
        query = query.eq("fund_id", fundId);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data as FundCommitment[];
    },
  });

  const createCommitment = useMutation({
    mutationFn: async (commitment: Omit<Partial<FundCommitment>, 'id' | 'created_at' | 'updated_at'> & { fund_id: string, investor_id: string, commitment_amount: number }) => {
      const { data, error } = await supabase
        .from("fund_commitments")
        .insert([commitment])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fund_commitments"] });
      toast.success("Commitment added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add commitment");
    },
  });

  const updateCommitment = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FundCommitment> & { id: string }) => {
      const { data, error } = await supabase
        .from("fund_commitments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fund_commitments"] });
      toast.success("Commitment updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update commitment");
    },
  });

  const deleteCommitment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("fund_commitments")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fund_commitments"] });
      toast.success("Commitment deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete commitment");
    },
  });

  return {
    commitments,
    isLoading,
    createCommitment: createCommitment.mutate,
    updateCommitment: updateCommitment.mutate,
    deleteCommitment: deleteCommitment.mutate,
  };
}