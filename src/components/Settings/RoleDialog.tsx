import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Role } from "@/hooks/useRolesPermissions";

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role;
  onSave: (data: any) => Promise<void>;
}

export function RoleDialog({ open, onOpenChange, role, onSave }: RoleDialogProps) {
  const [formData, setFormData] = useState({
    name: role?.name || "",
    description: role?.description || ""
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (role) {
        await onSave({ id: role.id, ...formData });
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
          <DialogTitle>{role ? "Edit Role" : "Create Role"}</DialogTitle>
          <DialogDescription>
            {role ? "Update role details" : "Create a new role with custom permissions"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Role Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Investment Manager"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the role and its responsibilities"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : role ? "Update Role" : "Create Role"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
