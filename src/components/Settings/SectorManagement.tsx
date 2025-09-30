import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSectors, Sector } from "@/hooks/useSectors";
import { Layers, Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";

export function SectorManagement() {
  const { sectors, createSector, updateSector, deleteSector, isCreating, isUpdating } = useSectors();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
    display_order: 0,
  });

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast.error("Sector name is required");
      return;
    }

    createSector(formData, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setFormData({ name: "", description: "", is_active: true, display_order: 0 });
      },
    });
  };

  const handleEdit = (sector: Sector) => {
    setEditingSector(sector);
    setFormData({
      name: sector.name,
      description: sector.description || "",
      is_active: sector.is_active,
      display_order: sector.display_order,
    });
  };

  const handleUpdate = () => {
    if (!editingSector || !formData.name.trim()) {
      toast.error("Sector name is required");
      return;
    }

    updateSector(
      { id: editingSector.id, ...formData },
      {
        onSuccess: () => {
          setEditingSector(null);
          setFormData({ name: "", description: "", is_active: true, display_order: 0 });
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this sector? This action cannot be undone.")) {
      deleteSector(id);
    }
  };

  const handleToggleActive = (sector: Sector) => {
    updateSector({
      id: sector.id,
      is_active: !sector.is_active,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Sector Management
            </CardTitle>
            <CardDescription>
              Manage industry sectors used across the platform
            </CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Sector
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Sector</DialogTitle>
                <DialogDescription>
                  Add a new industry sector to the platform
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Sector Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Financial Services"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the sector..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Active</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Sector"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sectors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No sectors yet. Create your first sector to get started.
            </div>
          ) : (
            sectors.map((sector) => (
              <div
                key={sector.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{sector.name}</span>
                      {!sector.is_active && <Badge variant="secondary">Inactive</Badge>}
                    </div>
                    {sector.description && (
                      <p className="text-sm text-muted-foreground mt-1">{sector.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={sector.is_active}
                    onCheckedChange={() => handleToggleActive(sector)}
                    aria-label="Toggle active status"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(sector)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(sector.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingSector} onOpenChange={(open) => !open && setEditingSector(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Sector</DialogTitle>
              <DialogDescription>
                Update sector information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Sector Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-display_order">Display Order</Label>
                <Input
                  id="edit-display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-is_active">Active</Label>
                <Switch
                  id="edit-is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingSector(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Sector"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
