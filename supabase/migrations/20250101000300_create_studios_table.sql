-- ============================================================================
-- TABLE: studios
-- DESCRIPTION: Studio creation and management for headshot generation
-- DEPENDENCIES: auth.users, organizations table, studio_status enum
-- BREAKING CHANGES: None
-- ROLLBACK: DROP TABLE public.studios CASCADE;
-- ============================================================================

-- ============================================================================
-- TABLE DEFINITION
-- ============================================================================

CREATE TABLE public.studios (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    creator_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    status public.studio_status NOT NULL DEFAULT 'PROCESSING',
    provider_id TEXT,
    provider public.providers NOT NULL DEFAULT 'REPLICATE',
    weights TEXT,
    datasets_object_key TEXT,
    style_pairs JSONB DEFAULT '[]',
    user_attributes JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    plan public.plans NOT NULL,
    metadata JSONB DEFAULT '{}'
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Primary access patterns
CREATE INDEX idx_studios_creator_user_id ON public.studios(creator_user_id);
CREATE INDEX idx_studios_organization_id ON public.studios(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_studios_status ON public.studios(status);

-- Secondary access patterns
CREATE INDEX idx_studios_created_at ON public.studios(created_at);
CREATE INDEX idx_studios_plan ON public.studios(plan);

-- Composite indexes for common queries
CREATE INDEX idx_studios_creator_status ON public.studios(creator_user_id, status);
CREATE INDEX idx_studios_org_status ON public.studios(organization_id, status) WHERE organization_id IS NOT NULL;

-- ============================================================================
-- CONSTRAINTS
-- ============================================================================

-- Ensure studio names are not empty
ALTER TABLE public.studios 
ADD CONSTRAINT studios_name_not_empty_check 
CHECK (LENGTH(TRIM(name)) > 0);


-- ============================================================================
-- TABLE OWNERSHIP AND COMMENTS
-- ============================================================================

ALTER TABLE public.studios OWNER TO postgres;

COMMENT ON TABLE public.studios IS 'Studio creation and headshot generation management';
COMMENT ON COLUMN public.studios.id IS 'Unique studio identifier';
COMMENT ON COLUMN public.studios.creator_user_id IS 'User who created the studio';
COMMENT ON COLUMN public.studios.organization_id IS 'Organization context (NULL for personal studios)';
COMMENT ON COLUMN public.studios.name IS 'Studio display name';
COMMENT ON COLUMN public.studios.status IS 'Current processing status';
COMMENT ON COLUMN public.studios.provider_id IS 'AI model identifier used for generation';
COMMENT ON COLUMN public.studios.provider IS 'Tune/training identifier';
COMMENT ON COLUMN public.studios.weights IS 'Trained model weights safetensors file object key';
COMMENT ON COLUMN public.studios.datasets_object_key IS 'URLs of uploaded training images';
COMMENT ON COLUMN public.studios.style_pairs IS 'Selected clothing and background combinations';
COMMENT ON COLUMN public.studios.user_attributes IS 'User physical attributes (hair, glasses, etc.)';
COMMENT ON COLUMN public.studios.metadata IS 'Additional studio metadata';
COMMENT ON COLUMN public.studios.created_at IS 'Studio creation timestamp';
COMMENT ON COLUMN public.studios.updated_at IS 'Last studio update timestamp';
COMMENT ON COLUMN public.studios.plan IS 'Plan for the studio';

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;
