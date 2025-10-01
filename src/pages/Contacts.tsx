import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Mail, Phone, Building2, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useContacts, Contact } from '@/hooks/useContacts';
import { useToast } from '@/hooks/use-toast';
import { EditContactDialog } from '@/components/Contacts/EditContactDialog';

export default function Contacts() {
  const { contacts, createContact, updateContact, deleteContact } = useContacts();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    linkedin: '',
    notes: '',
  });
  const { toast } = useToast();

  const filteredContacts = contacts.filter(contact =>
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateContact = () => {
    if (!formData.name.trim()) return;
    createContact(formData);
    setFormData({ name: '', email: '', phone: '', role: '', linkedin: '', notes: '' });
    setIsDialogOpen(false);
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsEditDialogOpen(true);
  };

  const handleDeleteContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedContact) {
      deleteContact(selectedContact.id);
      setIsDeleteDialogOpen(false);
      setSelectedContact(null);
    }
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
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    placeholder="+44 20 1234 5678"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Input 
                    id="role" 
                    placeholder="CEO, Partner, etc."
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input 
                    id="linkedin" 
                    placeholder="linkedin.com/in/..."
                    value={formData.linkedin}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Additional notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
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
          const initials = contact.name.split(' ').map(n => n[0]).join('').toUpperCase();
          
          return (
            <Card 
              key={contact.id} 
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-sm font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {contact.name}
                      </CardTitle>
                      {contact.role && (
                        <p className="text-sm text-muted-foreground">{contact.role}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {contact.portfolio_companies?.name && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.portfolio_companies.name}</span>
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

                {contact.last_contact_date && (
                  <p className="text-xs text-muted-foreground pt-2 border-t">
                    Last contacted: {new Date(contact.last_contact_date).toLocaleDateString()}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditContact(contact);
                    }}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteContact(contact);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
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

      <EditContactDialog
        contact={selectedContact}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={updateContact}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedContact?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}