-- ============================================================================
-- CREDIT FUNCTIONS
-- DESCRIPTION: Functions for credit management, validation, and transactions
-- DEPENDENCIES: credits table, profiles table
-- BREAKING CHANGES: None
-- ROLLBACK: DROP FUNCTION statements for each function
-- ============================================================================

-- Removed has_enough_credits and deduct_credits functions - not needed for webhook-only system

-- ============================================================================
-- FUNCTION: add_credits
-- DESCRIPTION: Simple credit addition for webhook use
-- ============================================================================

CREATE OR REPLACE FUNCTION public.add_credits(
    p_user_id UUID,
    p_credit_type public.credit_transfer_type,
    p_value INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    -- Simple upsert: update if exists, insert if not
    INSERT INTO public.credits (user_id, starter, professional, studio, team, balance)
    VALUES (
        p_user_id,
        CASE WHEN p_credit_type = 'STARTER' THEN p_value ELSE 0 END,
        CASE WHEN p_credit_type = 'PROFESSIONAL' THEN p_value ELSE 0 END,
        CASE WHEN p_credit_type = 'STUDIO' THEN p_value ELSE 0 END,
        CASE WHEN p_credit_type = 'TEAM' THEN p_value ELSE 0 END,
        CASE WHEN p_credit_type = 'BALANCE' THEN p_value ELSE 0 END
    )
    ON CONFLICT (user_id, organization_id)
    DO UPDATE SET
        starter = public.credits.starter + CASE WHEN p_credit_type = 'STARTER' THEN p_value ELSE 0 END,
        professional = public.credits.professional + CASE WHEN p_credit_type = 'PROFESSIONAL' THEN p_value ELSE 0 END,
        studio = public.credits.studio + CASE WHEN p_credit_type = 'STUDIO' THEN p_value ELSE 0 END,
        team = public.credits.team + CASE WHEN p_credit_type = 'TEAM' THEN p_value ELSE 0 END,
        balance = public.credits.balance + CASE WHEN p_credit_type = 'BALANCE' THEN p_value ELSE 0 END,
        updated_at = NOW();
END;
$$;

-- Removed get_user_credits function - credits are fetched directly via SELECT queries

-- ============================================================================
-- FUNCTION: handle_new_profile_credit
-- DESCRIPTION: Create initial credit record for new user profiles (simplified)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_profile_credit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    -- Simply insert user_id - all other fields use table defaults (0)
    INSERT INTO public.credits (user_id)
    VALUES (NEW.user_id);
    
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        RAISE WARNING 'Failed to create initial credits for user %: %', NEW.user_id, SQLERRM;
        RETURN NEW;
END;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Create initial credit balance for new profiles
CREATE TRIGGER on_profile_created_add_credits
    AFTER INSERT ON public.profiles
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_profile_credit();

-- ============================================================================
-- FUNCTION OWNERSHIP AND COMMENTS
-- ============================================================================

ALTER FUNCTION public.add_credits(UUID, public.credit_transfer_type, INTEGER) OWNER TO postgres;
ALTER FUNCTION public.handle_new_profile_credit() OWNER TO postgres;

COMMENT ON FUNCTION public.add_credits(UUID, public.credit_transfer_type, INTEGER) IS 
    'Simple credit addition for webhook use';

COMMENT ON FUNCTION public.handle_new_profile_credit() IS 
    'Create initial credit record when a new profile is created';

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.add_credits(UUID, public.credit_transfer_type, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_profile_credit() TO anon, authenticated, service_role;
