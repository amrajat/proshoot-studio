-- ============================================================================
-- BILLING RPC FUNCTIONS (SIMPLIFIED FOR WEBHOOK USE)
-- DESCRIPTION: Simple, robust functions for webhook-only service_role calls
-- DEPENDENCIES: purchases, transactions, credits tables
-- BREAKING CHANGES: Simplified for webhook-only use
-- ROLLBACK: DROP FUNCTION statements for each function
-- ============================================================================

-- ============================================================================
-- FUNCTION: create_purchase_record
-- DESCRIPTION: Create purchase record and automatically add credits (webhook-only)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_purchase_record(
    p_user_id UUID,
    p_payment_provider public.payment_provider,
    p_provider_payment_id TEXT,
    p_amount INTEGER,
    p_currency TEXT,
    p_credits_granted INTEGER,
    p_credits_type public.credit_transfer_type,
    p_status public.purchase_status,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_purchase_id UUID;
BEGIN
    -- Create purchase record
    INSERT INTO public.purchases (
        user_id,
        payment_provider,
        provider_payment_id,
        amount,
        currency,
        credits_granted,
        credits_type,
        status,
        metadata
    )
    VALUES (
        p_user_id,
        p_payment_provider,
        p_provider_payment_id,
        p_amount,
        p_currency,
        p_credits_granted,
        p_credits_type,
        p_status,
        p_metadata
    )
    RETURNING id INTO v_purchase_id;
    
    -- Add credits if purchase succeeded
    IF p_status = 'SUCCEEDED' AND p_credits_granted > 0 THEN
        -- Update credits based on type (assuming credits record already exists from trigger)
        IF p_credits_type = 'STARTER' THEN
            UPDATE public.credits
            SET starter = starter + p_credits_granted,
                updated_at = NOW()
            WHERE user_id = p_user_id;
        ELSIF p_credits_type = 'PROFESSIONAL' THEN
            UPDATE public.credits
            SET professional = professional + p_credits_granted,
                updated_at = NOW()
            WHERE user_id = p_user_id;
        ELSIF p_credits_type = 'STUDIO' THEN
            UPDATE public.credits
            SET studio = studio + p_credits_granted,
                updated_at = NOW()
            WHERE user_id = p_user_id;
        ELSIF p_credits_type = 'TEAM' THEN
            UPDATE public.credits
            SET team = team + p_credits_granted,
                updated_at = NOW()
            WHERE user_id = p_user_id;
        ELSE -- BALANCE or any other type
            UPDATE public.credits
            SET balance = balance + p_credits_granted,
                updated_at = NOW()
            WHERE user_id = p_user_id;
        END IF;
        
        -- Create transaction record for audit trail
        INSERT INTO public.transactions (
            user_id,
            context,
            credits_used,
            credit_type,
            description
        )
        VALUES (
            p_user_id,
            'PERSONAL',
            p_credits_granted, -- Positive for credit addition
            p_credits_type,
            'Credit purchase: ' || p_credits_type || ' (' || p_credits_granted || ' credits)'
        );
    END IF;
    
    RETURN v_purchase_id;
END;
$$;

-- ============================================================================
-- FUNCTION: create_transaction_record
-- DESCRIPTION: Create transaction record (simplified for service use)
-- ============================================================================

-- Service role version: For server-side operations (studio creation, etc.)
CREATE OR REPLACE FUNCTION public.create_transaction_record(
    p_user_id UUID,
    p_context public.account_type,
    p_credits_used INTEGER,
    p_credit_type public.credit_transfer_type,
    p_related_studio_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    -- Create transaction record for specified user (service_role only)
    INSERT INTO public.transactions (
        user_id,
        context,
        credits_used,
        credit_type,
        related_studio_id,
        description
    )
    VALUES (
        p_user_id, -- Use provided user ID
        p_context,
        p_credits_used,
        p_credit_type,
        p_related_studio_id,
        p_description
    );
    
    RETURN p_user_id;
END;
$$;

-- ============================================================================
-- FUNCTION: deduct_credits
-- DESCRIPTION: Deduct credits from user's account based on plan type
-- ============================================================================

CREATE OR REPLACE FUNCTION public.deduct_credits(
    p_user_id UUID,
    p_plan TEXT,
    p_credits_to_deduct INTEGER,
    p_context public.account_type DEFAULT 'PERSONAL',
    p_studio_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_current_credits INTEGER;
    v_plan_lower TEXT;
    v_credits_record RECORD;
    v_description TEXT;
BEGIN
    -- Normalize plan name to lowercase
    v_plan_lower := LOWER(p_plan);
    
    -- Validate plan type
    IF v_plan_lower NOT IN ('starter', 'professional', 'studio', 'team', 'balance') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid plan type. Must be one of: starter, professional, studio, team, balance'
        );
    END IF;
    
    -- Validate credits amount
    IF p_credits_to_deduct <= 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Credits to deduct must be greater than 0'
        );
    END IF;
    
    -- Get current credits record
    SELECT * INTO v_credits_record
    FROM public.credits
    WHERE user_id = p_user_id
    LIMIT 1;
    
    -- Check if credits record exists
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'No credits record found for user'
        );
    END IF;
    
    -- Get current credits for the specified plan
    CASE v_plan_lower
        WHEN 'starter' THEN
            v_current_credits := v_credits_record.starter;
        WHEN 'professional' THEN
            v_current_credits := v_credits_record.professional;
        WHEN 'studio' THEN
            v_current_credits := v_credits_record.studio;
        WHEN 'team' THEN
            v_current_credits := v_credits_record.team;
        WHEN 'balance' THEN
            v_current_credits := v_credits_record.balance;
    END CASE;
    
    -- Check if user has enough credits (must have >= required credits)
    IF v_current_credits < p_credits_to_deduct THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Insufficient credits',
            'current_credits', v_current_credits,
            'required_credits', p_credits_to_deduct,
            'plan', v_plan_lower
        );
    END IF;
    
    -- Deduct credits based on plan type
    CASE v_plan_lower
        WHEN 'starter' THEN
            UPDATE public.credits
            SET starter = starter - p_credits_to_deduct,
                updated_at = NOW()
            WHERE user_id = p_user_id;
        WHEN 'professional' THEN
            UPDATE public.credits
            SET professional = professional - p_credits_to_deduct,
                updated_at = NOW()
            WHERE user_id = p_user_id;
        WHEN 'studio' THEN
            UPDATE public.credits
            SET studio = studio - p_credits_to_deduct,
                updated_at = NOW()
            WHERE user_id = p_user_id;
        WHEN 'team' THEN
            UPDATE public.credits
            SET team = team - p_credits_to_deduct,
                updated_at = NOW()
            WHERE user_id = p_user_id;
        WHEN 'balance' THEN
            UPDATE public.credits
            SET balance = balance - p_credits_to_deduct,
                updated_at = NOW()
            WHERE user_id = p_user_id;
    END CASE;
    
    -- Create description if not provided
    IF p_description IS NULL THEN
        v_description := 'Studio creation - ' || UPPER(v_plan_lower) || ' plan (' || p_credits_to_deduct || ' credits)';
    ELSE
        v_description := p_description;
    END IF;
    
    -- Create transaction record for audit trail using existing function
    PERFORM public.create_transaction_record(
        p_user_id,
        p_context,
        -p_credits_to_deduct, -- Negative for credit deduction
        (v_plan_lower)::public.credit_transfer_type,
        p_studio_id,
        v_description
    );
    
    -- Return success with updated balance
    RETURN jsonb_build_object(
        'success', true,
        'credits_deducted', p_credits_to_deduct,
        'remaining_credits', v_current_credits - p_credits_to_deduct,
        'plan', v_plan_lower
    );
