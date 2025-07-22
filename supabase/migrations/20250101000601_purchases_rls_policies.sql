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


-- Add policy comments
COMMENT ON POLICY "purchases_select_own" ON public.purchases IS 'Allow users to read their own purchases';
