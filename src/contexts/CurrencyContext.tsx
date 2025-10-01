import React, { createContext, useContext, useEffect, useState } from 'react';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  formatCurrency: (amount: number | null | undefined) => string;
  currencySymbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'CHF',
  CNY: '¥',
  INR: '₹',
};

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { profile, upsertProfile } = useCompanyProfile();
  const [currency, setCurrencyState] = useState(profile?.currency_preference || 'USD');

  useEffect(() => {
    if (profile?.currency_preference) {
      setCurrencyState(profile.currency_preference);
    }
  }, [profile?.currency_preference]);

  const setCurrency = async (newCurrency: string) => {
    setCurrencyState(newCurrency);
    await upsertProfile({ currency_preference: newCurrency });
  };

  const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return 'N/A';
    
    const symbol = currencySymbols[currency] || currency;
    
    // Format large numbers with M/B suffixes
    if (Math.abs(amount) >= 1000000000) {
      return `${symbol}${(amount / 1000000000).toFixed(1)}B`;
    }
    if (Math.abs(amount) >= 1000000) {
      return `${symbol}${(amount / 1000000).toFixed(1)}M`;
    }
    if (Math.abs(amount) >= 1000) {
      return `${symbol}${(amount / 1000).toFixed(0)}K`;
    }
    
    return `${symbol}${amount.toLocaleString('en-US', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 2 
    })}`;
  };

  const currencySymbol = currencySymbols[currency] || currency;

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency, currencySymbol }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
