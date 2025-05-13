-- Define Enum Types
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'expired', 'denied');
CREATE TYPE public.organization_role AS ENUM ('admin', 'member');
CREATE TYPE public.studio_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE public.purchase_status AS ENUM ('succeeded', 'pending', 'failed');
CREATE TYPE public.transaction_type AS ENUM ('purchase', 'studio_creation', 'refund', 'admin_grant', 'initial');

-- Create Tables

-- 1. Profiles Table
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    avatar_url text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow individual user read access to own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow individual user update access to own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
-- Note: Deletion might be better handled via a secured function or trigger.

-- 2. Organizations Table
CREATE TABLE public.organizations (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT, -- Prevent deleting owner if org exists
    name text NOT NULL,
    team_size INT4, -- Added from 20250504110536
    website TEXT NULL, -- Added from 20250504110536
    industry TEXT NULL, -- Added from 20250504110536
    department TEXT NULL, -- Added from 20250504110536
    "position" TEXT NULL, -- Added from 20250504110536 (quoted)
    invite_token TEXT UNIQUE, -- Added from 20250512000000
    invite_token_generated_at TIMESTAMPTZ, -- Added from 20250512000000
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT organizations_owner_user_id_key UNIQUE (owner_user_id), -- Added from 20250504133136 (Enforces single owned org)
    CONSTRAINT organizations_name_key UNIQUE (name) -- Added for clarity, org names should be unique
);
COMMENT ON COLUMN public.organizations.invite_token IS 'Stores the active universal invite token for the organization. Nullified when revoked.';
COMMENT ON COLUMN public.organizations.invite_token_generated_at IS 'Timestamp of when the current universal invite token was generated.';
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 3. Organization Members Table
CREATE TABLE public.organization_members (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.organization_role NOT NULL DEFAULT 'member',
    joined_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT organization_members_uq UNIQUE (organization_id, user_id)
);
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow members read access to membership details" ON public.organization_members FOR SELECT USING ( organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()) );
CREATE POLICY "Allow org admins full access to members" ON public.organization_members FOR ALL USING ( (SELECT role FROM public.organization_members mem WHERE mem.user_id = auth.uid() AND mem.organization_id = organization_members.organization_id) = 'admin'::public.organization_role );
CREATE POLICY "Allow users to see their own membership" ON public.organization_members FOR SELECT USING ( auth.uid() = user_id );

-- RLS Policies for Organizations (Now after organization_members table exists)
CREATE POLICY "Allow owner full access to org" ON public.organizations FOR ALL USING (auth.uid() = owner_user_id);
CREATE POLICY "Allow members read access to their orgs" ON public.organizations FOR SELECT USING ( id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()) );

