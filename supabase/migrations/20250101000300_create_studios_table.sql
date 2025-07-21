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
    status public.studio_status NOT NULL DEFAULT 'PENDING',
    model_id TEXT,
    tune_id INTEGER,
    training_images_urls TEXT[] DEFAULT '{}',
    style_pairs JSONB DEFAULT '[]',
    user_attributes JSONB DEFAULT '{}',
    prompts_generated TEXT[] DEFAULT '{}',
    total_cost DECIMAL(10,2),
    credits_used JSONB DEFAULT '{}',
    downloaded BOOLEAN NOT NULL DEFAULT FALSE,
    processing_started_at TIMESTAMPTZ,
    processing_completed_at TIMESTAMPTZ,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Primary access patterns
CREATE INDEX idx_studios_creator_user_id ON public.studios(creator_user_id);
CREATE INDEX idx_studios_organization_id ON public.studios(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_studios_status ON public.studios(status);

-- Secondary access patterns
CREATE INDEX idx_studios_downloaded ON public.studios(downloaded);
CREATE INDEX idx_studios_tune_id ON public.studios(tune_id) WHERE tune_id IS NOT NULL;
CREATE INDEX idx_studios_created_at ON public.studios(created_at);

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

-- Ensure total cost is non-negative when specified
ALTER TABLE public.studios 
ADD CONSTRAINT studios_total_cost_non_negative_check 
CHECK (total_cost IS NULL OR total_cost >= 0);

-- Ensure processing timestamps are logical
ALTER TABLE public.studios 
ADD CONSTRAINT studios_processing_timestamps_check 
CHECK (
    processing_started_at IS NULL 
    OR processing_completed_at IS NULL 
    OR processing_completed_at >= processing_started_at
);

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
COMMENT ON COLUMN public.studios.model_id IS 'AI model identifier used for generation';
COMMENT ON COLUMN public.studios.tune_id IS 'Tune/training identifier';
COMMENT ON COLUMN public.studios.training_images_urls IS 'URLs of uploaded training images';
COMMENT ON COLUMN public.studios.style_pairs IS 'Selected clothing and background combinations';
COMMENT ON COLUMN public.studios.user_attributes IS 'User physical attributes (hair, glasses, etc.)';
COMMENT ON COLUMN public.studios.prompts_generated IS 'Generated AI prompts for image creation';
COMMENT ON COLUMN public.studios.total_cost IS 'Total cost for studio creation';
COMMENT ON COLUMN public.studios.credits_used IS 'Credits consumed by plan type';
COMMENT ON COLUMN public.studios.downloaded IS 'Whether results have been downloaded';
COMMENT ON COLUMN public.studios.processing_started_at IS 'When processing began';
COMMENT ON COLUMN public.studios.processing_completed_at IS 'When processing finished';
COMMENT ON COLUMN public.studios.error_message IS 'Error details if processing failed';
COMMENT ON COLUMN public.studios.metadata IS 'Additional studio metadata';
COMMENT ON COLUMN public.studios.created_at IS 'Studio creation timestamp';
COMMENT ON COLUMN public.studios.updated_at IS 'Last studio update timestamp';

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;
