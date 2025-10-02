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
    const { newsItemId } = await req.json();
    
    console.log('Match news entities request:', { newsItemId });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the news item
    const { data: newsItem, error: newsError } = await supabase
      .from('news_items')
      .select('*')
      .eq('id', newsItemId)
      .single();

    if (newsError) throw newsError;

    // Get auth header to find user
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token || '');

    if (!user) throw new Error('User not authenticated');

    // Get user's entities
    const [companies, investors, deals, contacts, intermediaries] = await Promise.all([
      supabase.from('portfolio_companies').select('id, name, sector').eq('user_id', user.id),
      supabase.from('investors').select('id, name, type').eq('user_id', user.id),
      supabase.from('deals').select('id, name, sector').eq('user_id', user.id),
      supabase.from('contacts').select('id, name, company_id').eq('user_id', user.id),
      supabase.from('intermediaries').select('id, name, firm').eq('user_id', user.id),
    ]);

    // Build context for AI matching
    const entities = {
      companies: companies.data || [],
      investors: investors.data || [],
      deals: deals.data || [],
      contacts: contacts.data || [],
      intermediaries: intermediaries.data || [],
    };

    // Use AI to match news to entities
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: `You are an entity matching analyst. Given a news article and a list of entities (companies, investors, deals, contacts, intermediaries), identify which entities are relevant to the news. Return a JSON array of matches with: entity_type, entity_id, match_confidence (0-1), and match_reason. Only include matches with confidence > 0.5.` 
          },
          { 
            role: 'user', 
            content: `News: ${JSON.stringify(newsItem)}\n\nEntities: ${JSON.stringify(entities)}\n\nFind relevant matches.` 
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      throw new Error(`AI request failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;

    // Parse matches
    let matches = [];
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      matches = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      matches = [];
    }

    // Insert matches into database
    if (matches.length > 0) {
      const matchRecords = matches.map((match: any) => ({
        news_item_id: newsItemId,
        entity_type: match.entity_type,
        entity_id: match.entity_id,
        match_confidence: match.match_confidence,
        match_reason: match.match_reason,
      }));

      const { error: insertError } = await supabase
        .from('news_entity_matches')
        .insert(matchRecords);

      if (insertError) {
        console.error('Error inserting matches:', insertError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        matches,
        count: matches.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Match news entities error:', error);
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
