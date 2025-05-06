-- Add UNIQUE constraint to enforce one owned organization per user
ALTER TABLE public.organizations
  ADD CONSTRAINT organizations_owner_user_id_key UNIQUE (owner_user_id);

-- Note: If existing data violates this constraint (a user already owns multiple orgs),
-- this migration will fail. You must manually clean up the data before applying.
