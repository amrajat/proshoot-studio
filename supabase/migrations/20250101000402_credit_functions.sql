-- ============================================================================
-- CREDIT FUNCTIONS
-- DESCRIPTION: Functions for credit management, validation, and transactions
-- DEPENDENCIES: credits table, profiles table
-- BREAKING CHANGES: None
-- ROLLBACK: DROP FUNCTION statements for each function
-- ============================================================================

-- ============================================================================
-- FUNCTION: has_enough_credits
-- DESCRIPTION: Check if user has sufficient credits for a specific plan
-- ============================================================================

CREATE OR REPLACE FUNCTION public.has_enough_credits(
    p_user_id UUID,
    p_plan_name TEXT,
    p_credits_required INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    current_credits INTEGER;
    column_name TEXT;
BEGIN
    -- Validate plan name and get column
    CASE LOWER(p_plan_name)
        WHEN 'starter' THEN column_name := 'starter';
        WHEN 'professional' THEN column_name := 'professional';
        WHEN 'studio' THEN column_name := 'studio';
        WHEN 'balance' THEN column_name := 'balance';
        WHEN 'team' THEN column_name := 'team';
        ELSE
            RETURN FALSE;
    END CASE;

    -- Get current credits for the plan
    EXECUTE format('SELECT %I FROM public.credits WHERE user_id = $1 AND organization_id IS NULL', column_name)
    USING p_user_id INTO current_credits;

    -- Return whether user has enough credits
    RETURN COALESCE(current_credits, 0) >= p_credits_required;

EXCEPTION
    WHEN others THEN
        RAISE WARNING 'Unexpected error in has_enough_credits: SQLSTATE: %, SQLERRM: %', SQLSTATE, SQLERRM;
        RETURN FALSE;
END;
$$;

-- ============================================================================
-- FUNCTION: deduct_credits
-- DESCRIPTION: Deduct credits from user account atomically
-- ============================================================================

CREATE OR REPLACE FUNCTION public.deduct_credits(
    p_user_id UUID,
    p_plan_name TEXT,
    p_credits_to_deduct INTEGER,
    p_description TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    column_name TEXT;
    current_credits INTEGER;
    new_credits INTEGER;
BEGIN
    -- Validate inputs
    IF p_credits_to_deduct <= 0 THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Credits to deduct must be positive');
    END IF;
    
    -- Validate plan name and get column
    CASE LOWER(p_plan_name)
        WHEN 'starter' THEN column_name := 'starter';
        WHEN 'professional' THEN column_name := 'professional';
        WHEN 'studio' THEN column_name := 'studio';
        WHEN 'balance' THEN column_name := 'balance';
        WHEN 'team' THEN column_name := 'team';
        ELSE
            RETURN jsonb_build_object('success', FALSE, 'error', 'Invalid plan name: ' || p_plan_name);
    END CASE;

    -- Deduct credits atomically
    EXECUTE format('
        UPDATE public.credits 
        SET %I = %I - $1, updated_at = NOW() 
        WHERE user_id = $2 
        AND organization_id IS NULL 
        AND %I >= $1
        RETURNING %I', 
        column_name, column_name, column_name, column_name
    ) USING p_credits_to_deduct, p_user_id INTO new_credits;

    IF NOT FOUND THEN
        -- Get current credits for error message
        EXECUTE format('SELECT COALESCE(%I, 0) FROM public.credits WHERE user_id = $1 AND organization_id IS NULL', column_name)
        USING p_user_id INTO current_credits;
        
        RETURN jsonb_build_object(
            'success', FALSE, 
            'error', format('Insufficient %s credits. Required: %s, Available: %s', p_plan_name, p_credits_to_deduct, COALESCE(current_credits, 0))
        );
    END IF;

    RETURN jsonb_build_object(
        'success', TRUE,
        'message', format('Successfully deducted %s %s credits', p_credits_to_deduct, p_plan_name),
        'remaining_credits', new_credits
    );

EXCEPTION
    WHEN others THEN
        RAISE WARNING 'Error deducting credits for user % plan %: %', p_user_id, p_plan_name, SQLERRM;
        RETURN jsonb_build_object('success', FALSE, 'error', 'Failed to deduct credits: ' || SQLERRM);
END;
$$;

-- ============================================================================
-- FUNCTION: add_credits
-- DESCRIPTION: Add credits to user account (for purchases, refunds, etc.)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.add_credits(
    p_user_id UUID,
    p_plan_name TEXT,
    p_credits_to_add INTEGER,
    p_description TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    column_name TEXT;
    new_credits INTEGER;
BEGIN
    -- Validate inputs
    IF p_credits_to_add <= 0 THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Credits to add must be positive');
    END IF;
    
    -- Validate plan name and get column
    CASE LOWER(p_plan_name)
        WHEN 'starter' THEN column_name := 'starter';
        WHEN 'professional' THEN column_name := 'professional';
        WHEN 'studio' THEN column_name := 'studio';
        WHEN 'balance' THEN column_name := 'balance';
        WHEN 'team' THEN column_name := 'team';
        ELSE
            RETURN jsonb_build_object('success', FALSE, 'error', 'Invalid plan name: ' || p_plan_name);
    END CASE;

    -- Add credits atomically
    EXECUTE format('
        UPDATE public.credits 
        SET %I = %I + $1, updated_at = NOW() 
        WHERE user_id = $2 
        AND organization_id IS NULL
        RETURNING %I', 
        column_name, column_name, column_name
    ) USING p_credits_to_add, p_user_id INTO new_credits;

    IF NOT FOUND THEN
        -- Create credit record if it doesn't exist
        EXECUTE format('
            INSERT INTO public.credits (user_id, organization_id, %I) 
            VALUES ($2, NULL, $1)
            RETURNING %I', 
            column_name, column_name
        ) USING p_credits_to_add, p_user_id INTO new_credits;
    END IF;

    RETURN jsonb_build_object(
        'success', TRUE,
        'message', format('Successfully added %s %s credits', p_credits_to_add, p_plan_name),
        'new_balance', new_credits
    );

EXCEPTION
    WHEN others THEN
        RAISE WARNING 'Error adding credits for user % plan %: %', p_user_id, p_plan_name, SQLERRM;
        RETURN jsonb_build_object('success', FALSE, 'error', 'Failed to add credits: ' || SQLERRM);
END;
$$;

-- ============================================================================
-- FUNCTION: get_user_credits
-- DESCRIPTION: Get all credit balances for a user
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_credits(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
    user_id UUID,
    organization_id UUID,
    balance INTEGER,
    starter INTEGER,
    professional INTEGER,
    studio INTEGER,
    team INTEGER,
    total_credits INTEGER,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    target_user_id UUID;
BEGIN
    target_user_id := COALESCE(p_user_id, auth.uid());
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User ID is required';
    END IF;
    
    RETURN QUERY
    SELECT 
        c.user_id,
        c.organization_id,
        c.balance,
        c.starter,
        c.professional,
        c.studio,
        c.team,
        (c.balance + c.starter + c.professional + c.studio + c.team) as total_credits,
        c.updated_at
    FROM public.credits c
    WHERE c.user_id = target_user_id
    ORDER BY c.organization_id NULLS FIRST;
    
EXCEPTION
    WHEN others THEN
        RAISE WARNING 'Error getting user credits: %', SQLERRM;
        RAISE;
END;
$$;

-- ============================================================================
-- FUNCTION: handle_new_profile_credit
-- DESCRIPTION: Create initial credit balance for new user profiles
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_profile_credit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Insert a row specifically for personal credits (organization_id IS NULL)
    INSERT INTO public.credits (
        user_id, 
        organization_id, 
        balance, 
        starter, 
        professional, 
        studio, 
        team
    )
    VALUES (
        NEW.user_id, 
        NULL, 
        0,  -- Initial balance
        0,  -- Initial starter credits
        0,  -- Initial professional credits
        0,  -- Initial studio credits
        0   -- Initial team credits (always 0 for personal)
    );
    
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

ALTER FUNCTION public.has_enough_credits(UUID, TEXT, INTEGER) OWNER TO postgres;
ALTER FUNCTION public.deduct_credits(UUID, TEXT, INTEGER, TEXT) OWNER TO postgres;
ALTER FUNCTION public.add_credits(UUID, TEXT, INTEGER, TEXT) OWNER TO postgres;
ALTER FUNCTION public.get_user_credits(UUID) OWNER TO postgres;
ALTER FUNCTION public.handle_new_profile_credit() OWNER TO postgres;

COMMENT ON FUNCTION public.has_enough_credits(UUID, TEXT, INTEGER) IS 
    'Check if user has sufficient credits for a specific plan';

COMMENT ON FUNCTION public.deduct_credits(UUID, TEXT, INTEGER, TEXT) IS 
    'Deduct credits from user account atomically with validation';

COMMENT ON FUNCTION public.add_credits(UUID, TEXT, INTEGER, TEXT) IS 
    'Add credits to user account for purchases, refunds, etc.';

COMMENT ON FUNCTION public.get_user_credits(UUID) IS 
    'Get all credit balances for a user including totals';

COMMENT ON FUNCTION public.handle_new_profile_credit() IS 
    'Create initial credit balance when a new profile is created';

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.has_enough_credits(UUID, TEXT, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.deduct_credits(UUID, TEXT, INTEGER, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.add_credits(UUID, TEXT, INTEGER, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_credits(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_profile_credit() TO anon, authenticated, service_role;
