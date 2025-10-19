import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { 
  apiVersion: "2024-06-20" 
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const companyId = subscription.metadata.company_id;
        
        if (!companyId) {
          console.error("No company_id in subscription metadata");
          break;
        }

        // Calculate seats from subscription items
        const seats = subscription.items.data.reduce((total, item) => 
          total + (item.quantity || 1), 0
        );

        // Upsert subscription record
        const { error: subError } = await supabase
          .from("subscriptions")
          .upsert({
            company_id: companyId,
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            plan_name: "puma-ai-pro",
            seats_purchased: seats,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "stripe_subscription_id"
          });

        if (subError) {
          console.error("Error upserting subscription:", subError);
        }

        // Update company profile status
        const { error: companyError } = await supabase
          .from("company_profiles")
          .update({
            subscription_status: subscription.status === "active" || subscription.status === "trialing" 
              ? subscription.status 
              : "past_due",
            max_users: seats,
            stripe_customer_id: subscription.customer as string,
          })
          .eq("id", companyId);

        if (companyError) {
          console.error("Error updating company profile:", companyError);
        }

        console.log(`Subscription ${subscription.status} for company ${companyId}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Update subscription status
        const { error: subError } = await supabase
          .from("subscriptions")
          .update({ 
            status: "canceled",
            updated_at: new Date().toISOString() 
          })
          .eq("stripe_subscription_id", subscription.id);

        if (subError) {
          console.error("Error updating canceled subscription:", subError);
        }

        // Update company profile
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("company_id")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (sub) {
          await supabase
            .from("company_profiles")
            .update({ subscription_status: "canceled" })
            .eq("id", sub.company_id);
        }

        console.log(`Subscription canceled: ${subscription.id}`);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          console.log(`Payment succeeded for subscription: ${invoice.subscription}`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          // Update subscription status to past_due
          const { error } = await supabase
            .from("subscriptions")
            .update({ 
              status: "past_due",
              updated_at: new Date().toISOString() 
            })
            .eq("stripe_subscription_id", invoice.subscription as string);

          if (error) {
            console.error("Error updating subscription to past_due:", error);
          }

          // Update company profile
          const { data: sub } = await supabase
            .from("subscriptions")
            .select("company_id")
            .eq("stripe_subscription_id", invoice.subscription as string)
            .single();

          if (sub) {
            await supabase
              .from("company_profiles")
              .update({ subscription_status: "past_due" })
              .eq("id", sub.company_id);
          }

          console.log(`Payment failed for subscription: ${invoice.subscription}`);
        }
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Checkout completed: ${session.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});
