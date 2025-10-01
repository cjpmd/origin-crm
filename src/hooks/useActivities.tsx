import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Activity {
  id: string;
  user_id: string;
  activity_type: 'email' | 'meeting' | 'call' | 'note' | 'linkedin' | 'research';
  subject?: string;
  body?: string;
  activity_date: string;
  duration_minutes?: number;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface ActivityAssociation {
  id: string;
  activity_id: string;
  entity_type: 'company' | 'contact' | 'deal' | 'fund' | 'investor';
  entity_id: string;
  created_at: string;
}

export const useActivities = (entityType?: string, entityId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities", entityType, entityId],
    queryFn: async () => {
      if (entityType && entityId) {
        // Get activities for a specific entity
        const { data: associations, error: assocError } = await supabase
          .from("activity_associations")
          .select("activity_id")
          .eq("entity_type", entityType)
          .eq("entity_id", entityId);

        if (assocError) throw assocError;

        const activityIds = associations.map(a => a.activity_id);
        
        if (activityIds.length === 0) return [];

        const { data, error } = await supabase
          .from("activities")
          .select("*")
          .in("id", activityIds)
          .order("activity_date", { ascending: false });

        if (error) throw error;
        return data as Activity[];
      } else {
        // Get all activities for the user
        const { data, error } = await supabase
          .from("activities")
          .select("*")
          .order("activity_date", { ascending: false });

        if (error) throw error;
        return data as Activity[];
      }
    },
  });

  const logActivity = useMutation({
    mutationFn: async (activity: {
      activity_type: Activity['activity_type'];
      subject?: string;
      body?: string;
      activity_date?: string;
      duration_minutes?: number;
      metadata?: any;
      associations?: { entity_type: string; entity_id: string }[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: activityData, error: activityError } = await supabase
        .from("activities")
        .insert({
          user_id: user.id,
          activity_type: activity.activity_type,
          subject: activity.subject,
          body: activity.body,
          activity_date: activity.activity_date || new Date().toISOString(),
          duration_minutes: activity.duration_minutes,
          metadata: activity.metadata || {},
        })
        .select()
        .single();

      if (activityError) throw activityError;

      // Create associations
      if (activity.associations && activity.associations.length > 0) {
        const { error: assocError } = await supabase
          .from("activity_associations")
          .insert(
            activity.associations.map(assoc => ({
              activity_id: activityData.id,
              entity_type: assoc.entity_type,
              entity_id: assoc.entity_id,
            }))
          );

        if (assocError) throw assocError;
      }

      return activityData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast({
        title: "Success",
        description: "Activity logged successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    activities,
    isLoading,
    logActivity: logActivity.mutateAsync,
  };
};