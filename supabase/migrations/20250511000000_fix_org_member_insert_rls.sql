-- Drop the existing policy first
DROP POLICY IF EXISTS "Allow org admins OR owner to INSERT first admin member" ON public.organization_members;
DROP POLICY IF EXISTS "Allow org admins INSERT members" ON public.organization_members; -- Drop the simpler name too, just in case

-- Create the policy that only allows existing admins to insert members
CREATE POLICY "Allow org admins to INSERT new members" ON public.organization_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.organization_members mem
      WHERE mem.organization_id = organization_members.organization_id -- organization_id of the row being inserted
      AND mem.user_id = auth.uid()
      AND mem.role = 'admin'::public.organization_role
    )
  );

-- Ensure RLS is enabled
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY; 