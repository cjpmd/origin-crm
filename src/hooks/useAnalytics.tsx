import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsData {
  dealFlow: {
    totalDeals: number;
    totalValue: number;
    byStage: Record<string, number>;
    last30Days: number;
  };
  contacts: {
    total: number;
    recentActivity: number;
    topEngagement: Array<{
      id: string;
      name: string;
      lastContact: string;
    }>;
  };
  portfolio: {
    totalCompanies: number;
    publicCompanies: number;
    totalValuation: number;
    bySector: Record<string, number>;
  };
}

export function useAnalytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch all data in parallel
      const [dealsResult, contactsResult, companiesResult] = await Promise.all([
        supabase.from("deals").select("*").eq("user_id", user.id),
        supabase.from("contacts").select("*").eq("user_id", user.id),
        supabase.from("portfolio_companies").select("*, sectors(name)").eq("user_id", user.id),
      ]);

      if (dealsResult.error) throw dealsResult.error;
      if (contactsResult.error) throw contactsResult.error;
      if (companiesResult.error) throw companiesResult.error;

      const deals = dealsResult.data || [];
      const contacts = contactsResult.data || [];
      const companies = companiesResult.data || [];

      // Calculate deal flow metrics
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const dealsByStage = deals.reduce((acc, deal) => {
        acc[deal.stage] = (acc[deal.stage] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const recentDeals = deals.filter(
        deal => new Date(deal.created_at) >= thirtyDaysAgo
      );

      const totalDealValue = deals.reduce((sum, deal) => sum + (deal.valuation || 0), 0);

      // Calculate contact metrics
      const recentContacts = contacts.filter(
        contact => contact.last_contact_date && 
        new Date(contact.last_contact_date) >= thirtyDaysAgo
      );

      const topEngagement = contacts
        .filter(c => c.last_contact_date)
        .sort((a, b) => 
          new Date(b.last_contact_date!).getTime() - new Date(a.last_contact_date!).getTime()
        )
        .slice(0, 5)
        .map(c => ({
          id: c.id,
          name: c.name,
          lastContact: c.last_contact_date!
        }));

      // Calculate portfolio metrics
      const companiesBySector = companies.reduce((acc, company) => {
        const sector = company.sectors?.name || "Other";
        acc[sector] = (acc[sector] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalValuation = companies.reduce(
        (sum, company) => sum + (company.valuation || company.market_cap || 0), 
        0
      );

      const publicCompanies = companies.filter(c => c.is_public).length;

      const analyticsData: AnalyticsData = {
        dealFlow: {
          totalDeals: deals.length,
          totalValue: totalDealValue,
          byStage: dealsByStage,
          last30Days: recentDeals.length,
        },
        contacts: {
          total: contacts.length,
          recentActivity: recentContacts.length,
          topEngagement,
        },
        portfolio: {
          totalCompanies: companies.length,
          publicCompanies,
          totalValuation,
          bySector: companiesBySector,
        },
      };

      return analyticsData;
    },
  });

  return {
    analytics,
    isLoading,
  };
}
