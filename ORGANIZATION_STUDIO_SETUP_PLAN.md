# Plan: Studio Creation Workflow for Organizations

This document outlines the plan to implement a studio creation workflow tailored for organizations, allowing administrators to manage available clothing and background options for their members.

## I. Core Goal

Enable organization administrators to define a specific set of approved clothing and background options for their members. If no specific options are set (i.e., "no restrictions"), members can access all globally available options, similar to personal accounts.

## II. Data Model (Supabase)

We will modify the existing `organizations` table (or a dedicated `organization_settings` table linked to it) to store these preferences.

1.  **Add New Columns to `organizations` table (or `organization_settings` table):**

    - `approved_clothing_items` (Type: `JSONB`): Stores an array of objects, where each object is `{ name: "Clothing Name", theme: "Clothing Theme" }`. A `NULL` value in this column will signify that there are no restrictions, and members can use all globally available clothing options.
    - `approved_background_items` (Type: `JSONB`): Stores an array of objects, similar to above, but for backgrounds: `{ name: "Background Name", theme: "Background Theme" }`. A `NULL` value signifies no restrictions.

    _Default_: Both fields should default to `NULL` when a new organization is created, meaning "no restrictions" by default.

## III. Admin Management Pages

New pages will be created for organization administrators to manage these settings.

**1. Clothing Management Page**

- **Route:** `dashboard/clothing/page.jsx`
- **Functionality:**
  - **Context Detection:** Identify if the user is in a personal or organization context (`useAccountContext`).
  - \*\*Data Fetching:
    - Load all globally available clothing options (from `app/dashboard/studio/create/components/Forms/ClothingSelector.jsx` or a shared utility).
    - If in an organization context, fetch the `approved_clothing_items` for the current `organization_id` from Supabase.
  - \*\*Organization Admin View (`selectedContext.type === 'organization'`):
    - Display all global clothing options, grouped by theme.
    - For each item, provide a checkbox/toggle to include it in the organization's approved list.
    - A master toggle: **"Allow all clothing options (no restrictions)"**.
      - If **ON**: All individual item checkboxes are disabled (or hidden). Saving will set `approved_clothing_items` to `NULL` for the organization.
      - If **OFF**: Admin can select specific items. Saving will store the array of selected `{name, theme}` objects in `approved_clothing_items`.
    - "Save Changes" button to persist settings to Supabase.
    - _Access Control_: Ensure only designated organization admins can make changes.
  - \*\*Personal Account View (`selectedContext.type === 'personal'`):
    - Display all global clothing options (read-only).
    - Show an informational message: "You are using a personal account. You have access to all clothing options for your studios."

**2. Background Management Page**

- **Route:** `dashboard/backgrounds/page.jsx`
- **Functionality:** This page will mirror the `dashboard/clothing/page.jsx` in structure and logic but will manage `approved_background_items` and display background options.

## IV. Modifying Studio Creation Flow

File: `app/dashboard/studio/create/page.jsx`

- **Context-Aware Data Fetching:**
  - If `selectedContext.type === 'organization'`:
    - Fetch the `organization_id`.
    - Fetch `approved_clothing_items` and `approved_background_items` from Supabase for this organization.
- **Passing Filtered Options to Selectors:**
  - The `ClothingSelector` and `BackgroundSelector` components will be modified to accept a new prop (e.g., `availableItems`).
  - **Clothing:**
    - If `approved_clothing_items` is `NULL` (no restrictions) or user is in personal context, pass the full global list of clothing items to `ClothingSelector` (or let it use its internal default).
    - If `approved_clothing_items` contains an array, pass this filtered array as `availableItems` to `ClothingSelector`.
  - **Backgrounds:** Apply the same logic for `approved_background_items` and `BackgroundSelector`.

## V. Enhancing Selector Components

Files: `app/dashboard/studio/create/components/Forms/ClothingSelector.jsx` and `app/dashboard/studio/create/components/Forms/BackgroundSelector.jsx`

- **New Prop:** Introduce an optional prop, e.g., `availableItems` (Array of `{name, theme, image}` objects).
- **Dynamic Option Loading:**
  - Modify the components (specifically `getOptions()` and related logic for tabs like "All") to use `availableItems` if this prop is provided.
  - If `availableItems` is not provided or is `null`, the selectors should default to using their global `CLOTHING_OPTIONS` or `BACKGROUND_OPTIONS` constants, ensuring backward compatibility and use for personal accounts.

## VI. Backend Logic (Supabase & API)

- **Supabase Row Level Security (RLS):**
  - Ensure RLS policies are in place so that users can only read/update settings for organizations they are an admin of.
- **API Routes or Server Actions:**
  - **Fetch settings:** Endpoint to get `approved_clothing_items` and `approved_background_items` for a given `organization_id`.
  - **Update settings:** Endpoint to update these JSONB fields. This endpoint must handle:
    - Setting the field to a specific array of items.
    - Setting the field to `NULL` (when "no restrictions" is chosen).
  - These operations should be callable from the new admin pages.

## VII. User Experience & UI Considerations

- **Clear Admin Interface:** On the admin pages, clearly distinguish between selecting specific items and enabling the "no restriction" option.
- **Guidance for Admins:** Provide brief explanations or tooltips on the admin pages about how the settings will affect their members.
- **Feedback for Members:** In the studio creation flow, if an organization member is seeing a restricted list, a small, non-intrusive message could inform them (e.g., "Displaying options approved by your organization").

## VIII. Step-by-Step Implementation Outline

1.  **Database:** Add `approved_clothing_items` and `approved_background_items` (JSONB, nullable) columns to the `organizations` table (or a new `organization_settings` table). Set RLS policies.
2.  **Create Admin Pages Shells:** Scaffold `dashboard/clothing/page.jsx` and `dashboard/backgrounds/page.jsx`.
3.  **Global Options Utility:** Refactor if necessary to easily access global `CLOTHING_OPTIONS` and `BACKGROUND_OPTIONS` from multiple locations (admin pages, selector components).
4.  **Implement Admin Pages (Read):** Fetch and display global options. If org admin, fetch and display current org settings. For personal users, show info message.
5.  **Implement Admin Pages (Write):** Add UI controls (checkboxes, "allow all" toggle) and save functionality to update Supabase.
6.  **Enhance Selector Components:** Add `availableItems` prop and logic to render based on it.
7.  **Update Studio Creation Page:** Fetch org-specific approved items and pass them to the selector components.
8.  **Testing:** Thoroughly test all scenarios:
    - Org admin sets restrictions for clothing, not for backgrounds.
    - Org admin sets restrictions for both.
    - Org admin sets "no restrictions" for one or both.
    - Org member creating a studio sees the correct filtered/full lists.
    - Personal account user on admin pages (sees info message).
    - Personal account user creating a studio (sees all options).

## IX. Suggested Enhancements (Future Iterations)

1.  **Search/Filter on Admin Pages:** For large lists of items.
2.  **Bulk Actions for Admins:** "Approve all in X theme," "Clear all approvals."
3.  **Audit Log:** Track changes to organization settings.
4.  **Member Preview for Admins:** Allow admin to see how the selectors will look for their members.
