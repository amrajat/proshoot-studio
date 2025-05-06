-- Define Enum Type for Credit Transfer
CREATE TYPE public.credit_transfer_type AS ENUM ('starter', 'pro', 'elite', 'studio', 'balance', 'none');

-- Alter Invitations Table to add transfer details
ALTER TABLE public.invitations
  ADD COLUMN transfer_credit_type public.credit_transfer_type NOT NULL DEFAULT 'none',
  ADD COLUMN transfer_credit_amount INT4 NULL CHECK (transfer_credit_amount IS NULL OR transfer_credit_amount > 0);

-- Add constraint for transfer amount based on type
ALTER TABLE public.invitations
  ADD CONSTRAINT transfer_amount_check
  CHECK (
    (transfer_credit_type = 'balance' AND transfer_credit_amount IS NOT NULL)
    OR
    (transfer_credit_type != 'balance' AND transfer_credit_amount IS NULL)
  );
