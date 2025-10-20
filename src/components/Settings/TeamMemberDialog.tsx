import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSubscription } from '@/hooks/useSubscription';
import { AlertCircle } from 'lucide-react';

interface TeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { email: string; full_name: string }) => void;
  member?: { id: string; email: string; full_name?: string } | null;
}

export function TeamMemberDialog({ open, onOpenChange, onSubmit, member }: TeamMemberDialogProps) {
  const { seatsAvailable, canAddUsers, subscription } = useSubscription();
  const [formData, setFormData] = useState({
    email: member?.email || '',
    full_name: member?.full_name || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ email: '', full_name: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{member ? 'Edit Team Member' : 'Invite Team Member'}</DialogTitle>
        </DialogHeader>
        
        {!member && !canAddUsers && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No seats available. You have {subscription?.seats_purchased || 0} seats and all are currently in use.
              Please upgrade your subscription to add more team members.
            </AlertDescription>
          </Alert>
        )}

        {!member && canAddUsers && seatsAvailable <= 2 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Only {seatsAvailable} seat{seatsAvailable !== 1 ? 's' : ''} remaining. Consider upgrading soon.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={!!member}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!member && !canAddUsers}>
              {member ? 'Update' : 'Invite'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
