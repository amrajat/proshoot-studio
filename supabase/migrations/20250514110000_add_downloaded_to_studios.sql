-- Add the downloaded column to the studios table
ALTER TABLE public.studios
ADD COLUMN downloaded BOOLEAN NOT NULL DEFAULT FALSE;

-- Add a comment to describe the new column
COMMENT ON COLUMN public.studios.downloaded IS 'Indicates whether the studio headshots have been downloaded/processed and are available in result_headshots, vs preview_headshots.';

-- It might be useful to index this column if it's frequently used in WHERE clauses
CREATE INDEX idx_studios_downloaded ON public.studios(downloaded); 