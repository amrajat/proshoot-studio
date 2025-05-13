-- Function to deduct team credits from the org owner's credit row
-- and log the transaction.
CREATE OR REPLACE FUNCTION public.transfer_org_team_credit(
    p_org_id UUID,
    p_admin_user_id UUID, -- The user whose credit row to deduct from (should be the owner)
    p_amount INT,
    p_transaction_type public.transaction_type,
    p_description TEXT DEFAULT NULL,
    p_related_studio_id UUID DEFAULT NULL,
    p_related_purchase_id UUID DEFAULT NULL
)
RETURNS BOOLEAN -- Return true on success, raises exception on failure
LANGUAGE plpgsql
SECURITY DEFINER -- Must run with elevated privileges to modify credits/transactions
SET search_path = public
AS $$
DECLARE
  v_credit_account_id UUID;
  v_current_team_balance INT;
BEGIN
  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Deduction amount must be positive.';
  END IF;

  -- Find the specific credit row for the admin user associated with this org
  SELECT id, team
  INTO v_credit_account_id, v_current_team_balance
  FROM public.credits
  WHERE user_id = p_admin_user_id
    AND organization_id = p_org_id;

  -- Check if credit row exists
  IF v_credit_account_id IS NULL THEN
     RAISE EXCEPTION 'Credit account not found for user % in organization %.', p_admin_user_id, p_org_id;
  END IF;

  -- Check for sufficient balance
  IF v_current_team_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient team credits. Required: %, Available: %', p_amount, v_current_team_balance;
  END IF;

  -- Perform the deduction
  UPDATE public.credits
  SET team = team - p_amount,
      updated_at = now()
  WHERE id = v_credit_account_id;

  -- Log the transaction
  INSERT INTO public.transactions (
      user_id, -- User performing the action (the admin)
      organization_id, -- Org context
      credit_account_id, -- The credit row that was changed
      change_amount, -- Negative for deduction
      type,
      related_purchase_id,
      related_studio_id,
      description
  ) VALUES (
      p_admin_user_id,
      p_org_id,
      v_credit_account_id,
      -p_amount, -- Use negative value for deduction
      p_transaction_type,
      p_related_purchase_id,
      p_related_studio_id,
      p_description
  );

  RETURN TRUE; -- Indicate success

EXCEPTION
    WHEN OTHERS THEN
        -- Log the error (optional)
        RAISE WARNING 'Error in transfer_org_team_credit: %', SQLERRM;
        -- Re-raise the original exception
        RAISE;
END;
$$;

-- Grant execute permission ONLY to roles that should be able to trigger deductions
-- This likely means only the service_role, or specific backend functions.
-- DO NOT grant to 'authenticated' unless absolutely necessary and secured elsewhere.
-- For now, let's assume it will be called by other SECURITY DEFINER functions or service role.
-- If called via RPC from frontend actions (less ideal), grant to 'authenticated'
-- GRANT EXECUTE ON FUNCTION public.transfer_org_team_credit(UUID, UUID, INT, public.transaction_type, TEXT, UUID, UUID) TO authenticated;
