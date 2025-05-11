ALTER TABLE organizations
ADD COLUMN restrict_clothing_options BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN restrict_background_options BOOLEAN NOT NULL DEFAULT FALSE;

-- Ensure RLS is enabled on the organizations table if not already done in a prior migration.
-- ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow org admins to update restriction flags"
ON organizations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM organization_members om
    WHERE om.organization_id = organizations.id
      AND om.user_id = auth.uid()
      AND om.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM organization_members om
    WHERE om.organization_id = organizations.id
      AND om.user_id = auth.uid()
      AND om.role = 'admin'
  )
);

CREATE POLICY "Allow org members to read organization details including flags"
ON organizations
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM organization_members om
    WHERE om.organization_id = organizations.id
      AND om.user_id = auth.uid()
  )
);

-- Note: If you have an existing broad SELECT policy for members or UPDATE policy for admins on the organizations table,
-- you might integrate the logic for these new columns/flags into those existing policies
-- rather than adding separate new policies, to avoid conflicts or overly permissive rules.
