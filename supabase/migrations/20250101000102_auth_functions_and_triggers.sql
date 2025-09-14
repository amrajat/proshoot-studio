-- ============================================================================
-- AUTH FUNCTIONS AND TRIGGERS
-- DESCRIPTION: Functions and triggers for user authentication and profile management
-- DEPENDENCIES: profiles table, auth.users
-- BREAKING CHANGES: None
-- ROLLBACK: DROP TRIGGER, DROP FUNCTION statements
-- ============================================================================

-- ============================================================================
-- FUNCTION: handle_new_user_v2
-- DESCRIPTION: Creates a profile when a new user signs up
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user_v2()
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
CREATE TRIGGER on_auth_user_created_v2
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user_v2();

-- Trigger: Update timestamp on profile changes
CREATE TRIGGER on_profiles_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- FUNCTION OWNERSHIP AND COMMENTS
-- ============================================================================

ALTER FUNCTION public.handle_new_user_v2() OWNER TO postgres;
ALTER FUNCTION public.handle_updated_at() OWNER TO postgres;

COMMENT ON FUNCTION public.handle_new_user_v2() IS 
    'Creates profile, initializes credits, and creates default organization when user signs up';

COMMENT ON FUNCTION public.handle_updated_at() IS 
    'Updates updated_at timestamp on profile changes';

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user_v2() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_updated_at() TO anon, authenticated, service_role;
