import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Building2 } from "lucide-react";
import { mockPublicComparables } from "@/lib/mockData";

interface PublicComparablesProps {
  sector: string;
}

export function PublicComparables({ sector }: PublicComparablesProps) {
  const comparables = mockPublicComparables.filter(c => c.sector === sector);

  const formatMarketCap = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    }
    return `$${(value / 1000000).toFixed(1)}M`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Public Comparables - {sector}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Ticker</TableHead>
              <TableHead className="text-right">Stock Price</TableHead>
              <TableHead className="text-right">Market Cap</TableHead>
              <TableHead className="text-right">EV/Revenue</TableHead>
              <TableHead className="text-right">EV/EBITDA</TableHead>
              <TableHead className="text-right">P/E</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comparables.map((comp) => (
              <TableRow key={comp.id}>
                <TableCell className="font-medium">{comp.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{comp.ticker}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span>${comp.stock_price.toFixed(2)}</span>
                    {comp.price_change_1d && (
                      <span className={`flex items-center text-xs ${comp.price_change_1d > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {comp.price_change_1d > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(comp.price_change_1d).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">{formatMarketCap(comp.market_cap)}</TableCell>
                <TableCell className="text-right">{comp.ev_revenue_multiple?.toFixed(1)}x</TableCell>
                <TableCell className="text-right">{comp.ev_ebitda_multiple?.toFixed(1)}x</TableCell>
                <TableCell className="text-right">{comp.pe_ratio?.toFixed(1)}x</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {comparables.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No public comparables available for this sector
          </p>
        )}
      </CardContent>
    </Card>
  );
}
