import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, RefreshCw } from "lucide-react";
import { PortfolioCompany } from "@/types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useStockPrice } from "@/hooks/useStockPrice";

interface MarketCapCardProps {
  company: PortfolioCompany;
}

export function MarketCapCard({ company }: MarketCapCardProps) {
  const { formatCurrency } = useCurrency();
  const { fetchStockPrice, fetching } = useStockPrice();

  const handleRefresh = () => {
    if (company.stock_ticker) {
      fetchStockPrice(company.stock_ticker, company.id);
    }
  };
  
  if (!company.is_public) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Market Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">Private Company</Badge>
          <p className="text-sm text-muted-foreground mt-2">
            Market data not available for private companies
          </p>
        </CardContent>
      </Card>
    );
  }

  const priceChange = 2.45; // Mock daily change percentage
  const isPositive = priceChange > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Market Data
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{company.stock_ticker}</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={fetching}
            >
              <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Current Stock Price</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">{formatCurrency(company.current_stock_price || 0)}</p>
            <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span className="text-sm font-medium">{isPositive ? '+' : ''}{priceChange.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Market Cap</p>
            <p className="text-lg font-semibold">{company.market_cap ? formatCurrency(company.market_cap) : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Enterprise Value</p>
            <p className="text-lg font-semibold">{company.enterprise_value ? formatCurrency(company.enterprise_value) : 'N/A'}</p>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">Last updated: Today at 4:00 PM EST</p>
        </div>
      </CardContent>
    </Card>
  );
}
