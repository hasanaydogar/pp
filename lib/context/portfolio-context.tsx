'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface Portfolio {
  id: string;
  name: string;
  base_currency: string;
  benchmark_symbol?: string | null;
  created_at: string;
  updated_at?: string | null;
}

interface PortfolioContextType {
  portfolios: Portfolio[];
  activePortfolioId: string | null;
  setActivePortfolioId: (id: string | null) => void;
  loading: boolean;
  refetch: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children, initialPortfolios, initialActiveId }: { 
  children: React.ReactNode;
  initialPortfolios: Portfolio[];
  initialActiveId?: string | null;
}) {
  const [portfolios, setPortfolios] = useState<Portfolio[]>(initialPortfolios);
  const [activePortfolioId, setActivePortfolioIdState] = useState<string | null>(
    initialActiveId || (initialPortfolios.length > 0 ? initialPortfolios[0].id : null)
  );
  const [loading, setLoading] = useState(false);

  // Load active portfolio from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('activePortfolioId');
    if (saved && portfolios.some(p => p.id === saved)) {
      setActivePortfolioIdState(saved);
    }
  }, []);

  // Save active portfolio to localStorage and cookie
  const setActivePortfolioId = (id: string | null) => {
    setActivePortfolioIdState(id);
    if (id) {
      localStorage.setItem('activePortfolioId', id);
      // Also set cookie for Server Components
      document.cookie = `activePortfolioId=${id}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    } else {
      localStorage.removeItem('activePortfolioId');
      // Remove cookie
      document.cookie = 'activePortfolioId=; path=/; max-age=0';
    }
  };

  const refetch = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/portfolios');
      if (response.ok) {
        const result = await response.json();
        // API returns { data: [...] } format
        const portfoliosList = Array.isArray(result) ? result : (result.data || []);
        setPortfolios(portfoliosList);
        // If active portfolio was deleted, reset to first portfolio
        if (activePortfolioId && !portfoliosList.some((p: Portfolio) => p.id === activePortfolioId)) {
          setActivePortfolioId(portfoliosList.length > 0 ? portfoliosList[0].id : null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch portfolios:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortfolioContext.Provider
      value={{
        portfolios,
        activePortfolioId,
        setActivePortfolioId,
        loading,
        refetch,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}

