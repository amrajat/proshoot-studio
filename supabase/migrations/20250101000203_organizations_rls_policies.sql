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
    USING (
        id IN (
            SELECT organization_id 
            FROM public.members 
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Organization admins can update organization settings
CREATE POLICY "organizations_admins_update" ON public.organizations
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM public.members om
            WHERE om.organization_id = organizations.id
            AND om.user_id = auth.uid()
            AND om.role = 'ADMIN'::public.organization_role
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.members om
            WHERE om.organization_id = organizations.id
            AND om.user_id = auth.uid()
            AND om.role = 'ADMIN'::public.organization_role
        )
    );

-- ============================================================================
-- members TABLE POLICIES
-- ============================================================================

-- Policy: Users can view their own memberships
CREATE POLICY "members_select_own" ON public.members
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Organization admins can view all members of their organizations
CREATE POLICY "members_admins_select_all" ON public.members
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.members admin_mem
            WHERE admin_mem.organization_id = members.organization_id
            AND admin_mem.user_id = auth.uid()
            AND admin_mem.role = 'ADMIN'::public.organization_role
        )
    );

-- Policy: Organization admins can add new members
CREATE POLICY "members_admins_insert" ON public.members
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.members admin_mem
            WHERE admin_mem.organization_id = members.organization_id
            AND admin_mem.user_id = auth.uid()
            AND admin_mem.role = 'ADMIN'::public.organization_role
        )
    );

-- Policy: Organization admins can update member roles
CREATE POLICY "members_admins_update" ON public.members
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM public.members admin_mem
            WHERE admin_mem.organization_id = members.organization_id
            AND admin_mem.user_id = auth.uid()
            AND admin_mem.role = 'ADMIN'::public.organization_role
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.members admin_mem
            WHERE admin_mem.organization_id = members.organization_id
            AND admin_mem.user_id = auth.uid()
            AND admin_mem.role = 'ADMIN'::public.organization_role
        )
    );

-- Policy: Organization admins can remove members, users can remove themselves
CREATE POLICY "members_delete" ON public.members
    FOR DELETE
    USING (
        -- User can remove themselves
        auth.uid() = user_id
        OR
        -- Organization admins can remove any member
        EXISTS (
            SELECT 1
            FROM public.members admin_mem
            WHERE admin_mem.organization_id = members.organization_id
            AND admin_mem.user_id = auth.uid()
            AND admin_mem.role = 'ADMIN'::public.organization_role
        )
    );

-- ============================================================================
-- POLICY COMMENTS
-- ============================================================================

COMMENT ON POLICY "organizations_owner_full_access" ON public.organizations IS 
    'Organization owners have complete access to their organization';

COMMENT ON POLICY "organizations_members_select" ON public.organizations IS 
    'Organization members can view basic organization information';

COMMENT ON POLICY "organizations_admins_update" ON public.organizations IS 
    'Organization admins can update organization settings';

COMMENT ON POLICY "members_select_own" ON public.members IS 
    'Users can view their own organization memberships';

COMMENT ON POLICY "members_admins_select_all" ON public.members IS 
    'Organization admins can view all members of their organizations';

COMMENT ON POLICY "members_admins_insert" ON public.members IS 
    'Organization admins can add new members to their organizations';

COMMENT ON POLICY "members_admins_update" ON public.members IS 
    'Organization admins can update member roles in their organizations';

COMMENT ON POLICY "members_delete" ON public.members IS 
    'Users can leave organizations, admins can remove members';
