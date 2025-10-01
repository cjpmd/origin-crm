import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PortfolioKPI {
  id: string;
  company_id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  revenue?: number;
  ebitda?: number;
  ebitda_margin?: number;
  arr?: number;
  headcount?: number;
  revenue_growth?: number;
  customer_count?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export function usePortfolioKPIs(companyId?: string) {
  const queryClient = useQueryClient();

  const { data: kpis = [], isLoading } = useQuery({
    queryKey: ["portfolio_kpis", companyId],
    queryFn: async () => {
      let query = supabase
        .from("portfolio_kpis")
        .select("*")
        .order("period_start", { ascending: false });

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PortfolioKPI[];
    },
  });

  const createKPI = useMutation({
    mutationFn: async (kpi: Omit<Partial<PortfolioKPI>, 'user_id' | 'id' | 'created_at' | 'updated_at'> & { company_id: string; period_start: string; period_end: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("portfolio_kpis")
        .insert([{ ...kpi, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio_kpis"] });
      toast.success("KPI added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add KPI");
    },
  });

  const updateKPI = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PortfolioKPI> & { id: string }) => {
      const { data, error } = await supabase
        .from("portfolio_kpis")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio_kpis"] });
      toast.success("KPI updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update KPI");
    },
  });

  const deleteKPI = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("portfolio_kpis")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio_kpis"] });
      toast.success("KPI deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete KPI");
    },
  });

  return {
    kpis,
    isLoading,
    createKPI: createKPI.mutate,
    updateKPI: updateKPI.mutate,
    deleteKPI: deleteKPI.mutate,
  };
}
