import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFunds, Fund } from '@/hooks/useFunds';
import { useCurrency } from '@/contexts/CurrencyContext';

interface AddEditFundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fund: Fund | null;
}

export function AddEditFundDialog({ open, onOpenChange, fund }: AddEditFundDialogProps) {
  const { currencySymbol } = useCurrency();
  const { createFund, updateFund } = useFunds();
  const [formData, setFormData] = useState({
    name: '',
    fund_size: '',
    vintage_year: '',
    strategy: '',
    status: 'Active',
    close_date: '',
    final_close_date: '',
    target_irr: '',
    target_moic: '',
    management_fee_rate: '',
    carried_interest_rate: '',
    notes: ''
  });

  useEffect(() => {
    if (fund) {
      setFormData({
        name: fund.name || '',
        fund_size: fund.fund_size?.toString() || '',
        vintage_year: fund.vintage_year?.toString() || '',
        strategy: fund.strategy || '',
        status: fund.status || 'Active',
        close_date: fund.close_date || '',
        final_close_date: fund.final_close_date || '',
        target_irr: fund.target_irr?.toString() || '',
        target_moic: fund.target_moic?.toString() || '',
        management_fee_rate: fund.management_fee_rate?.toString() || '',
        carried_interest_rate: fund.carried_interest_rate?.toString() || '',
        notes: fund.notes || ''
      });
    } else {
      setFormData({
        name: '',
        fund_size: '',
        vintage_year: '',
        strategy: '',
        status: 'Active',
        close_date: '',
        final_close_date: '',
        target_irr: '',
        target_moic: '',
        management_fee_rate: '',
        carried_interest_rate: '',
        notes: ''
      });
    }
  }, [fund, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const fundData = {
      name: formData.name,
      fund_size: formData.fund_size ? parseFloat(formData.fund_size) : undefined,
      vintage_year: formData.vintage_year ? parseInt(formData.vintage_year) : undefined,
      strategy: formData.strategy || undefined,
      status: formData.status,
      close_date: formData.close_date || undefined,
      final_close_date: formData.final_close_date || undefined,
      target_irr: formData.target_irr ? parseFloat(formData.target_irr) : undefined,
      target_moic: formData.target_moic ? parseFloat(formData.target_moic) : undefined,
      management_fee_rate: formData.management_fee_rate ? parseFloat(formData.management_fee_rate) : undefined,
      carried_interest_rate: formData.carried_interest_rate ? parseFloat(formData.carried_interest_rate) : undefined,
      notes: formData.notes || undefined
    };

    if (fund) {
      updateFund({ id: fund.id, ...fundData });
    } else {
      createFund(fundData);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{fund ? 'Edit Fund' : 'Add New Fund'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Basic Information */}
            <div className="col-span-2">
              <Label htmlFor="name">Fund Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="fund_size">Fund Size ({currencySymbol})</Label>
              <Input
                id="fund_size"
                type="number"
                step="0.01"
                value={formData.fund_size}
                onChange={(e) => setFormData({ ...formData, fund_size: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="vintage_year">Vintage Year</Label>
              <Input
                id="vintage_year"
                type="number"
                value={formData.vintage_year}
                onChange={(e) => setFormData({ ...formData, vintage_year: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="strategy">Strategy</Label>
              <Input
                id="strategy"
                value={formData.strategy}
                onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                placeholder="e.g., Growth Equity, Buyout"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Fundraising">Fundraising</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Liquidated">Liquidated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div>
              <Label htmlFor="close_date">Close Date</Label>
              <Input
                id="close_date"
                type="date"
                value={formData.close_date}
                onChange={(e) => setFormData({ ...formData, close_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="final_close_date">Final Close Date</Label>
              <Input
                id="final_close_date"
                type="date"
                value={formData.final_close_date}
                onChange={(e) => setFormData({ ...formData, final_close_date: e.target.value })}
              />
            </div>

            {/* Targets */}
            <div>
              <Label htmlFor="target_irr">Target IRR (%)</Label>
              <Input
                id="target_irr"
                type="number"
                step="0.1"
                value={formData.target_irr}
                onChange={(e) => setFormData({ ...formData, target_irr: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="target_moic">Target MOIC</Label>
              <Input
                id="target_moic"
                type="number"
                step="0.1"
                value={formData.target_moic}
                onChange={(e) => setFormData({ ...formData, target_moic: e.target.value })}
              />
            </div>

            {/* Fee Structure */}
            <div>
              <Label htmlFor="management_fee_rate">Management Fee (%)</Label>
              <Input
                id="management_fee_rate"
                type="number"
                step="0.01"
                value={formData.management_fee_rate}
                onChange={(e) => setFormData({ ...formData, management_fee_rate: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="carried_interest_rate">Carried Interest (%)</Label>
              <Input
                id="carried_interest_rate"
                type="number"
                step="0.01"
                value={formData.carried_interest_rate}
                onChange={(e) => setFormData({ ...formData, carried_interest_rate: e.target.value })}
              />
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {fund ? 'Update Fund' : 'Create Fund'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
