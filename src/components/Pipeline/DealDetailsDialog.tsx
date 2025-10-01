import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DealSourceAttribution } from "@/components/Intelligence/DealSourceAttribution";
import { Deal } from "@/hooks/useDeals";
import { useSectors } from "@/hooks/useSectors";
import { format } from "date-fns";

interface DealDetailsDialogProps {
  deal: Deal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DealDetailsDialog({ deal, open, onOpenChange }: DealDetailsDialogProps) {
  const { getSectorById } = useSectors();
  const sector = deal.sector_id ? getSectorById(deal.sector_id) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Deal Details: {deal.name}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Company</h3>
                <p>{deal.name}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Stage</h3>
                <p>{deal.stage}</p>
              </div>
              {deal.valuation && (
                <div>
                  <h3 className="font-semibold mb-2">Valuation</h3>
                  <p>${deal.valuation.toLocaleString()}</p>
                </div>
              )}
              {deal.probability && (
                <div>
                  <h3 className="font-semibold mb-2">Probability</h3>
                  <p>{deal.probability}%</p>
                </div>
              )}
              {sector && (
                <div>
                  <h3 className="font-semibold mb-2">Sector</h3>
                  <p>{sector.name}</p>
                </div>
              )}
              {deal.owner && (
                <div>
                  <h3 className="font-semibold mb-2">Owner</h3>
                  <p>{deal.owner}</p>
                </div>
              )}
              {deal.expected_close_date && (
                <div>
                  <h3 className="font-semibold mb-2">Expected Close</h3>
                  <p>{format(new Date(deal.expected_close_date), "MMM d, yyyy")}</p>
                </div>
              )}
            </div>
            {deal.notes && (
              <div>
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-muted-foreground">{deal.notes}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sources" className="mt-4">
            <DealSourceAttribution dealId={deal.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
