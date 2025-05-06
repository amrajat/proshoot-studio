# Database Refactor and Feature Addition Plan

## 1. Goals

- Refactor the current database schema to follow best practices, moving data _from_ `public.users` into new, dedicated tables without altering the structure of `public.users` itself during migration.
- Introduce Organization/Team functionality alongside Individual accounts.
- Allow users to switch context between their Individual and Organization spaces.
- Implement a secure invitation system for adding members to Organizations.
- Implement full account/organization deletion functionality.
- Introduce "Studios" (replacing "headshot_jobs") for managing headshot generation tasks.
- Separate headshot outputs into watermarked previews and final results.
- Implement a credit system with purchases, balances, and transaction logging.
- Allow deletion of Studios and associated data.

## 2. Proposed Schema Design

We will create several new tables to separate concerns and establish clear relationships. Existing data in `public.users` will be copied to `public.profiles` where appropriate during data migration, but `public.users` schema will not be altered by this migration script.

**Enum Types:**

- `public.invitation_status`: (`pending`, `accepted`, `expired`, `denied`)
- `public.organization_role`: (`admin`, `member`)
- `public.studio_status`: (`pending`, `processing`, `completed`, `failed`)
- `public.purchase_status`: (`succeeded`, `pending`, `failed`)
- `public.transaction_type`: (`purchase`, `studio_creation`, `refund`, `admin_grant`, `initial`)

**Tables:**

1.  **`public.profiles`**

    - Purpose: Stores data specific to an individual user's profile, separate from authentication. Populated from `public.users`.
    - Columns:
      - `id` (UUID, Primary Key, default: `uuid_generate_v4()`)
      - `user_id` (UUID, Foreign Key to `auth.users.id` ON DELETE CASCADE, UNIQUE, NOT NULL)
      - `full_name` (TEXT)
      - `avatar_url` (TEXT)
      - `created_at` (TIMESTAMPTZ, default: `now()`)
      - `updated_at` (TIMESTAMPTZ, default: `now()`)
    - RLS: Enable RLS. Users can select/update/delete their own profile.

2.  **`public.organizations`**

    - Purpose: Stores information about each Organization/Team.
    - Columns:
      - `id` (UUID, Primary Key, default: `uuid_generate_v4()`)
      - `owner_user_id` (UUID, Foreign Key to `auth.users.id` ON DELETE RESTRICT, NOT NULL) # Restrict deletion of owner if org exists
      - `name` (TEXT, NOT NULL)
      - `created_at` (TIMESTAMPTZ, default: `now()`)
      - `updated_at` (TIMESTAMPTZ, default: `now()`)
    - RLS: Enable RLS. Owner can manage. Members can select based on membership.

3.  **`public.organization_members`**

    - Purpose: Links users to the organizations they are part of. One organization can have multiple members.
    - Columns:
      - `id` (UUID, Primary Key, default: `uuid_generate_v4()`)
      - `organization_id` (UUID, Foreign Key to `public.organizations.id` ON DELETE CASCADE, NOT NULL)
      - `user_id` (UUID, Foreign Key to `auth.users.id` ON DELETE CASCADE, NOT NULL)
      - `role` (`public.organization_role`, NOT NULL, default: `'member'`)
      - `joined_at` (TIMESTAMPTZ, default: `now()`)
    - Constraints: UNIQUE (`organization_id`, `user_id`)
    - RLS: Enable RLS. Admins can manage members. Members can view their own membership and other members of the same org.

4.  **`public.invitations`**

    - Purpose: Manages invitations for users to join organizations.
    - Columns:
      - `id` (UUID, Primary Key, default: `uuid_generate_v4()`)
      - `organization_id` (UUID, Foreign Key to `public.organizations.id` ON DELETE CASCADE, NOT NULL)
      - `invited_by_user_id` (UUID, Foreign Key to `auth.users.id` ON DELETE SET NULL, NOT NULL)
      - `invited_email` (TEXT, NOT NULL)
      - `role` (`public.organization_role`, NOT NULL, default: `'member'`)
      - `token` (TEXT, UNIQUE, NOT NULL, default: `extensions.uuid_generate_v4()`)
      - `status` (`public.invitation_status`, NOT NULL, default: `'pending'`)
      - `expires_at` (TIMESTAMPTZ)
      - `created_at` (TIMESTAMPTZ, default: `now()`)
      - `updated_at` (TIMESTAMPTZ, default: `now()`)
    - RLS: Enable RLS. Org admins can manage invites for their org. Invited users might see their pending invites.

