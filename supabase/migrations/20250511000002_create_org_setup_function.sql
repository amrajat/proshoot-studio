CREATE OR REPLACE FUNCTION public.create_organization_with_initial_setup(
    p_owner_user_id UUID,
    p_org_name TEXT,
    p_team_size INT DEFAULT NULL,
    p_website TEXT DEFAULT NULL,
    p_industry TEXT DEFAULT NULL,
    p_department TEXT DEFAULT NULL,
    p_position TEXT DEFAULT NULL
)
RETURNS TABLE(created_org_id UUID, created_org_name TEXT) -- Match the expected return type of createOrganizationAction
LANGUAGE plpgsql
SECURITY DEFINER
-- Set a search_path to ensure the function can find tables in the public schema without schema-qualifying them everywhere.
-- This is good practice for SECURITY DEFINER functions.
SET search_path = public
AS $$
DECLARE
    v_created_org_id UUID;
    v_created_org_name TEXT;
BEGIN
    -- Validate required parameters
    IF p_owner_user_id IS NULL THEN
        RAISE EXCEPTION 'Owner user ID cannot be null';
    END IF;
    IF p_org_name IS NULL OR BTRIM(p_org_name) = '' THEN
        RAISE EXCEPTION 'Organization name cannot be empty';
    END IF;

    -- 1. Insert into organizations
    INSERT INTO organizations (owner_user_id, name, team_size, website, industry, department, "position")
    VALUES (p_owner_user_id, BTRIM(p_org_name), p_team_size, p_website, p_industry, p_department, p_position)
    RETURNING id, name INTO v_created_org_id, v_created_org_name;

    -- 2. Insert into organization_members (owner as admin)
    INSERT INTO organization_members (organization_id, user_id, role)
    VALUES (v_created_org_id, p_owner_user_id, 'admin'::organization_role);

    -- 3. UPDATE the owner's existing credits row to link it to the new organization
    UPDATE public.credits
    SET organization_id = v_created_org_id
    WHERE user_id = p_owner_user_id;
    -- Note: We assume the trigger handle_new_profile_credit already created the row.
    -- Consider if team credits should be set/reset here.
    
    -- Return the ID and name of the newly created organization
    RETURN QUERY SELECT v_created_org_id, v_created_org_name;

EXCEPTION
    WHEN OTHERS THEN
        -- Log the error (optional, requires logging setup or use RAISE NOTICE)
        RAISE WARNING 'Error in create_organization_with_initial_setup: %', SQLERRM;
        RAISE;
END;
$$;

-- Grant execute permission to the 'authenticated' role so logged-in users can call it via RPC.
-- Server actions might use a service role that already has permissions, but this is safer.
GRANT EXECUTE ON FUNCTION public.create_organization_with_initial_setup(UUID, TEXT, INT, TEXT, TEXT, TEXT, TEXT) TO authenticated; 