CREATE OR REPLACE FUNCTION deduct_credits(
    p_user_id UUID,
    p_plan_name TEXT,
    p_value_to_deduct INT
)
RETURNS BOOLEAN -- Returns true on success, raises exception on failure
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_credits INT;
    query TEXT;
    column_name TEXT;
BEGIN
    -- Validate plan name and get column name
    CASE lower(p_plan_name)
        WHEN 'starter' THEN column_name := 'starter';
        WHEN 'pro' THEN column_name := 'pro';
        WHEN 'elite' THEN column_name := 'elite';
        WHEN 'studio' THEN column_name := 'studio';
        WHEN 'balance' THEN column_name := 'balance';
        ELSE
            RAISE EXCEPTION 'Invalid plan name: %', p_plan_name USING ERRCODE = 'P0001', HINT = 'Valid plans are: starter, pro, elite, studio, balance.';
    END CASE;

    -- Get current credits for the specified plan
    query := format('SELECT %I FROM public.credits WHERE user_id = %L', column_name, p_user_id);
    EXECUTE query INTO current_credits;

    -- If user has no entry or plan column is NULL, treat as 0 credits
    IF current_credits IS NULL THEN
        current_credits := 0;
    END IF;

    -- Validate if enough credits are available
    IF current_credits < p_value_to_deduct THEN
        RAISE EXCEPTION 'Insufficient % credits. Available: %, Required: %', p_plan_name, current_credits, p_value_to_deduct USING ERRCODE = 'P0002';
    END IF;

    -- Subtract credits
    query := format('UPDATE public.credits SET %I = %I - %s WHERE user_id = %L',
                    column_name, column_name, p_value_to_deduct, p_user_id);
    EXECUTE query;

    RETURN TRUE; -- Credits deducted successfully

EXCEPTION
    WHEN SQLSTATE 'P0001' OR SQLSTATE 'P0002' THEN
        -- Re-raise custom exceptions (Invalid Plan Name or Insufficient Credits)
        RAISE; -- This preserves the message, errcode, and hint
    WHEN others THEN
        RAISE WARNING 'Unexpected error in deduct_credits: SQLSTATE: %, SQLERRM: %', SQLSTATE, SQLERRM;
        RAISE EXCEPTION 'An unexpected error occurred while deducting credits.';
END;
$$;


CREATE OR REPLACE FUNCTION has_enough_credits(
    p_user_id UUID,
    p_plan_name TEXT,
    p_credits_required INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Or SECURITY INVOKER if RLS on credits table is not restrictive for this check
AS $$
DECLARE
    current_credits INT;
    query TEXT;
    column_name TEXT;
BEGIN
    -- Validate plan name and get column name
    CASE lower(p_plan_name)
        WHEN 'starter' THEN column_name := 'starter';
        WHEN 'pro' THEN column_name := 'pro';
        WHEN 'elite' THEN column_name := 'elite';
        WHEN 'studio' THEN column_name := 'studio';
        WHEN 'balance' THEN column_name := 'balance';
        ELSE
            -- Invalid plan name, so user effectively doesn't have credits for it.
            RETURN FALSE;
    END CASE;

    -- Get current credits for the specified plan
    -- Using public.credits to be explicit within a SECURITY DEFINER function
    query := format('SELECT %I FROM public.credits WHERE user_id = %L', column_name, p_user_id);
    EXECUTE query INTO current_credits;

    -- If user has no entry or plan column is NULL, treat as 0 credits
    IF current_credits IS NULL THEN
        current_credits := 0;
    END IF;

    -- Check if enough credits are available
    IF current_credits >= p_credits_required THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;

EXCEPTION
    WHEN others THEN
        -- For unexpected errors, log and return FALSE as a safe default.
        RAISE WARNING 'Unexpected error in has_enough_credits: SQLSTATE: %, SQLERRM: %', SQLSTATE, SQLERRM;
        RETURN FALSE;
END;
$$;