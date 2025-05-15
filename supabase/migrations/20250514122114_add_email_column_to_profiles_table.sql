-- Add email column to public.profiles table
BEGIN;

ALTER TABLE public.profiles
ADD COLUMN email TEXT;

-- Optional: Add a unique constraint if emails should be unique
-- ALTER TABLE public.profiles
-- ADD CONSTRAINT unique_email UNIQUE (email);

-- Optional: Add a NOT NULL constraint if email is required
-- ALTER TABLE public.profiles
-- ALTER COLUMN email SET NOT NULL;

COMMENT ON COLUMN public.profiles.email IS 'User''s email address.';

COMMIT;