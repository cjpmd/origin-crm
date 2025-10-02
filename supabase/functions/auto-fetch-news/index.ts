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
    console.log('Auto-fetch news job started');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if this is a user-specific call or cron job
    const authHeader = req.headers.get('Authorization');
    let specificUserId = null;
    
    if (authHeader?.includes('Bearer')) {
      // User-specific manual refresh
      const userClient = createClient(
        supabaseUrl,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user } } = await userClient.auth.getUser();
      specificUserId = user?.id;
      console.log(`User-specific refresh for: ${specificUserId}`);
    }

    let usersProcessed = 0;

    if (specificUserId) {
      // Manual refresh: just this user
      await processUserNews(specificUserId, supabase, LOVABLE_API_KEY);
      usersProcessed = 1;
    } else {
      // Cron job: all users
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id');

      if (usersError) throw usersError;

      console.log(`Processing news for ${users?.length || 0} users`);

      for (const user of users || []) {
        try {
          await processUserNews(user.id, supabase, LOVABLE_API_KEY);
        } catch (error) {
          console.error(`Error processing news for user ${user.id}:`, error);
        }
      }
      usersProcessed = users?.length || 0;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: specificUserId ? 'Manual refresh completed' : 'Auto-fetch completed',
        usersProcessed
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Auto-fetch news error:', error);
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

async function processUserNews(userId: string, supabase: any, apiKey: string) {
  console.log(`Processing news for user: ${userId}`);

  // Fetch user's entities
  const [portfolioRes, dealsRes, investorsRes, sectorsRes] = await Promise.all([
    supabase.from('portfolio_companies').select('id, name, sector_id').eq('user_id', userId),
    supabase.from('deals').select('id, name, sector_id').eq('user_id', userId).neq('stage', 'Lost'),
    supabase.from('investors').select('id, name').eq('user_id', userId),
    supabase.from('sectors').select('id, name').eq('user_id', userId)
  ]);

  const portfolioCompanies = portfolioRes.data || [];
  const deals = dealsRes.data || [];
  const investors = investorsRes.data || [];
  const sectors = sectorsRes.data || [];

  console.log(`User ${userId}: ${portfolioCompanies.length} companies, ${deals.length} deals, ${investors.length} investors, ${sectors.length} sectors`);

  // Build search queries for each entity
  const queries = [];

  // Portfolio companies
  for (const company of portfolioCompanies.slice(0, 10)) { // Limit to avoid rate limits
    queries.push({
      query: `${company.name} company news`,
      entityType: 'company',
      entityId: company.id,
      entityName: company.name
    });
  }

  // Pipeline deals
  for (const deal of deals.slice(0, 10)) {
    queries.push({
      query: `${deal.name} company news acquisition`,
      entityType: 'deal',
      entityId: deal.id,
      entityName: deal.name
    });
  }

  // Investors
  for (const investor of investors.slice(0, 5)) {
    queries.push({
      query: `${investor.name} private equity fund news`,
      entityType: 'investor',
      entityId: investor.id,
      entityName: investor.name
    });
  }

  // Sectors
  for (const sector of sectors.slice(0, 5)) {
    queries.push({
      query: `${sector.name} industry trends news`,
      entityType: 'sector',
      entityId: sector.id,
      entityName: sector.name
    });
  }

  console.log(`Generated ${queries.length} search queries for user ${userId}`);

  // Fetch news for each query
  for (const queryInfo of queries) {
    try {
      await fetchAndMatchNews(queryInfo, userId, supabase, apiKey);
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error fetching news for query "${queryInfo.query}":`, error);
    }
  }
}

async function fetchAndMatchNews(queryInfo: any, userId: string, supabase: any, apiKey: string) {
  const { query, entityType, entityId, entityName } = queryInfo;

  // Check if we already have recent news for this query (last 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recentNews } = await supabase
    .from('news_items')
    .select('id')
    .contains('metadata', { query })
    .gte('created_at', oneDayAgo)
    .limit(1);

  if (recentNews && recentNews.length > 0) {
    console.log(`Skipping query "${query}" - recent news already exists`);
    return;
  }

  console.log(`Fetching news for: ${query}`);

  // Use Lovable AI to fetch news
  const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { 
          role: 'system', 
          content: `You are a financial news analyst. Generate 3 relevant, recent news items about: "${query}". For each item provide: title, summary (2-3 sentences), source_name, source_url, published_at (ISO date within last 30 days), sentiment (positive/negative/neutral), sentiment_confidence (0-1), impact_level (high/medium/low), category (financial/sector/regulatory/social/market/product), and relevance_score (0-100). Format as JSON array.` 
        },
        { 
          role: 'user', 
          content: `Generate 3 news items for: ${query}` 
        }
      ],
    }),
  });

  if (!aiResponse.ok) {
    console.error('AI request failed:', aiResponse.status);
    return;
  }

  const aiData = await aiResponse.json();
  const content = aiData.choices[0].message.content;

  // Parse news items
  let newsItems = [];
  try {
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
    newsItems = JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to parse AI response:', e);
    return;
  }

  // Insert news items and create entity matches
  const now = new Date().toISOString();
  for (const item of newsItems) {
    try {
      // Check for duplicate by title
      const { data: existing } = await supabase
        .from('news_items')
        .select('id')
        .eq('title', item.title)
        .limit(1);

      let newsItemId;

      if (existing && existing.length > 0) {
        newsItemId = existing[0].id;
        console.log(`News item already exists: ${item.title}`);
      } else {
        // Insert new news item
        const { data: insertedNews, error: insertError } = await supabase
          .from('news_items')
          .insert({
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
            metadata: { query, entityType, entityName },
            user_id: null // Global news
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting news:', insertError);
          continue;
        }

        newsItemId = insertedNews.id;
        console.log(`Inserted news: ${item.title}`);
      }

      // Create entity match
      const { error: matchError } = await supabase
        .from('news_entity_matches')
        .insert({
          news_item_id: newsItemId,
          entity_type: entityType,
          entity_id: entityId,
          match_confidence: 0.9,
          match_reason: `Auto-matched from query: ${query}`
        });

      if (matchError && matchError.code !== '23505') { // Ignore duplicate key errors
        console.error('Error creating match:', matchError);
      }

    } catch (error) {
      console.error('Error processing news item:', error);
    }
  }
}
