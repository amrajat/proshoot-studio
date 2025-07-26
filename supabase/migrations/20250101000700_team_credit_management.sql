-- ============================================================================
-- TEAM CREDIT MANAGEMENT FUNCTIONS (FIXED VERSION)
-- DESCRIPTION: Functions for organization owners to manage team member credits
-- DEPENDENCIES: credits table, members table, transactions table
-- SECURITY: Service role functions for sensitive credit operations
-- ============================================================================

-- ============================================================================
-- FUNCTION: transfer_team_credits_to_member (SERVICE ROLE ONLY)
-- DESCRIPTION: Transfer credits from owner to member with transaction logging
-- SUPPORTS: team credits (default) and balance credits
-- ============================================================================

CREATE OR REPLACE FUNCTION public.transfer_team_credits_to_member(
    p_owner_user_id UUID,
    p_member_user_id UUID,
    p_organization_id UUID,
    p_credits_amount INTEGER,
    p_skip_membership_check BOOLEAN DEFAULT FALSE,
    p_credit_type TEXT DEFAULT 'team'  -- 'team' or 'balance'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_owner_credits INTEGER;
    v_credit_column TEXT;
    v_owner_transaction_id UUID;
    v_member_transaction_id UUID;
BEGIN
    -- Validate inputs
    IF p_credits_amount <= 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Credits amount must be greater than 0'
        );
    END IF;

    -- Validate credit type
    IF p_credit_type NOT IN ('team', 'balance') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid credit type. Must be "team" or "balance"'
        );
    END IF;

    -- Set the column name based on credit type
    v_credit_column := p_credit_type;

    -- Check if owner has sufficient credits of the specified type
    -- Both team and balance credits are stored in the same organization-scoped record
    IF p_credit_type = 'team' THEN
        SELECT team INTO v_owner_credits
        FROM public.credits
        WHERE user_id = p_owner_user_id AND organization_id = p_organization_id;
    ELSE -- balance
        SELECT balance INTO v_owner_credits
        FROM public.credits
        WHERE user_id = p_owner_user_id AND organization_id = p_organization_id;
    END IF;

    IF v_owner_credits IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Owner credit account not found'
        );
    END IF;

    IF v_owner_credits < p_credits_amount THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Insufficient ' || p_credit_type || ' credits. Available: ' || v_owner_credits || ', Required: ' || p_credits_amount
        );
    END IF;

    -- Verify owner owns the organization
    IF NOT EXISTS (
        SELECT 1 FROM public.organizations 
        WHERE id = p_organization_id AND owner_user_id = p_owner_user_id
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Only organization owner can transfer credits'
        );
    END IF;

    -- Verify member belongs to the organization (skip for invitation flow)
    IF NOT p_skip_membership_check AND NOT EXISTS (
        SELECT 1 FROM public.members 
        WHERE user_id = p_member_user_id AND organization_id = p_organization_id
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User is not a member of this organization'
        );
    END IF;

    -- Deduct credits from owner based on credit type
    -- Both team and balance credits are in the same organization-scoped record
    IF p_credit_type = 'team' THEN
        UPDATE public.credits
        SET team = team - p_credits_amount,
            updated_at = NOW()
        WHERE user_id = p_owner_user_id AND organization_id = p_organization_id;
    ELSE -- balance
        UPDATE public.credits
        SET balance = balance - p_credits_amount,
            updated_at = NOW()
        WHERE user_id = p_owner_user_id AND organization_id = p_organization_id;
    END IF;

    -- Add credits to member's personal credit record
    -- Member's credits are stored in their personal record (not organization-scoped)
    IF p_credit_type = 'team' THEN
        -- Team credits go to member's team column in their personal record
        UPDATE public.credits
        SET team = team + p_credits_amount,
            updated_at = NOW()
        WHERE user_id = p_member_user_id;
    ELSE -- balance
        -- Balance credits go to member's balance column in their personal record
        UPDATE public.credits
        SET balance = balance + p_credits_amount,
            updated_at = NOW()
        WHERE user_id = p_member_user_id;
    END IF;


    
    -- Record transaction for owner (credit deduction) - this will be the "parent" transaction
    INSERT INTO public.transactions (
        user_id,
        context,
        credits_used,
        credit_type,
        description
    )
    VALUES (
        p_owner_user_id,
        'ORGANIZATION',
        -p_credits_amount,
        CASE WHEN p_credit_type = 'team' THEN 'TEAM'::public.credit_transfer_type ELSE 'BALANCE'::public.credit_transfer_type END,
        CASE WHEN p_credit_type = 'team' THEN 'Team credit transfer to member' ELSE 'Balance credit transfer to member' END
    )
    RETURNING id INTO v_owner_transaction_id;

    -- Record transaction for member (credit addition) - this will reference the owner transaction
    INSERT INTO public.transactions (
        user_id,
        context,
        credits_used,
        credit_type,
        description,
        related_transaction_id  -- Link to the owner's transaction
    )
    VALUES (
        p_member_user_id,
        'ORGANIZATION',
        p_credits_amount,
        CASE WHEN p_credit_type = 'team' THEN 'TEAM'::public.credit_transfer_type ELSE 'BALANCE'::public.credit_transfer_type END,
        CASE WHEN p_credit_type = 'team' THEN 'Received team credit transfer from organization owner' ELSE 'Received balance credit transfer from organization owner' END,
        v_owner_transaction_id  -- Link to the owner's deduction transaction
    )
    RETURNING id INTO v_member_transaction_id;

    -- Update the owner transaction to also reference the member transaction for mutual linking
    UPDATE public.transactions 
    SET related_transaction_id = v_member_transaction_id
    WHERE id = v_owner_transaction_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Credits transferred successfully',
        'credits_transferred', p_credits_amount,
        'owner_transaction_id', v_owner_transaction_id,
        'member_transaction_id', v_member_transaction_id
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Transfer failed: ' || SQLERRM
        );
