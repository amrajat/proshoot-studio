-- ============================================================================
-- TABLE: profiles
-- DESCRIPTION: User profile information linked to auth.users
-- DEPENDENCIES: auth.users, extensions (uuid-ossp)
-- BREAKING CHANGES: None
-- ROLLBACK: DROP TABLE public.profiles CASCADE;
-- ============================================================================

-- Set default table configuration
SET default_tablespace = '';
SET default_table_access_method = "heap";

-- ============================================================================
-- TABLE DEFINITION
-- ============================================================================

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    email TEXT,
    referred_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Primary access pattern: lookup by user_id
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);

-- Secondary access patterns
CREATE INDEX idx_profiles_email ON public.profiles(email) WHERE email IS NOT NULL;
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at);

-- ============================================================================
-- CONSTRAINTS
-- ============================================================================

-- Ensure email format is valid when provided
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_email_format_check 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- ============================================================================
-- TABLE OWNERSHIP AND COMMENTS
-- ============================================================================

ALTER TABLE public.profiles OWNER TO postgres;

COMMENT ON TABLE public.profiles IS 'User profile information and metadata';
COMMENT ON COLUMN public.profiles.id IS 'Unique profile identifier';
COMMENT ON COLUMN public.profiles.user_id IS 'Reference to auth.users.id';
COMMENT ON COLUMN public.profiles.full_name IS 'User''s full display name';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to user''s profile picture';
COMMENT ON COLUMN public.profiles.email IS 'User''s email address (cached from auth)';
COMMENT ON COLUMN public.profiles.referred_by IS 'Referral code or source';
COMMENT ON COLUMN public.profiles.created_at IS 'Profile creation timestamp';
COMMENT ON COLUMN public.profiles.updated_at IS 'Last profile update timestamp';

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
