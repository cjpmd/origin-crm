import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Users, Target, Brain, BarChart3, FileText, Sparkles, Shield, Zap, Globe, Briefcase } from "lucide-react";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ParallaxBackground } from "@/components/Landing/ParallaxBackground";
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
  return <div className="min-h-screen relative">
      <ParallaxBackground />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight">Deal Flow CRM</span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate("/auth")} className="font-medium">
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth")} className="font-medium">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
        
        <div className="container mx-auto relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Launching Very Soon
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight leading-tight">
              Private Equity
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI-Powered CRM
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Streamline your entire investment lifecycle with intelligent automation.
              From deal sourcing to portfolio management—unified, powerful, and effortless.
            </p>

            {/* Waitlist Form */}
            <Card className="max-w-xl mx-auto p-8 mt-12 shadow-xl border-border/50 bg-card/80 backdrop-blur-sm">
              <form onSubmit={handleWaitlistSubmit} className="space-y-5">
                <div className="text-left">
                  <h3 className="text-xl font-semibold mb-6 text-center">Join the Waitlist</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="you@company.com" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        className="mt-1.5 h-11"
                        required 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                        <Input 
                          id="fullName" 
                          placeholder="John Doe" 
                          value={fullName} 
                          onChange={e => setFullName(e.target.value)}
                          className="mt-1.5 h-11"
                        />
                      </div>
                      <div>
                        <Label htmlFor="role" className="text-sm font-medium">Role</Label>
                        <Input 
                          id="role" 
                          placeholder="Partner, Analyst" 
                          value={role} 
                          onChange={e => setRole(e.target.value)}
                          className="mt-1.5 h-11"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="company" className="text-sm font-medium">Company</Label>
                      <Input 
                        id="company" 
                        placeholder="Acme Capital" 
                        value={company} 
                        onChange={e => setCompany(e.target.value)}
                        className="mt-1.5 h-11"
                      />
                    </div>
                  </div>
                </div>
                <Button type="submit" className="w-full h-11 font-medium" disabled={isSubmitting}>
                  {isSubmitting ? "Joining..." : "Request Early Access"}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Complete Investment Platform</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your private equity operations in one unified, intelligent platform
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {features.map(feature => (
              <Card 
                key={feature.title} 
                className="group p-7 hover:shadow-lg hover:scale-105 transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm"
              >
                <div className="mb-5 p-3 rounded-lg bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2.5">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-primary/5 to-transparent" />
        
        <div className="container mx-auto relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-6 backdrop-blur-sm">
              <Brain className="h-4 w-4" />
              AI-Powered Intelligence
            </div>
            <h2 className="text-4xl font-bold mb-4">Intelligent Automation</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Leverage cutting-edge AI to automate research, generate insights, and make smarter investment decisions
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {aiFeatures.map(feature => (
              <Card 
                key={feature.title} 
                className="p-8 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-5">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <Card className="max-w-4xl mx-auto p-16 text-center relative overflow-hidden border-border/50 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
            <div className="relative">
              <h2 className="text-4xl font-bold mb-5">Ready to Transform Your Workflow?</h2>
              <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Join leading PE firms modernizing their operations with Deal Flow CRM
              </p>
              <Button size="lg" onClick={() => navigate("/auth")} className="h-12 px-8 text-base font-medium">
                Get Early Access
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-12">
        <div className="container mx-auto px-6 py-10 text-center">
          <p className="text-sm text-muted-foreground">© 2025 Deal Flow CRM. All rights reserved.</p>
        </div>
      </footer>
    </div>;
}