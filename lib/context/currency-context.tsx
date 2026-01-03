'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Currency, DEFAULT_CURRENCY, SUPPORTED_CURRENCIES } from '@/lib/types/currency';

const CURRENCY_STORAGE_KEY = 'preferred_currency';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  supportedCurrencies: Currency[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);
  const [mounted, setMounted] = useState(false);

  // Load currency from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (stored && SUPPORTED_CURRENCIES.includes(stored as Currency)) {
        setCurrencyState(stored as Currency);
      }
    } catch (error) {
      console.error('Failed to load currency from localStorage:', error);
    }
  }, []);

  // Save currency to localStorage when it changes
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
    } catch (error) {
      console.error('Failed to save currency to localStorage:', error);
    }
  };

  // Show default currency until mounted to avoid hydration mismatch
  const displayCurrency = mounted ? currency : DEFAULT_CURRENCY;

  return (
    <CurrencyContext.Provider
      value={{
        currency: displayCurrency,
        setCurrency,
        supportedCurrencies: SUPPORTED_CURRENCIES,
      }}
    >
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
