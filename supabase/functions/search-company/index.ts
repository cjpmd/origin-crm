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

    // Helper function to extract JSON from markdown-wrapped responses
    const extractJSON = (text: string) => {
      try {
        // Remove markdown code blocks
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleaned);
      } catch (e) {
        console.error('[search-company] JSON parse error:', e);
        return null;
      }
    };

    // Call Lovable AI to search for multiple companies
    console.log('[search-company] Preparing AI search prompt...');
    const searchPrompt = `Search for companies matching "${query}". Return the top 3-5 most relevant matches.

For each company, provide:
1. company_name (exact legal name)
2. website_url (full URL)
3. description (2-3 sentences about what they do)
4. industry (specific industry/sector)
5. location (city, country)
6. logo_url (if publicly available)
7. tagline (if available)

Return as a JSON array of company objects. Example format:
[
  {
    "company_name": "Example Corp",
    "website_url": "https://example.com",
    "description": "...",
    "industry": "Technology",
    "location": "San Francisco, USA",
    "logo_url": "https://...",
    "tagline": "Innovation in action"
  }
]`;

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
          { role: 'system', content: 'You are a company research assistant. Always return valid JSON arrays of company data.' },
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
    const companyInfoText = searchData.choices?.[0]?.message?.content || '[]';
    console.log('[search-company] Raw AI response:', companyInfoText);
    
    let companies;
    try {
      companies = extractJSON(companyInfoText);
      if (!Array.isArray(companies)) {
        // If single object returned, wrap in array
        companies = [companies];
      }
      console.log('[search-company] Parsed companies:', companies);
    } catch (e) {
      console.error('[search-company] Failed to parse company info:', companyInfoText);
      companies = [{ company_name: query }];
    }

    // Return the companies list - insights will be generated per-company on demand
    console.log('[search-company] Companies found:', companies.length);

    console.log('[search-company] Search complete, returning results');

    return new Response(
      JSON.stringify({
        success: true,
        companies: companies || [],
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
