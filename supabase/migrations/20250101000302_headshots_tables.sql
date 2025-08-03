-- ============================================================================
-- TABLES: headshots, favorites
-- DESCRIPTION: Tables for storing generated headshot images and user favorites
-- DEPENDENCIES: studios table, auth.users
-- BREAKING CHANGES: Merged preview_headshots and result_headshots into single headshots table
-- ROLLBACK: DROP TABLE statements for each table
-- ============================================================================

-- ============================================================================
-- TABLE: headshots
-- DESCRIPTION: Combined table for preview and result headshot images
-- ============================================================================

CREATE TABLE public.headshots (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    studio_id UUID NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
    preview TEXT,
    result TEXT,
    hd TEXT,
    prompt TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Ensure at least one image exists
    CONSTRAINT headshots_image_check CHECK (
        preview IS NOT NULL OR result IS NOT NULL
    )
);

-- ============================================================================
-- TABLE: favorites
-- DESCRIPTION: User favorite headshots for easy access
-- ============================================================================

CREATE TABLE public.favorites (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    studio_id UUID NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
    headshot_id UUID REFERENCES public.headshots(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- INDEXES: Performance optimization for headshot queries
-- ============================================================================

-- Index for headshots by studio
CREATE INDEX idx_headshots_studio_id ON public.headshots(studio_id);
CREATE INDEX idx_headshots_created_at ON public.headshots(created_at DESC);

-- Partial indexes for preview and result images
CREATE INDEX idx_headshots_preview ON public.headshots(studio_id) WHERE preview IS NOT NULL;
CREATE INDEX idx_headshots_result ON public.headshots(studio_id) WHERE result IS NOT NULL;

-- Favorites indexes
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_studio_id ON public.favorites(studio_id);
CREATE INDEX idx_favorites_headshot_id ON public.favorites(headshot_id) WHERE headshot_id IS NOT NULL;
CREATE INDEX idx_favorites_created_at ON public.favorites(created_at);

-- Composite indexes for common queries
CREATE INDEX idx_favorites_user_studio ON public.favorites(user_id, studio_id);

-- ============================================================================
-- CONSTRAINTS
-- ============================================================================

-- Ensure image URLs are not empty when present
ALTER TABLE public.headshots 
ADD CONSTRAINT headshots_preview_not_empty_check 
CHECK (preview IS NULL OR LENGTH(TRIM(preview)) > 0);

ALTER TABLE public.headshots 
ADD CONSTRAINT headshots_result_not_empty_check 
CHECK (result IS NULL OR LENGTH(TRIM(result)) > 0);

-- Ensure unique favorites per user per headshot
ALTER TABLE public.favorites 
ADD CONSTRAINT favorites_user_headshot_unique 
UNIQUE (user_id, headshot_id);

-- ============================================================================
-- TABLE OWNERSHIP AND COMMENTS
-- ============================================================================

ALTER TABLE public.headshots OWNER TO postgres;
ALTER TABLE public.favorites OWNER TO postgres;

-- Headshots comments
COMMENT ON TABLE public.headshots IS 'Combined table for preview and result headshot images';
COMMENT ON COLUMN public.headshots.id IS 'Unique headshot identifier';
COMMENT ON COLUMN public.headshots.studio_id IS 'Studio this headshot belongs to';
COMMENT ON COLUMN public.headshots.preview IS 'R2 bucket object key for preview image';
COMMENT ON COLUMN public.headshots.result IS 'R2 bucket object key for result image';
COMMENT ON COLUMN public.headshots.prompt IS 'AI prompt used to generate this image';
COMMENT ON COLUMN public.headshots.created_at IS 'Headshot creation timestamp';

-- Favorites comments
COMMENT ON TABLE public.favorites IS 'User favorite headshots for easy access';
COMMENT ON COLUMN public.favorites.id IS 'Unique favorite record identifier';
COMMENT ON COLUMN public.favorites.user_id IS 'User who favorited the headshot';
COMMENT ON COLUMN public.favorites.studio_id IS 'Studio containing the favorited headshot';
COMMENT ON COLUMN public.favorites.headshot_id IS 'Specific headshot favorited';
COMMENT ON COLUMN public.favorites.created_at IS 'Favorite creation timestamp';

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.headshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: headshots
-- ============================================================================

-- Policy: Users can view headshots for studios they created or org studios they can access
CREATE POLICY "headshots_select_access" ON public.headshots
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.studios s
            WHERE s.id = headshots.studio_id
            AND (
                s.creator_user_id = auth.uid()
                OR
                (s.organization_id IS NOT NULL AND is_org_member(s.organization_id))
            )
        )
    );

-- Policy: System can insert headshots
CREATE POLICY "headshots_insert_system" ON public.headshots
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.studios s
            WHERE s.id = headshots.studio_id
            AND s.creator_user_id = auth.uid()
        )
    );

-- Policy: System can update headshots (for adding result images)
CREATE POLICY "headshots_update_system" ON public.headshots
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM public.studios s
            WHERE s.id = headshots.studio_id
            AND s.creator_user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.studios s
            WHERE s.id = headshots.studio_id
            AND s.creator_user_id = auth.uid()
        )
    );

-- ============================================================================
-- RLS POLICIES: favorites
-- ============================================================================

-- Policy: Users can view their own favorites
CREATE POLICY "favorites_select_own" ON public.favorites
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can create their own favorites
CREATE POLICY "favorites_insert_own" ON public.favorites
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1
            FROM public.studios s
            WHERE s.id = favorites.studio_id
            AND (
                s.creator_user_id = auth.uid()
                OR
                (s.organization_id IS NOT NULL AND is_org_member(s.organization_id))
            )
        )
    );

-- Policy: Users can delete their own favorites
CREATE POLICY "favorites_delete_own" ON public.favorites
    FOR DELETE
    USING (auth.uid() = user_id);

-- Policy: Organization admins can view favorites for org studios
CREATE POLICY "favorites_select_org_admins" ON public.favorites
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.studios s
            WHERE s.id = favorites.studio_id
            AND s.organization_id IS NOT NULL
            AND is_org_owner(s.organization_id)
        )
    );

-- ============================================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================================

/*
To rollback this migration, run the following commands in order:

-- Drop RLS policies
DROP POLICY IF EXISTS "headshots_select_access" ON public.headshots;
DROP POLICY IF EXISTS "headshots_insert_system" ON public.headshots;
DROP POLICY IF EXISTS "headshots_update_system" ON public.headshots;
DROP POLICY IF EXISTS "favorites_select_own" ON public.favorites;
DROP POLICY IF EXISTS "favorites_insert_own" ON public.favorites;
DROP POLICY IF EXISTS "favorites_delete_own" ON public.favorites;
DROP POLICY IF EXISTS "favorites_select_org_admins" ON public.favorites;

-- Drop tables (this will cascade to indexes and constraints)
DROP TABLE IF EXISTS public.favorites;
DROP TABLE IF EXISTS public.headshots;
*/
