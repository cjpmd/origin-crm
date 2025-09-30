import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PortfolioCompany {
  id: string;
  user_id: string;
  name: string;
  sector_id?: string;
  stage?: string;
  investment_date?: string;
  investment_amount?: number;
  ownership_percentage?: number;
  valuation?: number;
  location?: string;
  website?: string;
  description?: string;
  status: string;
  is_public: boolean;
  stock_ticker?: string;
  current_stock_price?: number;
  market_cap?: number;
  enterprise_value?: number;
  created_at: string;
  updated_at: string;
  sectors?: {
    id: string;
    name: string;
  };
}

export function usePortfolioCompanies() {
  const queryClient = useQueryClient();

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["portfolio_companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio_companies")
        .select(`
          *,
          sectors (
            id,
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PortfolioCompany[];
    },
  });

  const createCompany = useMutation({
    mutationFn: async (company: Omit<Partial<PortfolioCompany>, 'user_id' | 'id' | 'created_at' | 'updated_at'> & { name: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("portfolio_companies")
        .insert([{ ...company, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio_companies"] });
      toast.success("Company added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add company");
    },
  });

  const updateCompany = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PortfolioCompany> & { id: string }) => {
      const { data, error } = await supabase
        .from("portfolio_companies")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio_companies"] });
      toast.success("Company updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update company");
    },
  });

  const deleteCompany = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("portfolio_companies")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio_companies"] });
      toast.success("Company deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete company");
    },
  });

  return {
    companies,
    isLoading,
    createCompany: createCompany.mutate,
    updateCompany: updateCompany.mutate,
    deleteCompany: deleteCompany.mutate,
  };
}