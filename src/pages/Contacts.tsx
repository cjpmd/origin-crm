import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Mail, Phone, Building2, Plus, Search, Filter } from 'lucide-react';
import { mockContacts, relationshipStrengthConfig } from '@/lib/mockData';
import { Contact } from '@/types';
import { useToast } from '@/hooks/use-toast';

const getRelationshipStrength = (score: number) => {
  return relationshipStrengthConfig.find(config => 
    score >= config.min && score <= config.max
  ) || relationshipStrengthConfig[0];
};

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredContacts = contacts.filter(contact =>
    `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateContact = () => {
    toast({ title: "Contact created", description: "New contact has been added to your network" });
    setIsDialogOpen(false);
  };

  const handleContactClick = (contactId: string) => {
    toast({ title: "Contact details", description: "Contact profile functionality will be implemented" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">
            Manage your network and relationship intelligence
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
              <DialogDescription>
                Add a new contact to your relationship network
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input id="first-name" placeholder="John" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input id="last-name" placeholder="Doe" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="+44 20 1234 5678" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" placeholder="Company name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input id="title" placeholder="CEO, Partner, etc." />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateContact}>
                Add Contact
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => {
          const strengthConfig = getRelationshipStrength(contact.relationship_strength);
          
          return (
            <Card 
              key={contact.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleContactClick(contact.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-sm font-medium">
                        {contact.first_name[0]}{contact.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {contact.first_name} {contact.last_name}
                      </CardTitle>
                      {contact.title && (
                        <p className="text-sm text-muted-foreground">{contact.title}</p>
                      )}
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${strengthConfig.color} border-current`}
                  >
                    {strengthConfig.label}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {contact.company && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.company}</span>
                  </div>
                )}
                
                {contact.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                )}
                
                {contact.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.phone}</span>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Relationship Score</span>
                    <span className="font-medium">{contact.relationship_strength}/100</span>
                  </div>
                  <div className="mt-1 w-full bg-muted rounded-full h-1.5">
                    <div 
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{ width: `${contact.relationship_strength}%` }}
                    />
                  </div>
                </div>

                {contact.last_contacted && (
                  <p className="text-xs text-muted-foreground">
                    Last contacted: {new Date(contact.last_contacted).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}

        {filteredContacts.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? 'No contacts match your search criteria'
                    : 'No contacts yet. Add your first contact to get started.'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}