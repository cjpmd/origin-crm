import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function ResearchNotifications() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const channel = supabase
      .channel("research-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "research_jobs",
          filter: "status=eq.done",
        },
        (payload) => {
          const job = payload.new as any;
          
          // Show toast notification
          toast.success(
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Research Complete!</p>
                <p className="text-sm text-muted-foreground">
                  {job.depth === "quick" && "Quick analysis"}
                  {job.depth === "standard" && "Standard research"}
                  {job.depth === "forensic" && "Forensic deep dive"}
                  {" finished successfully"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    if (job.company_id) {
                      navigate(`/research/company/${job.company_id}`);
                    } else if (job.sector_id) {
                      navigate(`/research/sector/${job.sector_id}`);
                    }
                  }}
                >
                  View Report
                </Button>
              </div>
            </div>,
            {
              duration: 10000,
            }
          );

          // Try browser notification if permitted
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Research Complete", {
              body: "Your deep research analysis has finished",
              icon: "/favicon.ico",
            });
          }

          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ["research_jobs"] });
          queryClient.invalidateQueries({ queryKey: ["research_reports"] });
          queryClient.invalidateQueries({ queryKey: ["evidence_items"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, navigate]);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return null;
}
