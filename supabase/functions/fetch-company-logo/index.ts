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
    const { website, dealId } = await req.json();
    
    console.log('Fetching logo for website:', website);

    if (!website) {
      return new Response(
        JSON.stringify({ error: 'Website URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract domain from URL
    let domain;
    try {
      const url = new URL(website.startsWith('http') ? website : `https://${website}`);
      domain = url.hostname;
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid website URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try multiple logo sources
    const logoSources = [
      `https://logo.clearbit.com/${domain}`, // Clearbit (most reliable)
      `https://www.google.com/s2/favicons?domain=${domain}&sz=128`, // Google favicons
      `https://${domain}/favicon.ico`, // Direct favicon
    ];

    let logoUrl = null;

    // Try each source until we find a working one
    for (const source of logoSources) {
      try {
        const response = await fetch(source);
        if (response.ok && response.headers.get('content-type')?.includes('image')) {
          logoUrl = source;
          console.log('Found logo at:', source);
          break;
        }
      } catch (e) {
        console.log('Failed to fetch from:', source);
        continue;
      }
    }

    // Update the deal with the logo URL if dealId is provided
    if (dealId && logoUrl) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error } = await supabase
        .from('deals')
        .update({ logo_url: logoUrl })
        .eq('id', dealId);

      if (error) {
        console.error('Error updating deal logo:', error);
      } else {
        console.log('Updated deal logo successfully');
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        logoUrl: logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(domain)}&background=random`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Fetch company logo error:', error);
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
