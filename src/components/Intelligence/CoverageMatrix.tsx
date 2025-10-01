import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useIntermediaryCoverage } from "@/hooks/useIntermediaryCoverage";
import { useSectors } from "@/hooks/useSectors";
import { useIntermediaries } from "@/hooks/useIntermediaries";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

export function CoverageMatrix() {
  const { coverage, isLoading: coverageLoading } = useIntermediaryCoverage();
  const { sectors, isLoading: sectorsLoading } = useSectors();
  const { intermediaries, isLoading: intermediariesLoading } = useIntermediaries();

  const isLoading = coverageLoading || sectorsLoading || intermediariesLoading;

  // Build coverage map: sector -> list of intermediaries
  const coverageMap = new Map<string, any[]>();
  coverage.forEach((cov: any) => {
    const sectorId = cov.sector_id || "uncategorized";
    if (!coverageMap.has(sectorId)) {
      coverageMap.set(sectorId, []);
    }
    coverageMap.get(sectorId)?.push(cov);
  });

  const getCoverageStatus = (sectorId: string) => {
    const sectorCoverage = coverageMap.get(sectorId) || [];
    const avgStrength = sectorCoverage.length > 0
      ? sectorCoverage.reduce((sum, c) => sum + (c.coverage_strength || 0), 0) / sectorCoverage.length
      : 0;

    if (sectorCoverage.length === 0) return { status: "none", color: "text-red-600", icon: XCircle };
    if (avgStrength >= 70) return { status: "strong", color: "text-green-600", icon: CheckCircle };
    if (avgStrength >= 40) return { status: "moderate", color: "text-yellow-600", icon: AlertCircle };
    return { status: "weak", color: "text-orange-600", icon: AlertCircle };
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 75) return "bg-green-100 text-green-800 border-green-300";
    if (strength >= 50) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sector Coverage Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading coverage data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sector Coverage Matrix</CardTitle>
        <p className="text-sm text-muted-foreground">
          Visualize your intermediary network coverage across target sectors
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sectors.map((sector) => {
            const sectorCoverage = coverageMap.get(sector.id) || [];
            const { status, color, icon: Icon } = getCoverageStatus(sector.id);

            return (
              <div key={sector.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{sector.name}</h3>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <Badge variant="outline">
                    {sectorCoverage.length} {sectorCoverage.length === 1 ? "intermediary" : "intermediaries"}
                  </Badge>
                </div>

                {sectorCoverage.length === 0 ? (
                  <div className="text-sm text-muted-foreground italic">
                    No intermediary coverage for this sector
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {sectorCoverage.map((cov: any) => {
                      const intermediary = intermediaries.find(i => i.id === cov.intermediary_id);
                      return (
                        <div
                          key={cov.id}
                          className={`border rounded p-2 ${getStrengthColor(cov.coverage_strength || 0)}`}
                        >
                          <div className="font-medium text-sm">
                            {intermediary?.name || "Unknown"}
                          </div>
                          <div className="text-xs opacity-80">
                            {intermediary?.firm || ""}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs">Strength: {cov.coverage_strength}%</span>
                            {cov.interaction_count > 0 && (
                              <span className="text-xs">{cov.interaction_count} interactions</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {sectors.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              No sectors configured. Add sectors in Settings to track coverage.
            </p>
          )}
        </div>

        <div className="mt-6 pt-6 border-t">
          <h4 className="font-semibold mb-3">Coverage Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {sectors.filter(s => getCoverageStatus(s.id).status === "strong").length}
              </div>
              <div className="text-sm text-muted-foreground">Strong Coverage</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {sectors.filter(s => getCoverageStatus(s.id).status === "moderate").length}
              </div>
              <div className="text-sm text-muted-foreground">Moderate Coverage</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {sectors.filter(s => getCoverageStatus(s.id).status === "weak").length}
              </div>
              <div className="text-sm text-muted-foreground">Weak Coverage</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {sectors.filter(s => getCoverageStatus(s.id).status === "none").length}
              </div>
              <div className="text-sm text-muted-foreground">No Coverage</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
