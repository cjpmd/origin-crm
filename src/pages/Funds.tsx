import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, TrendingUp, Users, Briefcase, Calendar } from 'lucide-react';
import { useFunds, Fund } from '@/hooks/useFunds';
import { useFundCommitments } from '@/hooks/useFundCommitments';
import { usePortfolioCompanies } from '@/hooks/usePortfolioCompanies';
import { AddEditFundDialog } from '@/components/Funds/AddEditFundDialog';
import { FundCommitmentsDialog } from '@/components/Funds/FundCommitmentsDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Funds() {
  const { funds, isLoading, deleteFund } = useFunds();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCommitmentsDialogOpen, setIsCommitmentsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);

  const handleEdit = (fund: Fund) => {
    setSelectedFund(fund);
    setIsEditDialogOpen(true);
  };

  const handleViewCommitments = (fund: Fund) => {
    setSelectedFund(fund);
    setIsCommitmentsDialogOpen(true);
  };

  const handleDelete = (fund: Fund) => {
    setSelectedFund(fund);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedFund) {
      deleteFund(selectedFund.id);
      setIsDeleteDialogOpen(false);
      setSelectedFund(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Active': 'bg-green-500',
      'Closed': 'bg-gray-500',
      'Liquidated': 'bg-orange-500',
      'Fundraising': 'bg-blue-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Fund Management</h1>
          <p className="text-muted-foreground">Manage your funds, commitments, and performance</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Fund
        </Button>
      </div>

      {funds.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No funds yet</h3>
            <p className="text-muted-foreground mb-4">Get started by creating your first fund</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Fund
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {funds.map((fund) => (
            <FundCard
              key={fund.id}
              fund={fund}
              onEdit={handleEdit}
              onViewCommitments={handleViewCommitments}
              onDelete={handleDelete}
              getStatusColor={getStatusColor}
            />
          ))}
        </div>
      )}

      <AddEditFundDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        fund={null}
      />

      <AddEditFundDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        fund={selectedFund}
      />

      {selectedFund && (
        <FundCommitmentsDialog
          open={isCommitmentsDialogOpen}
          onOpenChange={setIsCommitmentsDialogOpen}
          fundId={selectedFund.id}
          fundName={selectedFund.name}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fund</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedFund?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FundCard({ 
  fund, 
  onEdit, 
  onViewCommitments, 
  onDelete, 
  getStatusColor 
}: { 
  fund: Fund; 
  onEdit: (fund: Fund) => void;
  onViewCommitments: (fund: Fund) => void;
  onDelete: (fund: Fund) => void;
  getStatusColor: (status: string) => string;
}) {
  const { commitments } = useFundCommitments(fund.id);
  const { companies } = usePortfolioCompanies();
  
  const totalCommitment = commitments.reduce((sum, c) => sum + c.commitment_amount, 0);
  const totalCalled = commitments.reduce((sum, c) => sum + (c.called_amount || 0), 0);
  const totalDistributed = commitments.reduce((sum, c) => sum + (c.distributed_amount || 0), 0);
  const portfolioCount = companies.filter(c => c.fund_id === fund.id).length;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl">{fund.name}</CardTitle>
            <CardDescription className="mt-1">
              {fund.strategy && <span>{fund.strategy}</span>}
              {fund.vintage_year && <span> • Vintage {fund.vintage_year}</span>}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(fund.status)}>
            {fund.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Fund Size</p>
              <p className="text-lg font-semibold">
                {fund.fund_size ? `£${(fund.fund_size / 1000000).toFixed(1)}M` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Target IRR</p>
              <p className="text-lg font-semibold">
                {fund.target_irr ? `${fund.target_irr}%` : 'N/A'}
              </p>
            </div>
          </div>

          {/* Commitment Summary */}
          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Committed</span>
              <span className="font-medium">£{(totalCommitment / 1000000).toFixed(2)}M</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Capital Called</span>
              <span className="font-medium">£{(totalCalled / 1000000).toFixed(2)}M</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Distributed</span>
              <span className="font-medium">£{(totalDistributed / 1000000).toFixed(2)}M</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{commitments.length} Investors</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span>{portfolioCount} Companies</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onViewCommitments(fund)}
            >
              <Users className="mr-1 h-3 w-3" />
              Commitments
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(fund)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDelete(fund)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
