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
    console.log('Batch match news request');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth header to find user
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token || '');

    if (!user) throw new Error('User not authenticated');

    // Get all news items without matches
    const { data: newsItems, error: newsError } = await supabase
      .from('news_items')
      .select('id')
      .order('published_at', { ascending: false })
      .limit(100); // Process last 100 news items

    if (newsError) throw newsError;

    console.log(`Found ${newsItems?.length || 0} news items to process`);

    // Filter out news items that already have matches
    const newsIds = newsItems?.map(n => n.id) || [];
    const { data: existingMatches } = await supabase
      .from('news_entity_matches')
      .select('news_item_id')
      .in('news_item_id', newsIds);

    const matchedIds = new Set(existingMatches?.map(m => m.news_item_id) || []);
    const unmatchedNews = newsItems?.filter(n => !matchedIds.has(n.id)) || [];

    console.log(`${unmatchedNews.length} news items without matches`);

    // Match each news item
    let successCount = 0;
    let errorCount = 0;

    for (const newsItem of unmatchedNews) {
      try {
        const { error } = await supabase.functions.invoke('match-news-entities', {
          body: { newsItemId: newsItem.id }
        });

        if (error) {
          console.error(`Failed to match news item ${newsItem.id}:`, error);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (e) {
        console.error(`Error matching news item ${newsItem.id}:`, e);
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: unmatchedNews.length,
        successCount,
        errorCount
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
