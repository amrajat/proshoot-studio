-- Fix RLS policies AGAIN on public.organization_members to prevent recursion v2

-- Drop existing policies from the previous fix attempt
DROP POLICY IF EXISTS "Allow users to SELECT own membership" ON public.organization_members;
DROP POLICY IF EXISTS "Allow org admins full access to members" ON public.organization_members;

-- Recreate refined, action-specific policies

-- Policy 1: Allow users to SELECT their own membership record(s) (Non-recursive for SELECT)
CREATE POLICY "Allow users SELECT own membership" ON public.organization_members
  FOR SELECT
  USING ( auth.uid() = user_id );

-- Policy 2: Allow organization admins to INSERT members into their org
CREATE POLICY "Allow org admins INSERT members" ON public.organization_members
  FOR INSERT
  WITH CHECK (
    -- Check if the current user is an admin in the organization they are adding to
    EXISTS (
      SELECT 1
      FROM public.organization_members mem
      WHERE mem.organization_id = organization_members.organization_id -- Use the organization_id being inserted
      AND mem.user_id = auth.uid()
      AND mem.role = 'admin'::public.organization_role
    )
  );

-- Policy 3: Allow organization admins to UPDATE members in their org (e.g., change role)
CREATE POLICY "Allow org admins UPDATE members" ON public.organization_members
  FOR UPDATE
  USING ( -- This USING clause only applies to rows being considered for UPDATE, not initial SELECT
    EXISTS (
      SELECT 1
      FROM public.organization_members mem
      WHERE mem.organization_id = organization_members.organization_id
      AND mem.user_id = auth.uid()
      AND mem.role = 'admin'::public.organization_role
    )
  )
  WITH CHECK ( -- Ensure the update still keeps the row valid according to admin check
     EXISTS (
      SELECT 1
      FROM public.organization_members mem
      WHERE mem.organization_id = organization_members.organization_id
      AND mem.user_id = auth.uid()
      AND mem.role = 'admin'::public.organization_role
    )
  );

-- Policy 4: Allow organization admins to DELETE members from their org
-- Note: Deleting the last admin might need special handling (e.g., prevent in app logic or DB function)
CREATE POLICY "Allow org admins DELETE members" ON public.organization_members
  FOR DELETE
  USING ( -- This USING clause only applies to rows being considered for DELETE
    EXISTS (
      SELECT 1
      FROM public.organization_members mem
      WHERE mem.organization_id = organization_members.organization_id
      AND mem.user_id = auth.uid()
      AND mem.role = 'admin'::public.organization_role
    )
    -- Optional: Add condition to prevent admin self-deletion if desired
    -- AND organization_members.user_id != auth.uid()
  );

-- Ensure RLS is enabled (redundant but safe)
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Note: Regular members cannot SELECT other members with these policies.
-- Fetching the list of members for an org requires application-level logic
-- or a SECURITY DEFINER function that checks membership before querying.
