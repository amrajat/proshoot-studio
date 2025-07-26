-- ============================================================================
-- ORGANIZATION HELPER FUNCTIONS
-- DESCRIPTION: Utility functions for organization membership and permissions
-- DEPENDENCIES: organizations, members tables
-- BREAKING CHANGES: None
-- ROLLBACK: DROP FUNCTION statements
-- ============================================================================

-- ============================================================================
-- FUNCTION: is_org_member
-- DESCRIPTION: Check if current user is a member of specified organization
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_org_member(org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    is_member BOOLEAN;
BEGIN
    -- Use SECURITY DEFINER to bypass RLS and prevent infinite recursion
    SELECT EXISTS (
        SELECT 1
        FROM public.members om
        WHERE om.organization_id = org_id
        AND om.user_id = auth.uid()
    ) INTO is_member;
    
    RETURN COALESCE(is_member, FALSE);
EXCEPTION
    WHEN others THEN
        RAISE WARNING 'Error in is_org_member for org % and user %: %', org_id, auth.uid(), SQLERRM;
        RETURN FALSE;
END;
$$;

-- ============================================================================
-- NOTE: is_org_admin function removed - using owner-only model
-- All organization permissions are now owner-based via is_org_owner()
-- ============================================================================

-- ============================================================================
-- FUNCTION: is_org_owner
-- DESCRIPTION: Check if current user is the owner of specified organization
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_org_owner(org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    is_owner BOOLEAN;
BEGIN
    -- Use SECURITY DEFINER to bypass RLS and prevent infinite recursion
    SELECT EXISTS (
        SELECT 1
        FROM public.organizations o
        WHERE o.id = org_id
        AND o.owner_user_id = auth.uid()
    ) INTO is_owner;
    
    RETURN COALESCE(is_owner, FALSE);
EXCEPTION
    WHEN others THEN
        RAISE WARNING 'Error in is_org_owner for org % and user %: %', org_id, auth.uid(), SQLERRM;
        RETURN FALSE;
END;
$$;

-- ============================================================================
-- FUNCTION: is_email_org_member
-- DESCRIPTION: Check if email belongs to a member of specified organization
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_email_org_member(p_email TEXT, p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    is_member BOOLEAN;
BEGIN
    -- Use SECURITY DEFINER to bypass RLS and prevent infinite recursion
    SELECT EXISTS (
        SELECT 1
        FROM public.members om
        JOIN public.profiles p ON om.user_id = p.user_id
        WHERE p.email = p_email
        AND om.organization_id = p_org_id
    ) INTO is_member;
    
    RETURN COALESCE(is_member, FALSE);
EXCEPTION
    WHEN others THEN
        RAISE WARNING 'Error in is_email_org_member for email % and org %: %', p_email, p_org_id, SQLERRM;
        RETURN FALSE;
END;
$$;



-- ============================================================================
-- FUNCTION OWNERSHIP AND COMMENTS
-- ============================================================================

ALTER FUNCTION public.is_org_member(UUID) OWNER TO postgres;
ALTER FUNCTION public.is_org_owner(UUID) OWNER TO postgres;
ALTER FUNCTION public.is_email_org_member(TEXT, UUID) OWNER TO postgres;

COMMENT ON FUNCTION public.is_org_member(UUID) IS 
    'Check if current authenticated user is a member of the specified organization';

COMMENT ON FUNCTION public.is_org_owner(UUID) IS 
    'Check if current authenticated user is the owner of the specified organization';

COMMENT ON FUNCTION public.is_email_org_member(TEXT, UUID) IS 
    'Check if the provided email belongs to a member of the specified organization';

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Grant execute permissions to all roles
GRANT EXECUTE ON FUNCTION public.is_org_member(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_org_owner(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_email_org_member(TEXT, UUID) TO anon, authenticated, service_role;
