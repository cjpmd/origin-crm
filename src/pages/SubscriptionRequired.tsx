import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, CreditCard, Mail } from "lucide-react";

const SubscriptionRequired = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const handleSubscribe = async () => {
    setIsCreatingSession(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const response = await supabase.functions.invoke("create-checkout-session", {
        body: {
          priceId: import.meta.env.VITE_STRIPE_PRICE_ID_MONTHLY || "price_placeholder",
          seats: 1,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) throw response.error;
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setIsCreatingSession(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Subscription Required</CardTitle>
          <CardDescription className="text-lg mt-2">
            Your trial has ended or subscription is inactive. Subscribe to continue accessing Puma-AI CRM.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-primary/5 rounded-lg p-6 space-y-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold">Puma-AI Private Equity CRM</h3>
              <div className="text-3xl font-bold mt-2">£195 <span className="text-lg font-normal text-muted-foreground">per user/month</span></div>
            </div>
            
            <ul className="space-y-3 mt-6">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Full CRM access for deals, companies, contacts & investors</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">AI-powered insights & automated investment memos</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Real-time news feed with sentiment analysis</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">ESG analytics & sector benchmarking</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Research agent with evidence-based reports</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Relationship mapping & warm path finder</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Team collaboration with unlimited reports</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Priority support & all future features</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleSubscribe} 
              disabled={isCreatingSession}
              size="lg"
              className="w-full"
            >
              <CreditCard className="mr-2 h-5 w-5" />
              {isCreatingSession ? "Loading..." : "Subscribe Now"}
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="w-full"
              onClick={() => window.location.href = "mailto:support@puma-ai.com"}
            >
              <Mail className="mr-2 h-5 w-5" />
              Contact Sales
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            By subscribing, you agree to our Terms of Service and Privacy Policy.
            Cancel anytime through your billing settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionRequired;
