-- ============================================================================
-- MIGRATION: Migrate Existing Users Data to New Schema
-- DESCRIPTION: Copy existing users from public.users to profiles, organizations, credits, and members tables
-- DEPENDENCIES: profiles, organizations, credits, members tables must exist
-- BREAKING CHANGES: None (data migration only)
-- ============================================================================

-- Set session configuration for safety
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;

-- ============================================================================
-- DATA MIGRATION: Migrate existing users to new schema
-- ============================================================================

-- Step 1: Insert existing users into profiles table
INSERT INTO public.profiles (
    user_id,
    full_name,
    avatar_url,
    email,
    created_at,
    updated_at
)
SELECT 
    u.id,
    u.full_name,
    u.avatar,
    u.email,
    NOW() as created_at,
    NOW() as updated_at
FROM public.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
)
AND u.id IS NOT NULL
AND u.email IS NOT NULL
AND u.email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';

-- Step 2: Create default organizations for existing users
INSERT INTO public.organizations (
    owner_user_id,
    name,
    team_size,
    created_at,
    updated_at
)
SELECT 
    u.id,
    'Your Awesome Company',
    2,
    NOW() as created_at,
    NOW() as updated_at
FROM public.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.organizations o WHERE o.owner_user_id = u.id
)
AND u.id IS NOT NULL
AND u.email IS NOT NULL
AND u.email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';

-- Step 3: Initialize credits for existing users
INSERT INTO public.credits (
    user_id,
    organization_id,
    created_at,
    updated_at
)
SELECT 
    u.id,
    o.id,
    NOW() as created_at,
    NOW() as updated_at
FROM public.users u
JOIN public.organizations o ON o.owner_user_id = u.id
WHERE NOT EXISTS (
    SELECT 1 FROM public.credits c WHERE c.user_id = u.id AND c.organization_id = o.id
)
AND u.id IS NOT NULL
AND u.email IS NOT NULL
AND u.email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';

-- Step 4: Add existing users as owner members of their organizations
INSERT INTO public.members (
    user_id,
    organization_id,
    role,
    joined_at,
    updated_at
)
SELECT 
    u.id,
    o.id,
    'OWNER'::public.organization_role,
    NOW() as joined_at,
    NOW() as updated_at
FROM public.users u
JOIN public.organizations o ON o.owner_user_id = u.id
WHERE NOT EXISTS (
    SELECT 1 FROM public.members m WHERE m.user_id = u.id AND m.organization_id = o.id
)
AND u.id IS NOT NULL
AND u.email IS NOT NULL
AND u.email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';

-- Reset session settings
RESET ALL;
