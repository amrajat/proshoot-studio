-- Migration: <timestamp>_refine_core_rls_policies.sql

----------------------------------------
-- Helper Function: Check Org Membership
----------------------------------------
-- Helper function to check if the current user is a member of a given organization.
-- Returns TRUE if the user is a member, FALSE otherwise.
CREATE OR REPLACE FUNCTION is_org_member(org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public -- Use definer to check membership table
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

-- Helper function to check if the current user is an admin of a given organization.
-- Returns TRUE if the user is an admin, FALSE otherwise.
CREATE OR REPLACE FUNCTION is_org_admin(org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public -- Use definer to check membership table
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


----------------------------------------
-- Table: studios
----------------------------------------
-- Drop existing policies if they exist from previous attempts (optional, but safer)
DROP POLICY IF EXISTS "Allow users to manage their own studios" ON public.studios;
DROP POLICY IF EXISTS "Allow org members/admins to manage org studios" ON public.studios;
DROP POLICY IF EXISTS "Default Deny" ON public.studios; -- Example, adjust if you have others

-- SELECT: User can select studios they created OR studios belonging to orgs they are a member of.
CREATE POLICY "Allow select access for creators and org members"
ON public.studios
FOR SELECT
USING (
    auth.uid() = creator_user_id -- User created it
    OR (organization_id IS NOT NULL AND is_org_member(organization_id)) -- Or it's an org studio and user is a member
);

-- INSERT: User can insert if it's a personal studio OR if it's an org studio and they are an admin of that org.
CREATE POLICY "Allow insert for creators (personal) or org admins (org)"
ON public.studios
FOR INSERT
WITH CHECK (
    (organization_id IS NULL AND auth.uid() = creator_user_id) -- Personal studio insert check
    OR (organization_id IS NOT NULL AND auth.uid() = creator_user_id AND is_org_admin(organization_id)) -- Org studio insert check
);

-- UPDATE: User can update if they created it (personal) OR if they are an admin of the org it belongs to.
CREATE POLICY "Allow update for creators (personal) or org admins (org)"
ON public.studios
FOR UPDATE
USING (
    (organization_id IS NULL AND auth.uid() = creator_user_id)
    OR (organization_id IS NOT NULL AND is_org_admin(organization_id))
)
WITH CHECK ( -- Optional: Add constraints on what can be updated if needed
    (organization_id IS NULL AND auth.uid() = creator_user_id)
    OR (organization_id IS NOT NULL AND is_org_admin(organization_id))
);

-- DELETE: User can delete if they created it (personal) OR if they are an admin of the org it belongs to.
CREATE POLICY "Allow delete for creators (personal) or org admins (org)"
ON public.studios
FOR DELETE
USING (
    (organization_id IS NULL AND auth.uid() = creator_user_id)
    OR (organization_id IS NOT NULL AND is_org_admin(organization_id))
);

----------------------------------------
-- Table: preview_headshots
----------------------------------------
-- Drop existing policies (optional)
DROP POLICY IF EXISTS "Allow access based on parent studio ownership/membership" ON public.preview_headshots;

-- SELECT: User can select if they can select the parent studio.
CREATE POLICY "Allow select based on parent studio access"
ON public.preview_headshots
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.studios s
        WHERE s.id = preview_headshots.studio_id
        -- RLS on studios table itself handles the permission check here implicitly
        -- No need to explicitly check auth.uid() = s.creator_user_id OR is_org_member(s.organization_id) again
    )
);

-- INSERT: User can insert if they can update the parent studio (creator for personal, admin for org).
-- Note: We check UPDATE permission on the studio as a proxy for "management" rights needed to add headshots.
CREATE POLICY "Allow insert based on parent studio management rights"
ON public.preview_headshots
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.studios s
        WHERE s.id = preview_headshots.studio_id
        AND (
            (s.organization_id IS NULL AND s.creator_user_id = auth.uid()) -- Can update personal studio
            OR (s.organization_id IS NOT NULL AND is_org_admin(s.organization_id)) -- Can update org studio
        )
    )
);

-- UPDATE/DELETE: Generally not needed as URLs are usually immutable or handled by cascade delete. Add if required.

----------------------------------------
-- Table: result_headshots
----------------------------------------
-- Drop existing policies (optional)
DROP POLICY IF EXISTS "Allow access based on parent studio ownership/membership" ON public.result_headshots;

