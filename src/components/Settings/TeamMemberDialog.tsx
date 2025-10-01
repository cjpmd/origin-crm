import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeamMember } from "@/hooks/useTeamMembers";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: TeamMember;
  onSave: (data: any) => Promise<void>;
}

export function TeamMemberDialog({ open, onOpenChange, member, onSave }: TeamMemberDialogProps) {
  const [formData, setFormData] = useState({
    email: member?.email || "",
    full_name: member?.full_name || "",
    status: member?.status || "invited"
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (member) {
        await onSave({ id: member.id, ...formData });
      } else {
        await onSave(formData);
      }
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{member ? "Edit Team Member" : "Invite Team Member"}</DialogTitle>
          <DialogDescription>
            {member ? "Update team member details" : "Send an invitation to join your team"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
              required
              disabled={!!member}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          {member && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invited">Invited</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : member ? "Update Member" : "Send Invitation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
