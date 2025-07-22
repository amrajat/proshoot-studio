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
    -- Insert new profile for the user
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
    
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Log error but don't fail user creation
        RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
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
    'Creates a profile record when a new user signs up via auth';

COMMENT ON FUNCTION public.handle_updated_at() IS 
    'Updates the updated_at timestamp when a record is modified';

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Grant necessary permissions for the functions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

GRANT EXECUTE ON FUNCTION public.handle_updated_at() TO anon;
GRANT EXECUTE ON FUNCTION public.handle_updated_at() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_updated_at() TO service_role;
