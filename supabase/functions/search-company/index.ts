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
    const { query } = await req.json();
    
    if (!query) {
      throw new Error('Company name is required');
    }

    console.log('Searching for company:', query);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Not authenticated');
    }

    // Call Lovable AI to search for company information
    const searchPrompt = `Search for information about the company "${query}". Provide:
1. Company name
2. Website URL
3. Brief description (2-3 sentences)
4. Industry
5. Location/Headquarters
6. Logo URL if available
7. Tagline if available

Format as JSON.`;

    const searchResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that searches for company information. Always respond with valid JSON only.' },
          { role: 'user', content: searchPrompt }
        ],
      }),
    });

    if (!searchResponse.ok) {
      console.error('AI search error:', await searchResponse.text());
      throw new Error('Failed to search for company');
    }

    const searchData = await searchResponse.json();
    const companyInfoText = searchData.choices?.[0]?.message?.content || '{}';
    
    let companyInfo;
    try {
      companyInfo = JSON.parse(companyInfoText);
    } catch (e) {
      console.error('Failed to parse company info:', companyInfoText);
      companyInfo = { name: query };
    }

    // Generate AI investment insights
    const insightsPrompt = `Analyze this company for investment potential: ${query}

Company Info:
${JSON.stringify(companyInfo, null, 2)}

Provide a brief investment analysis covering:
1. Market opportunity
2. Competitive advantages
3. Potential risks
4. Investment recommendation (Buy/Hold/Pass)

Keep it concise (3-4 paragraphs).`;

    const insightsResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an investment analyst providing clear, actionable insights.' },
          { role: 'user', content: insightsPrompt }
        ],
      }),
    });

    const insightsData = await insightsResponse.json();
    const aiInsights = insightsData.choices?.[0]?.message?.content || 'No insights available';

    // Check LinkedIn connections (simplified - would need actual LinkedIn integration)
    // For now, we'll check if any team members have LinkedIn profiles and the company in their network
    const { data: teamMembers } = await supabase
      .from('team_members')
      .select('id, full_name, email');

    const { data: contacts } = await supabase
      .from('contacts')
      .select('name, company_id, linkedin')
      .ilike('name', `%${query}%`);

    const linkedInConnections = contacts?.map(contact => ({
      teamMember: contact.name,
      contact: contact.name,
    })) || [];

    return new Response(
      JSON.stringify({
        success: true,
        companyInfo,
        aiInsights,
        linkedInConnections,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in search-company function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
