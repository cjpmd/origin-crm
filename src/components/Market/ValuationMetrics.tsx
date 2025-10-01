import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator } from "lucide-react";
import { PortfolioKPI } from "@/types";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ValuationMetricsProps {
  kpi: PortfolioKPI;
  companyName: string;
}

export function ValuationMetrics({ kpi, companyName }: ValuationMetricsProps) {
  const { formatCurrency } = useCurrency();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Valuation Multiples
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-3">{companyName} - {kpi.period}</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">EV/Revenue</p>
                <p className="text-2xl font-bold">{kpi.ev_revenue_multiple?.toFixed(1)}x</p>
                <Badge variant="secondary" className="text-xs">
                  vs Sector: 8.5x
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">EV/EBITDA</p>
                <p className="text-2xl font-bold">{kpi.ev_ebitda_multiple?.toFixed(1)}x</p>
                <Badge variant="secondary" className="text-xs">
                  vs Sector: 24.2x
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">P/E Ratio</p>
                <p className="text-2xl font-bold">{kpi.pe_ratio?.toFixed(1)}x</p>
                <Badge variant="secondary" className="text-xs">
                  vs Sector: 32.5x
                </Badge>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Valuation Analysis</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Revenue:</span>
                <span className="font-medium">{formatCurrency(kpi.revenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">EBITDA:</span>
                <span className="font-medium">{formatCurrency(kpi.ebitda)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">EBITDA Margin:</span>
                <span className="font-medium">{((kpi.ebitda! / kpi.revenue!) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
