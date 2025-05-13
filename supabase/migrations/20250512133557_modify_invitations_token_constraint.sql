-- Modify the token column in the invitations table
-- Make it nullable and remove the UNIQUE constraint
ALTER TABLE public.invitations
DROP CONSTRAINT IF EXISTS invitations_token_key; -- Drops the UNIQUE constraint (name might vary slightly)

ALTER TABLE public.invitations
ALTER COLUMN token DROP NOT NULL; -- Make token nullable

COMMENT ON COLUMN public.invitations.token IS 'Stores the specific invite token used, if applicable. Can be NULL or store a non-unique universal organization token for email invites.';

-- If your unique constraint had a different name (e.g., from an older version of PG or how Supabase named it)
-- you might need to find its exact name using:
-- SELECT constraint_name
-- FROM information_schema.table_constraints
-- WHERE table_name = 'invitations' AND constraint_type = 'UNIQUE';
-- And then use that name in the DROP CONSTRAINT command.
-- For Supabase-generated constraints, 'invitations_token_key' is common.
