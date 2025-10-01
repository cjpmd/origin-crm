import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Building2, Users, GitBranch, Briefcase, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useContacts } from "@/hooks/useContacts";
import { useDeals } from "@/hooks/useDeals";
import { usePortfolioCompanies } from "@/hooks/usePortfolioCompanies";
import { useFunds } from "@/hooks/useFunds";
import { useInvestors } from "@/hooks/useInvestors";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { contacts } = useContacts();
  const { deals } = useDeals();
  const { companies } = usePortfolioCompanies();
  const { funds } = useFunds();
  const { investors } = useInvestors();

  const results = {
    contacts: query ? contacts.filter(c => 
      c.name?.toLowerCase().includes(query.toLowerCase()) ||
      c.email?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5) : [],
    deals: query ? deals.filter(d => 
      d.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5) : [],
    companies: query ? companies.filter(c => 
      c.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5) : [],
    funds: query ? funds.filter(f => 
      f.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5) : [],
    investors: query ? investors.filter(i => 
      i.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5) : [],
  };

  const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

  const handleSelect = (type: string, id: string) => {
    onOpenChange(false);
    setQuery("");
    
    switch (type) {
      case 'contact':
        navigate('/contacts');
        break;
      case 'deal':
        navigate('/pipeline');
        break;
      case 'company':
        navigate('/companies');
        break;
      case 'fund':
        navigate('/funds');
        break;
      case 'investor':
        navigate('/investors');
        break;
    }
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <div className="flex items-center border-b px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground mr-2" />
          <Input
            placeholder="Search deals, contacts, companies, funds, investors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
          <Badge variant="outline" className="ml-2 text-xs">
            ⌘K
          </Badge>
        </div>

        <ScrollArea className="max-h-[400px]">
          {!query ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Start typing to search across all entities...
            </div>
          ) : totalResults === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No results found for "{query}"
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {results.contacts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs font-medium text-muted-foreground uppercase">
                    <Users className="h-3 w-3" />
                    Contacts
                  </div>
                  <div className="space-y-1">
                    {results.contacts.map((contact) => (
                      <button
                        key={contact.id}
                        onClick={() => handleSelect('contact', contact.id)}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <div>
                          <p className="font-medium text-sm">{contact.name}</p>
                          <p className="text-xs text-muted-foreground">{contact.email}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">Contact</Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.deals.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs font-medium text-muted-foreground uppercase">
                    <GitBranch className="h-3 w-3" />
                    Deals
                  </div>
                  <div className="space-y-1">
                    {results.deals.map((deal) => (
                      <button
                        key={deal.id}
                        onClick={() => handleSelect('deal', deal.id)}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <div>
                          <p className="font-medium text-sm">{deal.name}</p>
                          <p className="text-xs text-muted-foreground">{deal.stage}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">Deal</Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.companies.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs font-medium text-muted-foreground uppercase">
                    <Building2 className="h-3 w-3" />
                    Companies
                  </div>
                  <div className="space-y-1">
                    {results.companies.map((company) => (
                      <button
                        key={company.id}
                        onClick={() => handleSelect('company', company.id)}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <div>
                          <p className="font-medium text-sm">{company.name}</p>
                          <p className="text-xs text-muted-foreground">{company.location}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">Company</Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.funds.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs font-medium text-muted-foreground uppercase">
                    <Briefcase className="h-3 w-3" />
                    Funds
                  </div>
                  <div className="space-y-1">
                    {results.funds.map((fund) => (
                      <button
                        key={fund.id}
                        onClick={() => handleSelect('fund', fund.id)}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <div>
                          <p className="font-medium text-sm">{fund.name}</p>
                          <p className="text-xs text-muted-foreground">{fund.vintage_year}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">Fund</Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.investors.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs font-medium text-muted-foreground uppercase">
                    <TrendingUp className="h-3 w-3" />
                    Investors
                  </div>
                  <div className="space-y-1">
                    {results.investors.map((investor) => (
                      <button
                        key={investor.id}
                        onClick={() => handleSelect('investor', investor.id)}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <div>
                          <p className="font-medium text-sm">{investor.name}</p>
                          <p className="text-xs text-muted-foreground">{investor.type}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">Investor</Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}