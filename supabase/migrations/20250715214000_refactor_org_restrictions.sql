-- Step 1: Add the new array columns to the organizations table.
-- These will store the IDs of approved items.
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS approved_clothing TEXT[] NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS approved_backgrounds TEXT[] NOT NULL DEFAULT '{}';

-- Step 2: Drop the old, now-redundant tables as per user confirmation that no data migration is needed.
DROP TABLE IF EXISTS public.organization_approved_clothing;
DROP TABLE IF EXISTS public.organization_approved_backgrounds;

-- Step 3: Ensure RLS policies are up-to-date.
-- The existing policies for admins/owners (full access) and members (read access)
-- on the 'organizations' table will implicitly cover these new columns.
-- No changes to RLS are strictly necessary, but we ensure the table has RLS enabled.
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

