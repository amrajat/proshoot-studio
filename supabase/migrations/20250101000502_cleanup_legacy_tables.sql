-- ============================================================================
-- CLEANUP LEGACY TABLES
-- DESCRIPTION: Remove legacy tables and functions after data migration
-- DEPENDENCIES: All new tables and data migration completed
-- BREAKING CHANGES: Removes legacy schema - ONLY run after data migration
-- ROLLBACK: Restore from backup - this migration is destructive
-- ============================================================================

-- ⚠️  WARNING: This migration is DESTRUCTIVE and should only be run after:
-- 1. All data has been migrated to new schema
-- 2. Application has been updated to use new schema
-- 3. Full backup has been taken
-- 4. Migration has been tested on staging environment

-- ============================================================================
-- LEGACY FUNCTION CLEANUP
-- ============================================================================

-- Drop legacy functions that manipulated JSONB arrays in users table
DROP FUNCTION IF EXISTS public.add_new_studio(text, jsonb);
DROP FUNCTION IF EXISTS public.add_purchase_history(text, jsonb);
DROP FUNCTION IF EXISTS public.append_preview_image_urls(text, text[], uuid);
DROP FUNCTION IF EXISTS public.append_results_image_urls(text, text[], uuid);

-- ============================================================================
-- LEGACY TABLE CLEANUP
-- ============================================================================

-- Drop legacy users table (after data migration to profiles)
-- UNCOMMENT ONLY AFTER DATA MIGRATION IS COMPLETE AND VERIFIED
-- DROP TABLE IF EXISTS public.users CASCADE;

-- Drop any other legacy tables that may exist
DROP TABLE IF EXISTS public.organization_approved_clothing CASCADE;
DROP TABLE IF EXISTS public.organization_approved_backgrounds CASCADE;

-- ============================================================================
-- LEGACY POLICY CLEANUP
-- ============================================================================

-- Clean up any orphaned policies (will fail silently if they don't exist)
-- These would be policies on tables that no longer exist

-- ============================================================================
-- LEGACY TRIGGER CLEANUP
-- ============================================================================

-- Drop any legacy triggers that may still exist
-- (Most will be dropped automatically when tables are dropped)

-- ============================================================================
-- PERMISSIONS CLEANUP
-- ============================================================================

-- Revoke permissions on legacy functions (if they still exist)
-- This is safe to run even if functions don't exist

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON SCHEMA public IS 'Refactored schema with normalized tables and proper RLS policies';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Use these queries to verify cleanup was successful:

/*
-- Check for any remaining legacy functions
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%legacy%' 
OR routine_name IN ('add_new_studio', 'add_purchase_history', 'append_preview_image_urls', 'append_results_image_urls');

-- Check for any remaining legacy tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'organization_approved_clothing', 'organization_approved_backgrounds');

-- Verify new schema is complete
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
*/

-- ============================================================================
-- POST-CLEANUP TASKS
-- ============================================================================

-- After running this migration:
-- 1. Update application configuration to remove any legacy table references
-- 2. Update API endpoints to use new schema
-- 3. Test all application functionality
-- 4. Monitor for any errors in production logs
-- 5. Update documentation to reflect new schema

-- ============================================================================
-- ROLLBACK PLAN
-- ============================================================================

-- If issues are discovered after cleanup:
-- 1. Restore from backup taken before migration
-- 2. Fix any issues in the new schema
-- 3. Re-run data migration with fixes
-- 4. Re-run cleanup migration

COMMENT ON SCHEMA public IS 'Production schema with normalized tables, proper RLS policies, and legacy cleanup completed';
