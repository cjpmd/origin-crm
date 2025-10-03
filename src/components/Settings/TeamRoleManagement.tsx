import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Shield, Crown } from "lucide-react";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Skeleton } from "@/components/ui/skeleton";

export function TeamRoleManagement() {
  const {
    usersWithRoles,
    availableRoles,
    isAdmin,
    isLoading,
    assignRole,
    isAssigning
  } = useUserRoles();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members & Roles
          </CardTitle>
          <CardDescription>Loading team members...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-10 w-40" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRoleIcon = (roleName?: string) => {
    if (roleName === "Admin") return <Crown className="h-3 w-3" />;
    return <Shield className="h-3 w-3" />;
  };

  const handleRoleChange = (userId: string, roleId: string) => {
    assignRole({ userId, roleId });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Members & Roles
        </CardTitle>
        <CardDescription>
          View all team members and manage their roles
          {!isAdmin && " (Admin access required to assign roles)"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {usersWithRoles.map((user) => (
            <div
              key={user.id}
              className={`flex items-center justify-between p-4 border rounded-lg ${
                user.is_current_user ? "bg-accent/50 border-primary" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                    {user.full_name?.substring(0, 2).toUpperCase() || 
                     user.email.substring(0, 2).toUpperCase()}
                  </div>
                  {user.is_current_user && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-background">
                      <span className="text-xs text-white">✓</span>
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {user.full_name || user.email}
                    {user.is_current_user && (
                      <Badge variant="secondary" className="text-xs">You</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  {user.role_description && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {user.role_description}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {user.role_name && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getRoleIcon(user.role_name)}
                    {user.role_name}
                  </Badge>
                )}
                
                {isAdmin ? (
                  <Select
                    value={user.role_id || ""}
                    onValueChange={(roleId) => handleRoleChange(user.id, roleId)}
                    disabled={isAssigning}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Assign role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{role.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {role.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  user.role_name && (
                    <div className="text-sm text-muted-foreground">
                      Role locked
                    </div>
                  )
                )}
              </div>
            </div>
          ))}

          {usersWithRoles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No team members found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
