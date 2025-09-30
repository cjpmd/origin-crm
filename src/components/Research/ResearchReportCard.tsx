import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Clock, FileText } from "lucide-react";
import { format } from "date-fns";

interface ResearchReportCardProps {
  report?: {
    id: string;
    title: string;
    summary: string;
    posterior_probability?: number;
    confidence?: number;
    key_drivers?: string[];
    created_at: string;
  };
  job?: {
    status: string;
    depth: string;
    created_at: string;
  };
  onViewFull?: () => void;
  onRerun?: () => void;
}

export function ResearchReportCard({ report, job, onViewFull, onRerun }: ResearchReportCardProps) {
  if (!report && job?.status === "running") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 animate-pulse" />
            Research In Progress
          </CardTitle>
          <CardDescription>
            Running {job.depth} analysis...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!report) return null;

  const probability = (report.posterior_probability || 0) * 100;
  const confidence = (report.confidence || 0) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle>{report.title}</CardTitle>
            <CardDescription>
              Last updated: {format(new Date(report.created_at), "MMM d, yyyy 'at' h:mm a")}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-3xl font-bold">{probability.toFixed(0)}%</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {confidence.toFixed(0)}% confidence
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{report.summary}</p>
        
        {report.key_drivers && report.key_drivers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {report.key_drivers.slice(0, 3).map((driver, i) => (
              <Badge key={i} variant="secondary">
                {driver}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button onClick={onViewFull} variant="default" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            View Full Report
          </Button>
          <Button onClick={onRerun} variant="outline" size="sm">
            Re-run Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
