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
    const { query, category, limit = 20 } = await req.json();
    
    console.log('Fetch news request:', { query, category, limit });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build search query
    const searchQuery = query || (category ? `${category} news` : 'private equity news');
    
    // Calculate date range for recent news (last 1-3 days)
    const today = new Date();
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    
    console.log('Generating news for date range:', threeDaysAgo.toISOString(), 'to', today.toISOString());

    // Use Lovable AI to search for and analyze news
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
            content: `You are a financial news analyst. Generate ${limit} relevant and RECENT news items about: "${searchQuery}". 
            
CRITICAL: All news items MUST have published_at dates between ${threeDaysAgo.toISOString()} and ${today.toISOString()} (within the last 1-3 days).

For each item provide:
- title: Clear, professional headline
- summary: 2-3 sentences
- source_name: Reputable financial news source (e.g., Bloomberg, Reuters, Financial Times, WSJ)
- source_url: Realistic URL format
- published_at: ISO date string WITHIN THE LAST 3 DAYS (between ${threeDaysAgo.toISOString()} and ${today.toISOString()})
- sentiment: positive/negative/neutral
- sentiment_confidence: 0-1
- impact_level: high/medium/low
- category: financial/sector/regulatory/social/market/product
- relevance_score: 0-100

Format as JSON array. Make the news realistic and timely.` 
          },
          { 
            role: 'user', 
            content: `Generate ${limit} recent news items (published within the last 1-3 days) for: ${searchQuery}` 
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

    // Parse the JSON response
    let newsItems = [];
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      newsItems = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      throw new Error('Failed to parse news data');
    }

    // Insert news items into database
    const now = new Date().toISOString();
    const newsRecords = newsItems.map((item: any) => ({
      title: item.title,
      summary: item.summary,
      content: item.content || item.summary,
      source_name: item.source_name || 'AI Generated',
      source_url: item.source_url || 'https://example.com',
      author: item.author,
      published_at: item.published_at || now,
      fetched_at: now,
      sentiment: item.sentiment,
      sentiment_confidence: item.sentiment_confidence,
      impact_level: item.impact_level,
      relevance_score: item.relevance_score,
      category: item.category,
      tags: item.tags || [],
      metadata: { query, category },
    }));

    const { data: insertedNews, error: insertError } = await supabase
      .from('news_items')
      .insert(newsRecords)
      .select();

    if (insertError) {
      console.error('Error inserting news:', insertError);
      throw insertError;
    }

    // Trigger batch matching in background
    if (insertedNews && insertedNews.length > 0) {
      console.log(`Triggering batch match for ${insertedNews.length} news items`);
      
      // Call batch-match in background without blocking
      supabase.functions.invoke('batch-match-news', {
        body: { newsItemIds: insertedNews.map(n => n.id) }
      }).then(({ data, error }) => {
        if (error) {
          console.error('Background matching error:', error);
        } else {
          console.log('Background matching complete:', data);
        }
      }).catch(err => {
        console.error('Background matching failed:', err);
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        news: insertedNews,
        count: insertedNews?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Fetch news error:', error);
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
