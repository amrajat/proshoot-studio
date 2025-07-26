-- ============================================================================
-- UPDATED_AT TRIGGERS
-- DESCRIPTION: Triggers to automatically update updated_at timestamps
-- DEPENDENCIES: All tables with updated_at columns, handle_updated_at function
-- BREAKING CHANGES: None
-- ROLLBACK: DROP TRIGGER statements for each trigger
-- ============================================================================

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

-- Trigger: Update timestamp on organizations changes
CREATE TRIGGER on_organizations_updated
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: Update timestamp on members changes
CREATE TRIGGER on_members_updated
    BEFORE UPDATE ON public.members
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: Update timestamp on credits changes
CREATE TRIGGER on_credits_updated
    BEFORE UPDATE ON public.credits
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: Update timestamp on studios changes
CREATE TRIGGER on_studios_updated
    BEFORE UPDATE ON public.studios
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();


-- Trigger: Update timestamp on purchases changes
CREATE TRIGGER on_purchases_updated
    BEFORE UPDATE ON public.purchases
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: Update timestamp on transactions changes
CREATE TRIGGER on_transactions_updated
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- TRIGGER COMMENTS
-- ============================================================================

COMMENT ON TRIGGER on_organizations_updated ON public.organizations IS 
    'Automatically updates updated_at timestamp when organization is modified';

COMMENT ON TRIGGER on_members_updated ON public.members IS 
    'Automatically updates updated_at timestamp when membership is modified';

COMMENT ON TRIGGER on_credits_updated ON public.credits IS 
    'Automatically updates updated_at timestamp when credits are modified';

COMMENT ON TRIGGER on_studios_updated ON public.studios IS 
    'Automatically updates updated_at timestamp when studio is modified';

COMMENT ON TRIGGER on_purchases_updated ON public.purchases IS 
    'Automatically updates updated_at timestamp when purchase is modified';

COMMENT ON TRIGGER on_transactions_updated ON public.transactions IS 
    'Automatically updates updated_at timestamp when transaction is modified';