END;
$$;

-- ============================================================================
-- FUNCTION OWNERSHIP AND COMMENTS
-- ============================================================================

ALTER FUNCTION public.create_purchase_record(UUID, public.payment_provider, TEXT, INTEGER, TEXT, INTEGER, public.credit_transfer_type, public.purchase_status, JSONB) OWNER TO postgres;
ALTER FUNCTION public.create_transaction_record(UUID, public.account_type, INTEGER, public.credit_transfer_type, UUID, TEXT) OWNER TO postgres;
ALTER FUNCTION public.deduct_credits(UUID, TEXT, INTEGER, public.account_type, UUID, TEXT) OWNER TO postgres;

COMMENT ON FUNCTION public.create_purchase_record(UUID, public.payment_provider, TEXT, INTEGER, TEXT, INTEGER, public.credit_transfer_type, public.purchase_status, JSONB) IS 
    'Create purchase record and add credits automatically (webhook-only)';

COMMENT ON FUNCTION public.create_transaction_record(UUID, public.account_type, INTEGER, public.credit_transfer_type, UUID, TEXT) IS 
    'Create transaction record for service_role operations';

COMMENT ON FUNCTION public.deduct_credits(UUID, TEXT, INTEGER, public.account_type, UUID, TEXT) IS 
    'Deduct credits from user account based on plan type with context support and audit trail';

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Purchase records: service_role only (webhook-only)
GRANT EXECUTE ON FUNCTION public.create_purchase_record(UUID, public.payment_provider, TEXT, INTEGER, TEXT, INTEGER, public.credit_transfer_type, public.purchase_status, JSONB) TO service_role;

