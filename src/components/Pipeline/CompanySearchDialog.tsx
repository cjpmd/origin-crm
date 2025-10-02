import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search, Building2, ExternalLink, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CompanySearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToPipeline?: (company: { name: string; website?: string; logo_url?: string }) => void;
}

export function CompanySearchDialog({ open, onOpenChange, onAddToPipeline }: CompanySearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<string>("");
  const [linkedInConnections, setLinkedInConnections] = useState<any[]>([]);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a company name to search",
        variant: "destructive",
      });
      return;
    }

    console.log('[CompanySearch] Starting search for:', searchQuery);
    setIsSearching(true);
    setCompanyInfo(null);
    setAiInsights("");
    setLinkedInConnections([]);

    try {
      console.log('[CompanySearch] Invoking search-company function...');
      const { data, error } = await supabase.functions.invoke('search-company', {
        body: { query: searchQuery }
      });

      console.log('[CompanySearch] Response:', { data, error });

      if (error) {
        console.error('[CompanySearch] Function error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from search');
      }

      console.log('[CompanySearch] Search successful:', data);
      setCompanyInfo(data.companyInfo);
      setAiInsights(data.aiInsights);
      setLinkedInConnections(data.linkedInConnections || []);

      toast({
        title: "Search completed",
        description: `Found information for ${data.companyInfo?.name || searchQuery}`,
      });
    } catch (error: any) {
      console.error('[CompanySearch] Error searching company:', error);
      toast({
        title: "Search Error",
        description: error.message || "Failed to search for company. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToPipeline = () => {
    if (companyInfo && onAddToPipeline) {
      onAddToPipeline({
        name: companyInfo.name,
        website: companyInfo.website,
        logo_url: companyInfo.logo,
      });
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Company added to pipeline",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Companies</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            placeholder="Search for a company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </Button>
        </div>

        {companyInfo && (
          <ScrollArea className="flex-1">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="insights">AI Insights</TabsTrigger>
                <TabsTrigger value="connections">Team Connections</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    {companyInfo.logo && (
                      <img 
                        src={companyInfo.logo} 
                        alt={companyInfo.name}
                        className="w-16 h-16 rounded-lg object-contain"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold">{companyInfo.name}</h3>
                          {companyInfo.tagline && (
                            <p className="text-sm text-muted-foreground mt-1">{companyInfo.tagline}</p>
                          )}
                        </div>
                        {companyInfo.website && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={companyInfo.website} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Website
                            </a>
                          </Button>
                        )}
                      </div>
                      {companyInfo.description && (
                        <p className="mt-4">{companyInfo.description}</p>
                      )}
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {companyInfo.industry && (
                          <div>
                            <p className="text-sm text-muted-foreground">Industry</p>
                            <p className="font-medium">{companyInfo.industry}</p>
                          </div>
                        )}
                        {companyInfo.location && (
                          <div>
                            <p className="text-sm text-muted-foreground">Location</p>
                            <p className="font-medium">{companyInfo.location}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={handleAddToPipeline}>
                    <Building2 className="w-4 h-4 mr-2" />
                    Add to Pipeline
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="insights">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Investment Analysis</h3>
                  {aiInsights ? (
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                      {aiInsights}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No AI insights available</p>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="connections">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Team Connections at {companyInfo.name}
                  </h3>
                  {linkedInConnections.length > 0 ? (
                    <div className="space-y-3">
                      {linkedInConnections.map((connection, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{connection.teamMember}</p>
                            <p className="text-sm text-muted-foreground">
                              Connected to: {connection.contact}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No team connections found at this company</p>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </ScrollArea>
        )}

        {isSearching && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
