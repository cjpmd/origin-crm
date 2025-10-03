import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserWithRole {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role_id?: string;
  role_name?: string;
  role_description?: string;
  is_current_user: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  is_system: boolean;
}

export function useUserRoles() {
  const queryClient = useQueryClient();

  // Fetch all users with their roles
  const { data: usersWithRoles = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users-with-roles"],
    queryFn: async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Not authenticated");

      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url");

      if (profilesError) throw profilesError;

      // Get all user roles with role details
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select(`
          user_id,
          role_id,
          roles (
            id,
            name,
            description
          )
        `);

      if (rolesError) throw rolesError;

      // Get all auth users
      const { data: { users } } = await supabase.auth.admin.listUsers();

      // Combine data
      const usersData: UserWithRole[] = users?.map((authUser) => {
        const profile = profiles?.find(p => p.id === authUser.id);
        const userRole = userRoles?.find((ur: any) => ur.user_id === authUser.id);
        const roleData: any = userRole ? (userRole as any).roles : null;

        return {
          id: authUser.id,
          email: authUser.email || "",
          full_name: profile?.full_name,
          avatar_url: profile?.avatar_url,
          role_id: roleData?.id,
          role_name: roleData?.name,
          role_description: roleData?.description,
          is_current_user: authUser.id === currentUser.id
        };
      }) || [];

      // Sort to put current user first
      return usersData.sort((a, b) => {
        if (a.is_current_user) return -1;
        if (b.is_current_user) return 1;
        return 0;
      });
    },
  });

  // Fetch available roles
  const { data: availableRoles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ["available-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Role[];
    },
  });

  // Check if current user is admin
  const { data: isAdmin = false } = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc("has_role_by_name", {
        _user_id: user.id,
        _role_name: "Admin"
      });

      if (error) {
        console.error("Error checking admin status:", error);
        return false;
      }

      return data || false;
    },
  });

  // Assign role to user
  const assignRole = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Delete existing role
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      // Insert new role
      const { data, error } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role_id: roleId,
          assigned_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
      toast.success("Role assigned successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to assign role");
    },
  });

  // Remove role from user
  const removeRole = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
      toast.success("Role removed successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove role");
    },
  });

  return {
    usersWithRoles,
    availableRoles,
    isAdmin,
    isLoading: isLoadingUsers || isLoadingRoles,
    assignRole: assignRole.mutate,
    removeRole: removeRole.mutate,
    isAssigning: assignRole.isPending,
    isRemoving: removeRole.isPending,
  };
}
