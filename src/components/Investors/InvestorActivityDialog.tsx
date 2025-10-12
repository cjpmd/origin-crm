import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useActivities } from '@/hooks/useActivities';
import { toast } from 'sonner';

interface InvestorActivityDialogProps {
  investorId: string;
  investorName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvestorActivityDialog({ investorId, investorName, open, onOpenChange }: InvestorActivityDialogProps) {
  const { logActivity } = useActivities();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    activity_type: 'call' as 'email' | 'meeting' | 'call' | 'note',
    subject: '',
    body: '',
    duration_minutes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await logActivity({
        activity_type: formData.activity_type,
        subject: formData.subject,
        body: formData.body,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : undefined,
        associations: [{ entity_type: 'investor', entity_id: investorId }],
      });

      toast.success('Activity logged successfully');
      setFormData({
        activity_type: 'call',
        subject: '',
        body: '',
        duration_minutes: '',
      });
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to log activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Log Activity</DialogTitle>
          <DialogDescription>
            Record an interaction with {investorName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="activity_type">Activity Type</Label>
            <Select
              value={formData.activity_type}
              onValueChange={(value: any) => setFormData({ ...formData, activity_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="call">Phone Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="note">Note</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g., Initial pitch call"
              required
            />
          </div>

          <div>
            <Label htmlFor="body">Details</Label>
            <Textarea
              id="body"
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Add notes about this interaction..."
              rows={5}
            />
          </div>

          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
              placeholder="30"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Logging...' : 'Log Activity'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
