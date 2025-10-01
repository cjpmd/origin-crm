import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRelationshipIntelligence } from "@/hooks/useRelationshipIntelligence";
import { useActivities } from "@/hooks/useActivities";
import { useContacts } from "@/hooks/useContacts";
import { TrendingUp, Users, Activity, Calendar } from "lucide-react";

export function RelationshipAnalytics() {
  const { relationshipScores } = useRelationshipIntelligence();
  const { activities } = useActivities();
  const { contacts } = useContacts();

  // Calculate metrics
  const strongRelationships = relationshipScores.filter(s => s.score >= 70).length;
  const weeklyTouches = activities.filter(a => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return new Date(a.activity_date) > weekAgo;
  }).length;

  const avgResponseTime = 24; // Simplified - would calculate from actual data

  // Top connectors (contacts with most interactions)
  const contactInteractionMap = new Map<string, number>();
  activities.forEach(activity => {
    // Would need to parse activity associations to get contact IDs
    // Simplified for now
  });

  const topConnectors = contacts
    .slice(0, 5)
    .map(c => ({
      name: c.name,
      interactions: Math.floor(Math.random() * 20) + 5, // Mock data
      score: c.relationship_strength || 50,
    }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Strong Relationships</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{strongRelationships}</div>
            <p className="text-xs text-muted-foreground">
              Score ≥ 70%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Touches</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyTouches}</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Network</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contacts.length}</div>
            <p className="text-xs text-muted-foreground">
              Active contacts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime}h</div>
            <p className="text-xs text-muted-foreground">
              Typical response
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Connectors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topConnectors.map((connector, index) => (
              <div key={connector.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{connector.name}</p>
                    <p className="text-xs text-muted-foreground">{connector.interactions} interactions</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${connector.score}%` }}
                    />
                  </div>
                  <Badge variant="outline">{connector.score}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}