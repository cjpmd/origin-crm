import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { 
  apiVersion: "2024-06-20" 
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { priceId, seats = 1 } = await req.json();
    
    if (!priceId) {
      throw new Error("priceId is required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      throw new Error("Missing authorization token");
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    // Get user's company profile
    const { data: companyProfile, error: companyError } = await supabase
      .from("company_profiles")
      .select("id, stripe_customer_id, company_name")
      .eq("user_id", user.id)
      .single();

    if (companyError || !companyProfile) {
      throw new Error("Company profile not found. Only company owners can manage billing.");
    }

    // Get or create Stripe customer
    let customerId = companyProfile.stripe_customer_id;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: companyProfile.company_name || user.email,
        metadata: { 
          company_id: companyProfile.id,
          user_id: user.id 
        },
      });
      customerId = customer.id;

      // Update company profile with Stripe customer ID
      await supabase
        .from("company_profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", companyProfile.id);
    }

    // Check for existing subscription
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("id, stripe_subscription_id")
      .eq("company_id", companyProfile.id)
      .single();

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ 
        price: priceId, 
        quantity: seats 
      }],
      success_url: `${Deno.env.get("SITE_URL")}/billing?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${Deno.env.get("SITE_URL")}/billing?canceled=true`,
      subscription_data: {
        metadata: { 
          company_id: companyProfile.id,
          user_id: user.id 
        },
        trial_period_days: existingSub ? undefined : 7, // 7-day trial for new subscriptions
      },
      allow_promotion_codes: true,
      billing_address_collection: "required",
    });

    console.log(`Checkout session created for company ${companyProfile.id}: ${session.id}`);

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (err) {
    console.error("Error creating checkout session:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
