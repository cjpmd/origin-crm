import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useIntermediaries, Intermediary } from "@/hooks/useIntermediaries";
import { Plus, Pencil, Trash2, Building2, Mail, Phone, Linkedin } from "lucide-react";
import { format } from "date-fns";

export function IntermediaryManagement() {
  const { intermediaries, isLoading, createIntermediary, updateIntermediary, deleteIntermediary } = useIntermediaries();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIntermediary, setEditingIntermediary] = useState<Intermediary | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "broker",
    firm: "",
    email: "",
    phone: "",
    linkedin: "",
    relationship_strength: 50,
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingIntermediary) {
      updateIntermediary({ id: editingIntermediary.id, updates: formData });
    } else {
      createIntermediary(formData);
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "broker",
      firm: "",
      email: "",
      phone: "",
      linkedin: "",
      relationship_strength: 50,
      notes: "",
    });
    setEditingIntermediary(null);
  };

  const handleEdit = (intermediary: Intermediary) => {
    setEditingIntermediary(intermediary);
    setFormData({
      name: intermediary.name,
      type: intermediary.type,
      firm: intermediary.firm || "",
      email: intermediary.email || "",
      phone: intermediary.phone || "",
      linkedin: intermediary.linkedin || "",
      relationship_strength: intermediary.relationship_strength || 50,
      notes: intermediary.notes || "",
    });
    setIsDialogOpen(true);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      banker: "bg-blue-500",
      broker: "bg-green-500",
      advisor: "bg-purple-500",
      consultant: "bg-orange-500",
      other: "bg-gray-500",
    };
    return colors[type] || colors.other;
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 75) return "text-green-600";
    if (strength >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Intermediary Network</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Intermediary
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingIntermediary ? "Edit" : "Add"} Intermediary</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banker">Investment Banker</SelectItem>
                      <SelectItem value="broker">Business Broker</SelectItem>
                      <SelectItem value="advisor">Advisor</SelectItem>
                      <SelectItem value="consultant">Consultant</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Firm</Label>
                  <Input
                    value={formData.firm}
                    onChange={(e) => setFormData({ ...formData, firm: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn</Label>
                  <Input
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Relationship Strength: {formData.relationship_strength}</Label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.relationship_strength}
                    onChange={(e) => setFormData({ ...formData, relationship_strength: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingIntermediary ? "Update" : "Add"} Intermediary
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading intermediaries...</p>
        ) : intermediaries.length === 0 ? (
          <p className="text-muted-foreground">No intermediaries yet. Add one to start tracking your network.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Firm</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Strength</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {intermediaries.map((intermediary) => (
                <TableRow key={intermediary.id}>
                  <TableCell className="font-medium">{intermediary.name}</TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(intermediary.type)}>
                      {intermediary.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {intermediary.firm && (
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        <span className="text-sm">{intermediary.firm}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {intermediary.email && (
                        <a href={`mailto:${intermediary.email}`} className="text-blue-600 hover:text-blue-800">
                          <Mail className="h-4 w-4" />
                        </a>
                      )}
                      {intermediary.phone && (
                        <a href={`tel:${intermediary.phone}`} className="text-blue-600 hover:text-blue-800">
                          <Phone className="h-4 w-4" />
                        </a>
                      )}
                      {intermediary.linkedin && (
                        <a href={intermediary.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-semibold ${getStrengthColor(intermediary.relationship_strength || 0)}`}>
                      {intermediary.relationship_strength}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{intermediary.successful_deals || 0} / {intermediary.total_deals_sourced || 0} deals</div>
                      {intermediary.last_contact_date && (
                        <div className="text-muted-foreground">
                          Last: {format(new Date(intermediary.last_contact_date), "MMM d, yyyy")}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(intermediary)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this intermediary?")) {
                            deleteIntermediary(intermediary.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
