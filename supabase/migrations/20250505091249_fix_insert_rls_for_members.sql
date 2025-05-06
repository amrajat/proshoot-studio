    -- Drop existing INSERT policies first
    DROP POLICY IF EXISTS "Allow insert based on parent studio management rights" ON public.preview_headshots;
    DROP POLICY IF EXISTS "Allow insert based on parent studio management rights" ON public.result_headshots;
    DROP POLICY IF EXISTS "Allow insert for valid user/org context" ON public.transactions;

    -- New INSERT policy for preview_headshots
    -- Allow insert if user is the creator of the parent studio OR an admin of the parent studio's org
    CREATE POLICY "Allow insert for studio creator or org admin"
    ON public.preview_headshots
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.studios s
            WHERE s.id = preview_headshots.studio_id
            AND (
                s.creator_user_id = auth.uid() -- User created the studio
                OR
                (s.organization_id IS NOT NULL AND is_org_admin(s.organization_id)) -- Or user is admin of the org
            )
        )
    );

    -- New INSERT policy for result_headshots
    -- Allow insert if user is the creator of the parent studio OR an admin of the parent studio's org
    CREATE POLICY "Allow insert for studio creator or org admin"
    ON public.result_headshots
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.studios s
            WHERE s.id = result_headshots.studio_id
            AND (
                s.creator_user_id = auth.uid() -- User created the studio
                OR
                (s.organization_id IS NOT NULL AND is_org_admin(s.organization_id)) -- Or user is admin of the org
            )
        )
    );

    -- New INSERT policy for transactions
    -- Allow insert if the acting user matches user_id AND the credit account belongs to that user
    CREATE POLICY "Allow insert for user's own transactions using their personal credits"
    ON public.transactions
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id -- Transaction is logged for the acting user
        AND EXISTS ( -- And the referenced credit account belongs to this user
            SELECT 1
            FROM public.credits c
            WHERE c.id = transactions.credit_account_id
              AND c.user_id = auth.uid()
              AND c.organization_id IS NULL -- Ensure it's the personal credit account
        )
    );