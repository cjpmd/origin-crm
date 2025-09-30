import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Clock, CheckCircle2 } from "lucide-react";

interface ResearchProgressProps {
  status: "pending" | "running" | "done" | "failed";
  depth: "quick" | "standard" | "forensic";
  createdAt: string;
}

const getEstimatedTime = (depth: string) => {
  switch (depth) {
    case "quick":
      return "5-10 minutes";
    case "standard":
      return "15-30 minutes";
    case "forensic":
      return "1+ hour";
    default:
      return "Unknown";
  }
};

const getProgressValue = (status: string, createdAt: string, depth: string) => {
  if (status === "done") return 100;
  if (status === "failed") return 0;
  if (status === "pending") return 5;

  // Estimate progress based on time elapsed
  const elapsed = Date.now() - new Date(createdAt).getTime();
  const elapsedMinutes = elapsed / 1000 / 60;

  const maxMinutes = depth === "quick" ? 10 : depth === "standard" ? 30 : 60;
  const progress = Math.min(95, (elapsedMinutes / maxMinutes) * 100);

  return Math.max(10, progress);
};

export function ResearchProgress({ status, depth, createdAt }: ResearchProgressProps) {
  const progress = getProgressValue(status, createdAt, depth);
  const estimatedTime = getEstimatedTime(depth);

  if (status === "done") {
    return (
      <Card className="bg-success/10 border-success">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <div>
              <p className="font-medium text-success">Research Complete</p>
              <p className="text-sm text-muted-foreground">Analysis finished successfully</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "failed") {
    return (
      <Card className="bg-destructive/10 border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full bg-destructive" />
            <div>
              <p className="font-medium text-destructive">Research Failed</p>
              <p className="text-sm text-muted-foreground">Analysis encountered an error</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <div className="flex-1">
            <p className="font-medium">Research in Progress</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Estimated time: {estimatedTime}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {Math.round(progress)}% complete
          </p>
        </div>

        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-2">Current activities:</p>
          <ul className="space-y-1 list-disc list-inside">
            {progress < 30 && <li>Gathering evidence from multiple sources</li>}
            {progress >= 30 && progress < 60 && <li>Analyzing collected data</li>}
            {progress >= 60 && progress < 90 && <li>Synthesizing insights</li>}
            {progress >= 90 && <li>Finalizing report</li>}
          </ul>
        </div>

        <p className="text-xs text-muted-foreground italic">
          You can navigate away - research will continue in the background
        </p>
      </CardContent>
    </Card>
  );
}
