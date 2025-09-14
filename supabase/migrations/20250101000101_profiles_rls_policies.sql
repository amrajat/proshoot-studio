-- ============================================================================
-- RLS POLICIES: profiles
-- DESCRIPTION: Row Level Security policies for profiles table
-- DEPENDENCIES: profiles table, auth.users
-- BREAKING CHANGES: None
-- ROLLBACK: DROP POLICY statements for each policy
-- ============================================================================

-- ============================================================================
-- SELECT POLICIES
-- ============================================================================

-- Policy: Users can view their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT 
    USING ((select auth.uid()) = user_id);

-- ============================================================================
-- INSERT POLICIES  
-- ============================================================================

-- Policy: Users can create their own profile (handled by trigger)
CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT
    WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- UPDATE POLICIES
-- ============================================================================

-- Policy: Users can update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- DELETE POLICIES
-- ============================================================================

-- Policy: Users can delete their own profile (cascade will handle auth.users)
CREATE POLICY "profiles_delete_own" ON public.profiles
    FOR DELETE
    USING ((select auth.uid()) = user_id);

-- ============================================================================
-- POLICY COMMENTS
-- ============================================================================

COMMENT ON POLICY "profiles_select_own" ON public.profiles IS 
    'Allow users to view their own profile information';

COMMENT ON POLICY "profiles_insert_own" ON public.profiles IS 
    'Allow users to create their own profile (typically via trigger)';

COMMENT ON POLICY "profiles_update_own" ON public.profiles IS 
    'Allow users to update their own profile information';

COMMENT ON POLICY "profiles_delete_own" ON public.profiles IS 
    'Allow users to delete their own profile';
