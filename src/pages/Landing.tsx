import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Users, Target, Brain, BarChart3, FileText, Sparkles, Shield, Zap, Globe, Mail, Building2 } from "lucide-react";
export default function Landing() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const {
        error
      } = await supabase.from("waitlist").insert({
        email,
        full_name: fullName,
        company,
        role
      });
      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already registered",
            description: "This email is already on our waitlist!"
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Success!",
          description: "You've been added to our waitlist. We'll be in touch soon!"
        });
        setEmail("");
        setFullName("");
        setCompany("");
        setRole("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const features = [{
    icon: Users,
    title: "Deal Pipeline Management",
    description: "Track and manage your entire deal flow from sourcing to exit"
  }, {
    icon: Target,
    title: "Investor Relations",
    description: "Manage LP relationships, commitments, and fundraising pipelines"
  }, {
    icon: TrendingUp,
    title: "Portfolio Analytics",
    description: "Real-time insights and KPI tracking for your portfolio companies"
  }, {
    icon: Brain,
    title: "AI-Powered Research",
    description: "Automated company research and market intelligence gathering"
  }, {
    icon: FileText,
    title: "Smart Reporting",
    description: "Generate professional reports with AI assistance"
  }, {
    icon: BarChart3,
    title: "ESG Analytics",
    description: "Track and benchmark environmental, social, and governance metrics"
  }, {
    icon: Globe,
    title: "News Intelligence",
    description: "AI-powered news monitoring for your portfolio and prospects"
  }, {
    icon: Shield,
    title: "Relationship Mapping",
    description: "Visualize and leverage your network connections"
  }];
  const aiFeatures = [{
    icon: Sparkles,
    title: "AI Insights",
    description: "Automated analysis and recommendations for deals and portfolio companies"
  }, {
    icon: Brain,
    title: "Research Agent",
    description: "Deep-dive research on companies, sectors, and market trends"
  }, {
    icon: Zap,
    title: "Smart Suggestions",
    description: "Context-aware task and action recommendations"
  }];
  return <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/5">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Deal Flow CRM</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth")}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
            🚀 Launching Very Soon
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Private Equity <span className="text-primary">AI CRM</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage your entire investment lifecycle with AI-powered intelligence.
            From deal sourcing to portfolio management, everything in one place.
          </p>

          {/* Waitlist Form */}
          <Card className="max-w-lg mx-auto p-6 mt-8">
            <form onSubmit={handleWaitlistSubmit} className="space-y-4">
              <div className="text-left">
                <h3 className="text-lg font-semibold mb-4">Join the Waitlist</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" placeholder="Acme Capital" value={company} onChange={e => setCompany(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" placeholder="Partner, Analyst, etc." value={role} onChange={e => setRole(e.target.value)} />
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Joining..." : "Join Waitlist"}
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Complete Investment Platform</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage your private equity operations in one unified platform
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(feature => <Card key={feature.title} className="p-6 hover:shadow-lg transition-shadow">
              <feature.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>)}
        </div>
      </section>

      {/* AI Features Section */}
      <section className="container mx-auto px-4 py-20 bg-accent/5 rounded-3xl my-12">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
            <Sparkles className="inline h-4 w-4 mr-1" />
            AI-Powered
          </div>
          <h2 className="text-3xl font-bold mb-4">Intelligent Automation</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Leverage advanced AI to automate research, generate insights, and make smarter decisions
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {aiFeatures.map(feature => <Card key={feature.title} className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <feature.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>)}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Card className="max-w-3xl mx-auto p-12 bg-gradient-to-br from-primary/5 to-primary/10">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Workflow?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join leading PE firms who are modernizing their operations with Strata Deal
          </p>
          <Button size="lg" onClick={() => navigate("/auth")}>
            Get Early Access
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Strata Deal. All rights reserved.</p>
        </div>
      </footer>
    </div>;
}