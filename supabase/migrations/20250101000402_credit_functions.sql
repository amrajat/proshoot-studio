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
-- NOTE: Credit initialization is now handled in handle_new_user() function
-- in auth_functions_and_triggers.sql to consolidate user setup process.
-- This eliminates the need for separate triggers and functions.
-- ============================================================================

-- ============================================================================
-- FUNCTION OWNERSHIP AND COMMENTS
-- ============================================================================

ALTER FUNCTION public.add_credits(UUID, public.credit_transfer_type, INTEGER) OWNER TO postgres;

COMMENT ON FUNCTION public.add_credits(UUID, public.credit_transfer_type, INTEGER) IS 
    'Simple credit addition for webhook use';

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.add_credits(UUID, public.credit_transfer_type, INTEGER) TO service_role;
