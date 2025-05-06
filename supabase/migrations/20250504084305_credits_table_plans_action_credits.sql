-- Modify public.credits table
ALTER TABLE public.credits
  ADD COLUMN "starter" INT4 NOT NULL DEFAULT 0,
  ADD COLUMN "pro" INT4 NOT NULL DEFAULT 0,
  ADD COLUMN "elite" INT4 NOT NULL DEFAULT 0,
  ADD COLUMN "studio" INT4 NOT NULL DEFAULT 0;

-- Ensure balance column constraints (already set in previous migration, but explicit)
ALTER TABLE public.credits
  ALTER COLUMN balance SET DEFAULT 0,
  ALTER COLUMN balance SET NOT NULL;

-- -- Update RLS Policies for public.credits to enforce read-only access for users

-- -- Drop existing policies (adjust names if different from previous migration)
-- DROP POLICY IF EXISTS "Allow user read access to own credit balance" ON public.credits;
-- DROP POLICY IF EXISTS "Allow org members read access to org credit balance" ON public.credits;
-- -- Drop any potential INSERT/UPDATE/DELETE policies if they were added previously
-- -- DROP POLICY IF EXISTS "PolicyNameForInsert" ON public.credits;
-- -- DROP POLICY IF EXISTS "PolicyNameForUpdate" ON public.credits;
-- -- DROP POLICY IF EXISTS "PolicyNameForDelete" ON public.credits;

-- -- Recreate SELECT policies only
-- CREATE POLICY "Allow user read access to own credit balance" ON public.credits
--   FOR SELECT
--   USING ( auth.uid() = user_id );

-- CREATE POLICY "Allow org members read access to org credit balance" ON public.credits
--   FOR SELECT
--   USING ( organization_id IS NOT NULL AND organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()) );

-- -- Ensure RLS is still enabled (should be from previous migration)
-- ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;

-- -- Note: Modifications (INSERT/UPDATE/DELETE) to credits should now
-- -- ONLY be possible through SECURITY DEFINER functions or the service_role key on the backend.
