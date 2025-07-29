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

-- Two versions: one for authenticated users, one for service role

-- Version 1: For authenticated users (studio creation, etc.)
CREATE OR REPLACE FUNCTION public.create_transaction_record(
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
    -- Create transaction record for authenticated user
    INSERT INTO public.transactions (
        user_id,
        context,
        credits_used,
        credit_type,
        related_studio_id,
        description
    )
    VALUES (
        auth.uid(), -- Use authenticated user's ID
        p_context,
        p_credits_used,
        p_credit_type,
        p_related_studio_id,
        p_description
    );
    
    RETURN auth.uid();
END;
$$;

-- ============================================================================
-- FUNCTION OWNERSHIP AND COMMENTS
-- ============================================================================

ALTER FUNCTION public.create_purchase_record(UUID, public.payment_provider, TEXT, INTEGER, TEXT, INTEGER, public.credit_transfer_type, public.purchase_status, JSONB) OWNER TO postgres;
ALTER FUNCTION public.create_transaction_record(public.account_type, INTEGER, public.credit_transfer_type, UUID, TEXT) OWNER TO postgres;

COMMENT ON FUNCTION public.create_purchase_record(UUID, public.payment_provider, TEXT, INTEGER, TEXT, INTEGER, public.credit_transfer_type, public.purchase_status, JSONB) IS 
    'Create purchase record and add credits automatically (webhook-only)';

COMMENT ON FUNCTION public.create_transaction_record(public.account_type, INTEGER, public.credit_transfer_type, UUID, TEXT) IS 
    'Create transaction record for authenticated users';

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Purchase records: service_role only (webhook-only)
GRANT EXECUTE ON FUNCTION public.create_purchase_record(UUID, public.payment_provider, TEXT, INTEGER, TEXT, INTEGER, public.credit_transfer_type, public.purchase_status, JSONB) TO service_role;

-- Transaction records: authenticated users for their own transactions
GRANT EXECUTE ON FUNCTION public.create_transaction_record(public.account_type, INTEGER, public.credit_transfer_type, UUID, TEXT) TO authenticated;

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

-- Example 2a: User creates transaction record (authenticated)
SELECT public.create_transaction_record(
    'PERSONAL'::public.account_type,
    -10, -- 10 credits used
    'PROFESSIONAL'::public.credit_transfer_type,
    'studio-uuid-here'::uuid,
    'Studio creation - Professional headshots'
);
*/
