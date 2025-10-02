import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useCompanyLogo() {
  const [fetching, setFetching] = useState(false);

  const fetchLogo = async (companyId: string, website: string) => {
    if (!website) {
      toast.error("Website URL is required to fetch logo");
      return;
    }

    setFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-company-logo", {
        body: { dealId: companyId, website },
      });

      if (error) throw error;

      if (data?.logoUrl) {
        toast.success("Logo updated successfully");
        return data.logoUrl;
      } else {
        toast.error("No logo found for this website");
      }
    } catch (error: any) {
      console.error("Error fetching logo:", error);
      toast.error(error.message || "Failed to fetch logo");
    } finally {
      setFetching(false);
    }
  };

  return { fetchLogo, fetching };
}
