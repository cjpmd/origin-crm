import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('[company-insights] Function invoked');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyName, companyInfo, question, conversationHistory } = await req.json();
    
    console.log('[company-insights] Request:', { companyName, question, historyLength: conversationHistory?.length });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build context from company info
    const context = `Company: ${companyName}
${companyInfo ? `
Industry: ${companyInfo.industry || 'N/A'}
Location: ${companyInfo.location || 'N/A'}
Description: ${companyInfo.description || 'N/A'}
Website: ${companyInfo.website_url || 'N/A'}
` : ''}`;

    // Build messages array
    const messages = [
      { 
        role: 'system', 
        content: `You are an investment analyst assistant. Provide clear, actionable insights about companies and investment opportunities. Use the following company context when relevant:\n\n${context}`
      },
      ...(conversationHistory || []),
      { role: 'user', content: question }
    ];

    console.log('[company-insights] Calling Lovable AI...');
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[company-insights] AI error:', response.status, errorText);
      throw new Error(`AI request failed: ${errorText}`);
    }

    console.log('[company-insights] Streaming response');
    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' }
    });
  } catch (error) {
    console.error('[company-insights] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
