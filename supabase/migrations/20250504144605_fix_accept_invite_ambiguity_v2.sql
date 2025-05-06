-- Recreate Function again to fix ambiguous column reference v2
CREATE OR REPLACE FUNCTION public.accept_invitation_and_transfer_credits(
    invitation_token TEXT,
    accepting_user_id UUID,
    accepting_user_email TEXT
)
RETURNS TABLE(success BOOLEAN, message TEXT, organization_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    invite_record RECORD;
    org_credit_record RECORD;
    user_credit_record RECORD;
    rows_affected INT;
    transfer_column TEXT;
    transfer_value INT;
BEGIN
    -- 1. Find the valid invitation (Same as before)
    SELECT * INTO invite_record
    FROM public.invitations
    WHERE token = invitation_token AND status = 'pending';

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Invalid or expired invitation token.'::TEXT, NULL::UUID;
        RETURN;
    END IF;

    -- 2. Verify the accepting user's email matches the invite (Same as before)
    IF invite_record.invited_email != accepting_user_email THEN
         RETURN QUERY SELECT FALSE, 'Email address does not match invitation.'::TEXT, NULL::UUID;
         RETURN;
    END IF;

     -- Check if user is already a member
     -- *** FIX: Explicitly qualify organization_id in WHERE clause ***
     PERFORM 1 FROM public.organization_members
     WHERE public.organization_members.organization_id = invite_record.organization_id
       AND public.organization_members.user_id = accepting_user_id;
     IF FOUND THEN
          UPDATE public.invitations SET status = 'accepted', updated_at = now() WHERE id = invite_record.id;
          RETURN QUERY SELECT TRUE, 'Already a member, invitation marked accepted.'::TEXT, invite_record.organization_id;
          RETURN;
     END IF;

    -- 3. Perform Credit Transfer (if specified)
    IF invite_record.transfer_credit_type != 'none' THEN
        -- Determine column name and amount (Same as before)
        transfer_column := CASE invite_record.transfer_credit_type
            WHEN 'starter' THEN '"Starter"' WHEN 'pro' THEN '"Pro"'
            WHEN 'elite' THEN '"Elite"' WHEN 'studio' THEN '"Studio"'
            WHEN 'balance' THEN 'balance' ELSE NULL
        END;
        transfer_value := CASE invite_record.transfer_credit_type
            WHEN 'balance' THEN invite_record.transfer_credit_amount ELSE 1
        END;

        IF transfer_column IS NULL OR transfer_value IS NULL THEN
             RAISE EXCEPTION 'Invalid credit transfer type calculation: %', invite_record.transfer_credit_type;
        END IF;

        -- Decrement organization credits (Qualification from previous fix)
        EXECUTE format('UPDATE public.credits SET %I = %I - $1, updated_at = now() WHERE public.credits.organization_id = $2 AND %I >= $1 RETURNING *',
                       transfer_column, transfer_column, transfer_column)
        INTO org_credit_record
        USING transfer_value, invite_record.organization_id;

        GET DIAGNOSTICS rows_affected = ROW_COUNT;
        IF rows_affected = 0 OR org_credit_record IS NULL THEN
            RAISE EXCEPTION 'Insufficient credits in organization or organization credits not found.';
        END IF;

        -- Increment user credits (Same as before)
         EXECUTE format('UPDATE public.credits SET %I = %I + $1, updated_at = now() WHERE user_id = $2 RETURNING *',
                        transfer_column, transfer_column)
         INTO user_credit_record
         USING transfer_value, accepting_user_id;

         GET DIAGNOSTICS rows_affected = ROW_COUNT;
         IF rows_affected = 0 OR user_credit_record IS NULL THEN
              RAISE EXCEPTION 'User credits record not found for increment.';
         END IF;

         -- TODO: Insert into public.transactions table here

    END IF;

    -- 4. Add user to organization members (Same as before)
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (invite_record.organization_id, accepting_user_id, invite_record.role);

    -- 5. Update invitation status (Same as before)
    UPDATE public.invitations SET status = 'accepted', updated_at = now() WHERE id = invite_record.id;

    -- 6. Return success (Same as before)
    RETURN QUERY SELECT TRUE, 'Invitation accepted successfully.'::TEXT, invite_record.organization_id;

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error accepting invitation %: %', invitation_token, SQLERRM;
        RETURN QUERY SELECT FALSE, 'An error occurred: ' || SQLERRM, NULL::UUID;
END;
$$;