-- SELECT: User can select if they can select the parent studio. (Same as previews)
CREATE POLICY "Allow select based on parent studio access"
ON public.result_headshots
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.studios s
        WHERE s.id = result_headshots.studio_id
    )
);

-- INSERT: User can insert if they can update the parent studio. (Same as previews)
CREATE POLICY "Allow insert based on parent studio management rights"
ON public.result_headshots
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.studios s
        WHERE s.id = result_headshots.studio_id
        AND (
            (s.organization_id IS NULL AND s.creator_user_id = auth.uid()) -- Can update personal studio
            OR (s.organization_id IS NOT NULL AND is_org_admin(s.organization_id)) -- Can update org studio
        )
    )
);

-- UPDATE/DELETE: Generally not needed.

----------------------------------------
-- Table: favorites
----------------------------------------
-- Drop existing policies first
DROP POLICY IF EXISTS "Allow users to view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Allow users to insert their own favorites for owned studios" ON public.favorites;
DROP POLICY IF EXISTS "Allow users to delete their own favorites" ON public.favorites;

-- SELECT: User can select their own favorites OR if they are an admin of the org the favorite's studio belongs to.
CREATE POLICY "Allow select for owners or relevant org admins"
ON public.favorites
FOR SELECT
USING (
    auth.uid() = user_id -- It's the user's own favorite
    OR EXISTS ( -- Or it's in an org studio and the viewer is an admin of that org
        SELECT 1
        FROM public.studios s
        WHERE s.id = favorites.studio_id
        AND s.organization_id IS NOT NULL
        AND is_org_admin(s.organization_id)
    )
);

-- INSERT: User can insert if it's their own user_id AND they have SELECT access to the studio.
CREATE POLICY "Allow insert for users with access to the studio"
ON public.favorites
FOR INSERT
WITH CHECK (
    auth.uid() = user_id -- Inserting for self
    AND EXISTS ( -- And they can access the studio (implicitly checks creator or org membership)
        SELECT 1
        FROM public.studios s
        WHERE s.id = favorites.studio_id
    )
    AND EXISTS ( -- And the headshot actually belongs to that studio
        SELECT 1
        FROM public.result_headshots rh
        WHERE rh.id = favorites.headshot_id
        AND rh.studio_id = favorites.studio_id
    )
);

-- DELETE: User can delete only their own favorites.
CREATE POLICY "Allow delete only for the user who favorited"
ON public.favorites
FOR DELETE
USING (
    auth.uid() = user_id
);


----------------------------------------
-- Table: transactions
----------------------------------------
-- Drop existing policies (optional)
DROP POLICY IF EXISTS "Allow select for relevant users/org admins" ON public.transactions;
DROP POLICY IF EXISTS "Allow insert based on context" ON public.transactions;


-- SELECT: User can select if it's their personal transaction OR if it relates to an org they are an ADMIN of.
CREATE POLICY "Allow select for relevant users or org admins"
ON public.transactions
FOR SELECT
USING (
    (organization_id IS NULL AND auth.uid() = user_id) -- Personal transaction initiated by the user
    OR (organization_id IS NOT NULL AND is_org_admin(organization_id)) -- Org transaction and user is admin
);

-- INSERT: Allow insert if the user_id matches auth.uid() AND it relates to a credit account they manage.
-- Note: RLS on the 'credits' table handles the check if they can *update* the balance.
-- This policy primarily ensures the transaction log entry *itself* is associated correctly.
CREATE POLICY "Allow insert for valid user/org context"
ON public.transactions
FOR INSERT
WITH CHECK (
    auth.uid() = user_id -- The transaction is logged for the acting user
    AND EXISTS ( -- Check that the referenced credit account exists and belongs to the correct context
        SELECT 1
        FROM public.credits c
        WHERE c.id = transactions.credit_account_id
        AND (
            -- Personal context: credits.user_id matches transaction.user_id (auth.uid) and org_id is null
            (transactions.organization_id IS NULL AND c.organization_id IS NULL AND c.user_id = transactions.user_id)
            OR
            -- Organizational context: credits.organization_id matches transaction.organization_id and user_id is null
            (transactions.organization_id IS NOT NULL AND c.user_id IS NULL AND c.organization_id = transactions.organization_id)
        )
    )
    -- Optional: Could add a check here that the user is an admin if transactions.organization_id is NOT NULL,
    -- but the RLS check on updating the credits table *should* prevent unauthorized updates anyway.
);

-- UPDATE/DELETE: Usually not allowed on transaction logs.
