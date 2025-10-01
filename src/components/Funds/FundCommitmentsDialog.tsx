import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useFundCommitments } from '@/hooks/useFundCommitments';
import { useInvestors } from '@/hooks/useInvestors';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrency } from '@/contexts/CurrencyContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FundCommitmentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fundId: string;
  fundName: string;
}

export function FundCommitmentsDialog({ open, onOpenChange, fundId, fundName }: FundCommitmentsDialogProps) {
  const { formatCurrency, currencySymbol } = useCurrency();
  const { commitments, isLoading, createCommitment, updateCommitment, deleteCommitment } = useFundCommitments(fundId);
  const { investors } = useInvestors();
  const [isAddMode, setIsAddMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    investor_id: '',
    commitment_amount: '',
    called_amount: '',
    distributed_amount: '',
    committed_date: '',
    status: 'Active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const commitmentData = {
      fund_id: fundId,
      investor_id: formData.investor_id,
      commitment_amount: parseFloat(formData.commitment_amount),
      called_amount: formData.called_amount ? parseFloat(formData.called_amount) : 0,
      distributed_amount: formData.distributed_amount ? parseFloat(formData.distributed_amount) : 0,
      committed_date: formData.committed_date || undefined,
      status: formData.status
    };

    if (editingId) {
      updateCommitment({ id: editingId, ...commitmentData });
      setEditingId(null);
    } else {
      createCommitment(commitmentData);
    }
    
    resetForm();
  };

  const handleEdit = (commitment: any) => {
    setEditingId(commitment.id);
    setIsAddMode(true);
    setFormData({
      investor_id: commitment.investor_id,
      commitment_amount: commitment.commitment_amount.toString(),
      called_amount: commitment.called_amount?.toString() || '',
      distributed_amount: commitment.distributed_amount?.toString() || '',
      committed_date: commitment.committed_date || '',
      status: commitment.status || 'Active'
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this commitment?')) {
      deleteCommitment(id);
    }
  };

  const resetForm = () => {
    setIsAddMode(false);
    setEditingId(null);
    setFormData({
      investor_id: '',
      commitment_amount: '',
      called_amount: '',
      distributed_amount: '',
      committed_date: '',
      status: 'Active'
    });
  };

  const totalCommitment = commitments.reduce((sum, c) => sum + c.commitment_amount, 0);
  const totalCalled = commitments.reduce((sum, c) => sum + (c.called_amount || 0), 0);
  const totalDistributed = commitments.reduce((sum, c) => sum + (c.distributed_amount || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Commitments - {fundName}</DialogTitle>
        </DialogHeader>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Total Committed</p>
            <p className="text-2xl font-bold">{formatCurrency(totalCommitment)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Called</p>
            <p className="text-2xl font-bold">{formatCurrency(totalCalled)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Distributed</p>
            <p className="text-2xl font-bold">{formatCurrency(totalDistributed)}</p>
          </div>
        </div>

        {/* Add/Edit Form */}
        {isAddMode ? (
          <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold">{editingId ? 'Edit Commitment' : 'Add New Commitment'}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="investor_id">Investor *</Label>
                <Select value={formData.investor_id} onValueChange={(value) => setFormData({ ...formData, investor_id: value })} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select investor" />
                  </SelectTrigger>
                  <SelectContent>
                    {investors.map((investor) => (
                      <SelectItem key={investor.id} value={investor.id}>
                        {investor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="commitment_amount">Commitment Amount ({currencySymbol}) *</Label>
                <Input
                  id="commitment_amount"
                  type="number"
                  step="0.01"
                  value={formData.commitment_amount}
                  onChange={(e) => setFormData({ ...formData, commitment_amount: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="called_amount">Called Amount ({currencySymbol})</Label>
                <Input
                  id="called_amount"
                  type="number"
                  step="0.01"
                  value={formData.called_amount}
                  onChange={(e) => setFormData({ ...formData, called_amount: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="distributed_amount">Distributed Amount ({currencySymbol})</Label>
                <Input
                  id="distributed_amount"
                  type="number"
                  step="0.01"
                  value={formData.distributed_amount}
                  onChange={(e) => setFormData({ ...formData, distributed_amount: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="committed_date">Commitment Date</Label>
                <Input
                  id="committed_date"
                  type="date"
                  value={formData.committed_date}
                  onChange={(e) => setFormData({ ...formData, committed_date: e.target.value })}
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
                    <SelectItem value="Fulfilled">Fulfilled</SelectItem>
                    <SelectItem value="Defaulted">Defaulted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">{editingId ? 'Update' : 'Add'} Commitment</Button>
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        ) : (
          <Button onClick={() => setIsAddMode(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Commitment
          </Button>
        )}

        {/* Commitments Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Investor</TableHead>
                <TableHead className="text-right">Committed</TableHead>
                <TableHead className="text-right">Called</TableHead>
                <TableHead className="text-right">Distributed</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commitments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No commitments yet
                  </TableCell>
                </TableRow>
              ) : (
                commitments.map((commitment) => (
                  <TableRow key={commitment.id}>
                    <TableCell className="font-medium">
                      {commitment.investors?.name || 'Unknown'}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(commitment.commitment_amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(commitment.called_amount || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(commitment.distributed_amount || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(commitment.commitment_amount - (commitment.called_amount || 0))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={commitment.status === 'Active' ? 'default' : 'secondary'}>
                        {commitment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(commitment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(commitment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
