-- Create a new, secure, and unified function to handle all invitation types.
CREATE OR REPLACE FUNCTION public.accept_invitation(
    p_invite_token TEXT,
    p_accepting_user_id UUID,
    p_accepting_user_email TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invite RECORD;
    v_org_id UUID;
    v_org_name TEXT;
    v_invite_role public.organization_role;
    v_user_credit_id UUID;
    v_org_credit_id UUID;
BEGIN
    -- Step 1: Try to find a UNIQUE invite token first.
    SELECT * INTO v_invite FROM public.invitations WHERE token = p_invite_token;

    IF FOUND THEN
        -- Check if the invitation is email-specific and if the user's email matches.
        IF v_invite.invited_email IS NOT NULL AND v_invite.invited_email != p_accepting_user_email THEN
            RETURN jsonb_build_object('success', false, 'error', 'This invitation is intended for ' || v_invite.invited_email || '. Please log in with the correct account.');
        END IF;

        -- Case A: This is a unique email invitation.
        v_org_id := v_invite.organization_id;
        v_invite_role := v_invite.role;

        IF v_invite.status != 'pending' THEN
            RETURN jsonb_build_object('success', false, 'error', 'This invitation has already been ' || v_invite.status || ' or is expired.');
        END IF;

    ELSE
        -- Case B: If not a unique token, check if it's a UNIVERSAL organization token.
        SELECT id, name INTO v_org_id, v_org_name FROM public.organizations WHERE invite_token = p_invite_token;

        IF NOT FOUND THEN
            -- If not found in either table, the token is invalid.
            RETURN jsonb_build_object('success', false, 'error', 'Invitation not found or invalid token.');
        END IF;
        
        -- For universal links, the role is always 'member'.
        v_invite_role := 'member'::public.organization_role;
    END IF;

    -- Step 2: Now that we have the organization ID, perform common checks and actions.
    IF v_org_name IS NULL THEN
        SELECT name INTO v_org_name FROM public.organizations WHERE id = v_org_id;
    END IF;
    
    -- Check if user is already a member of the determined organization
    IF EXISTS (SELECT 1 FROM public.members WHERE user_id = p_accepting_user_id AND organization_id = v_org_id) THEN
        IF v_invite.id IS NOT NULL AND v_invite.status = 'pending' THEN
             UPDATE public.invitations SET status = 'accepted', updated_at = now() WHERE id = v_invite.id;
        END IF;
        RETURN jsonb_build_object('success', true, 'message', 'You are already a member of ' || v_org_name || '.');
    END IF;

    -- Step 3: Perform the atomic credit transfer and membership creation.
    BEGIN
        UPDATE public.credits SET team = team - 1, updated_at = now() WHERE organization_id = v_org_id AND team > 0 RETURNING id INTO v_org_credit_id;
        IF NOT FOUND THEN RAISE EXCEPTION 'Organization has insufficient credits or no credit account.'; END IF;
        
        INSERT INTO public.credits (user_id, team) VALUES (p_accepting_user_id, 1)
        ON CONFLICT (user_id) WHERE organization_id IS NULL
        DO UPDATE SET team = credits.team + 1, updated_at = now() RETURNING id INTO v_user_credit_id;
        IF NOT FOUND THEN RAISE EXCEPTION 'Failed to find or create a personal credit account for the user.'; END IF;
        
        INSERT INTO public.members (user_id, organization_id, role) VALUES (p_accepting_user_id, v_org_id, v_invite_role);

        IF v_invite.id IS NOT NULL THEN
            UPDATE public.invitations SET status = 'accepted', updated_at = now() WHERE id = v_invite.id;
        END IF;
    EXCEPTION
        WHEN others THEN
            RETURN jsonb_build_object('success', false, 'error', 'Failed to process invitation. This could be due to insufficient organization credits. Error: ' || SQLERRM);
    END;

    -- Step 4: Return success.
    RETURN jsonb_build_object('success', true, 'message', 'Successfully joined ' || v_org_name || '!');

END;
$$;
