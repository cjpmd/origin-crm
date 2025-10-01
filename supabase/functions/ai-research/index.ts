import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { entityType, entityId, insightType, query } = await req.json();
    
    console.log('AI Research request:', { entityType, entityId, insightType });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get entity details from database
    let entityData: any = null;
    if (entityType === 'company') {
      const { data } = await supabase
        .from('portfolio_companies')
        .select('*')
        .eq('id', entityId)
        .single();
      entityData = data;
    } else if (entityType === 'contact') {
      const { data } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', entityId)
        .single();
      entityData = data;
    } else if (entityType === 'deal') {
      const { data } = await supabase
        .from('deals')
        .select('*')
        .eq('id', entityId)
        .single();
      entityData = data;
    }

    // Build context-aware prompt based on insight type
    let systemPrompt = '';
    let userPrompt = query || '';

    switch (insightType) {
      case 'research':
        systemPrompt = 'You are an expert private equity research analyst. Provide comprehensive market intelligence, industry trends, and competitive landscape analysis.';
        userPrompt = `Research the following ${entityType}: ${JSON.stringify(entityData)}. Provide detailed insights on market position, growth opportunities, competitive advantages, and potential risks.`;
        break;
      case 'summary':
        systemPrompt = 'You are a concise business analyst. Create executive summaries that capture key information clearly.';
        userPrompt = `Create a one-page executive summary for: ${JSON.stringify(entityData)}`;
        break;
      case 'suggestion':
        systemPrompt = 'You are a strategic advisor for private equity professionals. Suggest actionable next steps and relationship management tactics.';
        userPrompt = `Based on this ${entityType} data: ${JSON.stringify(entityData)}, suggest 3-5 strategic next steps for relationship development and deal advancement.`;
        break;
      case 'news':
        systemPrompt = 'You are a financial news analyst. Provide recent relevant news and market updates.';
        userPrompt = `Find recent news and market developments related to: ${entityData?.name || entityData?.company_name}`;
        break;
      case 'competitor':
        systemPrompt = 'You are a competitive intelligence analyst. Identify and analyze key competitors and market dynamics.';
        userPrompt = `Identify main competitors for: ${entityData?.name || entityData?.company_name} in the ${entityData?.sector || entityData?.stage} sector.`;
        break;
    }

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      throw new Error(`AI request failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;

    // Store the insight in the database
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token || '');

    if (user) {
      await supabase.from('ai_insights').insert({
        user_id: user.id,
        entity_type: entityType,
        entity_id: entityId,
        insight_type: insightType,
        title: `${insightType.charAt(0).toUpperCase() + insightType.slice(1)} - ${entityData?.name || entityData?.company_name}`,
        content,
        confidence_score: 0.85,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        content,
        title: `${insightType.charAt(0).toUpperCase() + insightType.slice(1)} Analysis`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI Research error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});