import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Sector {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export function useSectors() {
  const { data: sectors = [], isLoading } = useQuery({
    queryKey: ["sectors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sectors")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Sector[];
    },
  });

  const getSectorById = (id: string) => {
    return sectors.find(sector => sector.id === id);
  };

  return {
    sectors,
    isLoading,
    getSectorById,
  };
}
