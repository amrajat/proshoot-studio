-- Define Enum Types
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'expired', 'denied');
CREATE TYPE public.organization_role AS ENUM ('admin', 'member');
CREATE TYPE public.studio_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'images_uploaded', 'done');
CREATE TYPE public.purchase_status AS ENUM ('succeeded', 'pending', 'failed');
CREATE TYPE public.transaction_type AS ENUM ('purchase', 'studio_creation', 'refund', 'admin_grant', 'initial');
CREATE TYPE public.credit_transfer_type AS ENUM ('starter', 'pro', 'elite', 'studio', 'balance', 'none');

-- Helper Functions
CREATE OR REPLACE FUNCTION is_org_member(org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  is_member boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = org_id
    AND om.user_id = auth.uid()
  ) INTO is_member;
  RETURN is_member;
END;
$$;

CREATE OR REPLACE FUNCTION is_org_admin(org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  is_admin boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = org_id
    AND om.user_id = auth.uid()
    AND om.role = 'admin'::public.organization_role
  ) INTO is_admin;
  RETURN is_admin;
END;
$$;

-- Create Tables

-- 1. Profiles Table
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    avatar_url text,
    email TEXT,
    referred_by TEXT,
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
    restrict_clothing_options BOOLEAN NOT NULL DEFAULT FALSE,
    restrict_background_options BOOLEAN NOT NULL DEFAULT FALSE,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT organizations_owner_user_id_key UNIQUE (owner_user_id), -- Added from 20250504133136 (Enforces single owned org)
    CONSTRAINT organizations_name_key UNIQUE (name) -- Added for clarity, org names should be unique
);
COMMENT ON COLUMN public.organizations.invite_token IS 'Stores the active universal invite token for the organization. Nullified when revoked.';
COMMENT ON COLUMN public.organizations.invite_token_generated_at IS 'Timestamp of when the current universal invite token was generated.';
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 3. Organization Approved Clothing Table
CREATE TABLE public.organization_approved_clothing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    clothing_name TEXT NOT NULL,
    clothing_theme TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_organization_approved_clothing_org_id ON public.organization_approved_clothing(organization_id);
ALTER TABLE public.organization_approved_clothing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admins full access to approved clothing" ON public.organization_approved_clothing FOR ALL USING (is_org_admin(organization_id));
CREATE POLICY "Allow members to read approved clothing" ON public.organization_approved_clothing FOR SELECT USING (is_org_member(organization_id));

-- 4. Organization Approved Backgrounds Table
CREATE TABLE public.organization_approved_backgrounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    background_name TEXT NOT NULL,
    background_theme TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_organization_approved_backgrounds_org_id ON public.organization_approved_backgrounds(organization_id);
ALTER TABLE public.organization_approved_backgrounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admins full access to approved backgrounds" ON public.organization_approved_backgrounds FOR ALL USING (is_org_admin(organization_id));
CREATE POLICY "Allow members to read approved backgrounds" ON public.organization_approved_backgrounds FOR SELECT USING (is_org_member(organization_id));

-- 5. Organization Members Table
CREATE TABLE public.organization_members (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.organization_role NOT NULL DEFAULT 'member',
    joined_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT organization_members_uq UNIQUE (organization_id, user_id)
);
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
-- RLS Policies for Organization Members
-- Policy 1: Allow users to SELECT their own membership record(s)
CREATE POLICY "Allow users SELECT own membership" ON public.organization_members
  FOR SELECT
  USING ( auth.uid() = user_id );

-- Policy 2: Allow organization admins to INSERT members into their org
CREATE POLICY "Allow org admins to INSERT new members" ON public.organization_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.organization_members mem
      WHERE mem.organization_id = organization_members.organization_id
      AND mem.user_id = auth.uid()
      AND mem.role = 'admin'::public.organization_role
    )
  );

-- Policy 3: Allow organization admins to UPDATE members in their org (e.g., change role)
CREATE POLICY "Allow org admins UPDATE members" ON public.organization_members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.organization_members mem
      WHERE mem.organization_id = organization_members.organization_id
      AND mem.user_id = auth.uid()
      AND mem.role = 'admin'::public.organization_role
    )
  );

-- Policy 4: Allow organization admins to DELETE members from their org
CREATE POLICY "Allow org admins DELETE members" ON public.organization_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.organization_members mem
      WHERE mem.organization_id = organization_members.organization_id
      AND mem.user_id = auth.uid()
      AND mem.role = 'admin'::public.organization_role
    )
  );

