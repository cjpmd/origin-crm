import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Deal } from "@/hooks/useDeals";
import { usePortfolioCompanies } from "@/hooks/usePortfolioCompanies";
import { useSectors } from "@/hooks/useSectors";
import { useCurrency } from "@/contexts/CurrencyContext";
import { TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface PromoteDealDialogProps {
  deal: Deal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PromoteDealDialog({ deal, open, onOpenChange, onSuccess }: PromoteDealDialogProps) {
  const { currencySymbol } = useCurrency();
  const { createCompany } = usePortfolioCompanies();
  const { getSectorById } = useSectors();
  const [formData, setFormData] = useState({
    name: deal.name,
    sector_id: deal.sector_id || "",
    stage: "Series A",
    investment_amount: deal.valuation?.toString() || "",
    valuation: deal.valuation?.toString() || "",
    investment_date: new Date().toISOString().split("T")[0],
    status: "Active",
    description: deal.notes || "",
    location: "",
    website: "",
  });

  const handlePromote = () => {
    if (!formData.name.trim()) {
      toast.error("Company name is required");
      return;
    }

    const companyData = {
      name: formData.name,
      sector_id: formData.sector_id || undefined,
      stage: formData.stage,
      investment_amount: formData.investment_amount ? parseFloat(formData.investment_amount) : undefined,
      valuation: formData.valuation ? parseFloat(formData.valuation) : undefined,
      investment_date: formData.investment_date || undefined,
      status: formData.status,
      description: formData.description || undefined,
      location: formData.location || undefined,
      website: formData.website || undefined,
      is_public: false,
    };

    createCompany(companyData, {
      onSuccess: () => {
        toast.success("Deal promoted to portfolio company!");
        onSuccess();
        onOpenChange(false);
      },
    });
  };

  const sector = deal.sector_id ? getSectorById(deal.sector_id) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Promote Deal to Portfolio Company
          </DialogTitle>
          <DialogDescription>
            Convert this deal into a portfolio company. Data will be pre-filled from the deal.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name *</Label>
              <Input
                id="company-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage">Stage</Label>
              <Select
                value={formData.stage}
                onValueChange={(value) => setFormData({ ...formData, stage: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Seed">Seed</SelectItem>
                  <SelectItem value="Series A">Series A</SelectItem>
                  <SelectItem value="Series B">Series B</SelectItem>
                  <SelectItem value="Series C">Series C</SelectItem>
                  <SelectItem value="Growth">Growth</SelectItem>
                  <SelectItem value="Pre-IPO">Pre-IPO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sector-display">Sector</Label>
              <Input
                id="sector-display"
                value={sector?.name || "No sector"}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Exited">Exited</SelectItem>
                  <SelectItem value="Written Off">Written Off</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="investment-amount">Investment Amount ({currencySymbol})</Label>
              <Input
                id="investment-amount"
                type="number"
                value={formData.investment_amount}
                onChange={(e) => setFormData({ ...formData, investment_amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valuation">Valuation ({currencySymbol})</Label>
              <Input
                id="valuation"
                type="number"
                value={formData.valuation}
                onChange={(e) => setFormData({ ...formData, valuation: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="investment-date">Investment Date</Label>
              <Input
                id="investment-date"
                type="date"
                value={formData.investment_date}
                onChange={(e) => setFormData({ ...formData, investment_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, Country"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Company description..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handlePromote} disabled={!formData.name.trim()}>
            Promote to Portfolio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
