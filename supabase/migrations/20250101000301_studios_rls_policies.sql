-- ============================================================================
-- RLS POLICIES: studios
-- DESCRIPTION: Row Level Security policies for studios table
-- DEPENDENCIES: studios table, organization helper functions
-- BREAKING CHANGES: None
-- ROLLBACK: DROP POLICY statements for each policy
-- ============================================================================

-- ============================================================================
-- SELECT POLICIES
-- ============================================================================

-- Policy: Users can view their own studios
CREATE POLICY "studios_select_own" ON public.studios
    FOR SELECT
    USING ((select auth.uid()) = creator_user_id);

-- Policy: Organization members can view organization studios
CREATE POLICY "studios_select_org_members" ON public.studios
    FOR SELECT
    USING (
        organization_id IS NOT NULL
        AND is_org_member(organization_id)
    );

-- ============================================================================
-- INSERT POLICIES
-- ============================================================================

-- Policy: Users can create their own studios
CREATE POLICY "studios_insert_own" ON public.studios
    FOR INSERT
    WITH CHECK ((select auth.uid()) = creator_user_id);

-- Policy: Organization members can create studios for their organization
CREATE POLICY "studios_insert_org_members" ON public.studios
    FOR INSERT
    WITH CHECK (
        (select auth.uid()) = creator_user_id
        AND (
            organization_id IS NULL
            OR is_org_member(organization_id)
        )
    );

-- ============================================================================
-- UPDATE POLICIES - REMOVED FOR SECURITY
-- ============================================================================
-- UPDATE policies removed to prevent direct studio modifications
-- Studio status updates must go through update_studio_status RPC function
-- This ensures proper validation and audit trail

-- ============================================================================
-- DELETE POLICIES
-- ============================================================================

-- Policy: Users can delete their own studios
CREATE POLICY "studios_delete_own" ON public.studios
    FOR DELETE
    USING ((select auth.uid()) = creator_user_id);

-- Policy: Organization owners can delete organization studios
CREATE POLICY "studios_delete_org_owners" ON public.studios
    FOR DELETE
    USING (
        organization_id IS NOT NULL
        AND is_org_owner(organization_id)
    );

-- ============================================================================
-- POLICY COMMENTS
-- ============================================================================

COMMENT ON POLICY "studios_select_own" ON public.studios IS 
    'Users can view studios they created';

COMMENT ON POLICY "studios_select_org_members" ON public.studios IS 
    'Organization members can view studios created within their organization';

COMMENT ON POLICY "studios_insert_own" ON public.studios IS 
    'Users can create new studios';

COMMENT ON POLICY "studios_insert_org_members" ON public.studios IS 
    'Organization members can create studios for their organization';

COMMENT ON POLICY "studios_delete_own" ON public.studios IS 
    'Users can delete studios they created';

COMMENT ON POLICY "studios_delete_org_owners" ON public.studios IS 
    'Organization owners can delete studios created within their organization';

-- ============================================================================
-- RPC FUNCTION: update_studio_status
-- ============================================================================
-- Secure function to update studio status with validation
-- Only allows COMPLETED -> ACCEPTED/DELETED and ACCEPTED -> DELETED transitions
-- Runs with service_role privileges to bypass RLS

CREATE OR REPLACE FUNCTION public.update_studio_status(
    p_studio_id UUID,
    p_new_status public.studio_status
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_current_status public.studio_status;
    v_creator_user_id UUID;
    v_organization_id UUID;
    v_current_user_id UUID;
    v_is_creator BOOLEAN := FALSE;
BEGIN
    -- Get current user ID
    v_current_user_id := auth.uid();
    
    -- Validate inputs
    IF p_studio_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Studio ID is required'
        );
    END IF;
    
    IF p_new_status NOT IN ('ACCEPTED', 'DELETED') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid status. Only ACCEPTED and DELETED are allowed'
        );
    END IF;
    
    -- Get studio details
    SELECT status, creator_user_id, organization_id
    INTO v_current_status, v_creator_user_id, v_organization_id
    FROM public.studios
    WHERE id = p_studio_id;
    
    -- Check if studio exists
    IF v_current_status IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Studio not found'
        );
    END IF;
    
    -- Check permissions - ONLY studio creators can update status
    v_is_creator := (v_creator_user_id = v_current_user_id);
    
    IF NOT v_is_creator THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Access denied. Only the studio creator can update studio status'
        );
    END IF;
    
    -- Validate status transitions
    IF v_current_status = 'COMPLETED' AND p_new_status IN ('ACCEPTED', 'DELETED') THEN
        -- COMPLETED -> ACCEPTED/DELETED: OK
    ELSIF v_current_status = 'ACCEPTED' AND p_new_status = 'DELETED' THEN
        -- ACCEPTED -> DELETED: OK
    ELSE
        RETURN jsonb_build_object(
            'success', false,
            'error', format('Invalid transition from %s to %s', v_current_status, p_new_status)
        );
    END IF;
    
    -- Update studio status
    UPDATE public.studios
    SET 
        status = p_new_status,
        updated_at = NOW()
    WHERE id = p_studio_id;
    
    -- Return success
    RETURN jsonb_build_object(
        'success', true,
        'message', format('Studio status updated from %s to %s', v_current_status, p_new_status),
        'previous_status', v_current_status,
        'new_status', p_new_status
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('Database error: %s', SQLERRM)
        );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_studio_status TO authenticated;

-- Add function comment
COMMENT ON FUNCTION public.update_studio_status IS 
    'Securely updates studio status with validation. Only studio creators can update status. Allows COMPLETED->ACCEPTED/DELETED and ACCEPTED->DELETED transitions.';