-- RLS Policies for Organizations (Now after organization_members table exists)
CREATE POLICY "Allow owner full access to org" ON public.organizations FOR ALL USING (auth.uid() = owner_user_id);
CREATE POLICY "Allow members read access to their orgs" ON public.organizations FOR SELECT USING ( id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()) );
CREATE POLICY "Allow org admins to update restriction flags" ON public.organizations FOR UPDATE USING (
    EXISTS (
        SELECT 1
        FROM public.organization_members mem
        WHERE mem.organization_id = organizations.id
        AND mem.user_id = auth.uid()
        AND mem.role = 'admin'::public.organization_role
    )
);

-- 6. Invitations Table
CREATE TABLE public.invitations (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    invited_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    invited_email text NOT NULL,
    role public.organization_role NOT NULL DEFAULT 'member',
    token text DEFAULT extensions.uuid_generate_v4()::text,
    status public.invitation_status NOT NULL DEFAULT 'pending',
    expires_at timestamptz,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    transfer_credit_type public.credit_transfer_type NOT NULL DEFAULT 'none',
    transfer_credit_amount INT4 NULL,
    CONSTRAINT transfer_amount_check CHECK (
        (transfer_credit_type = 'balance' AND transfer_credit_amount IS NOT NULL AND transfer_credit_amount > 0)
        OR
        (transfer_credit_type != 'balance' AND transfer_credit_amount IS NULL)
    )
);
COMMENT ON COLUMN public.invitations.token IS 'Stores the specific invite token used, if applicable. Can be NULL or store a non-unique universal organization token for email invites.';
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow org admins full access to invitations" ON public.invitations FOR ALL USING ( (SELECT role FROM public.organization_members mem WHERE mem.user_id = auth.uid() AND mem.organization_id = invitations.organization_id) = 'admin'::public.organization_role );
-- Add policy for invited users to view based on email? Requires careful thought.

-- 7. Studios Table
CREATE TABLE public.studios (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    creator_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
    name text NOT NULL,
    status public.studio_status NOT NULL DEFAULT 'pending',
    plan text NOT NULL DEFAULT 'Starter',
    attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
    attire_ids text[] NOT NULL DEFAULT '{}',
    background_ids text[] NOT NULL DEFAULT '{}',
    datasets text NULL DEFAULT NULL,
    weights text NULL DEFAULT NULL,
    downloaded BOOLEAN NOT NULL DEFAULT FALSE,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT fk_studios_creator_user_id_to_profiles_user_id FOREIGN KEY (creator_user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);
ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_studios_downloaded ON public.studios(downloaded);

-- RLS Policies for studios
CREATE POLICY "Allow select access for creators and org members" ON public.studios FOR SELECT USING (
    auth.uid() = creator_user_id
    OR (organization_id IS NOT NULL AND is_org_member(organization_id))
);
CREATE POLICY "Allow insert for creators (personal) or org admins (org)" ON public.studios FOR INSERT WITH CHECK (
    (organization_id IS NULL AND auth.uid() = creator_user_id)
    OR (organization_id IS NOT NULL AND auth.uid() = creator_user_id AND is_org_admin(organization_id))
);
CREATE POLICY "Allow update for creators (personal) or org admins (org)" ON public.studios FOR UPDATE USING (
    (organization_id IS NULL AND auth.uid() = creator_user_id)
    OR (organization_id IS NOT NULL AND is_org_admin(organization_id))
);
CREATE POLICY "Allow delete for creators (personal) or org admins (org)" ON public.studios FOR DELETE USING (
    (organization_id IS NULL AND auth.uid() = creator_user_id)
    OR (organization_id IS NOT NULL AND is_org_admin(organization_id))
);

-- 8. Preview Headshots Table
CREATE TABLE public.preview_headshots (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    studio_id uuid NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    prompt text DEFAULT NULL, 
    created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.preview_headshots ENABLE ROW LEVEL SECURITY;
-- RLS Policies for preview_headshots
CREATE POLICY "Allow select for creators or org members direct join" ON public.preview_headshots FOR SELECT USING (
    EXISTS (
        SELECT 1
        FROM public.studios s
        WHERE s.id = preview_headshots.studio_id
        AND (
            s.creator_user_id = auth.uid()
            OR
            (
                s.organization_id IS NOT NULL
                AND EXISTS (
                    SELECT 1
                    FROM public.organization_members om
                    WHERE om.organization_id = s.organization_id
                      AND om.user_id = auth.uid()
                )
            )
        )
    )
);
CREATE POLICY "Allow insert for studio creator or org admin" ON public.preview_headshots FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.studios s
        WHERE s.id = preview_headshots.studio_id
        AND (
            s.creator_user_id = auth.uid()
            OR
            (s.organization_id IS NOT NULL AND is_org_admin(s.organization_id))
        )
    )
);

