-- Add columns to public.organizations table
ALTER TABLE public.organizations
  ADD COLUMN team_size INT4, -- Consider if this should be NOT NULL or have a default
  ADD COLUMN website TEXT NULL,
  ADD COLUMN industry TEXT NULL,
  ADD COLUMN department TEXT NULL,
  ADD COLUMN "position" TEXT NULL; -- Quoted because position can be a reserved keyword
