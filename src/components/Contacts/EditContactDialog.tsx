import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Contact } from '@/hooks/useContacts';

interface EditContactDialogProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<Contact> & { id: string }) => void;
}

export function EditContactDialog({ contact, open, onOpenChange, onSave }: EditContactDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    linkedin: '',
    notes: '',
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        role: contact.role || '',
        email: contact.email || '',
        phone: contact.phone || '',
        linkedin: contact.linkedin || '',
        notes: contact.notes || '',
      });
    }
  }, [contact]);

  const handleSave = () => {
    if (contact) {
      onSave({ id: contact.id, ...formData });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
          <DialogDescription>
            Update contact details
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input 
              id="edit-name" 
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input 
                id="edit-email" 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input 
                id="edit-phone" 
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role</Label>
              <Input 
                id="edit-role" 
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-linkedin">LinkedIn</Label>
              <Input 
                id="edit-linkedin" 
                value={formData.linkedin}
                onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea 
              id="edit-notes" 
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
