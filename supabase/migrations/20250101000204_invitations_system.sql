-- ============================================================================
-- TABLE: invitations
-- DESCRIPTION: Organization invitation system for email and universal invites
-- DEPENDENCIES: organizations table, invitation_status enum, organization_role enum
-- BREAKING CHANGES: None
-- ROLLBACK: DROP TABLE public.invitations CASCADE; DROP FUNCTION accept_invitation;
-- ============================================================================

-- ============================================================================
-- TABLE DEFINITION
-- ============================================================================

CREATE TABLE public.invitations (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    invited_email TEXT,
    role public.organization_role NOT NULL DEFAULT 'MEMBER',
    status public.invitation_status NOT NULL DEFAULT 'PENDING',
    token TEXT,
    invited_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Primary access patterns
CREATE INDEX idx_invitations_organization_id ON public.invitations(organization_id);
CREATE INDEX idx_invitations_token ON public.invitations(token) WHERE token IS NOT NULL;
CREATE INDEX idx_invitations_invited_email ON public.invitations(invited_email) WHERE invited_email IS NOT NULL;

-- Secondary access patterns
CREATE INDEX idx_invitations_status ON public.invitations(status);
CREATE INDEX idx_invitations_expires_at ON public.invitations(expires_at) WHERE expires_at IS NOT NULL;

-- Composite indexes
CREATE INDEX idx_invitations_org_status ON public.invitations(organization_id, status);
CREATE INDEX idx_invitations_email_status ON public.invitations(invited_email, status) WHERE invited_email IS NOT NULL;

-- ============================================================================
-- CONSTRAINTS
-- ============================================================================

-- Ensure either email or token is provided (not both null)
ALTER TABLE public.invitations 
ADD CONSTRAINT invitations_email_or_token_check 
CHECK (invited_email IS NOT NULL OR token IS NOT NULL);

-- Ensure email format when provided
ALTER TABLE public.invitations 
ADD CONSTRAINT invitations_email_format_check 
CHECK (invited_email IS NULL OR invited_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Ensure expires_at is in the future when created
ALTER TABLE public.invitations 
ADD CONSTRAINT invitations_expires_future_check 
CHECK (expires_at IS NULL OR expires_at > created_at);

-- ============================================================================
-- TABLE OWNERSHIP AND COMMENTS
-- ============================================================================

ALTER TABLE public.invitations OWNER TO postgres;

COMMENT ON TABLE public.invitations IS 'Organization invitation system for email and universal invites';
COMMENT ON COLUMN public.invitations.id IS 'Unique invitation identifier';
COMMENT ON COLUMN public.invitations.organization_id IS 'Organization being invited to';
COMMENT ON COLUMN public.invitations.invited_email IS 'Email address for email-specific invites (NULL for universal)';
COMMENT ON COLUMN public.invitations.role IS 'Role to assign when invitation is accepted';
COMMENT ON COLUMN public.invitations.status IS 'Current invitation status';
COMMENT ON COLUMN public.invitations.token IS 'Unique token for invitation acceptance';
COMMENT ON COLUMN public.invitations.invited_by_user_id IS 'User who sent the invitation';
COMMENT ON COLUMN public.invitations.expires_at IS 'When invitation expires (NULL for no expiration)';
COMMENT ON COLUMN public.invitations.created_at IS 'Invitation creation timestamp';
COMMENT ON COLUMN public.invitations.updated_at IS 'Last invitation update timestamp';

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Policy: Organization admins can view all invitations for their org
CREATE POLICY "invitations_select_org_admins" ON public.invitations
    FOR SELECT
    USING (is_org_admin(organization_id));

-- Policy: Organization admins can create invitations
CREATE POLICY "invitations_insert_org_admins" ON public.invitations
    FOR INSERT
    WITH CHECK (is_org_admin(organization_id));

-- Policy: Organization admins can update invitations
CREATE POLICY "invitations_update_org_admins" ON public.invitations
    FOR UPDATE
    USING (is_org_admin(organization_id))
    WITH CHECK (is_org_admin(organization_id));

-- Policy: Organization admins can delete invitations
CREATE POLICY "invitations_delete_org_admins" ON public.invitations
    FOR DELETE
    USING (is_org_admin(organization_id));

-- ============================================================================
-- INVITATION ACCEPTANCE FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.accept_invitation(
    p_invite_token TEXT,
    p_accepting_user_id UUID,
    p_accepting_user_email TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_invite RECORD;
    v_org_id UUID;
    v_org_name TEXT;
    v_invite_role public.organization_role;
    v_user_credit_id UUID;
    v_org_credit_id UUID;
BEGIN
    -- Step 1: Try to find a UNIQUE invite token first
    SELECT * INTO v_invite FROM public.invitations WHERE token = p_invite_token;

    IF FOUND THEN
        -- Check if the invitation is email-specific and if the user's email matches
        IF v_invite.invited_email IS NOT NULL AND v_invite.invited_email != p_accepting_user_email THEN
            RETURN jsonb_build_object(
                'success', FALSE, 
                'error', 'This invitation is intended for ' || v_invite.invited_email || '. Please log in with the correct account.'
            );
        END IF;

        -- Case A: This is a unique email invitation
        v_org_id := v_invite.organization_id;
        v_invite_role := v_invite.role;

        IF v_invite.status != 'PENDING' THEN
            RETURN jsonb_build_object(
                'success', FALSE, 
                'error', 'This invitation has already been ' || v_invite.status || ' or is expired.'
            );
        END IF;

        -- Check if invitation has expired
        IF v_invite.expires_at IS NOT NULL AND v_invite.expires_at < NOW() THEN
            UPDATE public.invitations SET status = 'EXPIRED', updated_at = NOW() WHERE id = v_invite.id;
            RETURN jsonb_build_object('success', FALSE, 'error', 'This invitation has expired.');
        END IF;

    ELSE
        -- Case B: If not a unique token, check if it's a UNIVERSAL organization token
        SELECT id, name INTO v_org_id, v_org_name FROM public.organizations WHERE invite_token = p_invite_token;

        IF NOT FOUND THEN
            -- If not found in either table, the token is invalid
            RETURN jsonb_build_object('success', FALSE, 'error', 'Invitation not found or invalid token.');
        END IF;
        
        -- For universal links, the role is always 'MEMBER'
        v_invite_role := 'MEMBER'::public.organization_role;
    END IF;

    -- Step 2: Now that we have the organization ID, perform common checks and actions
    IF v_org_name IS NULL THEN
        SELECT name INTO v_org_name FROM public.organizations WHERE id = v_org_id;
    END IF;
    
    -- Check if user is already a member of the determined organization
    IF EXISTS (SELECT 1 FROM public.members WHERE user_id = p_accepting_user_id AND organization_id = v_org_id) THEN
        IF v_invite.id IS NOT NULL AND v_invite.status = 'PENDING' THEN
             UPDATE public.invitations SET status = 'ACCEPTED', updated_at = NOW() WHERE id = v_invite.id;
        END IF;
        RETURN jsonb_build_object('success', TRUE, 'message', 'You are already a member of ' || v_org_name || '.');
    END IF;

    -- Step 3: Perform the atomic credit transfer and membership creation
    BEGIN
        -- Try to deduct team credit from organization
        UPDATE public.credits SET team = team - 1, updated_at = NOW() 
        WHERE organization_id = v_org_id AND team > 0 
        RETURNING id INTO v_org_credit_id;
        
        IF NOT FOUND THEN 
            RAISE EXCEPTION 'Organization has insufficient credits or no credit account.'; 
        END IF;
        
        -- Add team credit to user's personal account
        INSERT INTO public.credits (user_id, organization_id, team) 
        VALUES (p_accepting_user_id, NULL, 1)
        ON CONFLICT (user_id, organization_id) WHERE organization_id IS NULL
        DO UPDATE SET team = credits.team + 1, updated_at = NOW() 
        RETURNING id INTO v_user_credit_id;
        
        IF NOT FOUND THEN 
            RAISE EXCEPTION 'Failed to find or create a personal credit account for the user.'; 
        END IF;
        
        -- Add user to organization
        INSERT INTO public.members (user_id, organization_id, role) 
        VALUES (p_accepting_user_id, v_org_id, v_invite_role);

        -- Mark invitation as accepted if it exists
        IF v_invite.id IS NOT NULL THEN
            UPDATE public.invitations SET status = 'ACCEPTED', updated_at = NOW() WHERE id = v_invite.id;
        END IF;
        
    EXCEPTION
        WHEN others THEN
            RETURN jsonb_build_object(
                'success', FALSE, 
                'error', 'Failed to process invitation. This could be due to insufficient organization credits. Error: ' || SQLERRM
            );
    END;

    -- Step 4: Return success
    RETURN jsonb_build_object('success', TRUE, 'message', 'Successfully joined ' || v_org_name || '!');

EXCEPTION
    WHEN others THEN
        RAISE WARNING 'Unexpected error in accept_invitation: %', SQLERRM;
        RETURN jsonb_build_object('success', FALSE, 'error', 'An unexpected error occurred. Please try again.');
END;
$$;

-- ============================================================================
-- FUNCTION OWNERSHIP AND PERMISSIONS
-- ============================================================================

ALTER FUNCTION public.accept_invitation(TEXT, UUID, TEXT) OWNER TO postgres;

COMMENT ON FUNCTION public.accept_invitation(TEXT, UUID, TEXT) IS 
    'Process organization invitation acceptance with credit transfer';

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.accept_invitation(TEXT, UUID, TEXT) TO anon, authenticated, service_role;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Update timestamp on invitations changes
CREATE TRIGGER on_invitations_updated
    BEFORE UPDATE ON public.invitations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
