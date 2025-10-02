import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Deal } from "@/hooks/useDeals";
import { useSectors } from "@/hooks/useSectors";
import { useCurrency } from "@/contexts/CurrencyContext";

interface EditDealDialogProps {
  deal: Deal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: Partial<Deal>) => void;
  isLoading?: boolean;
}

export function EditDealDialog({ deal, open, onOpenChange, onSave, isLoading }: EditDealDialogProps) {
  const { currencySymbol } = useCurrency();
  const { activeSectors } = useSectors();
  const [formData, setFormData] = useState({
    name: deal.name,
    valuation: deal.valuation?.toString() || "",
    probability: deal.probability?.toString() || "",
    sector_id: deal.sector_id || "",
    owner: deal.owner || "",
    expected_close_date: deal.expected_close_date || "",
    website: deal.website || "",
    notes: deal.notes || "",
  });

  const handleSave = () => {
    const updates: Partial<Deal> = {
      name: formData.name,
      valuation: formData.valuation ? parseFloat(formData.valuation) : undefined,
      probability: formData.probability ? parseInt(formData.probability) : undefined,
      sector_id: formData.sector_id || undefined,
      owner: formData.owner || undefined,
      expected_close_date: formData.expected_close_date || undefined,
      website: formData.website || undefined,
      notes: formData.notes || undefined,
    };
    onSave(updates);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Deal</DialogTitle>
          <DialogDescription>Update deal information</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Deal Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner">Owner</Label>
              <Input
                id="owner"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                placeholder="Deal owner"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valuation">Valuation ({currencySymbol})</Label>
              <Input
                id="valuation"
                type="number"
                value={formData.valuation}
                onChange={(e) => setFormData({ ...formData, valuation: e.target.value })}
                placeholder="e.g., 5000000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="probability">Probability (%)</Label>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                placeholder="0-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sector">Sector</Label>
              <Select
                value={formData.sector_id}
                onValueChange={(value) => setFormData({ ...formData, sector_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  {activeSectors.map((sector) => (
                    <SelectItem key={sector.id} value={sector.id}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expected_close_date">Expected Close Date</Label>
              <Input
                id="expected_close_date"
                type="date"
                value={formData.expected_close_date}
                onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Company Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !formData.name.trim()}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
