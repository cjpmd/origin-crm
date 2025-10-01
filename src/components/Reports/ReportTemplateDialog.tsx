import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ReportTemplate } from "@/hooks/useReportTemplates";

interface ReportTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: ReportTemplate;
  onSave: (data: any) => Promise<void>;
}

const reportTypes = [
  "Portfolio Performance",
  "Deal Flow Summary",
  "Fund Performance",
  "ESG Impact",
  "Investor Update",
  "Market Analysis",
  "Custom"
];

const frequencies = [
  "On-Demand",
  "Daily",
  "Weekly", 
  "Monthly",
  "Quarterly",
  "Annually"
];

const formats = [
  { id: "pdf", label: "PDF" },
  { id: "powerpoint", label: "PowerPoint" },
  { id: "excel", label: "Excel" },
  { id: "markdown", label: "Markdown" }
];

export function ReportTemplateDialog({ open, onOpenChange, template, onSave }: ReportTemplateDialogProps) {
  const [formData, setFormData] = useState({
    name: template?.name || "",
    description: template?.description || "",
    type: template?.type || "Portfolio Performance",
    frequency: template?.frequency || "On-Demand",
    enabled_formats: template?.enabled_formats || ["pdf"],
    is_active: template?.is_active !== false
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (template) {
        await onSave({ id: template.id, ...formData });
      } else {
        await onSave(formData);
      }
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const toggleFormat = (formatId: string) => {
    setFormData(prev => ({
      ...prev,
      enabled_formats: prev.enabled_formats.includes(formatId)
        ? prev.enabled_formats.filter(f => f !== formatId)
        : [...prev.enabled_formats, formatId]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{template ? "Edit Report Template" : "Create Report Template"}</DialogTitle>
          <DialogDescription>
            Configure your report template with custom settings and format options.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter template name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this template generates"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Report Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map((freq) => (
                    <SelectItem key={freq} value={freq}>
                      {freq}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Export Formats</Label>
            <div className="grid grid-cols-2 gap-4">
              {formats.map((format) => (
                <div key={format.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={format.id}
                    checked={formData.enabled_formats.includes(format.id)}
                    onCheckedChange={() => toggleFormat(format.id)}
                  />
                  <Label htmlFor={format.id} className="font-normal cursor-pointer">
                    {format.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
            />
            <Label htmlFor="is_active" className="font-normal cursor-pointer">
              Active Template
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : template ? "Update Template" : "Create Template"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
