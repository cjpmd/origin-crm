import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useProfiles } from "@/hooks/useProfiles";
import { useContacts } from "@/hooks/useContacts";
import { useActivities } from "@/hooks/useActivities";
import { useTasks } from "@/hooks/useTasks";
import { useDeals } from "@/hooks/useDeals";
import { useAuth } from "@/hooks/useAuth";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { TeamMemberDialog } from "@/components/Settings/TeamMemberDialog";
import { 
  Search, UserPlus, Mail, Calendar, Edit, Trash2, 
  Phone, Building2, MapPin, Linkedin, FileText,
  Users, TrendingUp, CheckCircle, Clock, GitBranch
} from "lucide-react";

export default function Team() {
  const { members, isLoading, inviteMember, updateMember, deleteMember } = useTeamMembers();
  const { profiles } = useProfiles();
  const { contacts } = useContacts();
  const { activities } = useActivities();
  const { tasks } = useTasks();
  const { user } = useAuth();
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Use team members directly from the database
  const allMembers = members || [];

  const filteredMembers = allMembers?.filter((member) =>
    member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedMemberData = allMembers?.find(m => m.id === selectedMember);
  const selectedAvatarUrl = selectedMemberData?.profiles?.avatar_url;

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

  const { deals } = useDeals();
  
  // Get the actual user_id for filtering - for current user it's the id, for team members it's user_id
  const actualUserId = selectedMemberData?.user_id || selectedMemberData?.id;
  const { entries: journalEntries } = useJournalEntries(actualUserId);
  
  const memberContacts = contacts?.filter(c => c.user_id === actualUserId) || [];
  const memberActivities = activities?.filter(a => a.user_id === actualUserId).slice(0, 10) || [];
  const memberTasks = tasks?.filter(t => t.user_id === actualUserId) || [];
  const completedTasks = memberTasks.filter(t => t.status === 'Completed').length;
  const memberDeals = deals?.filter(d => d.owner === selectedMemberData?.id || d.user_id === selectedMemberData?.user_id) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">
            Manage your team members and track their activity
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
              {allMembers?.length || 0} member{allMembers?.length !== 1 ? 's' : ''}
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
                  const isCurrentUser = member.user_id === user?.id;
                  const avatarUrl = member.profiles?.avatar_url;
                  return (
                    <Card
                      key={member.id}
                      className={`p-4 cursor-pointer transition-colors hover:bg-accent ${
                        selectedMember === member.id ? 'border-primary bg-accent' : ''
                      }`}
                      onClick={() => setSelectedMember(member.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={avatarUrl || undefined} />
                          <AvatarFallback className="text-sm">
                            {getInitials(member.full_name, member.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">
                            {member.full_name || member.email}
                            {isCurrentUser && ' (You)'}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {member.email}
                          </p>
                          <Badge variant={member.status === 'Active' ? 'default' : 'secondary'} className="mt-1">
                            {member.status}
                          </Badge>
                        </div>
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
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={selectedAvatarUrl || undefined} />
                      <AvatarFallback className="text-xl">
                        {getInitials(selectedMemberData.full_name, selectedMemberData.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-2xl">{selectedMemberData.full_name || selectedMemberData.email}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1 text-base">
                        <Mail className="h-4 w-4" />
                        {selectedMemberData.email}
                      </CardDescription>
                      <Badge variant={selectedMemberData.status === 'Active' ? 'default' : 'secondary'} className="mt-2">
                        {selectedMemberData.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {selectedMemberData.user_id === user?.id ? (
                      <Button variant="outline" size="sm" onClick={() => window.location.href = '/settings'}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(selectedMemberData)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(selectedMemberData.id)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="connections">Connections</TabsTrigger>
                    <TabsTrigger value="introductions">Introductions</TabsTrigger>
                    <TabsTrigger value="journal">Journal</TabsTrigger>
                    <TabsTrigger value="reminders">Reminders</TabsTrigger>
                    <TabsTrigger value="files">Files</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6 mt-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-5 gap-4">
                      <Card 
                        className="cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => setActiveTab("introductions")}
                      >
                        <CardContent className="pt-6">
                          <div className="flex flex-col items-center text-center">
                            <GitBranch className="h-8 w-8 text-purple-600 mb-2" />
                            <p className="text-2xl font-bold">{memberDeals.length}</p>
                            <p className="text-xs text-muted-foreground">Deals</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card 
                        className="cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => setActiveTab("connections")}
                      >
                        <CardContent className="pt-6">
                          <div className="flex flex-col items-center text-center">
                            <Users className="h-8 w-8 text-primary mb-2" />
                            <p className="text-2xl font-bold">{memberContacts.length}</p>
                            <p className="text-xs text-muted-foreground">Contacts</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card 
                        className="cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => setActiveTab("overview")}
                      >
                        <CardContent className="pt-6">
                          <div className="flex flex-col items-center text-center">
                            <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
                            <p className="text-2xl font-bold">{memberActivities.length}</p>
                            <p className="text-xs text-muted-foreground">Activities</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card 
                        className="cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => setActiveTab("reminders")}
                      >
                        <CardContent className="pt-6">
                          <div className="flex flex-col items-center text-center">
                            <CheckCircle className="h-8 w-8 text-blue-600 mb-2" />
                            <p className="text-2xl font-bold">{completedTasks}</p>
                            <p className="text-xs text-muted-foreground">Completed Tasks</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card 
                        className="cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => setActiveTab("reminders")}
                      >
                        <CardContent className="pt-6">
                          <div className="flex flex-col items-center text-center">
                            <Clock className="h-8 w-8 text-orange-600 mb-2" />
                            <p className="text-2xl font-bold">{memberTasks.length - completedTasks}</p>
                            <p className="text-xs text-muted-foreground">Pending Tasks</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Separator />

                    {/* Member Info */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                        <p className="text-sm flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(selectedMemberData.created_at).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Invited At</p>
                        <p className="text-sm">
                          {new Date(selectedMemberData.invited_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Recent Activity */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                      <div className="space-y-3">
                        {memberActivities.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No recent activity</p>
                        ) : (
                          memberActivities.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                              <div className="p-2 rounded-full bg-primary/10">
                                {activity.activity_type === 'call' && <Phone className="h-4 w-4 text-primary" />}
                                {activity.activity_type === 'email' && <Mail className="h-4 w-4 text-primary" />}
                                {activity.activity_type === 'meeting' && <Users className="h-4 w-4 text-primary" />}
                                {activity.activity_type === 'note' && <FileText className="h-4 w-4 text-primary" />}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{activity.subject}</p>
                                <p className="text-xs text-muted-foreground mt-1">{activity.body}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {new Date(activity.activity_date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="connections" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Connections ({memberContacts.length})</h3>
                      {memberContacts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No connections yet</p>
                      ) : (
                        <div className="grid gap-3">
                          {memberContacts.map((contact) => (
                            <Card key={contact.id} className="p-4">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="font-medium">{contact.name}</p>
                                  <p className="text-sm text-muted-foreground">{contact.role}</p>
                                  {contact.email && (
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                      <Mail className="h-3 w-3" />
                                      {contact.email}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="introductions" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Pipeline Deals ({memberDeals.length})</h3>
                      {memberDeals.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No deals assigned</p>
                      ) : (
                        <div className="space-y-2">
                          {memberDeals.map((deal) => (
                            <Card key={deal.id} className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-full bg-primary/10">
                                    <GitBranch className="h-4 w-4 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{deal.name}</p>
                                    <p className="text-sm text-muted-foreground">{deal.sector || 'No sector'}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge>{deal.stage}</Badge>
                                  {deal.valuation && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      ${(deal.valuation / 1000000).toFixed(1)}M
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="journal" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Journal Entries ({journalEntries?.length || 0})</h3>
                      {!journalEntries || journalEntries.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No journal entries yet</p>
                      ) : (
                        <div className="space-y-3">
                          {journalEntries.slice(0, 5).map((entry) => (
                            <Card key={entry.id}>
                              <CardContent className="p-4">
                                <h4 className="font-medium mb-2">{entry.title || "Untitled"}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">{entry.content}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {new Date(entry.created_at).toLocaleDateString()}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="reminders" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Tasks ({memberTasks.length})</h3>
                      {memberTasks.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No tasks assigned</p>
                      ) : (
                        <div className="space-y-2">
                          {memberTasks.map((task) => (
                            <Card key={task.id} className="p-3">
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-full ${
                                  task.status === 'Completed' ? 'bg-green-100' : 'bg-orange-100'
                                }`}>
                                  {task.status === 'Completed' ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Clock className="h-4 w-4 text-orange-600" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{task.title}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                                  {task.due_date && (
                                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      Due: {new Date(task.due_date).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                                <Badge variant={task.priority === 'High' ? 'destructive' : 'secondary'}>
                                  {task.priority}
                                </Badge>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="files" className="mt-6">
                    <p className="text-sm text-muted-foreground">File management coming soon...</p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center text-muted-foreground">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a team member to view details</p>
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
