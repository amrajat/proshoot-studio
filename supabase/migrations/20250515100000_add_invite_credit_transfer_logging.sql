-- Add new transaction types for invite acceptance
ALTER TYPE public.transaction_type ADD VALUE IF NOT EXISTS 'invite_accept_deduct';
ALTER TYPE public.transaction_type ADD VALUE IF NOT EXISTS 'invite_accept_add';

-- Update transfer_org_team_credit function (no changes needed, it accepts the type as param)
-- Keep it here for reference if needed in future.
/*
CREATE OR REPLACE FUNCTION public.transfer_org_team_credit(...) ... END; $$;
*/

-- Update accept_organization_invite_with_credit_transfer function
CREATE OR REPLACE FUNCTION public.accept_organization_invite_with_credit_transfer(
    p_user_id UUID, -- The user accepting the invite
    p_organization_id UUID,
    p_invite_token TEXT -- This should be the org's universal invite_token
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Necessary to check token and modify members/credits
SET search_path = public
AS $$
DECLARE
    v_org_owner_id UUID;
    v_org_name TEXT;
    v_org_token TEXT;
    v_new_member_id UUID;
    v_user_credit_account_id UUID;
    v_credit_deducted BOOLEAN := false;
    v_credit_added BOOLEAN := false;
    v_deduction_error TEXT := NULL;
    v_addition_error TEXT := NULL;
    result JSONB;
BEGIN
    -- Fetch organization details including the owner and the current universal token
    SELECT owner_user_id, name, invite_token
    INTO v_org_owner_id, v_org_name, v_org_token
    FROM public.organizations
    WHERE id = p_organization_id;

    -- Check if organization exists
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Organization not found.');
    END IF;

    -- Check if token matches (must match the organization's current universal token)
    IF v_org_token IS NULL OR v_org_token != p_invite_token THEN
        RETURN jsonb_build_object('error', 'Invalid or expired invite token.');
    END IF;

    -- Check if user is already a member
    IF EXISTS (SELECT 1 FROM public.organization_members WHERE user_id = p_user_id AND organization_id = p_organization_id) THEN
        RETURN jsonb_build_object('success', true, 'message', 'Already a member.', 'organization_name', v_org_name);
    END IF;

    -- STEP 1: Attempt to deduct 1 team credit from the organization owner *BEFORE* adding member
    BEGIN
        SELECT transfer_org_team_credit(
            p_org_id := p_organization_id,
            p_admin_user_id := v_org_owner_id,
            p_amount := 1,
            p_transaction_type := 'invite_accept_deduct'::transaction_type, -- Use specific type
            p_description := 'Team credit deducted for invite acceptance by user ' || p_user_id::TEXT
        )
        INTO v_credit_deducted; -- Will be TRUE if successful
    EXCEPTION
        WHEN OTHERS THEN
            -- Capture the specific error
            v_deduction_error := SQLERRM;
            RAISE WARNING 'Credit deduction failed for org % owner % upon invite accept by user %: %', p_organization_id, v_org_owner_id, p_user_id, v_deduction_error;
            -- Check if the error is due to insufficient funds (or any error we want to block on)
            -- The transfer_org_team_credit function raises generic exceptions like 'Insufficient team credits...'
            IF v_deduction_error LIKE '%Insufficient team credits%' THEN
                 RETURN jsonb_build_object('error', 'Organization has insufficient Team Credits to accept new members via this link.');
            ELSE
                -- For other deduction errors, maybe still allow joining? Or block?
                -- Current decision: Block on ANY deduction error for safety.
                 RETURN jsonb_build_object('error', 'Failed to process organization credits: ' || v_deduction_error);
            END IF;
            -- No need to set v_credit_deducted = false here, we are returning.
    END;

    -- If credit deduction succeeded (didn't raise exception / return error), proceed.
    v_credit_deducted := true; 

    -- STEP 2: Insert user into organization_members since credit deduction was successful
    INSERT INTO public.organization_members (user_id, organization_id, role)
    VALUES (p_user_id, p_organization_id, 'member'::organization_role)
    RETURNING id INTO v_new_member_id;

    -- STEP 3: Attempt to add 1 team credit to the joining user's PERSONAL credit row
    -- This happens only if member insert succeeded.
    BEGIN
        -- Find the user's PERSONAL credit row (org_id is NULL)
        SELECT id
        INTO v_user_credit_account_id
        FROM public.credits
        WHERE user_id = p_user_id
          AND organization_id IS NULL;

        -- Ensure the user's personal credit row exists (should be handled by trigger, but check anyway)
        IF v_user_credit_account_id IS NULL THEN
            RAISE WARNING 'Personal credit row not found for user % during invite accept. Attempting to create.', p_user_id;
            INSERT INTO public.credits (user_id, organization_id, team)
            VALUES (p_user_id, NULL, 0)
            ON CONFLICT (user_id) WHERE organization_id IS NULL -- Assumes unique constraint or logical uniqueness
            DO NOTHING;

            -- Re-query for the ID
             SELECT id
             INTO v_user_credit_account_id
             FROM public.credits
             WHERE user_id = p_user_id
               AND organization_id IS NULL;

             IF v_user_credit_account_id IS NULL THEN
                 -- If still null after insert attempt, something is wrong. Log and maybe don't add credit?
                 RAISE WARNING 'Failed to find or create personal credit row for user %. Cannot add team credit.', p_user_id;
                 v_addition_error := 'Failed to locate user personal credit account.';
                 -- Continue without adding credit in this edge case
             ELSE
                 -- Row found/created, proceed with credit addition
                 UPDATE public.credits
                 SET team = team + 1,
                     updated_at = now()
                 WHERE id = v_user_credit_account_id;

                 -- Log the transaction for the user receiving the credit
                 INSERT INTO public.transactions (
                     user_id, organization_id, credit_account_id, change_amount, type, description
                 ) VALUES (
                     p_user_id, p_organization_id, v_user_credit_account_id, 1, 'invite_accept_add'::transaction_type,
                     'Team credit added from organization invite acceptance (Org: ' || p_organization_id::TEXT || ')'
                 );
                 v_credit_added := true;
             END IF;
        ELSE
            -- Row exists, proceed with credit addition
            UPDATE public.credits
            SET team = team + 1,
                updated_at = now()
            WHERE id = v_user_credit_account_id;

            -- Log the transaction for the user receiving the credit
            INSERT INTO public.transactions (
                user_id, organization_id, credit_account_id, change_amount, type, description
            ) VALUES (
                p_user_id, p_organization_id, v_user_credit_account_id, 1, 'invite_accept_add'::transaction_type,
                'Team credit added from organization invite acceptance (Org: ' || p_organization_id::TEXT || ')'
            );
            v_credit_added := true;
        END IF;

    EXCEPTION
        WHEN OTHERS THEN
            v_addition_error := SQLERRM;
            RAISE WARNING 'Credit addition failed for user % upon accepting invite for org %: %', p_user_id, p_organization_id, v_addition_error;
            v_credit_added := false;
            -- Do not fail the whole operation, just note the addition failed.
    END;

    -- Build the success response
    result := jsonb_build_object(
        'success', true,
        'member_id', v_new_member_id,
        'organization_name', v_org_name,
        'credit_deducted', v_credit_deducted, -- Will be true if we reached here
        'credit_added', v_credit_added
    );

    -- No need to add v_deduction_error here as we would have returned earlier if it occurred.
    IF v_addition_error IS NOT NULL THEN
        result := result || jsonb_build_object('credit_addition_error', v_addition_error);
    END IF;

    RETURN result;

EXCEPTION
    WHEN others THEN
        RAISE WARNING 'Error in accept_organization_invite_with_credit_transfer: %', SQLERRM;
        RETURN jsonb_build_object('error', 'An unexpected error occurred: ' || SQLERRM);
END;
$$;

-- Grant execute permission (already granted in previous migration, but ensure it's correct)
GRANT EXECUTE ON FUNCTION public.accept_organization_invite_with_credit_transfer(UUID, UUID, TEXT) TO authenticated; 