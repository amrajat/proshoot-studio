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

-- ============================================================================
-- SERVICE ROLE POLICIES (for webhook operations)
-- ============================================================================

-- Policy: Allow service_role to insert purchases via webhooks
CREATE POLICY "purchases_service_role_insert" ON public.purchases
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- Policy: Allow service_role to update purchases via webhooks
CREATE POLICY "purchases_service_role_update" ON public.purchases
    FOR UPDATE
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Add policy comments
COMMENT ON POLICY "purchases_select_own" ON public.purchases IS 'Allow users to read their own purchases';
COMMENT ON POLICY "purchases_service_role_insert" ON public.purchases IS 'Allow service_role to create purchases via webhook operations';
COMMENT ON POLICY "purchases_service_role_update" ON public.purchases IS 'Allow service_role to update purchases via webhook operations';
