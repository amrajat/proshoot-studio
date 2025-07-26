-- ============================================================================
-- AUTH FUNCTIONS AND TRIGGERS
-- DESCRIPTION: Functions and triggers for user authentication and profile management
-- DEPENDENCIES: profiles table, auth.users
-- BREAKING CHANGES: None
-- ROLLBACK: DROP TRIGGER, DROP FUNCTION statements
-- ============================================================================

-- ============================================================================
-- FUNCTION: handle_new_user
-- DESCRIPTION: Creates a profile when a new user signs up
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    -- 1. Insert new profile for the user
    INSERT INTO public.profiles (
        user_id,
        full_name,
        avatar_url,
        email
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
        COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture'),
        NEW.email
    );
    
    -- 2. Create default organization for the user
    INSERT INTO public.organizations (
        owner_user_id,
        name,
        team_size
    )
    VALUES (
        NEW.id,
        'Your Awesome Company',
        2
    );
    
    -- 3. Initialize credits for the user with organization_id
    INSERT INTO public.credits (user_id, organization_id)
    SELECT 
        NEW.id,
        o.id
    FROM public.organizations o
    WHERE o.owner_user_id = NEW.id;
    
    -- 4. Add user as owner member of their organization
    INSERT INTO public.members (
        user_id,
        organization_id,
        role
    )
    SELECT 
        NEW.id,
        o.id,
        'OWNER'::public.organization_role
    FROM public.organizations o
    WHERE o.owner_user_id = NEW.id;
    
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Log error but don't fail user creation
        RAISE WARNING 'Failed to setup user account for %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- ============================================================================
-- FUNCTION: handle_updated_at
-- DESCRIPTION: Updates the updated_at timestamp on profile changes
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Create profile when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Update timestamp on profile changes
CREATE TRIGGER on_profiles_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- FUNCTION OWNERSHIP AND COMMENTS
-- ============================================================================

ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
ALTER FUNCTION public.handle_updated_at() OWNER TO postgres;

COMMENT ON FUNCTION public.handle_new_user() IS 
    'Creates profile, initializes credits, and creates default organization when user signs up';

COMMENT ON FUNCTION public.handle_updated_at() IS 
    'Updates updated_at timestamp on profile changes';

-- ============================================================================
-- RPC FUNCTION: update_organization
-- DESCRIPTION: Allow users to update their organization details
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_organization(
    p_name TEXT,
    p_team_size INTEGER DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_org_id UUID;
BEGIN
    -- Get user's organization ID
    SELECT id INTO v_org_id
    FROM public.organizations
    WHERE owner_user_id = auth.uid();
    
    -- Check if organization exists
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Organization not found for user';
    END IF;
    
    -- Update organization details
    UPDATE public.organizations
    SET 
        name = p_name,
        team_size = COALESCE(p_team_size, team_size),
        updated_at = NOW()
    WHERE id = v_org_id;
    
    RETURN TRUE;
EXCEPTION
    WHEN others THEN
        RAISE WARNING 'Failed to update organization for user %: %', auth.uid(), SQLERRM;
        RETURN FALSE;
END;
$$;

-- ============================================================================
-- FUNCTION OWNERSHIP AND PERMISSIONS
-- ============================================================================

ALTER FUNCTION public.update_organization(TEXT, INTEGER) OWNER TO postgres;

COMMENT ON FUNCTION public.update_organization(TEXT, INTEGER) IS 
    'Allow authenticated users to update their organization details';

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_updated_at() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_organization(TEXT, INTEGER) TO authenticated;
