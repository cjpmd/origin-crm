import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { Investor } from "@/hooks/useInvestors";

interface EditInvestorDialogProps {
  investor: Investor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<Investor> & { id: string }) => void;
}

export function EditInvestorDialog({ investor, open, onOpenChange, onSave }: EditInvestorDialogProps) {
  const { currencySymbol } = useCurrency();
  const [formData, setFormData] = useState<Partial<Investor>>({});

  useEffect(() => {
    if (investor) {
      setFormData(investor);
    }
  }, [investor]);

  const handleSave = () => {
    if (!investor) return;
    onSave({ ...formData, id: investor.id });
    onOpenChange(false);
  };

  if (!investor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Investor</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Investor Name *</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Investor Type</Label>
            <Select value={formData.type || ""} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Family Office">Family Office</SelectItem>
                <SelectItem value="Pension Fund">Pension Fund</SelectItem>
                <SelectItem value="Insurance">Insurance</SelectItem>
                <SelectItem value="Endowment">Endowment</SelectItem>
                <SelectItem value="Fund of Funds">Fund of Funds</SelectItem>
                <SelectItem value="Sovereign Wealth">Sovereign Wealth</SelectItem>
                <SelectItem value="HNWI">HNWI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status || "Prospect"} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Prospect">Prospect</SelectItem>
                <SelectItem value="In Discussion">In Discussion</SelectItem>
                <SelectItem value="Committed">Committed</SelectItem>
                <SelectItem value="Active LP">Active LP</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="check_size">Check Size</Label>
            <Input
              id="check_size"
              value={formData.check_size || ""}
              onChange={(e) => setFormData({ ...formData, check_size: e.target.value })}
              placeholder={`e.g., ${currencySymbol}5M-${currencySymbol}10M`}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location || ""}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website || ""}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}