    -- Drop existing select policies first to ensure they are replaced
    DROP POLICY IF EXISTS "Allow select based on parent studio access" ON public.result_headshots;
    DROP POLICY IF EXISTS "Allow select for creators or org members direct check" ON public.result_headshots; -- If you created this temp one

    DROP POLICY IF EXISTS "Allow select based on parent studio access" ON public.preview_headshots;
    DROP POLICY IF EXISTS "Allow select for creators or org members direct check" ON public.preview_headshots; -- If you created this temp one

    -- Create new policy for result_headshots using direct membership check
    CREATE POLICY "Allow select for creators or org members direct join"
    ON public.result_headshots
    FOR SELECT
    USING (
        EXISTS (
            -- Find the parent studio
            SELECT 1
            FROM public.studios s
            WHERE s.id = result_headshots.studio_id
            -- Explicitly check access conditions here:
            AND (
                -- Condition 1: User created the studio
                s.creator_user_id = auth.uid()
                OR
                -- Condition 2: Studio belongs to an org, AND user is a member of that org (checked via subquery)
                (
                    s.organization_id IS NOT NULL
                    AND EXISTS (
                        SELECT 1
                        FROM public.organization_members om
                        WHERE om.organization_id = s.organization_id -- Join based on studio's org_id
                          AND om.user_id = auth.uid() -- Check if current user is a member
                    )
                )
            )
        )
    );

    -- Create new policy for preview_headshots using direct membership check
    CREATE POLICY "Allow select for creators or org members direct join"
    ON public.preview_headshots
    FOR SELECT
    USING (
        EXISTS (
            -- Find the parent studio
            SELECT 1
            FROM public.studios s
            WHERE s.id = preview_headshots.studio_id
             -- Explicitly check access conditions here:
            AND (
                -- Condition 1: User created the studio
                s.creator_user_id = auth.uid()
                OR
                 -- Condition 2: Studio belongs to an org, AND user is a member of that org (checked via subquery)
                (
                    s.organization_id IS NOT NULL
                    AND EXISTS (
                        SELECT 1
                        FROM public.organization_members om
                        WHERE om.organization_id = s.organization_id -- Join based on studio's org_id
                          AND om.user_id = auth.uid() -- Check if current user is a member
                    )
                )
            )
        )
    );