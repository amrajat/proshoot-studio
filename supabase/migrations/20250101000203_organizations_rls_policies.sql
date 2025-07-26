-- ============================================================================
-- RLS POLICIES: organizations and members
-- DESCRIPTION: Row Level Security policies for organization tables
-- DEPENDENCIES: organizations, members tables, helper functions
-- BREAKING CHANGES: None
-- ROLLBACK: DROP POLICY statements for each policy
-- ============================================================================

-- ============================================================================
-- ORGANIZATIONS TABLE POLICIES
-- ============================================================================

-- Policy: Organization owners have full access to their organization
CREATE POLICY "organizations_owner_full_access" ON public.organizations
    FOR ALL
    USING (auth.uid() = owner_user_id)
    WITH CHECK (auth.uid() = owner_user_id);

-- Policy: Organization members can view their organizations
CREATE POLICY "organizations_members_select" ON public.organizations
    FOR SELECT
    USING (is_org_member(id));

-- Policy: Organization owners can update organization settings
CREATE POLICY "organizations_owner_update" ON public.organizations
    FOR UPDATE
    USING (auth.uid() = owner_user_id)
    WITH CHECK (auth.uid() = owner_user_id);

-- ============================================================================
-- members TABLE POLICIES
-- ============================================================================

-- Policy: Users can view their own memberships
CREATE POLICY "members_select_own" ON public.members
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Organization owners can view all members of their organizations
CREATE POLICY "members_owners_select_all" ON public.members
    FOR SELECT
    USING (is_org_owner(organization_id));

-- Policy: Organization owners can add new members
CREATE POLICY "members_owners_insert" ON public.members
    FOR INSERT
    WITH CHECK (is_org_owner(organization_id));

-- Policy: Organization owners can update member roles
CREATE POLICY "members_owners_update" ON public.members
    FOR UPDATE
    USING (is_org_owner(organization_id))
    WITH CHECK (is_org_owner(organization_id));

-- Policy: Organization owners can remove members, users can remove themselves
CREATE POLICY "members_delete" ON public.members
    FOR DELETE
    USING (
        -- User can remove themselves
        auth.uid() = user_id
        OR
        -- Organization owners can remove any member
        is_org_owner(organization_id)
    );

-- ============================================================================
-- POLICY COMMENTS
-- ============================================================================

COMMENT ON POLICY "organizations_owner_full_access" ON public.organizations IS 
    'Organization owners have complete access to their organization';

COMMENT ON POLICY "organizations_members_select" ON public.organizations IS 
    'Organization members can view basic organization information';

COMMENT ON POLICY "organizations_owner_update" ON public.organizations IS 
    'Organization owners can update organization settings';

COMMENT ON POLICY "members_select_own" ON public.members IS 
    'Users can view their own organization memberships';

COMMENT ON POLICY "members_owners_select_all" ON public.members IS 
    'Organization owners can view all members of their organizations';

COMMENT ON POLICY "members_owners_insert" ON public.members IS 
    'Organization owners can add new members to their organizations';

COMMENT ON POLICY "members_owners_update" ON public.members IS 
    'Organization owners can update member roles in their organizations';

COMMENT ON POLICY "members_delete" ON public.members IS 
    'Users can leave organizations, owners can remove members';