END;
$$;

-- Grant execute permission to service_role
GRANT EXECUTE ON FUNCTION public.transfer_team_credits_to_member(UUID, UUID, UUID, INTEGER, BOOLEAN, TEXT) TO service_role;

-- Add function comment
COMMENT ON FUNCTION public.transfer_team_credits_to_member(UUID, UUID, UUID, INTEGER, BOOLEAN, TEXT) IS 
'Transfers credits (team or balance) from organization owner to member with transaction logging. Supports team credits (default) and balance credits. Optional skip_membership_check for invitation flow.';

-- ============================================================================
-- FUNCTION: get_organization_members_with_credits (SERVICE ROLE ONLY)
-- DESCRIPTION: Get organization members with their personal credit balances
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_organization_members_with_credits(
    p_organization_id UUID
)
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    role public.organization_role,
    joined_at TIMESTAMPTZ,
    personal_credits INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.user_id,
        au.email::TEXT,  -- Cast to TEXT to match return type
        m.role,
        m.joined_at,
        COALESCE(c.team, 0) as personal_credits
    FROM public.members m
    JOIN auth.users au ON m.user_id = au.id
    LEFT JOIN public.credits c ON c.user_id = m.user_id
    WHERE m.organization_id = p_organization_id
    ORDER BY m.joined_at ASC;
END;
$$;

-- Grant execute permission to service_role
GRANT EXECUTE ON FUNCTION public.get_organization_members_with_credits(UUID) TO service_role;

-- Add function comment
COMMENT ON FUNCTION public.get_organization_members_with_credits(UUID) IS 
'Gets organization members with their personal credit balances';

