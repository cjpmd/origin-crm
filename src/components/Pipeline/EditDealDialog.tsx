import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Deal } from "@/hooks/useDeals";
import { useSectors } from "@/hooks/useSectors";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useProfiles } from "@/hooks/useProfiles";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const { profiles } = useProfiles();
  const [isFetchingLogo, setIsFetchingLogo] = useState(false);
  
  const [formData, setFormData] = useState({
    name: deal.name,
    valuation: deal.valuation?.toString() || "",
    probability: deal.probability?.toString() || "",
    sector_id: deal.sector_id || "",
    sub_stage: deal.sub_stage || "",
    owner: deal.owner || "",
    expected_close_date: deal.expected_close_date || "",
    website: deal.website || "",
    logo_url: deal.logo_url || "",
    notes: deal.notes || "",
  });

  // Auto-fetch logo on dialog open if website exists but no logo
  useEffect(() => {
    const autoFetchLogo = async () => {
      if (open && deal.website && !deal.logo_url) {
        setIsFetchingLogo(true);
        try {
          const { data, error } = await supabase.functions.invoke('fetch-company-logo', {
            body: { website: deal.website, dealId: deal.id }
          });

          if (error) throw error;
          
          if (data?.logoUrl) {
            setFormData(prev => ({ ...prev, logo_url: data.logoUrl }));
            toast.success('Company logo fetched successfully');
          }
        } catch (error) {
          console.error('Error fetching logo:', error);
        } finally {
          setIsFetchingLogo(false);
        }
      }
    };

    autoFetchLogo();
  }, [open, deal.id, deal.website, deal.logo_url]);

  // Fetch logo when website changes
  useEffect(() => {
    const fetchLogo = async () => {
      if (formData.website && formData.website !== deal.website) {
        setIsFetchingLogo(true);
        try {
          const { data, error } = await supabase.functions.invoke('fetch-company-logo', {
            body: { website: formData.website, dealId: deal.id }
          });

          if (error) throw error;
          
          if (data?.logoUrl) {
            setFormData(prev => ({ ...prev, logo_url: data.logoUrl }));
            toast.success('Company logo fetched successfully');
          }
        } catch (error) {
          console.error('Error fetching logo:', error);
        } finally {
          setIsFetchingLogo(false);
        }
      }
    };

    const timer = setTimeout(fetchLogo, 1000); // Debounce
    return () => clearTimeout(timer);
  }, [formData.website, deal.website, deal.id]);

  const handleRefreshLogo = async () => {
    if (!formData.website) {
      toast.error('Please enter a website URL first');
      return;
    }

    setIsFetchingLogo(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-company-logo', {
        body: { website: formData.website, dealId: deal.id }
      });

      if (error) throw error;
      
      if (data?.logoUrl) {
        setFormData(prev => ({ ...prev, logo_url: data.logoUrl }));
        toast.success('Company logo refreshed successfully');
      }
    } catch (error) {
      console.error('Error fetching logo:', error);
      toast.error('Failed to fetch logo');
    } finally {
      setIsFetchingLogo(false);
    }
  };

  const handleSave = () => {
    const updates: Partial<Deal> = {
      name: formData.name,
      valuation: formData.valuation ? parseFloat(formData.valuation) : undefined,
      probability: formData.probability ? parseInt(formData.probability) : undefined,
      sector_id: formData.sector_id || undefined,
      sub_stage: formData.sub_stage || undefined,
      owner: formData.owner || undefined,
      expected_close_date: formData.expected_close_date || undefined,
      website: formData.website || undefined,
      logo_url: formData.logo_url || undefined,
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
              <Select
                value={formData.owner}
                onValueChange={(value) => setFormData({ ...formData, owner: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.full_name || 'Unknown User'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label htmlFor="sub_stage">Sub-Stage</Label>
              <Select
                value={formData.sub_stage}
                onValueChange={(value) => setFormData({ ...formData, sub_stage: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sub-stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Meeting">Meeting</SelectItem>
                  <SelectItem value="Proposal">Proposal</SelectItem>
                  <SelectItem value="Negotiation">Negotiation</SelectItem>
                  <SelectItem value="Closing">Closing</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

          <div className="space-y-2">
            <Label htmlFor="website">Company Website</Label>
            <div className="flex gap-2">
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
                disabled={isFetchingLogo}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleRefreshLogo}
                disabled={isFetchingLogo || !formData.website}
              >
                {isFetchingLogo ? "Fetching..." : "Refresh Logo"}
              </Button>
            </div>
            {isFetchingLogo && (
              <p className="text-xs text-muted-foreground">Fetching company logo...</p>
            )}
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
          <Button onClick={handleSave} disabled={isLoading || !formData.name?.trim()}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
