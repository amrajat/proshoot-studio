-- =============================================
-- Migration: Purchases RLS Policies
-- Description: Row Level Security policies for purchases table
-- Author: Database Migration
-- Date: 2025-01-01
-- =============================================

-- Policy: Allow users to read their own purchases
CREATE POLICY "purchases_select_own" ON public.purchases
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Allow organization admins to read organization purchases
CREATE POLICY "purchases_select_org_admin" ON public.purchases
    FOR SELECT
    USING (
        organization_id IS NOT NULL 
        AND is_org_admin(organization_id)
    );

-- Policy: Allow users to insert their own purchases
CREATE POLICY "purchases_insert_own" ON public.purchases
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND (
            organization_id IS NULL 
            OR is_org_admin(organization_id)
        )
    );

-- Policy: Allow users to update their own purchases (limited fields)
CREATE POLICY "purchases_update_own" ON public.purchases
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Allow organization admins to update organization purchases
CREATE POLICY "purchases_update_org_admin" ON public.purchases
    FOR UPDATE
    USING (
        organization_id IS NOT NULL 
        AND is_org_admin(organization_id)
    )
    WITH CHECK (
        organization_id IS NOT NULL 
        AND is_org_admin(organization_id)
    );

-- Policy: No delete access for regular users (admin only via service role)
-- Purchases should be kept for audit purposes

-- Add policy comments
COMMENT ON POLICY "purchases_select_own" ON public.purchases IS 'Allow users to read their own purchases';
COMMENT ON POLICY "purchases_select_org_admin" ON public.purchases IS 'Allow organization admins to read organization purchases';
COMMENT ON POLICY "purchases_insert_own" ON public.purchases IS 'Allow users to create purchases for themselves or their organizations';
COMMENT ON POLICY "purchases_update_own" ON public.purchases IS 'Allow users to update their own purchases (limited fields)';
COMMENT ON POLICY "purchases_update_org_admin" ON public.purchases IS 'Allow organization admins to update organization purchases (limited fields)';

-- =============================================
-- Rollback Instructions:
-- To rollback this migration, run:
-- DROP POLICY IF EXISTS "purchases_select_own" ON public.purchases;
-- DROP POLICY IF EXISTS "purchases_select_org_admin" ON public.purchases;
-- DROP POLICY IF EXISTS "purchases_insert_own" ON public.purchases;
-- DROP POLICY IF EXISTS "purchases_update_own" ON public.purchases;
-- DROP POLICY IF EXISTS "purchases_update_org_admin" ON public.purchases;
-- =============================================
