import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useStockPrice() {
  const [fetching, setFetching] = useState(false);
  const { toast } = useToast();

  const fetchStockPrice = async (ticker: string, companyId: string) => {
    if (!ticker || !companyId) return;

    setFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-stock-price', {
        body: { ticker, companyId }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Stock price updated for ${ticker}`,
      });

      return data;
    } catch (error: any) {
      console.error('Error fetching stock price:', error);
      toast({
        title: 'Stock Price Error',
        description: error.message || 'Failed to fetch stock price. Please check the ticker symbol.',
        variant: 'destructive',
      });
    } finally {
      setFetching(false);
    }
  };

  return {
    fetchStockPrice,
    fetching,
  };
}
