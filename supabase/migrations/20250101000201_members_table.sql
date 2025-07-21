-- ============================================================================
-- TABLE: members
-- DESCRIPTION: Junction table for organization membership and roles
-- DEPENDENCIES: organizations table, auth.users, organization_role enum
-- BREAKING CHANGES: None
-- ROLLBACK: DROP TABLE public.members CASCADE;
-- ============================================================================

-- ============================================================================
-- TABLE DEFINITION
-- ============================================================================

CREATE TABLE public.members (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    role public.organization_role NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Primary access patterns
CREATE INDEX idx_members_user_id ON public.members(user_id);
CREATE INDEX idx_members_organization_id ON public.members(organization_id);
CREATE INDEX idx_members_role ON public.members(role);

-- Composite indexes for common queries
CREATE INDEX idx_members_user_org ON public.members(user_id, organization_id);
CREATE INDEX idx_members_org_role ON public.members(organization_id, role);

-- ============================================================================
-- CONSTRAINTS
-- ============================================================================

-- Ensure unique membership per user per organization
ALTER TABLE public.members 
ADD CONSTRAINT members_user_org_unique 
UNIQUE (user_id, organization_id);

-- ============================================================================
-- TABLE OWNERSHIP AND COMMENTS
-- ============================================================================

ALTER TABLE public.members OWNER TO postgres;

COMMENT ON TABLE public.members IS 'Organization membership and role assignments';
COMMENT ON COLUMN public.members.id IS 'Unique membership record identifier';
COMMENT ON COLUMN public.members.user_id IS 'User who is a member';
COMMENT ON COLUMN public.members.organization_id IS 'Organization they belong to';
COMMENT ON COLUMN public.members.role IS 'Role within the organization (ADMIN/MEMBER)';
COMMENT ON COLUMN public.members.joined_at IS 'When user joined the organization';
COMMENT ON COLUMN public.members.updated_at IS 'Last membership update timestamp';

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
