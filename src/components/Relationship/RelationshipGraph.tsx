import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockContacts, relationshipStrengthConfig } from '@/lib/mockData';
import { Users, Network } from 'lucide-react';

interface NetworkNode {
  id: string;
  name: string;
  company?: string;
  strength: number;
  x: number;
  y: number;
}

interface NetworkEdge {
  from: string;
  to: string;
  strength: number;
}

export function RelationshipGraph() {
  // Create a simple network visualization
  const nodes: NetworkNode[] = mockContacts.slice(0, 8).map((contact, index) => ({
    id: contact.id,
    name: `${contact.first_name} ${contact.last_name}`,
    company: contact.company,
    strength: contact.relationship_strength,
    x: 50 + (index % 3) * 150 + Math.random() * 50,
    y: 50 + Math.floor(index / 3) * 100 + Math.random() * 30
  }));

  const edges: NetworkEdge[] = [
    { from: nodes[0]?.id || '', to: nodes[1]?.id || '', strength: 85 },
    { from: nodes[1]?.id || '', to: nodes[2]?.id || '', strength: 70 },
    { from: nodes[0]?.id || '', to: nodes[3]?.id || '', strength: 92 },
    { from: nodes[2]?.id || '', to: nodes[4]?.id || '', strength: 65 },
  ].filter(edge => edge.from && edge.to);

  const getStrengthColor = (strength: number) => {
    const config = relationshipStrengthConfig.find(
      cfg => strength >= cfg.min && strength <= cfg.max
    );
    return config?.color || 'text-muted-foreground';
  };

  const getStrengthLabel = (strength: number) => {
    const config = relationshipStrengthConfig.find(
      cfg => strength >= cfg.min && strength <= cfg.max
    );
    return config?.label || 'Unknown';
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Relationship Network
            </CardTitle>
            <CardDescription>
              Visual map of key relationships and connection strengths
            </CardDescription>
          </div>
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            {nodes.length} contacts
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-80 bg-muted/10 rounded-lg border border-border/50 overflow-hidden">
          {/* SVG for connections */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
            {edges.map((edge, index) => {
              const fromNode = nodes.find(n => n.id === edge.from);
              const toNode = nodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;
              
              return (
                <line
                  key={index}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={edge.strength > 80 ? '#34A853' : edge.strength > 60 ? '#0077B6' : '#6B7280'}
                  strokeWidth={edge.strength > 80 ? 2 : 1}
                  strokeOpacity={0.6}
                />
              );
            })}
          </svg>
          
          {/* Nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ left: node.x, top: node.y }}
            >
              <div className="bg-background border border-border rounded-lg p-2 shadow-sm min-w-32 text-center hover:shadow-md transition-shadow">
                <div className="font-medium text-sm text-foreground truncate">
                  {node.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {node.company}
                </div>
                <Badge 
                  variant="secondary" 
                  className={`text-xs mt-1 ${getStrengthColor(node.strength)}`}
                >
                  {getStrengthLabel(node.strength)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-green-500"></div>
              <span>Strong (67-100)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-blue-500"></div>
              <span>Medium (34-66)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-gray-400"></div>
              <span>Weak (0-33)</span>
            </div>
          </div>
          <span>Click nodes to explore connections</span>
        </div>
      </CardContent>
    </Card>
  );
}