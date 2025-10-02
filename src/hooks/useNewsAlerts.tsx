import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface NewsAlert {
  id: string;
  user_id: string;
  name: string;
  enabled: boolean;
  trigger_keywords: string[];
  trigger_event_types: string[];
  watch_entity_type?: 'company' | 'investor' | 'sector' | 'deal' | 'all';
  watch_entity_id?: string;
  min_impact_level?: 'high' | 'medium' | 'low';
  notification_channels: string[];
  last_triggered_at?: string;
  created_at: string;
  updated_at: string;
}

export const useNewsAlerts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["news-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_alerts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as NewsAlert[];
    },
  });

  const createAlert = useMutation({
    mutationFn: async (alert: Omit<NewsAlert, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'last_triggered_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from("news_alerts")
        .insert([{
          name: alert.name,
          enabled: alert.enabled,
          trigger_keywords: alert.trigger_keywords || [],
          trigger_event_types: alert.trigger_event_types || [],
          watch_entity_type: alert.watch_entity_type,
          watch_entity_id: alert.watch_entity_id,
          min_impact_level: alert.min_impact_level,
          notification_channels: alert.notification_channels || ['in_app'],
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news-alerts"] });
      toast({
        title: "Success",
        description: "Alert created successfully",
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

  const updateAlert = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<NewsAlert> & { id: string }) => {
      const { data, error } = await supabase
        .from("news_alerts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news-alerts"] });
      toast({
        title: "Success",
        description: "Alert updated successfully",
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

  const deleteAlert = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("news_alerts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news-alerts"] });
      toast({
        title: "Success",
        description: "Alert deleted successfully",
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
    alerts,
    isLoading,
    createAlert: createAlert.mutateAsync,
    updateAlert: updateAlert.mutateAsync,
    deleteAlert: deleteAlert.mutateAsync,
  };
};