5.  **`public.studios`** (Replaces `headshot_jobs`)

    - Purpose: Tracks headshot generation tasks ("studios").
    - Columns:
      - `id` (UUID, Primary Key, default: `uuid_generate_v4()`)
      - `creator_user_id` (UUID, Foreign Key to `auth.users.id` ON DELETE CASCADE, NOT NULL)
      - `organization_id` (UUID, Foreign Key to `public.organizations.id` ON DELETE SET NULL, NULLABLE) - If null, it's an individual studio.
      - `name` (TEXT, NOT NULL) - User-friendly name for the studio.
      - `status` (`public.studio_status`, NOT NULL, default: `'pending'`)
      - `created_at` (TIMESTAMPTZ, default: `now()`)
      - `updated_at` (TIMESTAMPTZ, default: `now()`)
    - RLS: Enable RLS. Users can manage their own studios. Org members/admins can manage studios associated with their org based on roles.

6.  **`public.preview_headshots`**

    - Purpose: Stores URLs for watermarked preview headshots.
    - Columns:
      - `id` (UUID, Primary Key, default: `uuid_generate_v4()`)
      - `studio_id` (UUID, Foreign Key to `public.studios.id` ON DELETE CASCADE, NOT NULL)
      - `image_url` (TEXT, NOT NULL)
      - `created_at` (TIMESTAMPTZ, default: `now()`)
    - RLS: Enable RLS. Access granted based on ownership/membership of the parent `studio`.

7.  **`public.result_headshots`**

    - Purpose: Stores URLs for final, non-watermarked headshots.
    - Columns:
      - `id` (UUID, Primary Key, default: `uuid_generate_v4()`)
      - `studio_id` (UUID, Foreign Key to `public.studios.id` ON DELETE CASCADE, NOT NULL)
      - `image_url` (TEXT, NOT NULL)
      - `created_at` (TIMESTAMPTZ, default: `now()`)
    - RLS: Enable RLS. Access granted based on ownership/membership of the parent `studio` (potentially gated by credit/payment status).

8.  **`public.purchases`**

    - Purpose: Records payment transactions.
    - Columns:
      - `id` (UUID, Primary Key, default: `uuid_generate_v4()`)
      - `user_id` (UUID, Foreign Key to `auth.users.id` ON DELETE SET NULL, NOT NULL)
      - `organization_id` (UUID, Foreign Key to `public.organizations.id` ON DELETE SET NULL, NULLABLE)
      - `payment_provider` (TEXT)
      - `payment_intent_id` (TEXT, UNIQUE)
      - `amount` (INTEGER, NOT NULL CHECK (`amount` > 0)) # In cents/smallest unit
      - `currency` (TEXT, NOT NULL)
      - `credits_granted` (INTEGER, NOT NULL CHECK (`credits_granted` >= 0))
      - `status` (`public.purchase_status`, NOT NULL)
      - `created_at` (TIMESTAMPTZ, default: `now()`)
      - `updated_at` (TIMESTAMPTZ, default: `now()`)
    - RLS: Enable RLS. Users can see own purchases. Org admins can see org purchases.

9.  **`public.credits`**

    - Purpose: Tracks the current credit balance for a user or an organization.
    - Columns:
      - `id` (UUID, Primary Key, default: `uuid_generate_v4()`)
      - `user_id` (UUID, Foreign Key to `auth.users.id` ON DELETE CASCADE, NULLABLE, UNIQUE)
      - `organization_id` (UUID, Foreign Key to `public.organizations.id` ON DELETE CASCADE, NULLABLE, UNIQUE)
      - `balance` (INTEGER, NOT NULL, default: 0, CHECK (`balance` >= 0))
      - `updated_at` (TIMESTAMPTZ, default: `now()`)
    - Constraints: `CHECK ((user_id IS NOT NULL AND organization_id IS NULL) OR (user_id IS NULL AND organization_id IS NOT NULL))` - Belongs to user OR org.
    - RLS: Enable RLS. User sees own balance. Org members see org balance.

