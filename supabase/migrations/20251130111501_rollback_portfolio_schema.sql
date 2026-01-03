-- Rollback Migration: Portfolio Tracker Database Schema
-- Created: 2025-11-30
-- Description: Drops all tables, indexes, policies, and ENUMs created by portfolio schema migration

-- ============================================================================
-- DROP RLS POLICIES
-- ============================================================================

-- Drop transactions policies
DROP POLICY IF EXISTS "Users can delete transactions for their assets" ON transactions;
DROP POLICY IF EXISTS "Users can update transactions for their assets" ON transactions;
DROP POLICY IF EXISTS "Users can create transactions for their assets" ON transactions;
DROP POLICY IF EXISTS "Users can view transactions for their assets" ON transactions;

-- Drop assets policies
DROP POLICY IF EXISTS "Users can delete assets in their portfolios" ON assets;
DROP POLICY IF EXISTS "Users can update assets in their portfolios" ON assets;
DROP POLICY IF EXISTS "Users can create assets in their portfolios" ON assets;
DROP POLICY IF EXISTS "Users can view assets in their portfolios" ON assets;

-- Drop portfolios policies
DROP POLICY IF EXISTS "Users can delete their own portfolios" ON portfolios;
DROP POLICY IF EXISTS "Users can update their own portfolios" ON portfolios;
DROP POLICY IF EXISTS "Users can create their own portfolios" ON portfolios;
DROP POLICY IF EXISTS "Users can view their own portfolios" ON portfolios;

-- ============================================================================
-- DROP TABLES (in reverse order due to foreign keys)
-- ============================================================================

DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS portfolios CASCADE;

-- ============================================================================
-- DROP ENUM TYPES
-- ============================================================================

DROP TYPE IF EXISTS transaction_type;
DROP TYPE IF EXISTS asset_type;

