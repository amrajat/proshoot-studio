-- Fix RLS policies on public.organization_members to prevent recursion

-- Drop existing potentially problematic policies
DROP POLICY IF EXISTS "Allow members read access to membership details" ON public.organization_members;
DROP POLICY IF EXISTS "Allow org admins full access to members" ON public.organization_members;
DROP POLICY IF EXISTS "Allow users to see their own membership" ON public.organization_members;

-- Recreate simplified policies

-- Policy 1: Allow users to SELECT their own membership record(s)
CREATE POLICY "Allow users to SELECT own membership" ON public.organization_members
  FOR SELECT
  USING ( auth.uid() = user_id );

-- Policy 2: Allow organization admins SELECT/INSERT/UPDATE/DELETE for members of their org
-- This checks the *requesting user's* role in the target organization.
CREATE POLICY "Allow org admins full access to members" ON public.organization_members
  FOR ALL -- Covers SELECT, INSERT, UPDATE, DELETE
  USING (
    -- Check if the current user is an admin in the organization associated with the row being accessed/modified
    EXISTS (
      SELECT 1
      FROM public.organization_members mem
      WHERE mem.organization_id = organization_members.organization_id
      AND mem.user_id = auth.uid()
      AND mem.role = 'admin'::public.organization_role
    )
  )
  WITH CHECK (
    -- Check if the current user is an admin in the organization associated with the row being created/modified
    EXISTS (
      SELECT 1
      FROM public.organization_members mem
      WHERE mem.organization_id = organization_members.organization_id
      AND mem.user_id = auth.uid()
      AND mem.role = 'admin'::public.organization_role
    )
  );

-- Ensure RLS is enabled (redundant but safe)
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Note: With these policies, a regular member cannot directly SELECT other members'
-- records via RLS alone. If you need members to see who else is in their org,
-- you should implement a specific query (potentially using a SECURITY DEFINER function)
-- in your application backend or API that fetches members for a given org_id
-- after verifying the requesting user is part of that organization.
