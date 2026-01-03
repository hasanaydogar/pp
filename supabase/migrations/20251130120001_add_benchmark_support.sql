-- Enhanced Portfolio Tracker: Benchmark Support Migration
-- Created: 2025-11-30
-- Description: Adds benchmark symbol support to portfolios for performance comparison

-- ============================================================================
-- ADD BENCHMARK SYMBOL
-- ============================================================================

-- Add benchmark_symbol to portfolios table
ALTER TABLE portfolios 
ADD COLUMN benchmark_symbol TEXT;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN portfolios.benchmark_symbol IS 'Benchmark symbol for performance comparison (e.g., BIST100, XAUUSD, SP500)';

