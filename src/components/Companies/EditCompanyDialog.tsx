import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStockPrice } from '@/hooks/useStockPrice';
import { useSectors } from '@/hooks/useSectors';
import { Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditCompanyDialogProps {
  company: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
}

export function EditCompanyDialog({ company, open, onOpenChange, onSave }: EditCompanyDialogProps) {
  const { fetchStockPrice, fetching } = useStockPrice();
  const { activeSectors, isLoading: sectorsLoading } = useSectors();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    stage: '',
    sector_id: '',
    location: '',
    website: '',
    description: '',
    stock_ticker: '',
    is_public: false,
  });

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        stage: company.stage || '',
        sector_id: company.sector_id || '',
        location: company.location || '',
        website: company.website || '',
        description: company.description || '',
        stock_ticker: company.stock_ticker || '',
        is_public: company.is_public || false,
      });
    }
  }, [company]);

  // Auto-fetch stock price when ticker is entered (debounced)
  useEffect(() => {
    if (!company?.id || !formData.stock_ticker || !formData.is_public) return;
    
    const timeoutId = setTimeout(async () => {
      if (formData.stock_ticker.length >= 1 && formData.stock_ticker !== company.stock_ticker) {
        try {
          await fetchStockPrice(formData.stock_ticker, company.id);
        } catch (error) {
          // Silent fail for auto-fetch
        }
      }
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [formData.stock_ticker, formData.is_public, company?.id, company?.stock_ticker]);

  const handleSave = () => {
    if (company) {
      onSave({ id: company.id, ...formData });
      onOpenChange(false);
    }
  };

  const handleFetchStockPrice = async () => {
    if (company && formData.stock_ticker) {
      await fetchStockPrice(formData.stock_ticker, company.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Company Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="stage">Stage</Label>
              <Select
                value={formData.stage}
                onValueChange={(value) => setFormData({ ...formData, stage: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Seed">Seed</SelectItem>
                  <SelectItem value="Series A">Series A</SelectItem>
                  <SelectItem value="Series B">Series B</SelectItem>
                  <SelectItem value="Series C">Series C</SelectItem>
                  <SelectItem value="Growth">Growth</SelectItem>
                  <SelectItem value="Public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="is_public">Company Type</Label>
              <Select
                value={formData.is_public ? 'public' : 'private'}
                onValueChange={(value) => setFormData({ ...formData, is_public: value === 'public' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.is_public && (
            <div className="grid gap-2">
              <Label htmlFor="stock_ticker">Stock Ticker</Label>
              <div className="flex gap-2">
                <Input
                  id="stock_ticker"
                  placeholder="e.g., AAPL"
                  value={formData.stock_ticker}
                  onChange={(e) => setFormData({ ...formData, stock_ticker: e.target.value.toUpperCase() })}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleFetchStockPrice}
                  disabled={fetching || !formData.stock_ticker}
                  title="Fetch current stock price"
                >
                  <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Add ticker and click fetch to get current stock price
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="sector_id">Sector</Label>
              <Select
                value={formData.sector_id}
                onValueChange={(value) => setFormData({ ...formData, sector_id: value })}
                disabled={sectorsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {activeSectors.map((sector) => (
                    <SelectItem key={sector.id} value={sector.id}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://example.com"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
