-- ============================================================================
-- TABLE: credits
-- DESCRIPTION: Credit balance management for users and organizations
-- DEPENDENCIES: auth.users, organizations table
-- BREAKING CHANGES: None
-- ROLLBACK: DROP TABLE public.credits CASCADE;
-- ============================================================================

-- ============================================================================
-- TABLE DEFINITION
-- ============================================================================

CREATE TABLE public.credits (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 0,
    starter INTEGER NOT NULL DEFAULT 0,
    professional INTEGER NOT NULL DEFAULT 0,
    studio INTEGER NOT NULL DEFAULT 0,
    team INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Primary access patterns
CREATE INDEX idx_credits_user_id ON public.credits(user_id);
CREATE INDEX idx_credits_organization_id ON public.credits(organization_id) WHERE organization_id IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX idx_credits_user_org ON public.credits(user_id, organization_id);

-- Indexes for credit balance queries
CREATE INDEX idx_credits_balance ON public.credits(balance) WHERE balance > 0;
CREATE INDEX idx_credits_starter ON public.credits(starter) WHERE starter > 0;
CREATE INDEX idx_credits_professional ON public.credits(professional) WHERE professional > 0;
CREATE INDEX idx_credits_studio ON public.credits(studio) WHERE studio > 0;
CREATE INDEX idx_credits_team ON public.credits(team) WHERE team > 0;

-- ============================================================================
-- CONSTRAINTS
-- ============================================================================

-- Essential business logic constraints only

-- Unique constraint: one credit record per user per organization (NULL for personal)
ALTER TABLE public.credits 
ADD CONSTRAINT credits_user_org_unique 
UNIQUE (user_id, organization_id);

-- ============================================================================
-- TABLE OWNERSHIP AND COMMENTS
-- ============================================================================

ALTER TABLE public.credits OWNER TO postgres;

COMMENT ON TABLE public.credits IS 'Credit balance tracking for users and organizations';
COMMENT ON COLUMN public.credits.id IS 'Unique credit record identifier';
COMMENT ON COLUMN public.credits.user_id IS 'User who owns these credits';
COMMENT ON COLUMN public.credits.organization_id IS 'Organization context (NULL for personal credits)';
COMMENT ON COLUMN public.credits.balance IS 'General purpose credit balance';
COMMENT ON COLUMN public.credits.starter IS 'Starter plan credits';
COMMENT ON COLUMN public.credits.professional IS 'Professional plan credits';
COMMENT ON COLUMN public.credits.studio IS 'Studio plan credits';
COMMENT ON COLUMN public.credits.team IS 'Team plan credits (organization only)';
COMMENT ON COLUMN public.credits.created_at IS 'Credit record creation timestamp';
COMMENT ON COLUMN public.credits.updated_at IS 'Last credit update timestamp';

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
