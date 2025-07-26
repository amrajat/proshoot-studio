-- ============================================================================
-- TABLE: organizations
-- DESCRIPTION: Organization/team management for multi-user accounts
-- DEPENDENCIES: auth.users, profiles table
-- BREAKING CHANGES: None
-- ROLLBACK: DROP TABLE public.organizations CASCADE;
-- ============================================================================

-- ============================================================================
-- TABLE DEFINITION
-- ============================================================================

CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    team_size INTEGER NOT NULL DEFAULT 2,
    invite_token TEXT UNIQUE,
    restrict_clothing_options BOOLEAN NOT NULL DEFAULT FALSE,
    restrict_background_options BOOLEAN NOT NULL DEFAULT FALSE,
    approved_clothing TEXT[] NOT NULL DEFAULT '{}',
    approved_backgrounds TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Primary access patterns
CREATE INDEX idx_organizations_owner_user_id ON public.organizations(owner_user_id);
CREATE INDEX idx_organizations_name ON public.organizations(name);
CREATE INDEX idx_organizations_invite_token ON public.organizations(invite_token) WHERE invite_token IS NOT NULL;
CREATE INDEX idx_organizations_created_at ON public.organizations(created_at);

-- ============================================================================
-- CONSTRAINTS
-- ============================================================================

-- Ensure organization names are not empty
ALTER TABLE public.organizations 
ADD CONSTRAINT organizations_name_not_empty_check 
CHECK (LENGTH(TRIM(name)) > 0);

-- Ensure team size is positive when specified
ALTER TABLE public.organizations 
ADD CONSTRAINT organizations_team_size_positive_check 
CHECK (team_size IS NULL OR team_size > 0);

-- Unique constraints
ALTER TABLE public.organizations 
ADD CONSTRAINT organizations_owner_user_id_key UNIQUE (owner_user_id);


-- ============================================================================
-- TABLE OWNERSHIP AND COMMENTS
-- ============================================================================

ALTER TABLE public.organizations OWNER TO postgres;

COMMENT ON TABLE public.organizations IS 'Organizations and teams for multi-user accounts';
COMMENT ON COLUMN public.organizations.id IS 'Unique organization identifier';
COMMENT ON COLUMN public.organizations.owner_user_id IS 'User who owns/created the organization';
COMMENT ON COLUMN public.organizations.name IS 'Organization display name';
COMMENT ON COLUMN public.organizations.team_size IS 'Number of team members';
COMMENT ON COLUMN public.organizations.invite_token IS 'Universal invite token for organization';
COMMENT ON COLUMN public.organizations.restrict_clothing_options IS 'Whether to restrict clothing options to approved list';
COMMENT ON COLUMN public.organizations.restrict_background_options IS 'Whether to restrict background options to approved list';
COMMENT ON COLUMN public.organizations.approved_clothing IS 'Array of approved clothing option IDs';
COMMENT ON COLUMN public.organizations.approved_backgrounds IS 'Array of approved background option IDs';
COMMENT ON COLUMN public.organizations.created_at IS 'Organization creation timestamp';
COMMENT ON COLUMN public.organizations.updated_at IS 'Last organization update timestamp';

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
