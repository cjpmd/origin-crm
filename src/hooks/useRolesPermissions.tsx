import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Role {
  id: string;
  name: string;
  description?: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string;
  created_at: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  created_at: string;
}

export const useRolesPermissions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Role[];
    },
  });

  const { data: permissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("permissions")
        .select("*")
        .order("resource, action");

      if (error) throw error;
      return data as Permission[];
    },
  });

  const { data: rolePermissions, isLoading: rolePermissionsLoading } = useQuery({
    queryKey: ["role-permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("role_permissions")
        .select("*");

      if (error) throw error;
      return data as RolePermission[];
    },
  });

  const createRole = useMutation({
    mutationFn: async (role: Omit<Partial<Role>, 'id' | 'created_at' | 'updated_at'> & { name: string }) => {
      const { data, error } = await supabase
        .from("roles")
        .insert([role])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast({
        title: "Success",
        description: "Role created successfully",
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

  const updateRole = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Role> & { id: string }) => {
      const { data, error } = await supabase
        .from("roles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast({
        title: "Success",
        description: "Role updated successfully",
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

  const deleteRole = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("roles")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast({
        title: "Success",
        description: "Role deleted successfully",
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

  const assignPermission = useMutation({
    mutationFn: async ({ roleId, permissionId }: { roleId: string; permissionId: string }) => {
      const { data, error } = await supabase
        .from("role_permissions")
        .insert({ role_id: roleId, permission_id: permissionId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-permissions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removePermission = useMutation({
    mutationFn: async ({ roleId, permissionId }: { roleId: string; permissionId: string }) => {
      const { error } = await supabase
        .from("role_permissions")
        .delete()
        .eq("role_id", roleId)
        .eq("permission_id", permissionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-permissions"] });
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
    roles,
    permissions,
    rolePermissions,
    isLoading: rolesLoading || permissionsLoading || rolePermissionsLoading,
    createRole: createRole.mutateAsync,
    updateRole: updateRole.mutateAsync,
    deleteRole: deleteRole.mutateAsync,
    assignPermission: assignPermission.mutateAsync,
    removePermission: removePermission.mutateAsync,
  };
};
