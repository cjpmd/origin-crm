import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useLinkedInData() {
  const [fetching, setFetching] = useState(false);
  const { toast } = useToast();

  const fetchLinkedInData = async (linkedinUrl: string, entityType: 'contact' | 'company', entityId: string) => {
    if (!linkedinUrl || !entityId) return;

    setFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-linkedin-data', {
        body: { linkedinUrl, entityType, entityId }
      });

      if (error) throw error;

      if (data?.data?.message) {
        toast({
          title: 'LinkedIn Integration',
          description: data.data.message,
        });
      }

      return data;
    } catch (error: any) {
      console.error('Error fetching LinkedIn data:', error);
      toast({
        title: 'LinkedIn Fetch Error',
        description: error.message || 'Failed to fetch LinkedIn data',
        variant: 'destructive',
      });
    } finally {
      setFetching(false);
    }
  };

  return {
    fetchLinkedInData,
    fetching,
  };
}
