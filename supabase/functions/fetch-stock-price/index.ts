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
    const { ticker, companyId } = await req.json();

    if (!ticker) {
      throw new Error('Stock ticker is required');
    }

    console.log(`Fetching stock data for ticker: ${ticker}`);

    // Use Alpha Vantage free API (requires API key)
    // Alternative: Financial Modeling Prep, Yahoo Finance API, etc.
    const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
    
    if (!apiKey) {
      throw new Error('ALPHA_VANTAGE_API_KEY not configured. Please add this secret.');
    }

    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data['Error Message']) {
      throw new Error('Invalid stock ticker or API error');
    }

    const quote = data['Global Quote'];
    
    if (!quote || !quote['05. price']) {
      throw new Error('Stock data not available');
    }

    const stockData = {
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume']),
      latestTradingDay: quote['07. latest trading day']
    };

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update company with latest stock price
    if (companyId) {
      await supabase
        .from('portfolio_companies')
        .update({
          current_stock_price: stockData.price,
          last_price_update: new Date().toISOString()
        })
        .eq('id', companyId);

      // Insert into market_data for historical tracking
      await supabase
        .from('market_data')
        .insert({
          company_id: companyId,
          date: stockData.latestTradingDay,
          close_price: stockData.price,
          volume: stockData.volume,
          change_amount: stockData.change,
          change_percent: stockData.changePercent
        });
    }

    return new Response(
      JSON.stringify({ success: true, data: stockData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching stock price:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
