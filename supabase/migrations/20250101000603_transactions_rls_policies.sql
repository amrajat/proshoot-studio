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
        organization_id IS NULL 
        AND auth.uid() = user_id
    );

-- Policy: Allow organization admins to read organization transactions
CREATE POLICY "transactions_select_org_admin" ON public.transactions
    FOR SELECT
    USING (
        organization_id IS NOT NULL 
        AND is_org_admin(organization_id)
    );

-- Policy: Allow users to insert transactions for valid credit accounts
CREATE POLICY "transactions_insert_valid" ON public.transactions
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1
            FROM public.credits c
            WHERE c.id = transactions.credit_account_id
            AND (
                -- Personal credit account
                (transactions.organization_id IS NULL 
                 AND c.organization_id IS NULL 
                 AND c.user_id = transactions.user_id)
                OR
                -- Organization credit account (admin only)
                (transactions.organization_id IS NOT NULL 
                 AND c.user_id IS NULL 
                 AND c.organization_id = transactions.organization_id
                 AND is_org_admin(transactions.organization_id))
            )
        )
    );

-- Policy: No update access for transactions (immutable audit trail)
-- Policy: No delete access for transactions (immutable audit trail)

-- Add policy comments
COMMENT ON POLICY "transactions_select_own" ON public.transactions IS 'Allow users to read their own personal transactions';
COMMENT ON POLICY "transactions_select_org_admin" ON public.transactions IS 'Allow organization admins to read organization transactions';
COMMENT ON POLICY "transactions_insert_valid" ON public.transactions IS 'Allow users to create transactions for valid credit accounts they control';

-- =============================================
-- Rollback Instructions:
-- To rollback this migration, run:
-- DROP POLICY IF EXISTS "transactions_select_own" ON public.transactions;
-- DROP POLICY IF EXISTS "transactions_select_org_admin" ON public.transactions;
-- DROP POLICY IF EXISTS "transactions_insert_valid" ON public.transactions;
-- =============================================
