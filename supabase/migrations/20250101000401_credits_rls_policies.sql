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

-- Policy: Users can view their own personal credits
CREATE POLICY "credits_select_own_personal" ON public.credits
    FOR SELECT
    USING (
        auth.uid() = user_id 
        AND organization_id IS NULL
    );

-- Policy: Users can view credits for organizations they belong to
CREATE POLICY "credits_select_org_members" ON public.credits
    FOR SELECT
    USING (
        auth.uid() = user_id 
        AND organization_id IS NOT NULL
        AND is_org_member(organization_id)
    );

-- Policy: Organization admins can view organization credit pools
CREATE POLICY "credits_select_org_pool" ON public.credits
    FOR SELECT
    USING (
        organization_id IS NOT NULL
        AND is_org_admin(organization_id)
    );

-- ============================================================================
-- INSERT POLICIES
-- ============================================================================

-- Policy: System can create personal credits (via trigger)
CREATE POLICY "credits_insert_personal" ON public.credits
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND organization_id IS NULL
    );

-- Policy: Organization admins can create organization credit pools
CREATE POLICY "credits_insert_org_pool" ON public.credits
    FOR INSERT
    WITH CHECK (
        organization_id IS NOT NULL
        AND is_org_admin(organization_id)
    );

-- ============================================================================
-- UPDATE POLICIES
-- ============================================================================

-- Policy: Users can update their own personal credits
CREATE POLICY "credits_update_own_personal" ON public.credits
    FOR UPDATE
    USING (
        auth.uid() = user_id
        AND organization_id IS NULL
    )
    WITH CHECK (
        auth.uid() = user_id
        AND organization_id IS NULL
    );

-- Policy: Organization admins can update organization credits
CREATE POLICY "credits_update_org_admin" ON public.credits
    FOR UPDATE
    USING (
        organization_id IS NOT NULL
        AND is_org_admin(organization_id)
    )
    WITH CHECK (
        organization_id IS NOT NULL
        AND is_org_admin(organization_id)
    );

-- ============================================================================
-- DELETE POLICIES
-- ============================================================================

-- Policy: Only service role can delete credits (for cleanup)
CREATE POLICY "credits_delete_service_only" ON public.credits
    FOR DELETE
    USING (auth.role() = 'service_role');

-- ============================================================================
-- POLICY COMMENTS
-- ============================================================================

COMMENT ON POLICY "credits_select_own_personal" ON public.credits IS 
    'Users can view their own personal credit balances';

COMMENT ON POLICY "credits_select_org_members" ON public.credits IS 
    'Organization members can view their organization-specific credits';

COMMENT ON POLICY "credits_select_org_pool" ON public.credits IS 
    'Organization admins can view the organization credit pool';

COMMENT ON POLICY "credits_insert_personal" ON public.credits IS 
    'Allow creation of personal credit records (typically via trigger)';

COMMENT ON POLICY "credits_insert_org_pool" ON public.credits IS 
    'Organization admins can create organization credit pools';

COMMENT ON POLICY "credits_update_own_personal" ON public.credits IS 
    'Users can update their own personal credit balances';

COMMENT ON POLICY "credits_update_org_admin" ON public.credits IS 
    'Organization admins can manage organization credit balances';

COMMENT ON POLICY "credits_delete_service_only" ON public.credits IS 
    'Only service role can delete credit records for cleanup purposes';
