CREATE TABLE organization_approved_backgrounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    background_name TEXT NOT NULL,
    background_theme TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_organization
        FOREIGN KEY(organization_id)
        REFERENCES organizations(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_organization_approved_backgrounds_org_id ON organization_approved_backgrounds(organization_id);

ALTER TABLE organization_approved_backgrounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admins full access to approved backgrounds" 
ON organization_approved_backgrounds
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = organization_approved_backgrounds.organization_id
      AND om.user_id = auth.uid()
      AND om.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = organization_approved_backgrounds.organization_id
      AND om.user_id = auth.uid()
      AND om.role = 'admin'
  )
);

CREATE POLICY "Allow members to read approved backgrounds"
ON organization_approved_backgrounds
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = organization_approved_backgrounds.organization_id
      AND om.user_id = auth.uid()
  )
);

-- Optional: Add a policy if needed.
-- CREATE POLICY "Allow admin full access" 
-- ON organization_approved_backgrounds
-- FOR ALL
-- USING (auth.is_admin_of_org(organization_id))
-- WITH CHECK (auth.is_admin_of_org(organization_id));
