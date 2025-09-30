import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { action, jobId, companyId, sectorId, depth } = await req.json();

    if (action === "create") {
      // Create a new research job
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: job, error } = await supabaseClient
        .from("research_jobs")
        .insert({
          company_id: companyId,
          sector_id: sectorId,
          initiated_by: user.id,
          depth: depth || "standard",
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      // Start processing in background with service role client
      EdgeRuntime.waitUntil(processResearchJob(job.id, user.id));

      return new Response(JSON.stringify({ job }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "status") {
      // Get job status
      const { data: job, error } = await supabaseClient
        .from("research_jobs")
        .select("*")
        .eq("id", jobId)
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ job }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Research agent error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function processResearchJob(jobId: string, userId: string) {
  // Create service role client for background operations
  const serviceClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    console.log(`Starting research job ${jobId} for user ${userId}`);

    // Update status to running
    const { error: updateError } = await serviceClient
      .from("research_jobs")
      .update({ status: "running" })
      .eq("id", jobId)
      .eq("initiated_by", userId);

    if (updateError) {
      console.error("Failed to update job status:", updateError);
      throw updateError;
    }

    // Get job details
    const { data: job, error: jobError } = await serviceClient
      .from("research_jobs")
      .select(`
        *,
        portfolio_companies(name, sector_id, description),
        sectors(name, description)
      `)
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      console.error("Failed to fetch job:", jobError);
      throw new Error("Job not found");
    }

    // Step 1: Query Expansion Agent
    console.log(`Expanding queries for job ${jobId}`);
    const queries = await expandQueries(job, LOVABLE_API_KEY);

    // Step 2: Evidence Gathering Agent
    console.log(`Gathering evidence for job ${jobId}`);
    const evidenceItems = await gatherEvidence(queries, job, LOVABLE_API_KEY);

    // Save evidence to DB
    console.log(`Saving ${evidenceItems.length} evidence items`);
    for (const item of evidenceItems) {
      const { error: evidenceError } = await serviceClient
        .from("evidence_items")
        .insert({
          research_job_id: jobId,
          company_id: job.company_id,
          ...item,
        });

      if (evidenceError) {
        console.error("Failed to insert evidence:", evidenceError);
      }
    }

    // Step 3: Analysis & Synthesis
    console.log(`Synthesizing findings for job ${jobId}`);
    const analysis = await synthesizeFindings(evidenceItems, job, LOVABLE_API_KEY);

    // Step 4: Bayesian Update
    const posterior = computePosterior(analysis);

    // Create research report
    console.log(`Creating research report for job ${jobId}`);
    const { error: reportError } = await serviceClient
      .from("research_reports")
      .insert({
        research_job_id: jobId,
        title: `Research Report: ${job.portfolio_companies?.name || job.sectors?.name || "Analysis"}`,
        summary: analysis.summary,
        prior_probability: 0.5,
        posterior_probability: posterior.probability,
        confidence: posterior.confidence,
        key_drivers: analysis.drivers,
        structured_findings: analysis.findings,
      });

    if (reportError) {
      console.error("Failed to create report:", reportError);
      throw reportError;
    }

    // Mark job as complete
    const { error: completeError } = await serviceClient
      .from("research_jobs")
      .update({ status: "done", completed_at: new Date().toISOString() })
      .eq("id", jobId);

    if (completeError) {
      console.error("Failed to mark job complete:", completeError);
      throw completeError;
    }

    console.log(`Job ${jobId} completed successfully`);
  } catch (error) {
    console.error(`Job ${jobId} failed:`, error);
    console.error("Error details:", error.message, error.stack);
    
    // Try to mark job as failed
    try {
      await serviceClient
        .from("research_jobs")
        .update({ status: "failed" })
        .eq("id", jobId);
    } catch (updateError) {
      console.error("Failed to update job status to failed:", updateError);
    }
  }
}

async function expandQueries(job: any, apiKey: string): Promise<string[]> {
  const context = job.portfolio_companies?.name || job.sectors?.name || "market analysis";
  const description = job.portfolio_companies?.description || job.sectors?.description || "";

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: "You are a research assistant. Generate focused search queries for deep market research.",
        },
        {
          role: "user",
          content: `Generate 5 focused search queries to research: ${context}. Description: ${description}. Return as JSON array of strings.`,
        },
      ],
    }),
  });

  if (!response.ok) throw new Error("Query expansion failed");

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "[]";
  
  try {
    return JSON.parse(content);
  } catch {
    return content.split("\n").filter((q: string) => q.trim());
  }
}

async function gatherEvidence(queries: string[], job: any, apiKey: string): Promise<any[]> {
  const evidence = [];

  for (const query of queries.slice(0, 3)) {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a research analyst. Provide factual evidence and insights.",
          },
          {
            role: "user",
            content: `Research this topic and provide key findings with sources: ${query}`,
          },
        ],
      }),
    });

    if (!response.ok) continue;

    const data = await response.json();
    const findings = data.choices?.[0]?.message?.content;

    if (findings) {
      evidence.push({
        title: query,
        snippet: findings.substring(0, 500),
        type: "analysis",
        verifiability_score: 0.7,
        independence_score: 0.8,
        recency_score: 0.9,
        signal_quality: 0.75,
        fetch_time: new Date().toISOString(),
      });
    }
  }

  return evidence;
}

async function synthesizeFindings(evidence: any[], job: any, apiKey: string): Promise<any> {
  const evidenceText = evidence.map(e => `${e.title}: ${e.snippet}`).join("\n\n");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: "You are an investment analyst. Synthesize research findings into actionable insights with key drivers and risks.",
        },
        {
          role: "user",
          content: `Analyze this research and provide: 1) Executive summary (2-3 sentences), 2) Top 3 key drivers, 3) Main risks. Evidence:\n\n${evidenceText}`,
        },
      ],
    }),
  });

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  return {
    summary: content.substring(0, 300),
    drivers: ["Market growth", "Competitive position", "Financial health"],
    findings: evidence.map(e => ({ claim: e.title, evidence: e.snippet, score: e.signal_quality })),
  };
}

function computePosterior(analysis: any): { probability: number; confidence: number } {
  // Simple Bayesian update simulation
  const prior = 0.5;
  const evidenceStrength = analysis.findings.reduce((sum: number, f: any) => sum + (f.score || 0.5), 0) / analysis.findings.length;
  
  const posterior = prior * evidenceStrength + (1 - prior) * (1 - evidenceStrength);
  const confidence = Math.min(0.95, evidenceStrength * 1.2);

  return {
    probability: Math.max(0.1, Math.min(0.9, posterior)),
    confidence: Math.max(0.3, confidence),
  };
}
