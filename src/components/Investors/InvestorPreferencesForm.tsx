import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useInvestorPreferences, InvestorPreference } from "@/hooks/useInvestorPreferences";
import { useCurrency } from "@/contexts/CurrencyContext";

interface InvestorPreferencesFormProps {
  investorId: string;
}

export function InvestorPreferencesForm({ investorId }: InvestorPreferencesFormProps) {
  const { preferences, upsertPreferences } = useInvestorPreferences(investorId);
  const { formatCurrency } = useCurrency();
  
  const [formData, setFormData] = useState<Partial<InvestorPreference>>({
    investor_id: investorId,
    preferred_sectors: [],
    preferred_geographies: [],
    preferred_fund_types: [],
    esg_focus: false,
    co_investment_interest: false,
  });

  const [newSector, setNewSector] = useState("");
  const [newGeography, setNewGeography] = useState("");
  const [newFundType, setNewFundType] = useState("");

  useEffect(() => {
    if (preferences) {
      setFormData(preferences);
    }
  }, [preferences]);

  const handleSave = () => {
    upsertPreferences({ ...formData, investor_id: investorId });
  };

  const addItem = (field: 'preferred_sectors' | 'preferred_geographies' | 'preferred_fund_types', value: string, setter: (v: string) => void) => {
    if (!value.trim()) return;
    const current = formData[field] || [];
    setFormData({ ...formData, [field]: [...current, value.trim()] });
    setter("");
  };

  const removeItem = (field: 'preferred_sectors' | 'preferred_geographies' | 'preferred_fund_types', index: number) => {
    const current = formData[field] || [];
    setFormData({ ...formData, [field]: current.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Preferred Sectors</Label>
          <div className="flex gap-2 mt-2">
            <Input
              value={newSector}
              onChange={(e) => setNewSector(e.target.value)}
              placeholder="Add sector..."
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('preferred_sectors', newSector, setNewSector))}
            />
            <Button onClick={() => addItem('preferred_sectors', newSector, setNewSector)} type="button">Add</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {(formData.preferred_sectors || []).map((sector, i) => (
              <Badge key={i} variant="secondary" className="gap-1">
                {sector}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeItem('preferred_sectors', i)} />
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label>Preferred Geographies</Label>
          <div className="flex gap-2 mt-2">
            <Input
              value={newGeography}
              onChange={(e) => setNewGeography(e.target.value)}
              placeholder="Add geography..."
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('preferred_geographies', newGeography, setNewGeography))}
            />
            <Button onClick={() => addItem('preferred_geographies', newGeography, setNewGeography)} type="button">Add</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {(formData.preferred_geographies || []).map((geo, i) => (
              <Badge key={i} variant="secondary" className="gap-1">
                {geo}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeItem('preferred_geographies', i)} />
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label>Preferred Fund Types</Label>
          <div className="flex gap-2 mt-2">
            <Input
              value={newFundType}
              onChange={(e) => setNewFundType(e.target.value)}
              placeholder="Add fund type..."
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('preferred_fund_types', newFundType, setNewFundType))}
            />
            <Button onClick={() => addItem('preferred_fund_types', newFundType, setNewFundType)} type="button">Add</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {(formData.preferred_fund_types || []).map((type, i) => (
              <Badge key={i} variant="secondary" className="gap-1">
                {type}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeItem('preferred_fund_types', i)} />
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="min_investment">Min Investment</Label>
            <Input
              id="min_investment"
              type="number"
              value={formData.min_investment || ""}
              onChange={(e) => setFormData({ ...formData, min_investment: parseFloat(e.target.value) || undefined })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_investment">Max Investment</Label>
            <Input
              id="max_investment"
              type="number"
              value={formData.max_investment || ""}
              onChange={(e) => setFormData({ ...formData, max_investment: parseFloat(e.target.value) || undefined })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="decision_timeline">Decision Timeline</Label>
          <Select 
            value={formData.decision_timeline || ""} 
            onValueChange={(value) => setFormData({ ...formData, decision_timeline: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select timeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-3 months">1-3 months</SelectItem>
              <SelectItem value="3-6 months">3-6 months</SelectItem>
              <SelectItem value="6-12 months">6-12 months</SelectItem>
              <SelectItem value="12+ months">12+ months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferred_deal_structure">Preferred Deal Structure</Label>
          <Input
            id="preferred_deal_structure"
            value={formData.preferred_deal_structure || ""}
            onChange={(e) => setFormData({ ...formData, preferred_deal_structure: e.target.value })}
            placeholder="e.g., Primary, Secondary, Co-investment"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reporting_frequency">Reporting Frequency</Label>
          <Select 
            value={formData.reporting_frequency || ""} 
            onValueChange={(value) => setFormData({ ...formData, reporting_frequency: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Monthly">Monthly</SelectItem>
              <SelectItem value="Quarterly">Quarterly</SelectItem>
              <SelectItem value="Semi-Annual">Semi-Annual</SelectItem>
              <SelectItem value="Annual">Annual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="esg_focus">ESG Focus</Label>
          <Switch
            id="esg_focus"
            checked={formData.esg_focus || false}
            onCheckedChange={(checked) => setFormData({ ...formData, esg_focus: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="co_investment_interest">Co-Investment Interest</Label>
          <Switch
            id="co_investment_interest"
            checked={formData.co_investment_interest || false}
            onCheckedChange={(checked) => setFormData({ ...formData, co_investment_interest: checked })}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Preferences</Button>
      </div>
    </div>
  );
}
