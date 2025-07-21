-- ============================================================================
-- RLS POLICIES: studios
-- DESCRIPTION: Row Level Security policies for studios table
-- DEPENDENCIES: studios table, organization helper functions
-- BREAKING CHANGES: None
-- ROLLBACK: DROP POLICY statements for each policy
-- ============================================================================

-- ============================================================================
-- SELECT POLICIES
-- ============================================================================

-- Policy: Users can view their own studios
CREATE POLICY "studios_select_own" ON public.studios
    FOR SELECT
    USING (auth.uid() = creator_user_id);

-- Policy: Organization members can view organization studios
CREATE POLICY "studios_select_org_members" ON public.studios
    FOR SELECT
    USING (
        organization_id IS NOT NULL
        AND is_org_member(organization_id)
    );

-- ============================================================================
-- INSERT POLICIES
-- ============================================================================

-- Policy: Users can create their own studios
CREATE POLICY "studios_insert_own" ON public.studios
    FOR INSERT
    WITH CHECK (auth.uid() = creator_user_id);

-- Policy: Organization members can create studios for their organization
CREATE POLICY "studios_insert_org_members" ON public.studios
    FOR INSERT
    WITH CHECK (
        auth.uid() = creator_user_id
        AND (
            organization_id IS NULL
            OR is_org_member(organization_id)
        )
    );

-- ============================================================================
-- UPDATE POLICIES
-- ============================================================================

-- Policy: Users can update their own studios
CREATE POLICY "studios_update_own" ON public.studios
    FOR UPDATE
    USING (auth.uid() = creator_user_id)
    WITH CHECK (auth.uid() = creator_user_id);

-- Policy: Organization admins can update organization studios
CREATE POLICY "studios_update_org_admins" ON public.studios
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

-- Policy: Users can delete their own studios
CREATE POLICY "studios_delete_own" ON public.studios
    FOR DELETE
    USING (auth.uid() = creator_user_id);

-- Policy: Organization admins can delete organization studios
CREATE POLICY "studios_delete_org_admins" ON public.studios
    FOR DELETE
    USING (
        organization_id IS NOT NULL
        AND is_org_admin(organization_id)
    );

-- ============================================================================
-- POLICY COMMENTS
-- ============================================================================

COMMENT ON POLICY "studios_select_own" ON public.studios IS 
    'Users can view studios they created';

COMMENT ON POLICY "studios_select_org_members" ON public.studios IS 
    'Organization members can view studios created within their organization';

COMMENT ON POLICY "studios_insert_own" ON public.studios IS 
    'Users can create new studios';

COMMENT ON POLICY "studios_insert_org_members" ON public.studios IS 
    'Organization members can create studios for their organization';

COMMENT ON POLICY "studios_update_own" ON public.studios IS 
    'Users can update studios they created';

COMMENT ON POLICY "studios_update_org_admins" ON public.studios IS 
    'Organization admins can update any studio in their organization';

COMMENT ON POLICY "studios_delete_own" ON public.studios IS 
    'Users can delete studios they created';

COMMENT ON POLICY "studios_delete_org_admins" ON public.studios IS 
    'Organization admins can delete any studio in their organization';
