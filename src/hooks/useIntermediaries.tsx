import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Intermediary {
  id: string;
  user_id: string;
  name: string;
  type: string;
  firm?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  relationship_strength?: number;
  last_contact_date?: string;
  total_deals_sourced?: number;
  successful_deals?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export function useIntermediaries() {
  const queryClient = useQueryClient();

  const { data: intermediaries = [], isLoading } = useQuery({
    queryKey: ["intermediaries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("intermediaries")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Intermediary[];
    },
  });

  const createIntermediary = useMutation({
    mutationFn: async (newIntermediary: Omit<Intermediary, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("intermediaries")
        .insert([{ ...newIntermediary, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intermediaries"] });
      toast.success("Intermediary added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add intermediary");
    },
  });

  const updateIntermediary = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Intermediary> }) => {
      const { data, error } = await supabase
        .from("intermediaries")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intermediaries"] });
      toast.success("Intermediary updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update intermediary");
    },
  });

  const deleteIntermediary = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("intermediaries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intermediaries"] });
      toast.success("Intermediary deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete intermediary");
    },
  });

  return {
    intermediaries,
    isLoading,
    createIntermediary: createIntermediary.mutate,
    updateIntermediary: updateIntermediary.mutate,
    deleteIntermediary: deleteIntermediary.mutate,
    isCreating: createIntermediary.isPending,
    isUpdating: updateIntermediary.isPending,
    isDeleting: deleteIntermediary.isPending,
  };
}