-- 9. Result Headshots Table
CREATE TABLE public.result_headshots (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    studio_id uuid NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    prompt text DEFAULT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.result_headshots ENABLE ROW LEVEL SECURITY;
-- RLS Policies for result_headshots
CREATE POLICY "Allow select for creators or org members direct join" ON public.result_headshots FOR SELECT USING (
    EXISTS (
        SELECT 1
        FROM public.studios s
        WHERE s.id = result_headshots.studio_id
        AND (
            s.creator_user_id = auth.uid()
            OR
            (
                s.organization_id IS NOT NULL
                AND EXISTS (
                    SELECT 1
                    FROM public.organization_members om
                    WHERE om.organization_id = s.organization_id
                      AND om.user_id = auth.uid()
                )
            )
        )
    )
);
CREATE POLICY "Allow insert for studio creator or org admin" ON public.result_headshots FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.studios s
        WHERE s.id = result_headshots.studio_id
        AND (
            s.creator_user_id = auth.uid()
            OR
            (s.organization_id IS NOT NULL AND is_org_admin(s.organization_id))
        )
    )
);

-- 10. Favorites Table
CREATE TABLE public.favorites (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    studio_id uuid NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
    headshot_id uuid NOT NULL REFERENCES public.result_headshots(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT unique_user_studio_headshot_favorite UNIQUE (user_id, studio_id, headshot_id)
);
CREATE INDEX idx_favorites_user_studio ON public.favorites(user_id, studio_id);
CREATE INDEX idx_favorites_headshot ON public.favorites(headshot_id);
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.favorites TO authenticated;
CREATE POLICY "Allow select for owners or relevant org admins" ON public.favorites FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
        SELECT 1
        FROM public.studios s
        WHERE s.id = favorites.studio_id
        AND s.organization_id IS NOT NULL
        AND is_org_admin(s.organization_id)
    )
);
CREATE POLICY "Allow insert for users with access to the studio" ON public.favorites FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
        SELECT 1
        FROM public.studios s
        WHERE s.id = favorites.studio_id
    )
    AND EXISTS (
        SELECT 1
        FROM public.result_headshots rh
        WHERE rh.id = favorites.headshot_id
        AND rh.studio_id = favorites.studio_id
    )
);
CREATE POLICY "Allow delete only for the user who favorited" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- 11. Purchases Table
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

-- 12. Credits Table (Refactored for Model 1)
CREATE TABLE public.credits (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE, -- Every credit row tied to a user (owner/purchaser)
    organization_id uuid NULL REFERENCES public.organizations(id) ON DELETE CASCADE, -- If NULL, it's personal credits. If NOT NULL, it's org credits.
    balance integer NOT NULL DEFAULT 0 CHECK (balance >= 0), -- Consider if this is still needed or just use plan columns
    starter integer NOT NULL DEFAULT 0 CHECK (starter >= 0), -- Added from 20250504084305
    pro integer NOT NULL DEFAULT 0 CHECK (pro >= 0), -- Added from 20250504084305
    elite integer NOT NULL DEFAULT 0 CHECK (elite >= 0), -- Added from 20250504084305
    studio integer NOT NULL DEFAULT 0 CHECK (studio >= 0), -- Added from 20250504084305
    team integer NOT NULL DEFAULT 0 CHECK (team >= 0), -- Added from 20250512104258
    updated_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT credits_user_id_key UNIQUE (user_id)
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

-- 13. Transactions Table
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
-- RLS Policies for transactions
CREATE POLICY "Allow select for relevant users or org admins" ON public.transactions FOR SELECT USING (
    (organization_id IS NULL AND auth.uid() = user_id)
    OR (organization_id IS NOT NULL AND is_org_admin(organization_id))
);
CREATE POLICY "Allow insert for valid user/org context" ON public.transactions FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
        SELECT 1
        FROM public.credits c
        WHERE c.id = transactions.credit_account_id
        AND (
            (transactions.organization_id IS NULL AND c.organization_id IS NULL AND c.user_id = transactions.user_id)
            OR
            (transactions.organization_id IS NOT NULL AND c.user_id IS NULL AND c.organization_id = transactions.organization_id)
        )
    )
);

