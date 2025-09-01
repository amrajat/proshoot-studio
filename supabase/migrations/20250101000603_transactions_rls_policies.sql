-- =============================================
-- Migration: Transactions RLS Policies
-- Description: Row Level Security policies for transactions table
-- Author: Database Migration
-- Date: 2025-01-01
-- =============================================

-- Policy: Allow users to read their own personal transactions
CREATE POLICY "transactions_select_own" ON public.transactions
    FOR SELECT
    USING (
        auth.uid() = user_id
    );

-- Policy: Allow users to insert their own transactions (via function)
CREATE POLICY "transactions_insert_own" ON public.transactions
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
    );

-- ============================================================================
-- SERVICE ROLE POLICIES (for RPC functions)
-- ============================================================================

-- Policy: Allow service_role full access for RPC operations
CREATE POLICY "transactions_service_role_all" ON public.transactions
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Add policy comments
COMMENT ON POLICY "transactions_select_own" ON public.transactions IS 'Allow users to read their own personal transactions';
COMMENT ON POLICY "transactions_insert_own" ON public.transactions IS 'Allow users to insert their own transactions via RPC functions';
COMMENT ON POLICY "transactions_service_role_all" ON public.transactions IS 'Allow service_role full access for secure RPC operations (credit transfers, etc.)';