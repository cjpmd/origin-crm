import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from "react";

export interface Deal {
  id: string;
  user_id: string;
  name: string;
  company_id?: string;
  stage: string;
  sub_stage?: string;
  valuation?: number;
  probability?: number;
  sector?: string;
  sector_id?: string;
  owner?: string;
  expected_close_date?: string;
  website?: string;
  logo_url?: string;
  notes?: string;
  promoted_to_company_id?: string;
  promoted_at?: string;
  created_at: string;
  updated_at: string;
}

export function useDeals() {
  const queryClient = useQueryClient();

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["deals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals")
        .select(`
          *,
          sectors(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Map sector name to the deal object
      return (data || []).map(deal => ({
        ...deal,
        sector: deal.sectors?.name || deal.sector
      })) as Deal[];
    },
  });

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("deals-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "deals",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["deals"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createDeal = useMutation({
    mutationFn: async (newDeal: Omit<Deal, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("deals")
        .insert([{ ...newDeal, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Deal created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create deal");
    },
  });

  const updateDeal = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Deal> }) => {
      const { data, error } = await supabase
        .from("deals")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update deal");
    },
  });

  const deleteDeal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("deals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Deal deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete deal");
    },
  });

  return {
    deals,
    isLoading,
    createDeal: createDeal.mutate,
    updateDeal: updateDeal.mutate,
    deleteDeal: deleteDeal.mutate,
    isCreating: createDeal.isPending,
    isUpdating: updateDeal.isPending,
    isDeleting: deleteDeal.isPending,
  };
}
