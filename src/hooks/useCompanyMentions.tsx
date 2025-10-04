import { usePortfolioCompanies } from "@/hooks/usePortfolioCompanies";
import { useActivities } from "@/hooks/useActivities";
import { useState, useCallback } from "react";

export interface CompanyMention {
  companyId: string;
  companyName: string;
  startIndex: number;
  endIndex: number;
}

export function useCompanyMentions() {
  const { companies } = usePortfolioCompanies();
  const { logActivity } = useActivities();
  const [isProcessing, setIsProcessing] = useState(false);

  const parseMentions = useCallback((text: string): CompanyMention[] => {
    if (!companies || !text) return [];

    const mentions: CompanyMention[] = [];
    const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionText = match[1].toLowerCase();
      
      // Find matching company
      const matchedCompany = companies.find(c => 
        c.name.toLowerCase().includes(mentionText) || 
        mentionText.includes(c.name.toLowerCase())
      );

      if (matchedCompany) {
        mentions.push({
          companyId: matchedCompany.id,
          companyName: matchedCompany.name,
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
    }

    return mentions;
  }, [companies]);

  const getSuggestions = useCallback((query: string) => {
    if (!companies || !query) return [];
    
    const searchTerm = query.toLowerCase();
    return companies
      .filter(c => c.name.toLowerCase().includes(searchTerm))
      .slice(0, 5)
      .map(c => ({
        id: c.id,
        name: c.name,
        logoUrl: (c as any).logo_url || null,
      }));
  }, [companies]);

  const createActivitiesFromMentions = useCallback(async (
    content: string,
    mentions: CompanyMention[],
    title?: string
  ) => {
    if (mentions.length === 0) return;

    setIsProcessing(true);
    try {
      // Create one activity for each mentioned company
      for (const mention of mentions) {
        await logActivity({
          activity_type: 'note',
          subject: title || `Journal entry about ${mention.companyName}`,
          body: content,
          associations: [{
            entity_type: 'company',
            entity_id: mention.companyId,
          }],
        });
      }
    } finally {
      setIsProcessing(false);
    }
  }, [logActivity]);

  return {
    parseMentions,
    getSuggestions,
    createActivitiesFromMentions,
    isProcessing,
  };
}
