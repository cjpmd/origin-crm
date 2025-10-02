import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Contact } from '@/hooks/useContacts';
import { useLinkedInData } from '@/hooks/useLinkedInData';
import { TrendingUp, TrendingDown, Minus, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditContactDialogProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<Contact> & { id: string }) => void;
}

export function EditContactDialog({ contact, open, onOpenChange, onSave }: EditContactDialogProps) {
  const { fetchLinkedInData, fetching } = useLinkedInData();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    linkedin: '',
    notes: '',
    relationship_strength: 50,
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
        relationship_strength: contact.relationship_strength || 50,
      });
    }
  }, [contact]);

  // Auto-fetch LinkedIn data when URL is entered (debounced)
  useEffect(() => {
    if (!contact?.id || !formData.linkedin) return;
    
    const timeoutId = setTimeout(async () => {
      const isValidLinkedInUrl = formData.linkedin.includes('linkedin.com');
      if (isValidLinkedInUrl && formData.linkedin !== contact.linkedin) {
        try {
          await fetchLinkedInData(formData.linkedin, 'contact', contact.id);
        } catch (error) {
          // Silent fail for auto-fetch
        }
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [formData.linkedin, contact?.id, contact?.linkedin]);

  const getRelationshipLabel = (strength: number) => {
    if (strength >= 70) return { label: "Strong", icon: TrendingUp, color: "text-green-600" };
    if (strength >= 40) return { label: "Medium", icon: Minus, color: "text-yellow-600" };
    return { label: "Weak", icon: TrendingDown, color: "text-red-600" };
  };

  const handleSave = () => {
    if (contact) {
      onSave({ id: contact.id, ...formData });
      onOpenChange(false);
    }
  };

  const handleFetchLinkedIn = async () => {
    if (contact && formData.linkedin) {
      await fetchLinkedInData(formData.linkedin, 'contact', contact.id);
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
              <div className="flex gap-2">
                <Input 
                  id="edit-linkedin" 
                  placeholder="https://linkedin.com/in/..."
                  value={formData.linkedin}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleFetchLinkedIn}
                  disabled={fetching || !formData.linkedin}
                  title="Fetch LinkedIn data"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Add LinkedIn URL and click fetch to auto-populate image
              </p>
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
          <div className="space-y-2">
            <Label>
              Relationship Strength: {formData.relationship_strength}%
              {(() => {
                const badge = getRelationshipLabel(formData.relationship_strength);
                const Icon = badge.icon;
                return (
                  <span className={`ml-2 inline-flex items-center gap-1 ${badge.color}`}>
                    <Icon className="h-3 w-3" />
                    {badge.label}
                  </span>
                );
              })()}
            </Label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.relationship_strength}
              onChange={(e) => setFormData(prev => ({ ...prev, relationship_strength: parseInt(e.target.value) }))}
              className="w-full accent-primary"
            />
            <p className="text-xs text-muted-foreground">
              Adjust to reflect relationship quality (0-100)
            </p>
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
