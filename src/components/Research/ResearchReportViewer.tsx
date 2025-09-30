import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ResearchReport } from "@/hooks/useResearch";

interface ResearchReportViewerProps {
  report: ResearchReport;
}

export function ResearchReportViewer({ report }: ResearchReportViewerProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{report.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Generated: {new Date(report.created_at).toLocaleDateString()} at{" "}
                {new Date(report.created_at).toLocaleTimeString()}
              </p>
            </div>
            <div className="flex gap-2">
              {report.confidence && (
                <Badge variant="secondary">
                  {(report.confidence * 100).toFixed(0)}% confidence
                </Badge>
              )}
              {report.posterior_probability && (
                <Badge variant="outline">
                  {(report.posterior_probability * 100).toFixed(0)}% probability
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Executive Summary</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {report.summary}
            </p>
          </div>

          <Separator />

          {report.key_drivers && report.key_drivers.length > 0 && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-3">Key Investment Drivers</h3>
                <ul className="space-y-2">
                  {report.key_drivers.map((driver: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary font-semibold mt-1">•</span>
                      <span className="text-muted-foreground">{driver}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Separator />
            </>
          )}

          {report.structured_findings && report.structured_findings.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Detailed Findings</h3>
              <div className="space-y-4">
                {report.structured_findings.map((finding: any, i: number) => (
                  <div key={i} className="border-l-4 border-primary pl-4 py-2">
                    <h4 className="font-semibold text-base mb-2">{finding.claim}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {finding.evidence}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
