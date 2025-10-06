import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TeamMember {
  id: string;
  user_id: string | null; // null for invited members who haven't joined
  email: string;
  full_name?: string;
  status: string;
  invited_by?: string;
  invited_at: string;
  joined_at?: string;
  created_at: string;
  updated_at: string;
}

export const useTeamMembers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: members, isLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TeamMember[];
    },
  });

  const inviteMember = useMutation({
    mutationFn: async (member: { email: string; full_name?: string }) => {
      const { data, error } = await supabase.functions.invoke('invite-team-member', {
        body: member,
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to invite member');
      return data.member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast({
        title: "Success",
        description: "Team member invited successfully",
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

  const updateMember = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TeamMember> & { id: string }) => {
      const { data, error } = await supabase
        .from("team_members")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast({
        title: "Success",
        description: "Team member updated successfully",
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

  const deleteMember = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast({
        title: "Success",
        description: "Team member removed successfully",
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
    members,
    isLoading,
    inviteMember: inviteMember.mutateAsync,
    updateMember: updateMember.mutateAsync,
    deleteMember: deleteMember.mutateAsync,
  };
};
