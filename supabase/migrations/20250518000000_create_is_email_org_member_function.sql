-- supabase/migrations/YYYYMMDDHHMMSS_create_is_email_org_member_function.sql

CREATE OR REPLACE FUNCTION is_email_org_member(p_email TEXT, p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  is_member BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM organization_members om
    JOIN profiles p ON om.user_id = p.user_id
    WHERE p.email = p_email
    AND om.organization_id = p_org_id
  ) INTO is_member;
  RETURN is_member;
END;
$$; 