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
    const body = await req.json().catch(() => ({}));
    const { newsItemIds, limit = 50 } = body;
    
    console.log('Batch match news request:', { newsItemIds, limit });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.log('LOVABLE_API_KEY not configured, skipping AI matching');
      return new Response(
        JSON.stringify({ success: false, message: 'AI matching not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all users
    const { data: allUsers } = await supabase.auth.admin.listUsers();
    const users = allUsers?.users || [];
    
    console.log(`Matching for ${users.length} users`);

    // Get news items to match
    let newsQuery = supabase
      .from('news_items')
      .select('id, title, summary, content, category')
      .order('published_at', { ascending: false });

    if (newsItemIds && newsItemIds.length > 0) {
      newsQuery = newsQuery.in('id', newsItemIds);
    } else {
      // Get news without matches
      const { data: allNews } = await supabase
        .from('news_items')
        .select('id')
        .order('published_at', { ascending: false })
        .limit(limit);
      
      if (!allNews || allNews.length === 0) {
        return new Response(
          JSON.stringify({ success: true, message: 'No news to match' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const newsIds = allNews.map(n => n.id);
      const { data: existingMatches } = await supabase
        .from('news_entity_matches')
        .select('news_item_id')
        .in('news_item_id', newsIds);

      const matchedIds = new Set(existingMatches?.map(m => m.news_item_id) || []);
      const unmatchedIds = newsIds.filter(id => !matchedIds.has(id));
      
      if (unmatchedIds.length === 0) {
        return new Response(
          JSON.stringify({ success: true, message: 'All news already matched' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      newsQuery = newsQuery.in('id', unmatchedIds);
    }

    const { data: newsItems, error: newsError } = await newsQuery;

    if (newsError) throw newsError;

    console.log(`Found ${newsItems?.length || 0} news items to match`);

    if (!newsItems || newsItems.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No unmatched news found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const allMatches: any[] = [];

    // Process each user
    for (const user of users) {
      try {
        // Get user's entities
        const [companies, investors, deals] = await Promise.all([
          supabase.from('portfolio_companies').select('id, name, sector, website').eq('user_id', user.id),
          supabase.from('investors').select('id, name, type').eq('user_id', user.id),
          supabase.from('deals').select('id, name, sector, website').eq('user_id', user.id),
        ]);

        const entities = {
          companies: companies.data || [],
          investors: investors.data || [],
          deals: deals.data || [],
        };

        // Skip if user has no entities
        if (!entities.companies.length && !entities.investors.length && !entities.deals.length) {
          continue;
        }

        console.log(`User ${user.id}: ${entities.companies.length} companies, ${entities.investors.length} investors, ${entities.deals.length} deals`);

        // Match news items for this user
        for (const newsItem of newsItems) {
          try {
            const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${LOVABLE_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'google/gemini-2.5-flash-lite',
                messages: [
                  { 
                    role: 'system', 
                    content: `You are an entity matching analyst. Given a news article and entities, identify relevant matches. Return a JSON array with: entity_type, entity_id, match_confidence (0-1), and match_reason. Only include confidence > 0.6. Focus on: direct mentions, sector relevance, business relationships, geographic overlap, market impact.` 
                  },
                  { 
                    role: 'user', 
                    content: `News: ${JSON.stringify({ title: newsItem.title, summary: newsItem.summary, category: newsItem.category })}\n\nEntities: ${JSON.stringify(entities)}\n\nFind matches.` 
                  }
                ],
              }),
            });

            if (!aiResponse.ok) {
              console.error(`AI failed for news ${newsItem.id}:`, aiResponse.status);
              continue;
            }

            const aiData = await aiResponse.json();
            const content = aiData.choices[0].message.content;

            let matches = [];
            try {
              const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\[[\s\S]*\]/);
              const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
              matches = JSON.parse(jsonStr);
            } catch (e) {
              console.error(`Parse failed for news ${newsItem.id}`);
              continue;
            }

            if (matches.length > 0) {
              matches.forEach((match: any) => {
                allMatches.push({
                  news_item_id: newsItem.id,
                  entity_type: match.entity_type,
                  entity_id: match.entity_id,
                  match_confidence: match.match_confidence,
                  match_reason: match.match_reason,
                });
              });
            }
          } catch (e) {
            console.error(`Error matching news ${newsItem.id}:`, e);
          }
        }
      } catch (e) {
        console.error(`Error processing user ${user.id}:`, e);
      }
    }

    console.log(`Generated ${allMatches.length} total matches`);

    // Insert all matches
    if (allMatches.length > 0) {
      const { error: insertError } = await supabase
        .from('news_entity_matches')
        .upsert(allMatches, { 
          onConflict: 'news_item_id,entity_type,entity_id',
          ignoreDuplicates: true 
        });

      if (insertError) {
        console.error('Error inserting matches:', insertError);
        throw insertError;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        newsCount: newsItems.length,
        matchCount: allMatches.length,
        usersProcessed: users.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Batch match news error:', error);
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
