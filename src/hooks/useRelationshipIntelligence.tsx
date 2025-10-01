import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface RelationshipScore {
  id: string;
  user_id: string;
  contact_id?: string;
  company_id?: string;
  score: number;
  last_interaction?: string;
  interaction_count: number;
  recency_score: number;
  frequency_score: number;
  created_at: string;
  updated_at: string;
}

export interface NetworkConnection {
  id: string;
  user_id: string;
  from_contact_id: string;
  to_contact_id: string;
  connection_strength: number;
  source?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useRelationshipIntelligence = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: relationshipScores = [], isLoading: scoresLoading } = useQuery({
    queryKey: ["relationship-scores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("relationship_scores")
        .select("*")
        .order("score", { ascending: false });

      if (error) throw error;
      return data as RelationshipScore[];
    },
  });

  const { data: networkConnections = [], isLoading: connectionsLoading } = useQuery({
    queryKey: ["network-connections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("network_connections")
        .select(`
          *,
          from_contact:from_contact_id(id, name, company_id, email),
          to_contact:to_contact_id(id, name, company_id, email)
        `);

      if (error) throw error;
      return data as any[];
    },
  });

  const updateRelationshipScore = useMutation({
    mutationFn: async (params: {
      contactId?: string;
      companyId?: string;
      score: number;
      lastInteraction?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("relationship_scores")
        .upsert({
          user_id: user.id,
          contact_id: params.contactId,
          company_id: params.companyId,
          score: params.score,
          last_interaction: params.lastInteraction,
          interaction_count: 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["relationship-scores"] });
    },
  });

  const addNetworkConnection = useMutation({
    mutationFn: async (connection: {
      from_contact_id: string;
      to_contact_id: string;
      connection_strength?: number;
      source?: string;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("network_connections")
        .insert({
          user_id: user.id,
          ...connection,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["network-connections"] });
      toast({
        title: "Success",
        description: "Network connection added",
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
    relationshipScores,
    networkConnections,
    isLoading: scoresLoading || connectionsLoading,
    updateRelationshipScore: updateRelationshipScore.mutateAsync,
    addNetworkConnection: addNetworkConnection.mutateAsync,
  };
};