-- Functions & Triggers

-- Function to create a new organization and set up the owner.
CREATE OR REPLACE FUNCTION public.create_organization_with_initial_setup(
    p_owner_user_id UUID,
    p_org_name TEXT,
    p_team_size INT DEFAULT NULL,
    p_website TEXT DEFAULT NULL,
    p_industry TEXT DEFAULT NULL,
    p_department TEXT DEFAULT NULL,
    p_position TEXT DEFAULT NULL
)
RETURNS TABLE(created_org_id UUID, created_org_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_created_org_id UUID;
    v_created_org_name TEXT;
BEGIN
    IF p_owner_user_id IS NULL THEN
        RAISE EXCEPTION 'Owner user ID cannot be null';
    END IF;
    IF p_org_name IS NULL OR BTRIM(p_org_name) = '' THEN
        RAISE EXCEPTION 'Organization name cannot be empty';
    END IF;

    INSERT INTO organizations (owner_user_id, name, team_size, website, industry, department, "position")
    VALUES (p_owner_user_id, BTRIM(p_org_name), p_team_size, p_website, p_industry, p_department, p_position)
    RETURNING id, name INTO v_created_org_id, v_created_org_name;

    INSERT INTO organization_members (organization_id, user_id, role)
    VALUES (v_created_org_id, p_owner_user_id, 'admin'::organization_role);

    UPDATE public.credits
    SET organization_id = v_created_org_id
    WHERE user_id = p_owner_user_id;
    
    RETURN QUERY SELECT v_created_org_id, v_created_org_name;

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in create_organization_with_initial_setup: %', SQLERRM;
        RAISE;
END;
$$;

-- Function to generate or regenerate the universal invite token for an organization
CREATE OR REPLACE FUNCTION public.generate_org_invite_token(p_org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_new_token TEXT;
  v_is_admin BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members mem
    WHERE mem.organization_id = p_org_id
      AND mem.user_id = auth.uid()
      AND mem.role = 'admin'::organization_role
  ) INTO v_is_admin;

  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'User is not authorized to generate invite token for this organization.';
  END IF;

  v_new_token := extensions.uuid_generate_v4()::TEXT;

  UPDATE public.organizations
  SET
    invite_token = v_new_token,
    invite_token_generated_at = now()
  WHERE id = p_org_id;

  RETURN v_new_token;

END;
$$;

-- Function to deduct team credits from the org owner's credit row and log the transaction.
CREATE OR REPLACE FUNCTION public.transfer_org_team_credit(
    p_org_id UUID,
    p_admin_user_id UUID,
    p_amount INT,
    p_transaction_type public.transaction_type,
    p_description TEXT DEFAULT NULL,
    p_related_studio_id UUID DEFAULT NULL,
    p_related_purchase_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_credit_account_id UUID;
  v_current_team_balance INT;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Deduction amount must be positive.';
  END IF;

  SELECT id, team
  INTO v_credit_account_id, v_current_team_balance
  FROM public.credits
  WHERE user_id = p_admin_user_id
    AND organization_id = p_org_id;

  IF v_credit_account_id IS NULL THEN
     RAISE EXCEPTION 'Credit account not found for user % in organization %.', p_admin_user_id, p_org_id;
  END IF;

  IF v_current_team_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient team credits. Required: %, Available: %', p_amount, v_current_team_balance;
  END IF;

  UPDATE public.credits
  SET team = team - p_amount,
      updated_at = now()
  WHERE id = v_credit_account_id;

  INSERT INTO public.transactions (
      user_id,
      organization_id,
      credit_account_id,
      change_amount,
      type,
      related_purchase_id,
      related_studio_id,
      description
  ) VALUES (
      p_admin_user_id,
      p_org_id,
      v_credit_account_id,
      -p_amount,
      p_transaction_type,
      p_related_purchase_id,
      p_related_studio_id,
      p_description
  );

  RETURN TRUE;

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in transfer_org_team_credit: %', SQLERRM;
        RAISE;
END;
$$;

-- Function to accept an organization invite, handle credit transfer, and log transactions.
CREATE OR REPLACE FUNCTION public.accept_organization_invite_with_credit_transfer(
    p_user_id UUID,
    p_organization_id UUID,
    p_invite_token TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_org_owner_id UUID;
    v_org_name TEXT;
    v_org_token TEXT;
    v_new_member_id UUID;
    v_user_credit_account_id UUID;
    v_credit_deducted BOOLEAN := false;
    v_credit_added BOOLEAN := false;
    v_deduction_error TEXT := NULL;
    v_addition_error TEXT := NULL;
    result JSONB;
BEGIN
    SELECT owner_user_id, name, invite_token
    INTO v_org_owner_id, v_org_name, v_org_token
    FROM public.organizations
    WHERE id = p_organization_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Organization not found.');
    END IF;

    IF v_org_token IS NULL OR v_org_token != p_invite_token THEN
        RETURN jsonb_build_object('error', 'Invalid or expired invite token.');
    END IF;

    IF EXISTS (SELECT 1 FROM public.organization_members WHERE user_id = p_user_id AND organization_id = p_organization_id) THEN
        RETURN jsonb_build_object('success', true, 'message', 'Already a member.', 'organization_name', v_org_name);
    END IF;

    BEGIN
        SELECT transfer_org_team_credit(
            p_org_id := p_organization_id,
            p_admin_user_id := v_org_owner_id,
            p_amount := 1,
            p_transaction_type := 'invite_accept_deduct'::transaction_type,
            p_description := 'Team credit deducted for invite acceptance by user ' || p_user_id::TEXT
        )
        INTO v_credit_deducted;
    EXCEPTION
        WHEN OTHERS THEN
            v_deduction_error := SQLERRM;
            RAISE WARNING 'Credit deduction failed for org % owner % upon invite accept by user %: %', p_organization_id, v_org_owner_id, p_user_id, v_deduction_error;
            IF v_deduction_error LIKE '%Insufficient team credits%' THEN
                 RETURN jsonb_build_object('error', 'Organization has insufficient Team Credits to accept new members via this link.');
            ELSE
                 RETURN jsonb_build_object('error', 'Failed to process organization credits: ' || v_deduction_error);
            END IF;
    END;

    v_credit_deducted := true; 

    INSERT INTO public.organization_members (user_id, organization_id, role)
    VALUES (p_user_id, p_organization_id, 'member'::organization_role)
    RETURNING id INTO v_new_member_id;

    BEGIN
        SELECT id
        INTO v_user_credit_account_id
        FROM public.credits
        WHERE user_id = p_user_id
          AND organization_id IS NULL;

        IF v_user_credit_account_id IS NULL THEN
            RAISE WARNING 'Personal credit row not found for user % during invite accept. Attempting to create.', p_user_id;
            INSERT INTO public.credits (user_id, organization_id, team)
            VALUES (p_user_id, NULL, 0)
            ON CONFLICT (user_id) WHERE organization_id IS NULL
            DO NOTHING;

             SELECT id
             INTO v_user_credit_account_id
             FROM public.credits
             WHERE user_id = p_user_id
               AND organization_id IS NULL;

             IF v_user_credit_account_id IS NULL THEN
                 RAISE WARNING 'Failed to find or create personal credit row for user %. Cannot add team credit.', p_user_id;
                 v_addition_error := 'Failed to locate user personal credit account.';
             ELSE
                 UPDATE public.credits
                 SET team = team + 1,
                     updated_at = now()
                 WHERE id = v_user_credit_account_id;

                 INSERT INTO public.transactions (
                     user_id, organization_id, credit_account_id, change_amount, type, description
                 ) VALUES (
                     p_user_id, p_organization_id, v_user_credit_account_id, 1, 'invite_accept_add'::transaction_type,
                     'Team credit added from organization invite acceptance (Org: ' || p_organization_id::TEXT || ')'
                 );
                 v_credit_added := true;
             END IF;
        ELSE
            UPDATE public.credits
            SET team = team + 1,
                updated_at = now()
            WHERE id = v_user_credit_account_id;

            INSERT INTO public.transactions (
                user_id, organization_id, credit_account_id, change_amount, type, description
            ) VALUES (
                p_user_id, p_organization_id, v_user_credit_account_id, 1, 'invite_accept_add'::transaction_type,
                'Team credit added from organization invite acceptance (Org: ' || p_organization_id::TEXT || ')'
            );
            v_credit_added := true;
        END IF;

    EXCEPTION
        WHEN OTHERS THEN
            v_addition_error := SQLERRM;
            RAISE WARNING 'Credit addition failed for user % upon accepting invite for org %: %', p_user_id, p_organization_id, v_addition_error;
            v_credit_added := false;
    END;

    result := jsonb_build_object(
        'success', true,
        'member_id', v_new_member_id,
        'organization_name', v_org_name,
        'credit_deducted', v_credit_deducted,
        'credit_added', v_credit_added
    );

    IF v_addition_error IS NOT NULL THEN
        result := result || jsonb_build_object('credit_addition_error', v_addition_error);
    END IF;

    RETURN result;

EXCEPTION
    WHEN others THEN
        RAISE WARNING 'Error in accept_organization_invite_with_credit_transfer: %', SQLERRM;
        RETURN jsonb_build_object('error', 'An unexpected error occurred: ' || SQLERRM);
END;
$$;

-- Generic function to deduct credits from a user's account for a specific plan.
CREATE OR REPLACE FUNCTION deduct_credits(
    p_user_id UUID,
    p_plan_name TEXT,
    p_value_to_deduct INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_credits INT;
    query TEXT;
    column_name TEXT;
BEGIN
    CASE lower(p_plan_name)
        WHEN 'starter' THEN column_name := 'starter';
        WHEN 'pro' THEN column_name := 'pro';
        WHEN 'elite' THEN column_name := 'elite';
        WHEN 'studio' THEN column_name := 'studio';
        WHEN 'balance' THEN column_name := 'balance';
        ELSE
            RAISE EXCEPTION 'Invalid plan name: %', p_plan_name USING ERRCODE = 'P0001', HINT = 'Valid plans are: starter, pro, elite, studio, balance.';
    END CASE;

    query := format('SELECT %I FROM public.credits WHERE user_id = %L', column_name, p_user_id);
    EXECUTE query INTO current_credits;

    IF current_credits IS NULL THEN
        current_credits := 0;
    END IF;

    IF current_credits < p_value_to_deduct THEN
        RAISE EXCEPTION 'Insufficient % credits. Available: %, Required: %', p_plan_name, current_credits, p_value_to_deduct USING ERRCODE = 'P0002';
    END IF;

    query := format('UPDATE public.credits SET %I = %I - %s WHERE user_id = %L',
                    column_name, column_name, p_value_to_deduct, p_user_id);
    EXECUTE query;

    RETURN TRUE;

EXCEPTION
    WHEN SQLSTATE 'P0001' OR SQLSTATE 'P0002' THEN
        RAISE; 
    WHEN others THEN
        RAISE WARNING 'Unexpected error in deduct_credits: SQLSTATE: %, SQLERRM: %', SQLSTATE, SQLERRM;
        RAISE EXCEPTION 'An unexpected error occurred while deducting credits.';
END;
$$;

-- Generic function to check if a user has enough credits for a specific plan.
CREATE OR REPLACE FUNCTION has_enough_credits(
    p_user_id UUID,
    p_plan_name TEXT,
    p_credits_required INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_credits INT;
    query TEXT;
    column_name TEXT;
BEGIN
    CASE lower(p_plan_name)
        WHEN 'starter' THEN column_name := 'starter';
        WHEN 'pro' THEN column_name := 'pro';
        WHEN 'elite' THEN column_name := 'elite';
        WHEN 'studio' THEN column_name := 'studio';
        WHEN 'balance' THEN column_name := 'balance';
        ELSE
            RETURN FALSE;
    END CASE;

    query := format('SELECT %I FROM public.credits WHERE user_id = %L', column_name, p_user_id);
    EXECUTE query INTO current_credits;

    IF current_credits IS NULL THEN
        current_credits := 0;
    END IF;

    IF current_credits >= p_credits_required THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;

EXCEPTION
    WHEN others THEN
        RAISE WARNING 'Unexpected error in has_enough_credits: SQLSTATE: %, SQLERRM: %', SQLSTATE, SQLERRM;
        RETURN FALSE;
END;
$$;

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
