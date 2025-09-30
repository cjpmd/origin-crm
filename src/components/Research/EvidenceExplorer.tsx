import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, FileText, Twitter, Newspaper } from "lucide-react";
import { format } from "date-fns";

interface Evidence {
  id: string;
  title?: string;
  snippet?: string;
  outlet?: string;
  type?: string;
  verifiability_score?: number;
  independence_score?: number;
  signal_quality?: number;
  fetch_time?: string;
  source_url?: string;
}

interface EvidenceExplorerProps {
  evidence: Evidence[];
}

const getTypeIcon = (type?: string) => {
  switch (type) {
    case "article":
      return <Newspaper className="h-4 w-4" />;
    case "tweet":
      return <Twitter className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

export function EvidenceExplorer({ evidence }: EvidenceExplorerProps) {
  if (!evidence || evidence.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evidence</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No evidence collected yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Research Evidence ({evidence.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {evidence.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(item.type)}
                      <h4 className="font-medium text-sm">{item.title || "Evidence Item"}</h4>
                    </div>
                    {item.outlet && (
                      <p className="text-xs text-muted-foreground">
                        {item.outlet} • {item.fetch_time && format(new Date(item.fetch_time), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 text-right text-xs">
                    <Badge variant="outline" className="text-xs">
                      Quality: {((item.signal_quality || 0) * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>

                {item.snippet && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {item.snippet}
                  </p>
                )}

                {item.source_url && (
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    View source <ExternalLink className="h-3 w-3" />
                  </a>
                )}

                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>V: {((item.verifiability_score || 0) * 100).toFixed(0)}%</span>
                  <span>•</span>
                  <span>I: {((item.independence_score || 0) * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
