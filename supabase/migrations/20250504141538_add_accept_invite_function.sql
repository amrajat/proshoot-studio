-- Function to accept an invitation and transfer credits atomically
CREATE OR REPLACE FUNCTION public.accept_invitation_and_transfer_credits(
    invitation_token TEXT,
    accepting_user_id UUID,
    accepting_user_email TEXT
)
RETURNS TABLE(success BOOLEAN, message TEXT, organization_id UUID) -- Return success status, message, and org ID
LANGUAGE plpgsql
SECURITY DEFINER -- Essential for modifying credits across users/orgs
SET search_path = public -- Define search path
AS $$
DECLARE
    invite_record RECORD;
    org_credit_record RECORD;
    user_credit_record RECORD;
    rows_affected INT;
    transfer_column TEXT;
    transfer_value INT;
BEGIN
    -- 1. Find the valid invitation
    SELECT * INTO invite_record
    FROM public.invitations
    WHERE token = invitation_token AND status = 'pending';

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Invalid or expired invitation token.'::TEXT, NULL::UUID;
        RETURN;
    END IF;

    -- 2. Verify the accepting user's email matches the invite
    IF invite_record.invited_email != accepting_user_email THEN
         RETURN QUERY SELECT FALSE, 'Email address does not match invitation.'::TEXT, NULL::UUID;
         RETURN;
    END IF;

     -- Check if user is already a member (optional, prevents duplicate membership entries)
     PERFORM 1 FROM public.organization_members
     WHERE organization_id = invite_record.organization_id AND user_id = accepting_user_id;
     IF FOUND THEN
          -- Decide action: update status & return success, or return error?
          -- Let's update status and return success to allow re-accept flow.
          UPDATE public.invitations SET status = 'accepted', updated_at = now() WHERE id = invite_record.id;
          RETURN QUERY SELECT TRUE, 'Already a member, invitation marked accepted.'::TEXT, invite_record.organization_id;
          RETURN;
     END IF;


    -- 3. Perform Credit Transfer (if specified)
    IF invite_record.transfer_credit_type != 'none' THEN
        -- Determine column name and amount
        transfer_column := CASE invite_record.transfer_credit_type
            WHEN 'starter' THEN '"Starter"' -- Quote required due to capitalization
            WHEN 'pro' THEN '"Pro"'
            WHEN 'elite' THEN '"Elite"'
            WHEN 'studio' THEN '"Studio"'
            WHEN 'balance' THEN 'balance'
            ELSE NULL -- Should not happen based on enum/check constraint
        END;
        transfer_value := CASE invite_record.transfer_credit_type
            WHEN 'balance' THEN invite_record.transfer_credit_amount
            ELSE 1 -- Transfer 1 credit for plan types
        END;

        IF transfer_column IS NULL OR transfer_value IS NULL THEN
             RAISE EXCEPTION 'Invalid credit transfer type calculation: %', invite_record.transfer_credit_type;
        END IF;

        -- Decrement organization credits (check if sufficient)
        EXECUTE format('UPDATE public.credits SET %I = %I - $1, updated_at = now() WHERE organization_id = $2 AND %I >= $1 RETURNING *',
                       transfer_column, transfer_column, transfer_column)
        INTO org_credit_record -- Capture the updated row (or NULL if check failed)
        USING transfer_value, invite_record.organization_id;

        GET DIAGNOSTICS rows_affected = ROW_COUNT;
        IF rows_affected = 0 OR org_credit_record IS NULL THEN
            RAISE EXCEPTION 'Insufficient credits in organization or organization credits not found.';
        END IF;

        -- Increment user credits
         EXECUTE format('UPDATE public.credits SET %I = %I + $1, updated_at = now() WHERE user_id = $2 RETURNING *',
                        transfer_column, transfer_column)
         INTO user_credit_record
         USING transfer_value, accepting_user_id;

         GET DIAGNOSTICS rows_affected = ROW_COUNT;
         IF rows_affected = 0 OR user_credit_record IS NULL THEN
              RAISE EXCEPTION 'User credits record not found for increment.';
         END IF;

         -- TODO: (Optional but Recommended) Insert into public.transactions table here
         -- Insert one row for org deduction, one for user addition

    END IF; -- End credit transfer logic

    -- 4. Add user to organization members
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (invite_record.organization_id, accepting_user_id, invite_record.role);

    -- 5. Update invitation status
    UPDATE public.invitations SET status = 'accepted', updated_at = now() WHERE id = invite_record.id;

    -- 6. Return success
    RETURN QUERY SELECT TRUE, 'Invitation accepted successfully.'::TEXT, invite_record.organization_id;

EXCEPTION
    WHEN OTHERS THEN
        -- Log the error (optional, requires setup)
        RAISE WARNING 'Error accepting invitation %: %', invitation_token, SQLERRM;
        RETURN QUERY SELECT FALSE, 'An error occurred: ' || SQLERRM, NULL::UUID;
        -- The transaction will be rolled back automatically on exception
END;
$$;
