-- ============================================================================
-- RLS POLICIES: credits
-- DESCRIPTION: Row Level Security policies for credits table
-- DEPENDENCIES: credits table, organization helper functions
-- BREAKING CHANGES: None
-- ROLLBACK: DROP POLICY statements for each policy
-- ============================================================================

-- ============================================================================
-- SELECT POLICIES
-- ============================================================================

-- Policy: Users can view their own credits
CREATE POLICY "credits_select_own_credits" ON public.credits
    FOR SELECT
    USING (
        auth.uid() = user_id 
    );

-- ============================================================================
-- SERVICE ROLE POLICIES (for RPC functions)
-- ============================================================================

-- Policy: Allow service_role full access for RPC operations
CREATE POLICY "credits_service_role_all" ON public.credits
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- POLICY COMMENTS
-- ============================================================================

COMMENT ON POLICY "credits_select_own_credits" ON public.credits IS 
    'Users can view their own credit balances';

COMMENT ON POLICY "credits_service_role_all" ON public.credits IS 
    'Allow service_role full access for secure RPC operations (credit transfers, purchases, etc.)';
