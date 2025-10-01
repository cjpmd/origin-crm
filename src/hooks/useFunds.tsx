import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Fund {
  id: string;
  user_id: string;
  name: string;
  fund_size?: number;
  vintage_year?: number;
  strategy?: string;
  status: string;
  close_date?: string;
  final_close_date?: string;
  target_irr?: number;
  target_moic?: number;
  management_fee_rate?: number;
  carried_interest_rate?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export function useFunds() {
  const queryClient = useQueryClient();

  const { data: funds = [], isLoading } = useQuery({
    queryKey: ["funds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("funds")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Fund[];
    },
  });

  const createFund = useMutation({
    mutationFn: async (fund: Omit<Partial<Fund>, 'user_id' | 'id' | 'created_at' | 'updated_at'> & { name: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("funds")
        .insert([{ ...fund, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      toast.success("Fund created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create fund");
    },
  });

  const updateFund = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Fund> & { id: string }) => {
      const { data, error } = await supabase
        .from("funds")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      toast.success("Fund updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update fund");
    },
  });

  const deleteFund = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("funds")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      toast.success("Fund deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete fund");
    },
  });

  return {
    funds,
    isLoading,
    createFund: createFund.mutate,
    updateFund: updateFund.mutate,
    deleteFund: deleteFund.mutate,
  };
}