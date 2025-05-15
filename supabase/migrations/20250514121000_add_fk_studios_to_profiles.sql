-- Migration to add a foreign key from studios.creator_user_id to profiles.user_id
-- This helps PostgREST identify the relationship for joins.

BEGIN;

-- First, ensure that all existing creator_user_id in studios have a corresponding user_id in profiles.
-- If not, this FK constraint will fail. You might need to handle orphaned studios or create missing profiles.
-- For a new setup or if data integrity is already ensured, this step might be optional.

-- Add the foreign key constraint
ALTER TABLE public.studios
ADD CONSTRAINT fk_studios_creator_user_id_to_profiles_user_id
FOREIGN KEY (creator_user_id)
REFERENCES public.profiles(user_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Add a comment for clarity
COMMENT ON CONSTRAINT fk_studios_creator_user_id_to_profiles_user_id ON public.studios
IS 'Ensures creator_user_id in studios maps to a valid user_id in profiles, establishing a direct link for joins.';

COMMIT; 