-- 4. Invitations Table
CREATE TABLE public.invitations (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    invited_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    invited_email text NOT NULL,
    role public.organization_role NOT NULL DEFAULT 'member',
    token text UNIQUE NOT NULL DEFAULT extensions.uuid_generate_v4()::text,
    status public.invitation_status NOT NULL DEFAULT 'pending',
    expires_at timestamptz,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow org admins full access to invitations" ON public.invitations FOR ALL USING ( (SELECT role FROM public.organization_members mem WHERE mem.user_id = auth.uid() AND mem.organization_id = invitations.organization_id) = 'admin'::public.organization_role );
-- Add policy for invited users to view based on email? Requires careful thought.

-- 5. Studios Table
CREATE TABLE public.studios (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    creator_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL, -- Org studios deleted if org is deleted? Or set null? SET NULL allows history retention.
    name text NOT NULL,
    status public.studio_status NOT NULL DEFAULT 'pending',
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow creator full access to own studio" ON public.studios FOR ALL USING ( auth.uid() = creator_user_id );
CREATE POLICY "Allow org members read access to org studios" ON public.studios FOR SELECT USING ( organization_id IS NOT NULL AND organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()) );
CREATE POLICY "Allow org admins full access to org studios" ON public.studios FOR ALL USING ( organization_id IS NOT NULL AND (SELECT role FROM public.organization_members mem WHERE mem.user_id = auth.uid() AND mem.organization_id = studios.organization_id) = 'admin'::public.organization_role );

-- 6. Preview Headshots Table
CREATE TABLE public.preview_headshots (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    studio_id uuid NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.preview_headshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow access based on parent studio access" ON public.preview_headshots FOR SELECT USING (
    (SELECT count(*) FROM public.studios s WHERE s.id = studio_id) > 0 -- Check if user can select the studio (relies on studio policies)
    -- Note: For performance, consider duplicating relevant checks from studios policies here.
);
-- Add INSERT/UPDATE/DELETE policies mirroring studio access if needed.

-- 7. Result Headshots Table
CREATE TABLE public.result_headshots (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    studio_id uuid NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.result_headshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow access based on parent studio access" ON public.result_headshots FOR SELECT USING (
    (SELECT count(*) FROM public.studios s WHERE s.id = studio_id) > 0 -- Check if user can select the studio
);
-- Add INSERT/UPDATE/DELETE policies mirroring studio access if needed.

-- 8. Purchases Table
CREATE TABLE public.purchases (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL, -- User who made the purchase
    organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL, -- Org benefiting from purchase (if applicable)
    payment_provider text,
    payment_intent_id text UNIQUE,
    amount integer NOT NULL CHECK (amount > 0),
    currency text NOT NULL,
    credits_granted integer NOT NULL CHECK (credits_granted >= 0), -- Consider renaming if this field's meaning changes
    status public.purchase_status NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow user read access to own purchases" ON public.purchases FOR SELECT USING ( auth.uid() = user_id );
CREATE POLICY "Allow org admin read access to org purchases" ON public.purchases FOR SELECT USING ( organization_id IS NOT NULL AND (SELECT role FROM public.organization_members mem WHERE mem.user_id = auth.uid() AND mem.organization_id = purchases.organization_id) = 'admin'::public.organization_role );

-- 9. Credits Table (Refactored for Model 1)
CREATE TABLE public.credits (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Every credit row tied to a user (owner/purchaser)
    organization_id uuid NULL REFERENCES public.organizations(id) ON DELETE CASCADE, -- If NULL, it's personal credits. If NOT NULL, it's org credits.
    balance integer NOT NULL DEFAULT 0 CHECK (balance >= 0), -- Consider if this is still needed or just use plan columns
    starter integer NOT NULL DEFAULT 0 CHECK (starter >= 0), -- Added from 20250504084305
    pro integer NOT NULL DEFAULT 0 CHECK (pro >= 0), -- Added from 20250504084305
    elite integer NOT NULL DEFAULT 0 CHECK (elite >= 0), -- Added from 20250504084305
    studio integer NOT NULL DEFAULT 0 CHECK (studio >= 0), -- Added from 20250504084305
    team integer NOT NULL DEFAULT 0 CHECK (team >= 0), -- Added from 20250512104258
    updated_at timestamptz DEFAULT now() NOT NULL
    -- Removed user_or_org_check constraint (Model 1 allows user_id and org_id)
    -- Removed UNIQUE constraints on user_id and organization_id (Model 1 might allow multiple rows per user/org if needed, though current setup implies one)
);
COMMENT ON TABLE public.credits IS 'Stores credit balances. For personal credits, organization_id is NULL. For organization credits, organization_id is NOT NULL and user_id refers to the owner/purchaser.';
COMMENT ON COLUMN public.credits.user_id IS 'Reference to the user who owns these credits. NOT NULL.';
COMMENT ON COLUMN public.credits.organization_id IS 'Reference to the organization if these are org-specific credits; otherwise NULL.';
COMMENT ON COLUMN public.credits.team IS 'Stores the balance of credits for the Team plan, used specifically for organizations.';

ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
-- RLS Policy for personal credits (user_id matches AND org_id IS NULL)
CREATE POLICY "Allow user read access to own PERSONAL credit balance" ON public.credits FOR SELECT USING ( auth.uid() = user_id AND organization_id IS NULL );
-- RLS Policy for organization credits (org_id matches user's membership)
CREATE POLICY "Allow org members read access to ORG credit balance" ON public.credits FOR SELECT USING ( organization_id IS NOT NULL AND organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()) );
-- Note: Update/Insert/Delete should likely be restricted to backend/triggers/functions

-- 10. Transactions Table
CREATE TABLE public.transactions (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- User performing/initiating action
    organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL, -- Org context if applicable
    credit_account_id uuid NOT NULL REFERENCES public.credits(id) ON DELETE RESTRICT, -- The balance being changed
    change_amount integer NOT NULL, -- Positive for add, negative for spend
    type public.transaction_type NOT NULL,
    related_purchase_id uuid REFERENCES public.purchases(id) ON DELETE SET NULL,
    related_studio_id uuid REFERENCES public.studios(id) ON DELETE SET NULL,
    description text,
    created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow user read access to own credit transactions" ON public.transactions FOR SELECT USING (
    credit_account_id IN (SELECT id FROM public.credits WHERE user_id = auth.uid() AND organization_id IS NULL) -- Match Personal Credits RLS
);
CREATE POLICY "Allow org members read access to org credit transactions" ON public.transactions FOR SELECT USING (
    credit_account_id IN (SELECT id FROM public.credits WHERE organization_id IS NOT NULL AND organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())) -- Match Org Credits RLS
);
-- Insert should be restricted to backend/triggers/functions

-- Trigger Functions

-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET SEARCH_PATH = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name', -- Example: Adjust if name/avatar are stored differently in auth.users.raw_user_meta_data
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Trigger to call the function after a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Function to create a PERSONAL credit balance for a new user profile (Model 1)
CREATE OR REPLACE FUNCTION public.handle_new_profile_credit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET SEARCH_PATH = public
AS $$
BEGIN
  -- Insert a row specifically for personal credits (organization_id IS NULL)
  INSERT INTO public.credits (user_id, organization_id, balance, starter, pro, elite, studio, team)
  VALUES (NEW.user_id, NULL, 0, 0, 0, 0, 0, 0); -- Start with 0 credits for all plans
  RETURN NEW;
END;
$$;

-- Trigger to call the function after a new profile is created
CREATE TRIGGER on_profile_created_add_credits
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_profile_credit();

-- Removed trigger for creating organization credits, as it's now handled
-- by the create_organization_with_initial_setup function.

-- Data Migration Placeholders (Review and Adjust Before Running)

-- Copy data from existing public.users to new public.profiles
-- DO NOT RUN if public.users doesn't have these exact columns or if profiles should be populated differently.
/*
INSERT INTO public.profiles (user_id, full_name, avatar_url, created_at, updated_at)
SELECT
    id,
    <full_name_column>,   -- Replace with actual column name in public.users for full name
    <avatar_url_column>,  -- Replace with actual column name in public.users for avatar
    <created_at_column>, -- Replace with actual column name in public.users for creation timestamp
    <updated_at_column>  -- Replace with actual column name in public.users for update timestamp
FROM
    public.users
ON CONFLICT (user_id) DO NOTHING; -- Avoid errors if a profile somehow already exists (e.g., from trigger)
*/

-- Create initial PERSONAL credit balances for existing users
-- Only inserts if a personal credit row doesn't already exist for the user
/*
INSERT INTO public.credits (user_id, organization_id, balance, starter, pro, elite, studio, team)
SELECT
    p.user_id,
    NULL, -- Explicitly NULL for personal credits
    0, -- Initial balance
    0, -- Initial starter
    0, -- Initial pro
    0, -- Initial elite
    0, -- Initial studio
    0  -- Initial team (always 0 for personal rows)
FROM
    public.profiles p
LEFT JOIN public.credits c ON p.user_id = c.user_id AND c.organization_id IS NULL
WHERE c.id IS NULL; -- Only insert if a personal credit row doesn't exist
*/
