import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Subscription {
  id: string;
  company_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  seats_purchased: number;
  seats_used: number;
  trial_end: string | null;
  current_period_end: string | null;
  current_period_start: string | null;
  plan_name: string;
}

export const useSubscription = () => {
  const { user } = useAuth();

  const { data: subscription, isLoading, error, refetch } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get user's company profile
      const { data: companyProfile, error: companyError } = await supabase
        .from("company_profiles")
        .select("id, subscription_status, max_users")
        .eq("user_id", user.id)
        .single();

      if (companyError) {
        // User might be a team member, get their company via team_members
        const { data: teamMember } = await supabase
          .from("team_members")
          .select("invited_by")
          .eq("user_id", user.id)
          .single();

        if (teamMember?.invited_by) {
          const { data: ownerCompany, error: ownerError } = await supabase
            .from("company_profiles")
            .select("id, subscription_status, max_users")
            .eq("user_id", teamMember.invited_by)
            .single();

          if (ownerError) throw ownerError;
          
          // Get subscription for owner's company
          const { data: sub, error: subError } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("company_id", ownerCompany.id)
            .single();

          if (subError) throw subError;
          return sub as Subscription;
        }
        throw companyError;
      }

      // Get subscription for user's company
      const { data: sub, error: subError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("company_id", companyProfile.id)
        .single();

      if (subError) throw subError;
      return sub as Subscription;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const isActive = subscription?.status === "active" || subscription?.status === "trialing";
  const isTrialing = subscription?.status === "trialing";
  const isPastDue = subscription?.status === "past_due";
  const isCanceled = subscription?.status === "canceled";
  
  const seatsAvailable = subscription 
    ? subscription.seats_purchased - subscription.seats_used 
    : 0;
  
  const canAddUsers = seatsAvailable > 0 && isActive;

  const trialDaysRemaining = subscription?.trial_end 
    ? Math.ceil((new Date(subscription.trial_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    subscription,
    isLoading,
    error,
    isActive,
    isTrialing,
    isPastDue,
    isCanceled,
    seatsAvailable,
    canAddUsers,
    trialDaysRemaining,
    refetch,
  };
};
