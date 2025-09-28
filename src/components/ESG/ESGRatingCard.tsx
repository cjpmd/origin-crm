import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ESGRating } from "@/types";
import { getESGRiskLevel } from "@/lib/mockData";
import { Leaf, Users, Shield } from "lucide-react";

interface ESGRatingCardProps {
  rating: ESGRating;
}

export function ESGRatingCard({ rating }: ESGRatingCardProps) {
  const riskLevel = getESGRiskLevel(rating.overall_score);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">ESG Rating</CardTitle>
          <Badge variant="outline" className={`${riskLevel.color} border-current`}>
            {riskLevel.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Overall Score</span>
            <span className="font-semibold">{rating.overall_score}/100</span>
          </div>
          <Progress value={rating.overall_score} className="h-2" />
        </div>

        {/* Category Scores */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center space-y-1">
            <div className="flex justify-center">
              <Leaf className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-xs text-muted-foreground">Environmental</div>
            <div className="font-semibold text-sm">{rating.e_score}</div>
          </div>
          <div className="text-center space-y-1">
            <div className="flex justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-xs text-muted-foreground">Social</div>
            <div className="font-semibold text-sm">{rating.s_score}</div>
          </div>
          <div className="text-center space-y-1">
            <div className="flex justify-center">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-xs text-muted-foreground">Governance</div>
            <div className="font-semibold text-sm">{rating.g_score}</div>
          </div>
        </div>

        {/* Provider Info */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Provider: {rating.provider} • Last updated: {new Date(rating.last_updated).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}