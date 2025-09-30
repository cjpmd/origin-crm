import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { PortfolioCompany } from "@/types";

interface MarketCapCardProps {
  company: PortfolioCompany;
}

export function MarketCapCard({ company }: MarketCapCardProps) {
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

  const formatMarketCap = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    }
    return `$${(value / 1000000).toFixed(2)}M`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Market Data
          </span>
          <Badge variant="outline">{company.stock_ticker}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Current Stock Price</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">${company.current_stock_price?.toFixed(2)}</p>
            <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span className="text-sm font-medium">{isPositive ? '+' : ''}{priceChange.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Market Cap</p>
            <p className="text-lg font-semibold">{company.market_cap ? formatMarketCap(company.market_cap) : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Enterprise Value</p>
            <p className="text-lg font-semibold">{company.enterprise_value ? formatMarketCap(company.enterprise_value) : 'N/A'}</p>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">Last updated: Today at 4:00 PM EST</p>
        </div>
      </CardContent>
    </Card>
  );
}
