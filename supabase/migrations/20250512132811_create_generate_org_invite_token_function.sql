-- Function to generate or regenerate the universal invite token for an organization
CREATE OR REPLACE FUNCTION public.generate_org_invite_token(p_org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER -- Check permissions using RLS/standard checks
AS $$
DECLARE
  v_new_token TEXT;
  v_is_admin BOOLEAN;
BEGIN
  -- Check if the current user is an admin of the specified organization
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members mem
    WHERE mem.organization_id = p_org_id
      AND mem.user_id = auth.uid()
      AND mem.role = 'admin'::organization_role
  ) INTO v_is_admin;

  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'User is not authorized to generate invite token for this organization.';
  END IF;

  -- Generate a new token
  v_new_token := extensions.uuid_generate_v4()::TEXT;

  -- Update the organization's token and timestamp
  UPDATE public.organizations
  SET
    invite_token = v_new_token,
    invite_token_generated_at = now()
  WHERE id = p_org_id;

  -- Return the newly generated token
  RETURN v_new_token;

END;
$$;

-- Grant execute permission to authenticated users
-- The function itself checks for the 'admin' role internally.
GRANT EXECUTE ON FUNCTION public.generate_org_invite_token(UUID) TO authenticated;
