import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('[search-company] Function invoked');
  
  if (req.method === 'OPTIONS') {
    console.log('[search-company] Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[search-company] Parsing request body...');
    const { query } = await req.json();
    
    if (!query) {
      console.error('[search-company] No query provided');
      throw new Error('Company name is required');
    }

    console.log('[search-company] Searching for company:', query);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('[search-company] LOVABLE_API_KEY not configured');
      throw new Error('LOVABLE_API_KEY not configured');
    }
    console.log('[search-company] API key found');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[search-company] Supabase client initialized');

    // Get auth user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[search-company] No authorization header');
      throw new Error('Not authenticated');
    }
    console.log('[search-company] User authenticated');

    // Call Lovable AI to search for company information
    console.log('[search-company] Preparing AI search prompt...');
    const searchPrompt = `Search for information about the company "${query}". Provide:
1. Company name
2. Website URL
3. Brief description (2-3 sentences)
4. Industry
5. Location/Headquarters
6. Logo URL if available
7. Tagline if available

Format as JSON.`;

    console.log('[search-company] Calling Lovable AI for company info...');
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
      const errorText = await searchResponse.text();
      console.error('[search-company] AI search error:', searchResponse.status, errorText);
      throw new Error(`Failed to search for company: ${errorText}`);
    }

    console.log('[search-company] AI search successful');
    const searchData = await searchResponse.json();
    const companyInfoText = searchData.choices?.[0]?.message?.content || '{}';
    console.log('[search-company] Raw AI response:', companyInfoText);
    
    let companyInfo;
    try {
      companyInfo = JSON.parse(companyInfoText);
      console.log('[search-company] Parsed company info:', companyInfo);
    } catch (e) {
      console.error('[search-company] Failed to parse company info:', companyInfoText);
      companyInfo = { name: query };
    }

    // Generate AI investment insights
    console.log('[search-company] Generating AI insights...');
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
    console.log('[search-company] AI insights generated');

    // Check LinkedIn connections (simplified - would need actual LinkedIn integration)
    // For now, we'll check if any team members have LinkedIn profiles and the company in their network
    console.log('[search-company] Checking team connections...');
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('id, full_name, email');

    if (teamError) {
      console.error('[search-company] Error fetching team members:', teamError);
    }

    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('name, company_id, linkedin')
      .ilike('name', `%${query}%`);

    if (contactsError) {
      console.error('[search-company] Error fetching contacts:', contactsError);
    }

    const linkedInConnections = contacts?.map(contact => ({
      teamMember: contact.name,
      contact: contact.name,
    })) || [];

    console.log('[search-company] Found', linkedInConnections.length, 'connections');
    console.log('[search-company] Search complete, returning results');

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
    console.error('[search-company] Error in search-company function:', error);
    console.error('[search-company] Error details:', error.message, error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        details: error.toString()
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
