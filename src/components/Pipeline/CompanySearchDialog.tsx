import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search, Building2, ExternalLink, MessageSquare, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CompanyData {
  company_name: string;
  website_url?: string;
  description?: string;
  industry?: string;
  location?: string;
  logo_url?: string;
  tagline?: string;
}

interface CompanySearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToPipeline?: (company: CompanyData) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function CompanySearchDialog({ open, onOpenChange, onAddToPipeline }: CompanySearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [initialInsightGenerated, setInitialInsightGenerated] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Generate initial investment analysis when company is selected
  useEffect(() => {
    if (selectedCompany && !initialInsightGenerated) {
      generateInitialInsight();
    }
  }, [selectedCompany]);

  const generateInitialInsight = async () => {
    if (!selectedCompany) return;
    
    setInitialInsightGenerated(true);
    setChatMessages([]);
    
    const initialQuestion = "Provide a brief investment analysis covering market opportunity, competitive advantages, potential risks, and investment recommendation.";
    await sendChatMessage(initialQuestion, true);
  };

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
    setCompanies([]);
    setSelectedCompany(null);
    setChatMessages([]);
    setInitialInsightGenerated(false);

    try {
      const { data, error } = await supabase.functions.invoke('search-company', {
        body: { query: searchQuery }
      });

      console.log('[CompanySearch] Response:', { data, error });

      if (error) throw error;
      if (!data?.companies || data.companies.length === 0) {
        throw new Error('No companies found');
      }

      console.log('[CompanySearch] Found companies:', data.companies.length);
      setCompanies(data.companies);
      
      // Auto-select first company
      setSelectedCompany(data.companies[0]);

      toast({
        title: "Search completed",
        description: `Found ${data.companies.length} ${data.companies.length === 1 ? 'company' : 'companies'}`,
      });
    } catch (error: any) {
      console.error('[CompanySearch] Error:', error);
      toast({
        title: "Search Error",
        description: error.message || "Failed to search for companies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const sendChatMessage = async (question: string, isInitial = false) => {
    if (!selectedCompany || !question.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: question };
    if (!isInitial) {
      setChatMessages(prev => [...prev, userMessage]);
    }
    
    setIsChatLoading(true);

    try {
      const conversationHistory = isInitial ? [] : chatMessages;
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/company-insights`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            companyName: selectedCompany.company_name,
            companyInfo: selectedCompany,
            question,
            conversationHistory,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to get insights');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      // Add empty assistant message that we'll update
      setChatMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      if (reader) {
        let buffer = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim() || line.startsWith(':')) continue;
            if (!line.startsWith('data: ')) continue;

            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantMessage += content;
                setChatMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    role: 'assistant',
                    content: assistantMessage
                  };
                  return newMessages;
                });
              }
            } catch (e) {
              // Ignore parse errors for incomplete JSON
            }
          }
        }
      }
    } catch (error: any) {
      console.error('[Chat] Error:', error);
      toast({
        title: "Chat Error",
        description: error.message || "Failed to get response",
        variant: "destructive",
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput);
    setChatInput("");
  };

  const handleAddToPipeline = () => {
    if (selectedCompany && onAddToPipeline) {
      onAddToPipeline(selectedCompany);
      onOpenChange(false);
      
      const fields = [];
      if (selectedCompany.company_name) fields.push('name');
      if (selectedCompany.website_url) fields.push('website');
      if (selectedCompany.logo_url) fields.push('logo');
      if (selectedCompany.industry) fields.push('sector');
      if (selectedCompany.description) fields.push('description');
      if (selectedCompany.location) fields.push('location');
      
      toast({
        title: "Added to Pipeline",
        description: `Pre-populated: ${fields.join(', ')}`,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh] flex flex-col">
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

        {isSearching && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {companies.length > 0 && (
          <div className="flex gap-4 flex-1 min-h-0">
            {/* Company List */}
            <ScrollArea className="w-64 border rounded-lg">
              <div className="p-2 space-y-2">
                {companies.map((company, idx) => (
                  <Card
                    key={idx}
                    className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                      selectedCompany?.company_name === company.company_name
                        ? 'ring-2 ring-primary'
                        : ''
                    }`}
                    onClick={() => {
                      setSelectedCompany(company);
                      setChatMessages([]);
                      setInitialInsightGenerated(false);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10 rounded-md">
                        {company.logo_url ? (
                          <AvatarImage src={company.logo_url} alt={company.company_name} />
                        ) : null}
                        <AvatarFallback className="rounded-md">
                          <Building2 className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{company.company_name}</p>
                        {company.industry && (
                          <p className="text-xs text-muted-foreground truncate">{company.industry}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            {/* Company Details */}
            {selectedCompany && (
              <div className="flex-1 flex flex-col min-h-0">
                <Tabs defaultValue="overview" className="flex-1 flex flex-col">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="insights">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      AI Chat
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="flex-1 space-y-4 overflow-auto">
                    <Card className="p-6">
                      <div className="flex items-start gap-6">
                        {selectedCompany.logo_url && (
                          <Avatar className="w-24 h-24 rounded-lg flex-shrink-0">
                            <AvatarImage src={selectedCompany.logo_url} alt={selectedCompany.company_name} />
                            <AvatarFallback className="rounded-lg">
                              <Building2 className="w-12 h-12" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold mb-1">{selectedCompany.company_name}</h3>
                              {selectedCompany.tagline && (
                                <p className="text-base text-muted-foreground italic">{selectedCompany.tagline}</p>
                              )}
                            </div>
                            {selectedCompany.website_url && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={selectedCompany.website_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Website
                                </a>
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            {selectedCompany.industry && (
                              <div>
                                <p className="text-sm font-semibold text-muted-foreground mb-1">Industry</p>
                                <p className="text-base">{selectedCompany.industry}</p>
                              </div>
                            )}
                            {selectedCompany.location && (
                              <div>
                                <p className="text-sm font-semibold text-muted-foreground mb-1">Location</p>
                                <p className="text-base">{selectedCompany.location}</p>
                              </div>
                            )}
                          </div>
                          
                          {selectedCompany.description && (
                            <div className="pt-4 border-t">
                              <p className="text-sm font-semibold text-muted-foreground mb-2">About</p>
                              <p className="text-base leading-relaxed">{selectedCompany.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>

                    <div className="flex justify-end">
                      <Button onClick={handleAddToPipeline} size="lg">
                        <Building2 className="w-4 h-4 mr-2" />
                        Add to Pipeline
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="insights" className="flex-1 flex flex-col min-h-0">
                    <Card className="flex-1 flex flex-col min-h-0 max-h-[500px]">
                      <ScrollArea className="flex-1 p-4 min-h-0" ref={chatScrollRef}>
                        <div className="space-y-4 pb-4">
                          {chatMessages.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[85%] rounded-lg p-4 ${
                                  msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                              </div>
                            </div>
                          ))}
                          {isChatLoading && (
                            <div className="flex justify-start">
                              <div className="bg-muted rounded-lg p-4">
                                <Loader2 className="w-4 h-4 animate-spin" />
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                      <div className="p-4 border-t flex-shrink-0">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Ask about this company..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                            disabled={isChatLoading}
                          />
                          <Button 
                            onClick={handleSendMessage} 
                            disabled={isChatLoading || !chatInput.trim()}
                            size="icon"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
