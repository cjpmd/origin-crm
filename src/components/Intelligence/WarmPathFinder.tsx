import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRelationshipIntelligence } from "@/hooks/useRelationshipIntelligence";
import { useContacts } from "@/hooks/useContacts";
import { Search, ArrowRight, Star } from "lucide-react";

export function WarmPathFinder() {
  const [targetName, setTargetName] = useState("");
  const [paths, setPaths] = useState<any[]>([]);
  const { networkConnections } = useRelationshipIntelligence();
  const { contacts } = useContacts();

  const findPaths = () => {
    if (!targetName.trim()) return;

    // Simple BFS to find paths
    const targetContact = contacts.find(c => 
      c.name.toLowerCase().includes(targetName.toLowerCase())
    );

    if (!targetContact) {
      setPaths([]);
      return;
    }

    const foundPaths: any[] = [];

    // Find direct connections
    const directConnections = networkConnections.filter(
      conn => conn.to_contact_id === targetContact.id
    );

    directConnections.forEach(conn => {
      const intermediary = contacts.find(c => c.id === conn.from_contact_id);
      if (intermediary) {
        foundPaths.push({
          intermediaries: [intermediary],
          strength: conn.connection_strength,
          type: 'direct',
        });
      }
    });

    // Find 2-degree connections
    networkConnections.forEach(firstConn => {
      networkConnections.forEach(secondConn => {
        if (firstConn.to_contact_id === secondConn.from_contact_id &&
            secondConn.to_contact_id === targetContact.id) {
          const first = contacts.find(c => c.id === firstConn.from_contact_id);
          const second = contacts.find(c => c.id === firstConn.to_contact_id);
          
          if (first && second) {
            foundPaths.push({
              intermediaries: [first, second],
              strength: Math.min(firstConn.connection_strength, secondConn.connection_strength),
              type: '2-degree',
            });
          }
        }
      });
    });

    // Sort by strength
    foundPaths.sort((a, b) => b.strength - a.strength);
    setPaths(foundPaths.slice(0, 5));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Warm Path Finder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search for a target person..."
            value={targetName}
            onChange={(e) => setTargetName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && findPaths()}
          />
          <Button onClick={findPaths}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {paths.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Found {paths.length} warm {paths.length === 1 ? 'path' : 'paths'} to reach this person
            </p>
            {paths.map((path, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={path.type === 'direct' ? 'default' : 'secondary'}>
                    {path.type}
                  </Badge>
                  <Badge variant="outline">
                    {path.strength}% connection strength
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {path.intermediaries[0].name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="ml-2 font-medium">{path.intermediaries[0].name}</span>
                  </div>
                  {path.intermediaries.length > 1 && (
                    <>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {path.intermediaries[1].name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="ml-2 font-medium">{path.intermediaries[1].name}</span>
                      </div>
                    </>
                  )}
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-primary">{targetName}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {path.intermediaries[0].email}
                </p>
              </div>
            ))}
          </div>
        ) : targetName && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No warm paths found. This person might not be in your network yet.
          </p>
        )}

        {!targetName && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Enter a person's name to find warm introduction paths through your network
          </p>
        )}
      </CardContent>
    </Card>
  );
}