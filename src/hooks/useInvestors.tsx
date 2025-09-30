import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Investor {
  id: string;
  user_id: string;
  name: string;
  type?: string;
  focus_sectors?: string[];
  check_size?: string;
  location?: string;
  website?: string;
  notes?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useInvestors() {
  const queryClient = useQueryClient();

  const { data: investors = [], isLoading } = useQuery({
    queryKey: ["investors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investors")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Investor[];
    },
  });

  const createInvestor = useMutation({
    mutationFn: async (investor: Omit<Partial<Investor>, 'user_id' | 'id' | 'created_at' | 'updated_at'> & { name: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("investors")
        .insert([{ ...investor, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investors"] });
      toast.success("Investor added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add investor");
    },
  });

  const updateInvestor = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Investor> & { id: string }) => {
      const { data, error } = await supabase
        .from("investors")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investors"] });
      toast.success("Investor updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update investor");
    },
  });

  const deleteInvestor = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("investors")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investors"] });
      toast.success("Investor deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete investor");
    },
  });

  return {
    investors,
    isLoading,
    createInvestor: createInvestor.mutate,
    updateInvestor: updateInvestor.mutate,
    deleteInvestor: deleteInvestor.mutate,
  };
}