-- ============================================================================
-- FUNCTION: get_member_credit_history (USER ACCESSIBLE)
-- DESCRIPTION: Get credit transaction history for a specific member
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_member_credit_history(
    p_member_user_id UUID,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    transaction_id UUID,
    credits_used INTEGER,
    credit_type public.credit_transfer_type,
    description TEXT,
    related_user_id UUID,
    related_user_email TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id as transaction_id,
        t.credits_used,
        t.credit_type,
        t.description,
        t.related_user_id,
        COALESCE(au.email::TEXT, 'N/A') as related_user_email,
        t.created_at
    FROM public.transactions t
    LEFT JOIN auth.users au ON t.related_user_id = au.id
    WHERE t.user_id = p_member_user_id
    ORDER BY t.created_at DESC
    LIMIT p_limit;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_member_credit_history(UUID, INTEGER) TO authenticated;

-- Add function comment
COMMENT ON FUNCTION public.get_member_credit_history(UUID, INTEGER) IS 
'Gets credit transaction history for a specific member with related user information for transfers';

-- ============================================================================
-- FUNCTION: resend_organization_invitation (USER ACCESSIBLE)
-- DESCRIPTION: Resend organization invitation with rate limiting
-- ============================================================================

CREATE OR REPLACE FUNCTION public.resend_organization_invitation(
    p_organization_id UUID,
    p_invitation_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_resend_count INTEGER;
    v_last_resent TIMESTAMPTZ;
    v_invitation_email TEXT;
BEGIN
    -- Check if invitation exists and get details
    SELECT 
        COALESCE(resend_count, 0),
        last_resent_at,
        invited_email
    INTO v_resend_count, v_last_resent, v_invitation_email
    FROM public.invitations
    WHERE id = p_invitation_id 
      AND organization_id = p_organization_id 
      AND status = 'PENDING';

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invitation not found or not pending'
        );
    END IF;

    -- Rate limiting: max 3 resends per hour
    IF v_resend_count >= 3 AND v_last_resent > NOW() - INTERVAL '1 hour' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Rate limit exceeded. Maximum 3 resends per hour.',
            'retry_after', v_last_resent + INTERVAL '1 hour'
        );
    END IF;

    -- Reset count if more than 1 hour has passed
    IF v_last_resent IS NULL OR v_last_resent <= NOW() - INTERVAL '1 hour' THEN
        v_resend_count := 0;
    END IF;

    -- Update invitation with new resend info
    UPDATE public.invitations
    SET 
        resend_count = v_resend_count + 1,
        last_resent_at = NOW(),
        updated_at = NOW()
    WHERE id = p_invitation_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Invitation resent successfully',
        'email', v_invitation_email,
        'resend_count', v_resend_count + 1
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Failed to resend invitation: ' || SQLERRM
        );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.resend_organization_invitation(UUID, UUID) TO authenticated;

-- Add function comment
COMMENT ON FUNCTION public.resend_organization_invitation(UUID, UUID) IS 
'Resends organization invitation with rate limiting (max 3 per hour)';
-- ============================================================================
-- FUNCTION: remove_organization_invitation (USER ACCESSIBLE)
-- DESCRIPTION: Cancel/remove a pending organization invitation
-- ============================================================================

CREATE OR REPLACE FUNCTION public.remove_organization_invitation(
    p_organization_id UUID,
    p_invitation_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_invitation_email TEXT;
BEGIN
    -- Get invitation details and update status
    UPDATE public.invitations
    SET 
        status = 'CANCELLED',
        updated_at = NOW()
    WHERE id = p_invitation_id 
      AND organization_id = p_organization_id 
      AND status = 'PENDING'
    RETURNING invited_email INTO v_invitation_email;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invitation not found or not pending'
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Invitation cancelled successfully',
        'email', v_invitation_email
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Failed to cancel invitation: ' || SQLERRM
        );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.remove_organization_invitation(UUID, UUID) TO authenticated;

-- Add function comment
COMMENT ON FUNCTION public.remove_organization_invitation(UUID, UUID) IS 
'Cancels/removes a pending organization invitation';

-- ============================================================================
-- FUNCTION: accept_invitation (SIMPLIFIED VERSION)
-- DESCRIPTION: Accept organization invitation and automatically transfer team credit
-- REUSES: transfer_team_credits_to_member function for credit transfer logic
-- ============================================================================

