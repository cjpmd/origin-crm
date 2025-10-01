import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePortfolioKPIs, PortfolioKPI } from "@/hooks/usePortfolioKPIs";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Plus, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface KPIManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  companyName: string;
}

export function KPIManagementDialog({ open, onOpenChange, companyId, companyName }: KPIManagementDialogProps) {
  const { formatCurrency, currencySymbol } = useCurrency();
  const { kpis, isLoading, createKPI, updateKPI, deleteKPI } = usePortfolioKPIs(companyId);
  const [editingKPI, setEditingKPI] = useState<PortfolioKPI | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState({
    period_start: "",
    period_end: "",
    revenue: "",
    ebitda: "",
    ebitda_margin: "",
    arr: "",
    headcount: "",
    revenue_growth: "",
    customer_count: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const kpiData = {
      company_id: companyId,
      period_start: formData.period_start,
      period_end: formData.period_end,
      revenue: formData.revenue ? parseFloat(formData.revenue) : undefined,
      ebitda: formData.ebitda ? parseFloat(formData.ebitda) : undefined,
      ebitda_margin: formData.ebitda_margin ? parseFloat(formData.ebitda_margin) : undefined,
      arr: formData.arr ? parseFloat(formData.arr) : undefined,
      headcount: formData.headcount ? parseInt(formData.headcount) : undefined,
      revenue_growth: formData.revenue_growth ? parseFloat(formData.revenue_growth) : undefined,
      customer_count: formData.customer_count ? parseInt(formData.customer_count) : undefined,
      notes: formData.notes || undefined,
    };

    if (editingKPI) {
      updateKPI({ id: editingKPI.id, ...kpiData });
    } else {
      createKPI(kpiData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      period_start: "",
      period_end: "",
      revenue: "",
      ebitda: "",
      ebitda_margin: "",
      arr: "",
      headcount: "",
      revenue_growth: "",
      customer_count: "",
      notes: "",
    });
    setEditingKPI(null);
    setIsAddingNew(false);
  };

  const handleEdit = (kpi: PortfolioKPI) => {
    setEditingKPI(kpi);
    setIsAddingNew(true);
    setFormData({
      period_start: kpi.period_start,
      period_end: kpi.period_end,
      revenue: kpi.revenue?.toString() || "",
      ebitda: kpi.ebitda?.toString() || "",
      ebitda_margin: kpi.ebitda_margin?.toString() || "",
      arr: kpi.arr?.toString() || "",
      headcount: kpi.headcount?.toString() || "",
      revenue_growth: kpi.revenue_growth?.toString() || "",
      customer_count: kpi.customer_count?.toString() || "",
      notes: kpi.notes || "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage KPIs - {companyName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!isAddingNew && (
            <Button onClick={() => setIsAddingNew(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add New KPI Period
            </Button>
          )}

          {isAddingNew && (
            <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold">{editingKPI ? "Edit KPI" : "New KPI Period"}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="period_start">Period Start</Label>
                  <Input
                    id="period_start"
                    type="date"
                    value={formData.period_start}
                    onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="period_end">Period End</Label>
                  <Input
                    id="period_end"
                    type="date"
                    value={formData.period_end}
                    onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="revenue">Revenue ({currencySymbol})</Label>
                  <Input
                    id="revenue"
                    type="number"
                    step="0.01"
                    value={formData.revenue}
                    onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                    placeholder="1000000"
                  />
                </div>
                <div>
                  <Label htmlFor="ebitda">EBITDA ({currencySymbol})</Label>
                  <Input
                    id="ebitda"
                    type="number"
                    step="0.01"
                    value={formData.ebitda}
                    onChange={(e) => setFormData({ ...formData, ebitda: e.target.value })}
                    placeholder="200000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ebitda_margin">EBITDA Margin (%)</Label>
                  <Input
                    id="ebitda_margin"
                    type="number"
                    step="0.01"
                    value={formData.ebitda_margin}
                    onChange={(e) => setFormData({ ...formData, ebitda_margin: e.target.value })}
                    placeholder="20"
                  />
                </div>
                <div>
                  <Label htmlFor="arr">ARR ({currencySymbol})</Label>
                  <Input
                    id="arr"
                    type="number"
                    step="0.01"
                    value={formData.arr}
                    onChange={(e) => setFormData({ ...formData, arr: e.target.value })}
                    placeholder="1200000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="headcount">Headcount</Label>
                  <Input
                    id="headcount"
                    type="number"
                    value={formData.headcount}
                    onChange={(e) => setFormData({ ...formData, headcount: e.target.value })}
                    placeholder="50"
                  />
                </div>
                <div>
                  <Label htmlFor="revenue_growth">Revenue Growth (%)</Label>
                  <Input
                    id="revenue_growth"
                    type="number"
                    step="0.01"
                    value={formData.revenue_growth}
                    onChange={(e) => setFormData({ ...formData, revenue_growth: e.target.value })}
                    placeholder="45"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="customer_count">Customer Count</Label>
                <Input
                  id="customer_count"
                  type="number"
                  value={formData.customer_count}
                  onChange={(e) => setFormData({ ...formData, customer_count: e.target.value })}
                  placeholder="1000"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this period..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingKPI ? "Update KPI" : "Add KPI"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold">KPI History</h3>
            {isLoading ? (
              <p>Loading KPIs...</p>
            ) : kpis.length === 0 ? (
              <p className="text-muted-foreground">No KPIs recorded yet.</p>
            ) : (
              kpis.map((kpi) => (
                <div key={kpi.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">
                        {format(new Date(kpi.period_start), "MMM d, yyyy")} - {format(new Date(kpi.period_end), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(kpi)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteKPI(kpi.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Revenue</p>
                      <p className="font-semibold">{formatCurrency(kpi.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">EBITDA</p>
                      <p className="font-semibold">{formatCurrency(kpi.ebitda)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">EBITDA Margin</p>
                      <p className="font-semibold">{kpi.ebitda_margin ? `${kpi.ebitda_margin}%` : "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">ARR</p>
                      <p className="font-semibold">{formatCurrency(kpi.arr)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Headcount</p>
                      <p className="font-semibold">{kpi.headcount || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Revenue Growth</p>
                      <p className="font-semibold">{kpi.revenue_growth ? `${kpi.revenue_growth}%` : "N/A"}</p>
                    </div>
                  </div>
                  
                  {kpi.notes && (
                    <p className="text-sm text-muted-foreground mt-2">{kpi.notes}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
