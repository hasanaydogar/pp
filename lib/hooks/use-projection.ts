'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  PortfolioSettings, 
  ProjectionResult, 
  ProjectionScenario,
  DEFAULT_PORTFOLIO_SETTINGS,
  DEFAULT_PROJECTION_PERIODS,
} from '@/lib/types/portfolio-settings';
import { 
  generateProjections, 
  generateScenarios, 
  generateScenarioChartData 
} from '@/lib/utils/projection';

interface UseProjectionResult {
  // Data
  currentValue: number;
  settings: PortfolioSettings | null;
  projections: ProjectionResult[];
  scenarios: ProjectionScenario | null;
  chartData: { year: number; optimistic: number; base: number; pessimistic: number }[];
  
  // State
  loading: boolean;
  saving: boolean;
  error: Error | null;
  
  // Actions
  refetch: () => Promise<void>;
  updateSettings: (settings: Partial<PortfolioSettings>) => Promise<void>;
  
  // Local state for settings (for immediate UI updates)
  localSettings: {
    monthlyInvestment: number;
    expectedReturnRate: number;
    withdrawalRate: number;
    includeDividends: boolean;
  };
  setLocalSettings: (settings: Partial<{
    monthlyInvestment: number;
    expectedReturnRate: number;
    withdrawalRate: number;
    includeDividends: boolean;
  }>) => void;
}

export function useProjection(portfolioId: string | null): UseProjectionResult {
  const [currentValue, setCurrentValue] = useState(0);
  const [settings, setSettings] = useState<PortfolioSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Local settings state for immediate UI feedback
  const [localSettings, setLocalSettingsState] = useState({
    monthlyInvestment: DEFAULT_PORTFOLIO_SETTINGS.monthly_investment,
    expectedReturnRate: DEFAULT_PORTFOLIO_SETTINGS.expected_return_rate,
    withdrawalRate: DEFAULT_PORTFOLIO_SETTINGS.withdrawal_rate,
    includeDividends: DEFAULT_PORTFOLIO_SETTINGS.include_dividends_in_projection,
  });

  const fetchData = useCallback(async () => {
    if (!portfolioId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch projection data
      const res = await fetch(
        `/api/portfolios/${portfolioId}/projection?include_scenarios=true&include_chart_data=true`
      );
      
      if (!res.ok) {
        throw new Error('Failed to fetch projection data');
      }
      
      const data = await res.json();
      setCurrentValue(data.data.current_value);
      
      // Update local settings from server
      if (data.data.settings) {
        setLocalSettingsState({
          monthlyInvestment: data.data.settings.monthly_investment,
          expectedReturnRate: data.data.settings.expected_return_rate,
          withdrawalRate: data.data.settings.withdrawal_rate,
          includeDividends: data.data.settings.include_dividends,
        });
      }

      // Fetch settings
      const settingsRes = await fetch(`/api/portfolios/${portfolioId}/settings`);
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [portfolioId]);

  const updateSettings = useCallback(
    async (newSettings: Partial<PortfolioSettings>) => {
      if (!portfolioId) {
        throw new Error('Portfolio ID is required');
      }

      setSaving(true);

      try {
        const res = await fetch(`/api/portfolios/${portfolioId}/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSettings),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Failed to save settings');
        }

        const data = await res.json();
        setSettings(data.data);
      } catch (err) {
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [portfolioId]
  );

  const setLocalSettings = useCallback(
    (updates: Partial<typeof localSettings>) => {
      setLocalSettingsState(prev => ({ ...prev, ...updates }));
    },
    []
  );

  // Calculate projections from local settings
  const { projections, scenarios, chartData } = useMemo(() => {
    const projections = generateProjections(
      currentValue,
      localSettings.monthlyInvestment,
      localSettings.expectedReturnRate,
      localSettings.withdrawalRate,
      DEFAULT_PROJECTION_PERIODS
    );

    const scenarios = generateScenarios(
      currentValue,
      localSettings.monthlyInvestment,
      localSettings.expectedReturnRate,
      localSettings.withdrawalRate,
      DEFAULT_PROJECTION_PERIODS
    );

    const chartData = generateScenarioChartData(
      currentValue,
      localSettings.monthlyInvestment,
      localSettings.expectedReturnRate,
      25
    );

    return { projections, scenarios, chartData };
  }, [currentValue, localSettings]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    currentValue,
    settings,
    projections,
    scenarios,
    chartData,
    loading,
    saving,
    error,
    refetch: fetchData,
    updateSettings,
    localSettings,
    setLocalSettings,
  };
}
