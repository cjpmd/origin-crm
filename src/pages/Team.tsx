import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useProfiles } from '@/hooks/useProfiles';
import { 
  Users, 
  Search, 
  FileText, 
  Calendar, 
  CheckSquare,
  Network,
  UserPlus
} from 'lucide-react';

export default function Team() {
  const { members } = useTeamMembers();
  const { profiles } = useProfiles();
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = members?.filter(member =>
    member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string | undefined, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const selectedMemberData = members?.find(m => m.id === selectedMember);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">
            Manage your team and track collaboration
          </p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Team Members List */}
        <div className="col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle>Team Members</CardTitle>
              </div>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredMembers?.map((member) => {
                const profile = profiles.find(p => p.id === member.user_id);
                return (
                  <div
                    key={member.id}
                    onClick={() => setSelectedMember(member.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedMember === member.id
                        ? 'bg-accent border-accent'
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(member.full_name, member.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {member.full_name || member.email}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {member.email}
                        </div>
                        <Badge 
                          variant={member.status === 'active' ? 'default' : 'secondary'}
                          className="mt-1"
                        >
                          {member.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Member Details */}
        <div className="col-span-8">
          {selectedMemberData ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profiles.find(p => p.id === selectedMemberData.user_id)?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {getInitials(selectedMemberData.full_name, selectedMemberData.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{selectedMemberData.full_name || selectedMemberData.email}</CardTitle>
                    <p className="text-muted-foreground">{selectedMemberData.email}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="connections">Connections</TabsTrigger>
                    <TabsTrigger value="introductions">Introductions</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="reminders">Reminders</TabsTrigger>
                    <TabsTrigger value="files">Files</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">0</div>
                          <div className="text-sm text-muted-foreground">Active Deals</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">0</div>
                          <div className="text-sm text-muted-foreground">Connections</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">0</div>
                          <div className="text-sm text-muted-foreground">Introductions</div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">No recent activity</p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="connections" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Network className="h-5 w-5" />
                          <CardTitle className="text-base">Network Connections</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">No connections yet</p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="introductions" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Deal Introductions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">No introductions yet</p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="notes" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          <CardTitle className="text-base">Notes</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Textarea 
                          placeholder="Add notes about this team member..."
                          className="min-h-[200px]"
                        />
                        <Button>Save Note</Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="reminders" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <CheckSquare className="h-5 w-5" />
                          <CardTitle className="text-base">Tasks & Reminders</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">No reminders set</p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="files" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          <CardTitle className="text-base">Documents & Files</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">No files uploaded</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Select a team member to view their details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