-- Transaction records: service_role only for server-side operations
GRANT EXECUTE ON FUNCTION public.create_transaction_record(UUID, public.account_type, INTEGER, public.credit_transfer_type, UUID, TEXT) TO service_role;

-- Credit deduction: service_role only (for server-side operations)
GRANT EXECUTE ON FUNCTION public.deduct_credits(UUID, TEXT, INTEGER, public.account_type, UUID, TEXT) TO service_role;

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

/*
-- Example 1: Create purchase record via webhook
SELECT public.create_purchase_record(
    'user-uuid-here'::uuid,
    'LEMONSQUEEZY'::public.payment_provider,
    'order_12345',
    2999, -- $29.99 in cents
    'USD',
    100, -- 100 credits granted
    'PROFESSIONAL'::public.credit_transfer_type,
    'SUCCEEDED'::public.purchase_status,
    '{"order_id": "12345", "product_name": "Professional Plan"}'::jsonb
);

-- Example 2: Create transaction record (service_role)
SELECT public.create_transaction_record(
    'user-uuid-here'::uuid,
    'PERSONAL'::public.account_type,
    -10, -- 10 credits used
    'PROFESSIONAL'::public.credit_transfer_type,
    'studio-uuid-here'::uuid,
    'Studio creation - Professional headshots'
);

-- Example 3: Deduct credits for studio creation (service_role)
SELECT public.deduct_credits(
    'user-uuid-here'::uuid,
    'starter', -- Plan type
    1, -- Credits to deduct
    'PERSONAL'::public.account_type, -- Context
    'studio-uuid-here'::uuid,
    'Studio creation - Starter plan'
);

-- Example 3b: Deduct credits for organization context
SELECT public.deduct_credits(
    'user-uuid-here'::uuid,
    'team', -- Plan type
    1, -- Credits to deduct
    'ORGANIZATION'::public.account_type, -- Organization context
    'studio-uuid-here'::uuid,
    'Studio creation - Team plan (Organization)'
);

-- Example 4: Check result of credit deduction
-- Returns: {"success": true, "credits_deducted": 1, "remaining_credits": 9, "plan": "starter"}
-- Or: {"success": false, "error": "Insufficient credits", "current_credits": 0, "required_credits": 1, "plan": "starter"}
*/
