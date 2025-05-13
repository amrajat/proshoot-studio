-- Add UNIQUE constraint to enforce one credits row per user_id
-- This aligns with the model where the user's single credit row
-- gets its organization_id updated when they own an org.
ALTER TABLE public.credits
ADD CONSTRAINT credits_user_id_key UNIQUE (user_id);

-- Note: This migration will fail if any existing user currently has
-- multiple rows in the credits table (which might be the case due to
-- the previous setup). Before applying this, clean up duplicate rows,
-- keeping only one row per user (ideally the one with org_id=NULL if both exist).
