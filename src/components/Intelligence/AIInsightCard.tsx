import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, FileText, Lightbulb, Newspaper, Users, Loader2 } from "lucide-react";
import { useAIInsights } from "@/hooks/useAIInsights";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AIInsightCardProps {
  entityType: 'company' | 'contact' | 'deal' | 'sector';
  entityId: string;
}

const insightIcons = {
  research: Brain,
  summary: FileText,
  suggestion: Lightbulb,
  news: Newspaper,
  competitor: Users,
};

const insightLabels = {
  research: 'Deep Research',
  summary: 'Executive Summary',
  suggestion: 'Smart Suggestions',
  news: 'Market News',
  competitor: 'Competitor Analysis',
};

export function AIInsightCard({ entityType, entityId }: AIInsightCardProps) {
  const { insights, generateInsight, isGenerating } = useAIInsights(entityType, entityId);
  const [selectedInsight, setSelectedInsight] = useState<any>(null);
  const [generatingType, setGeneratingType] = useState<string | null>(null);

  const handleGenerate = async (insightType: 'research' | 'summary' | 'suggestion' | 'news' | 'competitor') => {
    setGeneratingType(insightType);
    try {
      await generateInsight({
        entityType,
        entityId,
        insightType,
      });
    } finally {
      setGeneratingType(null);
    }
  };

  const latestInsights = insights.slice(0, 3);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Insights
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {(Object.keys(insightIcons) as Array<keyof typeof insightIcons>).map((type) => {
              const Icon = insightIcons[type];
              const isGeneratingThis = generatingType === type;
              
              return (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerate(type)}
                  disabled={isGenerating}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  {isGeneratingThis ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  <span className="text-xs">{insightLabels[type]}</span>
                </Button>
              );
            })}
          </div>

          {latestInsights.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recent Insights</h4>
              {latestInsights.map((insight) => {
                const Icon = insightIcons[insight.insight_type as keyof typeof insightIcons];
                return (
                  <div
                    key={insight.id}
                    className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedInsight(insight)}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="h-4 w-4 mt-0.5 text-primary" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium truncate">{insight.title}</p>
                          <Badge variant="secondary" className="text-xs">
                            {insightLabels[insight.insight_type as keyof typeof insightLabels]}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {insight.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(insight.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {insights.length === 0 && !isGenerating && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No insights yet. Generate your first insight above!
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedInsight} onOpenChange={() => setSelectedInsight(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedInsight?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedInsight && insightLabels[selectedInsight.insight_type as keyof typeof insightLabels]}
              </Badge>
              {selectedInsight?.confidence_score && (
                <Badge variant="outline">
                  Confidence: {(selectedInsight.confidence_score * 100).toFixed(0)}%
                </Badge>
              )}
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{selectedInsight?.content}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Generated: {selectedInsight && new Date(selectedInsight.created_at).toLocaleString()}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}