import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Sector {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export function useSectors() {
  const queryClient = useQueryClient();

  const { data: sectors = [], isLoading } = useQuery({
    queryKey: ["sectors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sectors")
        .select("*")
        .order("display_order", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Sector[];
    },
  });

  const activeSectors = sectors.filter(s => s.is_active);

  const createSector = useMutation({
    mutationFn: async (sector: Omit<Sector, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("sectors")
        .insert([sector])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sectors"] });
      toast.success("Sector created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create sector");
    },
  });

  const updateSector = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Sector> & { id: string }) => {
      const { data, error } = await supabase
        .from("sectors")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sectors"] });
      toast.success("Sector updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update sector");
    },
  });

  const deleteSector = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("sectors")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sectors"] });
      toast.success("Sector deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete sector");
    },
  });

  const getSectorById = (id: string) => {
    return sectors.find(sector => sector.id === id);
  };

  return {
    sectors,
    activeSectors,
    isLoading,
    getSectorById,
    createSector: createSector.mutate,
    updateSector: updateSector.mutate,
    deleteSector: deleteSector.mutate,
    isCreating: createSector.isPending,
    isUpdating: updateSector.isPending,
    isDeleting: deleteSector.isPending,
  };
}
