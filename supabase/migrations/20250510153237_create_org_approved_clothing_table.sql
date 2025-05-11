CREATE TABLE organization_approved_clothing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    clothing_name TEXT NOT NULL,
    clothing_theme TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_organization
        FOREIGN KEY(organization_id)
        REFERENCES organizations(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_organization_approved_clothing_org_id ON organization_approved_clothing(organization_id);

ALTER TABLE organization_approved_clothing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admins full access to approved clothing" 
ON organization_approved_clothing
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = organization_approved_clothing.organization_id
      AND om.user_id = auth.uid()
      AND om.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = organization_approved_clothing.organization_id
      AND om.user_id = auth.uid()
      AND om.role = 'admin'
  )
);

CREATE POLICY "Allow members to read approved clothing"
ON organization_approved_clothing
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = organization_approved_clothing.organization_id
      AND om.user_id = auth.uid()
  )
);

-- Optional: Add a policy if needed, for example, to allow admins to manage these.
-- This is a basic example, adjust to your roles and needs.
-- CREATE POLICY "Allow admin full access" 
-- ON organization_approved_clothing
-- FOR ALL
-- USING (auth.is_admin_of_org(organization_id)) -- Assuming you have such a function
-- WITH CHECK (auth.is_admin_of_org(organization_id));
