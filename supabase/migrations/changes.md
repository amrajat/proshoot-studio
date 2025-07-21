1. In orgnization table, the column is unique, which is not requried we should remove this unique constraint from this.

# Migration Changes Log

## ✅ COMPLETED: Headshots Table Merge (2025-07-21)

### Summary

Successfully merged `preview_headshots` and `result_headshots` tables into a single `headshots` table with `preview` and `result` columns.

### Changes Made

#### Database Schema

1. **20250101000302_headshots_tables.sql**:

   - Merged `preview_headshots` and `result_headshots` into single `headshots` table
   - Added `preview` and `result` TEXT columns for R2 bucket object keys
   - Added constraint to ensure at least one image exists
   - Updated all indexes, constraints, and RLS policies
   - Updated `favorites` table foreign key to reference new `headshots` table

2. **20250101000303_studio_functions.sql**:
   - Updated `append_preview_image_urls()` to insert into `headshots` table with `preview` column
   - Updated `append_results_image_urls()` to update existing records with `result` column
   - Updated `get_user_studios()` to count preview/result images from single table using FILTER clauses

#### Documentation

1. **README.md**: Updated table list to show merged `headshots` table
2. **MIGRATION_SUMMARY.md**: Updated core tables list and adjusted numbering

### Breaking Changes

- Functions now work with single `headshots` table instead of separate tables
- Frontend code will need updates to query single table
- Favorites system now references `headshots.id` instead of `result_headshots.id`

### Next Steps

- Update frontend components to use single `headshots` table
- Update API queries and state management
- Test migration in development environment

---

## TODO: Organization Table Constraint

1. In organization table, the column is unique, which is not required - we should remove this unique constraint from this.
