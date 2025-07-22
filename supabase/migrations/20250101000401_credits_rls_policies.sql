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
-- POLICY COMMENTS
-- ============================================================================

COMMENT ON POLICY "credits_select_own_credits" ON public.credits IS 
    'Users can view their own credit balances';
