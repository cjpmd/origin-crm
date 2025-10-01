import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRelationshipIntelligence } from "@/hooks/useRelationshipIntelligence";
import { Badge } from "@/components/ui/badge";

export function NetworkGraph() {
  const { networkConnections, isLoading } = useRelationshipIntelligence();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || isLoading || networkConnections.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 600;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create nodes from connections
    const nodeMap = new Map<string, { id: string; name: string; x: number; y: number; connections: number }>();
    
    networkConnections.forEach((conn: any) => {
      if (!nodeMap.has(conn.from_contact_id)) {
        nodeMap.set(conn.from_contact_id, {
          id: conn.from_contact_id,
          name: conn.from_contact?.name || 'Unknown',
          x: Math.random() * (canvas.width - 100) + 50,
          y: Math.random() * (canvas.height - 100) + 50,
          connections: 0,
        });
      }
      if (!nodeMap.has(conn.to_contact_id)) {
        nodeMap.set(conn.to_contact_id, {
          id: conn.to_contact_id,
          name: conn.to_contact?.name || 'Unknown',
          x: Math.random() * (canvas.width - 100) + 50,
          y: Math.random() * (canvas.height - 100) + 50,
          connections: 0,
        });
      }
      const fromNode = nodeMap.get(conn.from_contact_id)!;
      const toNode = nodeMap.get(conn.to_contact_id)!;
      fromNode.connections++;
      toNode.connections++;
    });

    const nodes = Array.from(nodeMap.values());

    // Draw edges
    ctx.strokeStyle = 'hsl(var(--muted))';
    ctx.lineWidth = 1;
    
    networkConnections.forEach((conn: any) => {
      const from = nodeMap.get(conn.from_contact_id);
      const to = nodeMap.get(conn.to_contact_id);
      if (!from || !to) return;

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      
      // Color based on connection strength
      const strength = conn.connection_strength || 50;
      if (strength > 70) {
        ctx.strokeStyle = 'hsl(var(--primary))';
        ctx.lineWidth = 2;
      } else if (strength > 40) {
        ctx.strokeStyle = 'hsl(var(--muted-foreground))';
        ctx.lineWidth = 1.5;
      } else {
        ctx.strokeStyle = 'hsl(var(--muted))';
        ctx.lineWidth = 1;
      }
      
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach(node => {
      // Node size based on number of connections
      const radius = Math.min(5 + node.connections * 2, 25);
      
      ctx.fillStyle = 'hsl(var(--primary))';
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw node label
      ctx.fillStyle = 'hsl(var(--foreground))';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.name.split(' ')[0], node.x, node.y + radius + 15);
    });

  }, [networkConnections, isLoading]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Network Graph</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading network...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (networkConnections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Network Graph</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] flex items-center justify-center">
            <p className="text-muted-foreground">No network connections yet. Start building your relationship network!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Network Graph</CardTitle>
          <Badge variant="secondary">{networkConnections.length} connections</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <canvas ref={canvasRef} className="w-full" />
        <div className="mt-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Strong (70+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted-foreground" />
            <span className="text-muted-foreground">Medium (40-70)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted" />
            <span className="text-muted-foreground">Weak (&lt;40)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}