10. **`public.transactions`**
    - Purpose: Audit log of all credit changes (additions and deductions).
    - Columns:
      - `id` (UUID, Primary Key, default: `uuid_generate_v4()`)
      - `user_id` (UUID, Foreign Key to `auth.users.id` ON DELETE SET NULL, NULLABLE) # User performing/initiating
      - `organization_id` (UUID, Foreign Key to `public.organizations.id` ON DELETE SET NULL, NULLABLE) # Org context if applicable
      - `credit_account_id` (UUID, Foreign Key to `public.credits.id` ON DELETE RESTRICT, NOT NULL) # The balance being changed
      - `change_amount` (INTEGER, NOT NULL) # Positive for add, negative for spend
      - `type` (`public.transaction_type`, NOT NULL)
      - `related_purchase_id` (UUID, Foreign Key to `public.purchases.id` ON DELETE SET NULL, NULLABLE)
      - `related_studio_id` (UUID, Foreign Key to `public.studios.id` ON DELETE SET NULL, NULLABLE)
      - `description` (TEXT)
      - `created_at` (TIMESTAMPTZ, default: `now()`)
    - RLS: Enable RLS. User sees own transactions. Org admins/members see relevant org transactions.

## 3. Migration Steps (Using Supabase CLI)

1.  **Backup Production Database:** Crucial step before any deployment.
2.  **Start Local Development Database:** `supabase start`.
3.  **Pull Production Schema Changes (Optional but Recommended):** `supabase db pull`.
4.  **Create New Migration File:**
    ```bash
    supabase migration new refactor_schema_orgs_credits_studios
    ```
5.  **Edit the Migration SQL File:** Add SQL statements for:

    - Creating Enum Types: `invitation_status`, `organization_role`, `studio_status`, `purchase_status`, `transaction_type`.
    - Creating Tables: `profiles`, `organizations`, `organization_members`, `invitations`, `studios`, `preview_headshots`, `result_headshots`, `purchases`, `credits`, `transactions` with specified columns, Primary Keys, Foreign Keys (with appropriate `ON DELETE` actions like CASCADE, SET NULL, RESTRICT), UNIQUE constraints, and CHECK constraints.
    - Enabling RLS: `ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;` for all new tables.
    - Creating RLS Policies: Define `CREATE POLICY ...` statements for each table, specifying access control for SELECT, INSERT, UPDATE, DELETE based on user roles (authenticated, user owning the record, org admin, org member, etc.). Ensure policies cover all intended access patterns.
    - **Data Migration (Example - Needs careful adjustment):**
      - Copy relevant user data: `INSERT INTO public.profiles (user_id, full_name, avatar_url, created_at, updated_at) SELECT id, full_name, avatar_url, created_at, updated_at FROM public.users;` (Adjust column names based on your actual `public.users` table). **Do not add `ALTER TABLE public.users ...` or `DROP COLUMN ...` statements here.**
      - Create initial credit balances (if applicable, e.g., for existing users): `INSERT INTO public.credits (user_id, balance) SELECT id, <initial_credits_value> FROM public.users;`
      - Create initial transaction logs for these balances: `INSERT INTO public.transactions (user_id, credit_account_id, change_amount, type, description) SELECT u.id, c.id, c.balance, 'initial', 'Initial credit balance assignment' FROM public.users u JOIN public.credits c ON u.id = c.user_id;` (Adjust based on actual IDs).
    - **Create Trigger Function for Profiles:** Implement the `public.handle_new_user()` function and trigger (as shown in the previous plan) to automatically create a profile when a new user signs up in `auth.users`.
    - **Create Trigger Function for Credits:** Consider a similar trigger to create an initial (zero) credit balance row in `public.credits` when a new user signs up or an organization is created.

      ```sql
      -- Function to create a credit balance for a new user profile
      create function public.handle_new_profile_credit()
      returns trigger
      language plpgsql
      security definer set search_path = public
      as $$
      begin
        insert into public.credits (user_id, balance)
        values (new.user_id, 0); -- Start with 0 credits
        return new;
      end;
      $$;

      -- Trigger to call the function after a new profile is created
      create trigger on_profile_created_add_credits
        after insert on public.profiles
        for each row execute procedure public.handle_new_profile_credit();

      -- Function/Trigger for Organization Credits (similar pattern)
      -- ... create function handle_new_organization_credit ...
      -- ... create trigger on_organization_created_add_credits after insert on public.organizations ...
      ```

