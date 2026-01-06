import { 
  ProjectionResult, 
  ProjectionScenario, 
  ProjectionParams,
  DEFAULT_PROJECTION_PERIODS,
  SCENARIO_ADJUSTMENTS 
} from '@/lib/types/portfolio-settings';

// ============================================================================
// CORE CALCULATIONS
// ============================================================================

/**
 * Calculate future value using compound interest with regular contributions
 * 
 * Formula: FV = PV × (1 + r)^n + PMT × [((1 + r)^n - 1) / r]
 * 
 * Where:
 * - FV = Future Value
 * - PV = Present Value (current portfolio value)
 * - r = Monthly interest rate (annual / 12)
 * - n = Number of months
 * - PMT = Monthly contribution
 */
export function calculateFutureValue(
  currentValue: number,
  monthlyInvestment: number,
  annualReturnRate: number,
  years: number
): number {
  const monthlyRate = annualReturnRate / 12;
  const months = years * 12;
  
  if (monthlyRate === 0) {
    // No growth, just sum of current + contributions
    return currentValue + (monthlyInvestment * months);
  }
  
  // Future value of current portfolio
  const fvCurrentPortfolio = currentValue * Math.pow(1 + monthlyRate, months);
  
  // Future value of monthly contributions (annuity)
  const fvContributions = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  
  return fvCurrentPortfolio + fvContributions;
}

/**
 * Calculate monthly withdrawable income using the 4% rule (or custom rate)
 * 
 * Monthly Income = (Portfolio Value × Withdrawal Rate) / 12
 */
export function calculateMonthlyIncome(
  portfolioValue: number,
  withdrawalRate: number = 0.04
): number {
  return (portfolioValue * withdrawalRate) / 12;
}

/**
 * Calculate total invested amount over a period
 */
export function calculateTotalInvested(
  currentValue: number,
  monthlyInvestment: number,
  years: number
): number {
  return currentValue + (monthlyInvestment * years * 12);
}

/**
 * Calculate total returns (growth beyond contributions)
 */
export function calculateTotalReturns(
  futureValue: number,
  totalInvested: number
): number {
  return futureValue - totalInvested;
}

// ============================================================================
// PROJECTION GENERATORS
// ============================================================================

/**
 * Generate projections for multiple time periods
 */
export function generateProjections(
  currentValue: number,
  monthlyInvestment: number,
  annualReturnRate: number,
  withdrawalRate: number,
  periods: number[] = DEFAULT_PROJECTION_PERIODS
): ProjectionResult[] {
  return periods.map(years => {
    const futureValue = calculateFutureValue(
      currentValue,
      monthlyInvestment,
      annualReturnRate,
      years
    );
    
    const totalInvested = calculateTotalInvested(
      currentValue,
      monthlyInvestment,
      years
    );
    
    const totalReturns = calculateTotalReturns(futureValue, totalInvested);
    const monthlyIncome = calculateMonthlyIncome(futureValue, withdrawalRate);
    
    return {
      years,
      future_value: Math.round(futureValue),
      total_invested: Math.round(totalInvested),
      total_returns: Math.round(totalReturns),
      monthly_income: Math.round(monthlyIncome),
    };
  });
}

/**
 * Generate scenario analysis with optimistic, base, and pessimistic projections
 * 
 * - Optimistic: base rate + 2%
 * - Pessimistic: base rate - 2%
 */
export function generateScenarios(
  currentValue: number,
  monthlyInvestment: number,
  annualReturnRate: number,
  withdrawalRate: number,
  periods: number[] = DEFAULT_PROJECTION_PERIODS
): ProjectionScenario {
  const optimisticRate = Math.min(annualReturnRate + SCENARIO_ADJUSTMENTS.optimistic, 0.50);
  const pessimisticRate = Math.max(annualReturnRate + SCENARIO_ADJUSTMENTS.pessimistic, 0);
  
  return {
    optimistic: generateProjections(
      currentValue,
      monthlyInvestment,
      optimisticRate,
      withdrawalRate,
      periods
    ),
    base: generateProjections(
      currentValue,
      monthlyInvestment,
      annualReturnRate,
      withdrawalRate,
      periods
    ),
    pessimistic: generateProjections(
      currentValue,
      monthlyInvestment,
      pessimisticRate,
      withdrawalRate,
      periods
    ),
  };
}

// ============================================================================
// CHART DATA HELPERS
// ============================================================================

/**
 * Generate data points for a smooth projection chart
 * Returns yearly data points for chart rendering
 */
export function generateChartData(
  currentValue: number,
  monthlyInvestment: number,
  annualReturnRate: number,
  maxYears: number = 25
): { year: number; value: number }[] {
  const data: { year: number; value: number }[] = [];
  
  for (let year = 0; year <= maxYears; year++) {
    const value = calculateFutureValue(
      currentValue,
      monthlyInvestment,
      annualReturnRate,
      year
    );
    data.push({ year, value: Math.round(value) });
  }
  
  return data;
}

/**
 * Generate chart data for all scenarios
 */
export function generateScenarioChartData(
  currentValue: number,
  monthlyInvestment: number,
  annualReturnRate: number,
  maxYears: number = 25
): {
  year: number;
  optimistic: number;
  base: number;
  pessimistic: number;
}[] {
  const optimisticRate = Math.min(annualReturnRate + SCENARIO_ADJUSTMENTS.optimistic, 0.50);
  const pessimisticRate = Math.max(annualReturnRate + SCENARIO_ADJUSTMENTS.pessimistic, 0);
  
  const data: {
    year: number;
    optimistic: number;
    base: number;
    pessimistic: number;
  }[] = [];
  
  for (let year = 0; year <= maxYears; year++) {
    data.push({
      year,
      optimistic: Math.round(calculateFutureValue(currentValue, monthlyInvestment, optimisticRate, year)),
      base: Math.round(calculateFutureValue(currentValue, monthlyInvestment, annualReturnRate, year)),
      pessimistic: Math.round(calculateFutureValue(currentValue, monthlyInvestment, pessimisticRate, year)),
    });
  }
  
  return data;
}

// ============================================================================
// FORMATTING HELPERS
// ============================================================================

/**
 * Format percentage for display
 */
export function formatPercent(value: number): string {
  return `%${(value * 100).toFixed(1)}`;
}

/**
 * Format years for display
 */
export function formatYears(years: number): string {
  return years === 1 ? '1 Yıl' : `${years} Yıl`;
}