CREATE OR REPLACE FUNCTION public.accept_invitation(
    p_invite_token TEXT,
    p_accepting_user_id UUID,
    p_accepting_user_email TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_invite RECORD;
    v_org_id UUID;
    v_org_name TEXT;
    v_invite_role public.organization_role;
    v_owner_user_id UUID;
    v_credit_transfer_result JSONB;
BEGIN
    -- Step 1: Try to find a UNIQUE invite token first
    SELECT * INTO v_invite FROM public.invitations WHERE token = p_invite_token;

    IF FOUND THEN
        -- Check if the invitation is email-specific and if the user's email matches
        IF v_invite.invited_email IS NOT NULL AND v_invite.invited_email != p_accepting_user_email THEN
            RETURN jsonb_build_object(
                'success', FALSE, 
                'error', 'This invitation is intended for ' || v_invite.invited_email || '. Please log in with the correct account.'
            );
        END IF;

        -- Case A: This is a unique email invitation
        v_org_id := v_invite.organization_id;
        v_invite_role := v_invite.role;

        -- Get organization details early for membership check
        SELECT name, owner_user_id INTO v_org_name, v_owner_user_id 
        FROM public.organizations 
        WHERE id = v_org_id;
        
        -- CRITICAL: Check if user is already a member BEFORE checking invitation status
        -- This prevents "already accepted" errors for users who are legitimately members
        IF EXISTS (SELECT 1 FROM public.members WHERE user_id = p_accepting_user_id AND organization_id = v_org_id) THEN
            -- If user is already a member, mark invitation as accepted if it's still pending
            IF v_invite.status = 'PENDING' THEN
                UPDATE public.invitations SET status = 'ACCEPTED', updated_at = NOW() WHERE id = v_invite.id;
            END IF;
            RETURN jsonb_build_object('success', TRUE, 'message', 'You are already a member of ' || v_org_name || '.');
        END IF;

        -- Now check invitation status only if user is NOT already a member
        IF v_invite.status != 'PENDING' THEN
            RETURN jsonb_build_object(
                'success', FALSE, 
                'error', 'This invitation has already been ' || v_invite.status || ' or is expired.'
            );
        END IF;

        -- Check if invitation has expired
        IF v_invite.expires_at IS NOT NULL AND v_invite.expires_at < NOW() THEN
            UPDATE public.invitations SET status = 'EXPIRED', updated_at = NOW() WHERE id = v_invite.id;
            RETURN jsonb_build_object('success', FALSE, 'error', 'This invitation has expired.');
        END IF;

    ELSE
        -- Case B: If not a unique token, check if it's a UNIVERSAL organization token
        -- Optimize: Get all organization details in one query
        SELECT id, name, owner_user_id INTO v_org_id, v_org_name, v_owner_user_id 
        FROM public.organizations 
        WHERE invite_token = p_invite_token;

        IF NOT FOUND THEN
            -- If not found in either table, the token is invalid
            RETURN jsonb_build_object('success', FALSE, 'error', 'Invitation not found or invalid token.');
        END IF;
        
        -- For universal links, the role is always 'MEMBER'
        v_invite_role := 'MEMBER'::public.organization_role;
        
        -- Check if user is already a member for universal invites too
        IF EXISTS (SELECT 1 FROM public.members WHERE user_id = p_accepting_user_id AND organization_id = v_org_id) THEN
            RETURN jsonb_build_object('success', TRUE, 'message', 'You are already a member of ' || v_org_name || '.');
        END IF;
    END IF;

    -- Step 3: Use the existing transfer_team_credits_to_member function for credit transfer
    -- Skip membership check since user is not yet a member (invitation flow)
    SELECT public.transfer_team_credits_to_member(
        v_owner_user_id,
        p_accepting_user_id,
        v_org_id,
        1,  -- Transfer 1 team credit
        TRUE  -- Skip membership check for invitation flow
    ) INTO v_credit_transfer_result;

    -- Check if credit transfer was successful
    IF NOT (v_credit_transfer_result->>'success')::boolean THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error', 'Failed to process invitation: ' || (v_credit_transfer_result->>'error')
        );
    END IF;

    -- Step 4: Add user to organization (credit transfer was successful)
    BEGIN
        INSERT INTO public.members (user_id, organization_id, role) 
        VALUES (p_accepting_user_id, v_org_id, v_invite_role);

        -- Mark invitation as accepted if it exists
        IF v_invite.id IS NOT NULL THEN
            UPDATE public.invitations SET status = 'ACCEPTED', updated_at = NOW() WHERE id = v_invite.id;
        END IF;
        
    EXCEPTION
        WHEN others THEN
            RETURN jsonb_build_object(
                'success', FALSE, 
                'error', 'Failed to add member to organization: ' || SQLERRM
            );
    END;

    -- Step 5: Return success
    RETURN jsonb_build_object('success', TRUE, 'message', 'Successfully joined ' || v_org_name || '!');

EXCEPTION
    WHEN others THEN
        RAISE WARNING 'Unexpected error in accept_invitation: %', SQLERRM;
        RETURN jsonb_build_object(
            'success', FALSE, 
            'error', 'An unexpected error occurred while processing the invitation.'
        );