6.  **Apply Migration Locally:** `supabase db reset`. Debug any errors.
7.  **Test Locally:** Extensive testing covering all new entities and features:
    - Signup -> Profile created -> Credit balance created (0).
    - Organization creation -> Org Credit balance created (0).
    - Invitations (send, accept, deny, expire).
    - Member management (add, remove, role change).
    - Purchases -> Credits added -> Transaction logged.
    - Studio creation -> Credits deducted -> Transaction logged.
    - Studio process -> Previews added -> Results added.
    - **Studio Deletion:** Test deleting a studio cascades to delete `preview_headshots` and `result_headshots`.
    - **User Deletion:** Test deleting a user cascades correctly (profile, memberships, studios, credits, etc., but check `ON DELETE SET NULL` and `ON DELETE RESTRICT` behavior).
    - **Organization Deletion:** Test deleting an org cascades correctly (memberships, invites, studios?, credits, etc.). Handle owner deletion restriction.
    - Check RLS policies prevent unauthorized access/modification.
8.  **Generate Types (TypeScript):** `supabase gen types typescript --local > src/types/supabase.ts`

## 4. Feature Implementation Notes

- **Account Toggle (UI):** Remains largely the same concept. Fetch profile, org memberships, and potentially separate credit balances (`public.credits` where `user_id = auth.uid()` and `public.credits` where `organization_id IN (user's orgs)`). API calls for credit-consuming actions (like creating a Studio) must specify whether to use the user's balance or a specific organization's balance. RLS and application logic must enforce this.
- **Account/Organization Deletion:**
  - **User Account:** Deleting from `auth.users` cascades to `profiles`, `organization_members`, `studios`, `credits` (user balance). Use `ON DELETE SET NULL` for FKs in `purchases`, `transactions`, `invitations` where appropriate. A `public.delete_user()` function is still recommended for atomicity, especially to handle potential org ownership transfers or deletions if the user is an owner.
  - **Organization:** Deleting an organization cascades to `organization_members`, `invitations`, `credits` (org balance). Use `ON DELETE SET NULL` for FKs in `studios`, `purchases`, `transactions`. The `owner_user_id` FK should be `ON DELETE RESTRICT` to prevent deleting an owner if they still own an org (unless handled by a specific function). A `public.delete_organization(org_id)` function checking ownership and performing deletion is best.
  - **Studio Deletion:** Deleting a `studios` record will automatically cascade delete related `preview_headshots` and `result_headshots` due to `ON DELETE CASCADE` on the foreign keys. Ensure RLS policies allow the correct users (creator or org admin) to delete studios. This can be a simple `DELETE` operation protected by RLS.
- **Credit System:**
  - Purchases create a `purchases` record and trigger logic (e.g., a database function called via RPC, or backend logic) to update the corresponding `credits.balance` and create a `transactions` log entry (`type = 'purchase'`).
  - Creating a `studios` record requires checking the relevant `credits.balance` (user or org), deducting the cost if sufficient, updating the balance, and creating a `transactions` log entry (`type = 'studio_creation'`). This should ideally happen atomically, possibly within a database function.
- **Headshot Access:** Access to `result_headshots` might depend on the `studios.status` being 'completed' and potentially other logic (like ensuring credits were successfully deducted).

## 5. Next Steps

1.  Review this updated schema and plan carefully.
2.  Finalize column types, constraints, and especially `ON DELETE` actions for Foreign Keys.
3.  Write the SQL migration file (`supabase/migrations/...sql`).
4.  Implement and test locally.
5.  Update frontend and backend application code to interact with the new schema.
