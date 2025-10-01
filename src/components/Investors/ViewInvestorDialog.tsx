import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Mail, Phone, Globe, MapPin } from 'lucide-react';
import { Investor } from '@/hooks/useInvestors';

interface ViewInvestorDialogProps {
  investor: Investor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContact: (investor: Investor) => void;
}

export function ViewInvestorDialog({ investor, open, onOpenChange, onContact }: ViewInvestorDialogProps) {
  if (!investor) return null;

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'Institutional': return 'bg-green-100 text-green-800';
      case 'Family Office': return 'bg-purple-100 text-purple-800';
      case 'Angel': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{investor.name}</DialogTitle>
          <DialogDescription>
            Investor Profile
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Type</Label>
              <Badge className={`${getTypeColor(investor.type)} mt-1`}>
                {investor.type || 'N/A'}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <Badge variant="default" className="mt-1">{investor.status}</Badge>
            </div>
          </div>

          {investor.focus_sectors && investor.focus_sectors.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Focus Sectors</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {investor.focus_sectors.map((sector, index) => (
                  <Badge key={index} variant="outline">{sector}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {investor.check_size && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Check Size</Label>
                <p className="text-lg font-semibold mt-1">{investor.check_size}</p>
              </div>
            )}
            {investor.location && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                <p className="flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {investor.location}
                </p>
              </div>
            )}
          </div>

          {investor.website && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Website</Label>
              <a 
                href={investor.website.startsWith('http') ? investor.website : `https://${investor.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline mt-1"
              >
                <Globe className="h-4 w-4" />
                {investor.website}
              </a>
            </div>
          )}

          {investor.notes && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
              <p className="text-sm mt-1 p-3 bg-muted rounded-lg">{investor.notes}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={() => onContact(investor)}>
              <Mail className="h-4 w-4 mr-2" />
              Contact Investor
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