END;
$$;

-- Set function ownership and permissions
ALTER FUNCTION public.accept_invitation(TEXT, UUID, TEXT) OWNER TO postgres;

COMMENT ON FUNCTION public.accept_invitation(TEXT, UUID, TEXT) IS 
'Accepts organization invitation and automatically transfers 1 team credit using transfer_team_credits_to_member function';

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.accept_invitation(TEXT, UUID, TEXT) TO anon, authenticated, service_role;

-- ============================================================================
-- TRANSACTION AUDIT HELPER FUNCTIONS
-- ============================================================================

-- Function to get complete credit transfer transaction pairs
CREATE OR REPLACE FUNCTION public.get_credit_transfer_transaction_pair(
    p_transaction_id UUID
)
RETURNS TABLE (
    transaction_id UUID,
    user_id UUID,
    user_email TEXT,
    context public.account_type,
    credits_used INTEGER,
    credit_type public.credit_transfer_type,
    description TEXT,
    created_at TIMESTAMPTZ,
    related_transaction_id UUID,
    is_primary_transaction BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH transaction_pair AS (
        -- Get the primary transaction and its related transaction
        SELECT 
            t.id as transaction_id,
            t.user_id,
            u.email as user_email,
            t.context,
            t.credits_used,
            t.credit_type,
            t.description,
            t.created_at,
            t.related_transaction_id,
            TRUE as is_primary_transaction
        FROM public.transactions t
        LEFT JOIN auth.users u ON t.user_id = u.id
        WHERE t.id = p_transaction_id
        
        UNION ALL
        
        -- Get the related transaction if it exists
        SELECT 
            rt.id as transaction_id,
            rt.user_id,
            ru2.email as user_email,
            rt.context,
            rt.credits_used,
            rt.credit_type,
            rt.description,
            rt.created_at,
            rt.related_transaction_id,
            FALSE as is_primary_transaction
        FROM public.transactions t
        JOIN public.transactions rt ON t.related_transaction_id = rt.id
        LEFT JOIN auth.users ru2 ON rt.user_id = ru2.id
        WHERE t.id = p_transaction_id
    )
    SELECT 
        tp.transaction_id,
        tp.user_id,
        tp.user_email,
        tp.context,
        tp.credits_used,
        tp.credit_type,
        tp.description,
        tp.created_at,
        tp.related_transaction_id,
        tp.is_primary_transaction
    FROM transaction_pair tp
    ORDER BY tp.is_primary_transaction DESC, tp.created_at;
END;
$$;

-- Function to get all credit transfer transactions for a user with their pairs
CREATE OR REPLACE FUNCTION public.get_user_credit_transfer_history(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    transaction_id UUID,
    user_id UUID,
    user_email TEXT,
    context public.account_type,
    credits_used INTEGER,
    credit_type public.credit_transfer_type,
    description TEXT,
    created_at TIMESTAMPTZ,
    related_transaction_id UUID,
    transfer_pair_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id as transaction_id,
        t.user_id,
        u.email as user_email,
        t.context,
        t.credits_used,
        t.credit_type,
        t.description,
        t.created_at,
        t.related_transaction_id,
        -- Use the smaller ID as the pair identifier for grouping
        CASE 
            WHEN t.related_transaction_id IS NOT NULL THEN 
                LEAST(t.id, t.related_transaction_id)
            ELSE t.id 
        END as transfer_pair_id
    FROM public.transactions t
    LEFT JOIN auth.users u ON t.user_id = u.id
    WHERE t.user_id = p_user_id
    ORDER BY t.created_at DESC
    LIMIT p_limit;
END;
$$;

-- Add function comments
COMMENT ON FUNCTION public.get_credit_transfer_transaction_pair IS 'Gets both transactions in a credit transfer pair for complete audit trail';
COMMENT ON FUNCTION public.get_user_credit_transfer_history IS 'Gets credit transfer history for a user with related transaction information';

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_credit_transfer_transaction_pair TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_credit_transfer_transaction_pair TO service_role;

GRANT EXECUTE ON FUNCTION public.get_user_credit_transfer_history TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_credit_transfer_history TO service_role;
