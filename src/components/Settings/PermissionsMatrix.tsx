import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Permission, Role, RolePermission, useRolesPermissions } from "@/hooks/useRolesPermissions";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface PermissionsMatrixProps {
  selectedRole: Role | null;
}

export function PermissionsMatrix({ selectedRole }: PermissionsMatrixProps) {
  const { permissions, rolePermissions, assignPermission, removePermission } = useRolesPermissions();

  if (!selectedRole) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Select a role to manage permissions
        </CardContent>
      </Card>
    );
  }

  const groupedPermissions = permissions?.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>) || {};

  const hasPermission = (permissionId: string) => {
    return rolePermissions?.some(
      rp => rp.role_id === selectedRole.id && rp.permission_id === permissionId
    );
  };

  const handlePermissionToggle = async (permission: Permission) => {
    if (hasPermission(permission.id)) {
      await removePermission({ roleId: selectedRole.id, permissionId: permission.id });
    } else {
      await assignPermission({ roleId: selectedRole.id, permissionId: permission.id });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissions for {selectedRole.name}</CardTitle>
        <CardDescription>
          {selectedRole.description || "Configure which actions this role can perform"}
        </CardDescription>
        {selectedRole.is_system && (
          <Badge variant="secondary">System Role</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedPermissions).map(([resource, perms]) => (
          <div key={resource} className="space-y-3">
            <h4 className="font-medium capitalize">{resource}</h4>
            <div className="grid grid-cols-2 gap-4">
              {perms.map((permission) => (
                <div key={permission.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={permission.id}
                    checked={hasPermission(permission.id)}
                    onCheckedChange={() => handlePermissionToggle(permission)}
                    disabled={selectedRole.is_system}
                  />
                  <Label
                    htmlFor={permission.id}
                    className="font-normal cursor-pointer capitalize"
                  >
                    {permission.action}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
