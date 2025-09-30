import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

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

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { templateType, includeCharts } = await req.json();
    
    console.log(`Generating ${templateType} report for user ${user.id}`);

    // Fetch user's data
    const [dealsResult, companiesResult, contactsResult] = await Promise.all([
      supabaseClient.from("deals").select("*").eq("user_id", user.id),
      supabaseClient.from("portfolio_companies").select("*, sectors(name)").eq("user_id", user.id),
      supabaseClient.from("contacts").select("*").eq("user_id", user.id),
    ]);

    if (dealsResult.error) throw dealsResult.error;
    if (companiesResult.error) throw companiesResult.error;
    if (contactsResult.error) throw contactsResult.error;

    const deals = dealsResult.data || [];
    const companies = companiesResult.data || [];
    const contacts = contactsResult.data || [];

    // Calculate key metrics
    const totalDealValue = deals.reduce((sum, deal) => sum + (deal.valuation || 0), 0);
    const dealsByStage = deals.reduce((acc, deal) => {
      acc[deal.stage] = (acc[deal.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const companiesBySector = companies.reduce((acc, company) => {
      const sector = company.sectors?.name || "Other";
      acc[sector] = (acc[sector] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Generate report using AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `You are an expert investment analyst generating professional reports for a private equity firm.
Create a comprehensive ${templateType} report based on the provided data.
Include executive summary, key findings, detailed analysis, and recommendations.
Use professional language suitable for limited partners and investment committees.`;

    const userPrompt = `Generate a detailed ${templateType} report with the following data:

Portfolio Overview:
- Total Companies: ${companies.length}
- Total Deal Value: £${(totalDealValue / 1000000).toFixed(2)}M
- Active Deals: ${deals.length}
- Contacts: ${contacts.length}

Deal Pipeline:
${Object.entries(dealsByStage).map(([stage, count]) => `- ${stage}: ${count} deals`).join('\n')}

Sector Distribution:
${Object.entries(companiesBySector).map(([sector, count]) => `- ${sector}: ${count} companies`).join('\n')}

Please structure the report with:
1. Executive Summary
2. Portfolio Performance
3. Deal Flow Analysis
4. Key Insights & Trends
5. Recommendations
6. Appendix

Format the report in markdown with clear sections and professional formatting.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const reportContent = aiData.choices?.[0]?.message?.content;

    if (!reportContent) {
      throw new Error("No report content generated");
    }

    console.log(`Report generated successfully for user ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        report: reportContent,
        metadata: {
          generatedAt: new Date().toISOString(),
          templateType,
          includeCharts,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating report:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
