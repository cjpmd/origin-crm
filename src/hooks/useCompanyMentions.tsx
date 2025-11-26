import { usePortfolioCompanies } from "@/hooks/usePortfolioCompanies";
import { useDeals } from "@/hooks/useDeals";
import { useActivities } from "@/hooks/useActivities";
import { useProfiles } from "@/hooks/useProfiles";
import { useTasks } from "@/hooks/useTasks";
import { useState, useCallback } from "react";

export interface CompanyMention {
  companyId: string;
  companyName: string;
  entityType: 'company' | 'deal';
  startIndex: number;
  endIndex: number;
}

export interface UserMention {
  userId: string;
  userName: string;
  entityType: 'user';
  startIndex: number;
  endIndex: number;
}

export function useCompanyMentions() {
  const { companies } = usePortfolioCompanies();
  const { deals } = useDeals();
  const { profiles } = useProfiles();
  const { logActivity } = useActivities();
  const { createTask } = useTasks();
  const [isProcessing, setIsProcessing] = useState(false);

  const parseMentions = useCallback((text: string): CompanyMention[] => {
    if ((!companies || companies.length === 0) && (!deals || deals.length === 0)) return [];
    if (!text) return [];

    const mentions: CompanyMention[] = [];
    const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionText = match[1].toLowerCase();
      
      // Find matching company
      const matchedCompany = companies?.find(c => 
        c.name.toLowerCase().includes(mentionText) || 
        mentionText.includes(c.name.toLowerCase())
      );

      if (matchedCompany) {
        mentions.push({
          companyId: matchedCompany.id,
          companyName: matchedCompany.name,
          entityType: 'company',
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
        continue;
      }

      // Find matching deal
      const matchedDeal = deals?.find(d => 
        d.name.toLowerCase().includes(mentionText) || 
        mentionText.includes(d.name.toLowerCase())
      );

      if (matchedDeal) {
        mentions.push({
          companyId: matchedDeal.id,
          companyName: matchedDeal.name,
          entityType: 'deal',
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
    }

    return mentions;
  }, [companies, deals]);

  const parseUserMentions = useCallback((text: string): UserMention[] => {
    if (!profiles || profiles.length === 0) return [];
    if (!text) return [];

    const mentions: UserMention[] = [];
    const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionText = match[1].toLowerCase();
      
      // Find matching user
      const matchedUser = profiles.find(p => 
        p.full_name?.toLowerCase().includes(mentionText) || 
        mentionText.includes(p.full_name?.toLowerCase() || '')
      );

      if (matchedUser) {
        mentions.push({
          userId: matchedUser.id,
          userName: matchedUser.full_name || 'Unnamed User',
          entityType: 'user',
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
    }

    return mentions;
  }, [profiles]);

  const getSuggestions = useCallback((query: string) => {
    if (!query) return [];
    
    const searchTerm = query.toLowerCase();
    
    // Get user suggestions first (priority for team collaboration)
    const userSuggestions = (profiles || [])
      .filter(p => p.full_name?.toLowerCase().includes(searchTerm))
      .slice(0, 2)
      .map(p => ({
        id: p.id,
        name: p.full_name || 'Unnamed User',
        entityType: 'user' as const,
        avatarUrl: p.avatar_url || null,
        label: `${p.full_name || 'Unnamed User'} (Team)`,
      }));

    // Get company suggestions
    const companySuggestions = (companies || [])
      .filter(c => c.name.toLowerCase().includes(searchTerm))
      .slice(0, 2)
      .map(c => ({
        id: c.id,
        name: c.name,
        entityType: 'company' as const,
        logoUrl: (c as any).logo_url || null,
        label: `${c.name} (Portfolio)`,
      }));

    // Get deal suggestions
    const dealSuggestions = (deals || [])
      .filter(d => d.name.toLowerCase().includes(searchTerm))
      .slice(0, 2)
      .map(d => ({
        id: d.id,
        name: d.name,
        entityType: 'deal' as const,
        logoUrl: (d as any).logo_url || null,
        label: `${d.name} (Pipeline)`,
      }));

    return [...userSuggestions, ...companySuggestions, ...dealSuggestions].slice(0, 5);
  }, [profiles, companies, deals]);

  const createActivitiesFromMentions = useCallback(async (
    content: string,
    mentions: CompanyMention[],
    title?: string
  ) => {
    if (mentions.length === 0) return;

    setIsProcessing(true);
    try {
      // Create one activity for each mentioned company or deal
      for (const mention of mentions) {
        await logActivity({
          activity_type: 'note',
          subject: title || `Journal entry about ${mention.companyName}`,
          body: content,
          associations: [{
            entity_type: mention.entityType,
            entity_id: mention.companyId,
          }],
        });
      }
    } finally {
      setIsProcessing(false);
    }
  }, [logActivity]);

  const createTasksFromUserMentions = useCallback(async (
    content: string,
    mentions: UserMention[],
    title?: string
  ) => {
    if (mentions.length === 0) return;

    setIsProcessing(true);
    try {
      // Create a task for each mentioned user
      for (const mention of mentions) {
        createTask({
          title: title || 'You were mentioned in a journal entry',
          description: `${content.substring(0, 200)}${content.length > 200 ? '...' : ''}`,
          status: 'pending',
          priority: 'medium',
          assigned_to: mention.userId,
        });
      }
    } finally {
      setIsProcessing(false);
    }
  }, [createTask]);

  return {
    parseMentions,
    parseUserMentions,
    getSuggestions,
    createActivitiesFromMentions,
    createTasksFromUserMentions,
    isProcessing,
  };
}
