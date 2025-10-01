import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useProfiles } from "@/hooks/useProfiles";
import { TeamMemberDialog } from "@/components/Settings/TeamMemberDialog";
import { Search, UserPlus, Mail, Calendar, Edit, Trash2 } from "lucide-react";

export default function Team() {
  const { members, isLoading, inviteMember, updateMember, deleteMember } = useTeamMembers();
  const { profiles } = useProfiles();
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);

  const filteredMembers = members?.filter((member) =>
    member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedMemberData = members?.find(m => m.id === selectedMember);

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email ? email[0].toUpperCase() : '?';
  };

  const handleInvite = async (data: { email: string; full_name: string }) => {
    if (editingMember) {
      await updateMember({ id: editingMember.id, full_name: data.full_name });
    } else {
      await inviteMember(data);
    }
    setIsDialogOpen(false);
    setEditingMember(null);
  };

  const handleEdit = (member: any) => {
    setEditingMember(member);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      await deleteMember(id);
      if (selectedMember === id) {
        setSelectedMember(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">
            Manage your team members and their access
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              {members?.length || 0} member{members?.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="space-y-2">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : filteredMembers?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No members found</p>
              ) : (
                filteredMembers?.map((member) => {
                  const profile = profiles.find(p => p.id === member.user_id);
                  return (
                    <Card
                      key={member.id}
                      className={`p-3 cursor-pointer transition-colors hover:bg-accent ${
                        selectedMember === member.id ? 'border-primary bg-accent' : ''
                      }`}
                      onClick={() => setSelectedMember(member.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={profile?.avatar_url || undefined} />
                          <AvatarFallback>
                            {getInitials(member.full_name, member.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {member.full_name || member.email}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {member.email}
                          </p>
                        </div>
                        <Badge variant={member.status === 'Active' ? 'default' : 'secondary'}>
                          {member.status}
                        </Badge>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Member Details */}
        <Card className="lg:col-span-2">
          {selectedMemberData ? (
            <>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={profiles.find(p => p.id === selectedMemberData.user_id)?.avatar_url || undefined} />
                      <AvatarFallback className="text-lg">
                        {getInitials(selectedMemberData.full_name, selectedMemberData.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{selectedMemberData.full_name || selectedMemberData.email}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Mail className="h-3 w-3" />
                        {selectedMemberData.email}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(selectedMemberData)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(selectedMemberData.id)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <Badge variant={selectedMemberData.status === 'Active' ? 'default' : 'secondary'}>
                          {selectedMemberData.status}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                        <p className="text-sm flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(selectedMemberData.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Invited At</p>
                      <p className="text-sm">
                        {new Date(selectedMemberData.invited_at).toLocaleString()}
                      </p>
                    </div>

                    {selectedMemberData.joined_at && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Joined At</p>
                        <p className="text-sm">
                          {new Date(selectedMemberData.joined_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="activity" className="mt-4">
                    <p className="text-sm text-muted-foreground">Activity tracking coming soon...</p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center text-muted-foreground">
                <p>Select a team member to view details</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      <TeamMemberDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleInvite}
        member={editingMember}
      />
    </div>
  );
}
