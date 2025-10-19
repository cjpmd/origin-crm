import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Calendar, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Billing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscription, isActive, isTrialing, isPastDue, trialDaysRemaining, seatsAvailable } = useSubscription();
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const handleSubscribe = async () => {
    if (!user) return;
    setIsCreatingSession(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("create-checkout-session", {
        body: { priceId: import.meta.env.VITE_STRIPE_PRICE_ID_MONTHLY || "price_placeholder", seats: 1 },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.error) throw response.error;
      if (response.data?.url) window.location.href = response.data.url;
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create checkout session", variant: "destructive" });
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleManageBilling = async () => {
    setIsCreatingSession(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("create-portal-session", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.error) throw response.error;
      if (response.data?.url) window.location.href = response.data.url;
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to open billing portal", variant: "destructive" });
    } finally {
      setIsCreatingSession(false);
    }
  };

  const getStatusBadge = () => {
    if (isTrialing) return <Badge variant="secondary" className="gap-1"><Calendar className="h-3 w-3" />Trial</Badge>;
    if (isActive) return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />Active</Badge>;
    if (isPastDue) return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Past Due</Badge>;
    return <Badge variant="outline" className="gap-1"><XCircle className="h-3 w-3" />Inactive</Badge>;
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and billing information</p>
      </div>

      {isTrialing && trialDaysRemaining > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} remaining in your free trial.
          </AlertDescription>
        </Alert>
      )}

      {isPastDue && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Your payment is past due. Please update your payment method.</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Current Plan {getStatusBadge()}
            </CardTitle>
            <CardDescription>Puma-AI Private Equity CRM</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price per user</span>
                <span className="font-medium">£195/month</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Seats purchased</span>
                <span className="font-medium">{subscription?.seats_purchased || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Seats available</span>
                <span className="font-medium">{seatsAvailable}</span>
              </div>
            </div>

            {subscription?.current_period_end && (
              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Next billing date</span>
                  <span className="font-medium">{new Date(subscription.current_period_end).toLocaleDateString()}</span>
                </div>
              </div>
            )}

            <div className="pt-4 space-y-2">
              {!isActive && (
                <Button onClick={handleSubscribe} disabled={isCreatingSession} className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  {isCreatingSession ? "Loading..." : "Subscribe Now"}
                </Button>
              )}
              {isActive && subscription?.stripe_subscription_id && (
                <Button onClick={handleManageBilling} disabled={isCreatingSession} variant="outline" className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  {isCreatingSession ? "Loading..." : "Manage Billing"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan Features</CardTitle>
            <CardDescription>Everything included</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                <span>Full CRM access</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                <span>AI insights & memos</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                <span>News & ESG analytics</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Billing;
