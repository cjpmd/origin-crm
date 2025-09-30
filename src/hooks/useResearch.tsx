import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ResearchJob {
  id: string;
  company_id?: string;
  sector_id?: string;
  initiated_by: string;
  status: "pending" | "running" | "done" | "failed";
  depth: "quick" | "standard" | "forensic";
  created_at: string;
  completed_at?: string;
}

export interface ResearchReport {
  id: string;
  research_job_id: string;
  title: string;
  summary: string;
  prior_probability?: number;
  posterior_probability?: number;
  confidence?: number;
  key_drivers?: string[];
  structured_findings?: any;
  created_at: string;
}

export interface EvidenceItem {
  id: string;
  research_job_id: string;
  title?: string;
  snippet?: string;
  source_url?: string;
  outlet?: string;
  type?: string;
  verifiability_score?: number;
  independence_score?: number;
  recency_score?: number;
  signal_quality?: number;
  fetch_time?: string;
}

export function useResearch(companyId?: string, sectorId?: string) {
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ["research_jobs", companyId, sectorId],
    queryFn: async () => {
      let query = supabase
        .from("research_jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (companyId) {
        query = query.eq("company_id", companyId);
      }
      if (sectorId) {
        query = query.eq("sector_id", sectorId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ResearchJob[];
    },
    enabled: !!(companyId || sectorId),
  });

  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ["research_reports", jobs[0]?.id],
    queryFn: async () => {
      if (!jobs[0]?.id) return [];

      const { data, error } = await supabase
        .from("research_reports")
        .select("*")
        .eq("research_job_id", jobs[0].id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ResearchReport[];
    },
    enabled: !!jobs[0]?.id,
  });

  const { data: evidence = [], isLoading: evidenceLoading } = useQuery({
    queryKey: ["evidence_items", jobs[0]?.id],
    queryFn: async () => {
      if (!jobs[0]?.id) return [];

      const { data, error } = await supabase
        .from("evidence_items")
        .select("*")
        .eq("research_job_id", jobs[0].id)
        .order("signal_quality", { ascending: false });

      if (error) throw error;
      return data as EvidenceItem[];
    },
    enabled: !!jobs[0]?.id,
  });

  const startResearch = useMutation({
    mutationFn: async ({ companyId, sectorId, depth = "standard" }: {
      companyId?: string;
      sectorId?: string;
      depth?: "quick" | "standard" | "forensic";
    }) => {
      const { data, error } = await supabase.functions.invoke("research-agent", {
        body: {
          action: "create",
          companyId,
          sectorId,
          depth,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["research_jobs"] });
      toast.success("Research started successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to start research");
    },
  });

  return {
    jobs,
    reports,
    evidence,
    isLoading: jobsLoading || reportsLoading || evidenceLoading,
    latestJob: jobs[0],
    latestReport: reports[0],
    startResearch: startResearch.mutate,
    isStarting: startResearch.isPending,
  };
}
