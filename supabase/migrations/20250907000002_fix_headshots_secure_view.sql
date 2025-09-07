-- ============================================================================
-- MIGRATION: Fix headshots_secure View Security Issue
-- DESCRIPTION: Update headshots_secure view to use security_invoker instead of security_definer
-- DEPENDENCIES: headshots and studios tables must exist
-- BREAKING CHANGES: None (security improvement)
-- ============================================================================

-- Drop existing view
DROP VIEW IF EXISTS public.headshots_secure;

-- Recreate view with security_invoker to fix security linter warning
CREATE VIEW public.headshots_secure WITH (security_invoker = on) AS
SELECT 
    h.id,
    h.studio_id,
    h.preview,
    CASE
        WHEN s.status = 'ACCEPTED'::studio_status THEN h.result
        ELSE NULL::text
    END AS result,
    CASE
        WHEN s.status = 'ACCEPTED'::studio_status THEN h.hd
        ELSE NULL::text
    END AS hd,
    h.prompt,
    h.created_at,
    s.status AS studio_status
FROM headshots h
JOIN studios s ON h.studio_id = s.id;

-- Grant necessary permissions
GRANT SELECT ON public.headshots_secure TO authenticated;
GRANT SELECT ON public.headshots_secure TO service_role;

-- Add comment for documentation
COMMENT ON VIEW public.headshots_secure IS 'Secure view of headshots with conditional result/hd access based on studio status. Uses security_invoker for proper RLS enforcement.';
