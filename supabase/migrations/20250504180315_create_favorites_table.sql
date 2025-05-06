-- Migration file: <timestamp>_create_favorites_table.sql

-- Create the favorites table
CREATE TABLE public.favorites (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    studio_id uuid NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
    headshot_id uuid NOT NULL REFERENCES public.result_headshots(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    -- Ensure a user can only favorite a specific headshot within a studio once
    CONSTRAINT unique_user_studio_headshot_favorite UNIQUE (user_id, studio_id, headshot_id)
);

-- Add indexes for common queries
CREATE INDEX idx_favorites_user_studio ON public.favorites(user_id, studio_id);
CREATE INDEX idx_favorites_headshot ON public.favorites(headshot_id);

-- Enable Row Level Security
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Grant all privileges to the authenticated role (policies will restrict)
GRANT ALL ON TABLE public.favorites TO authenticated;

-- RLS Policies for favorites

-- Policy: Users can view their own favorites
CREATE POLICY "Allow users to view their own favorites"
ON public.favorites
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own favorites
-- Add check: User must own the studio they are favoriting within
CREATE POLICY "Allow users to insert their own favorites for owned studios"
ON public.favorites
FOR INSERT
WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
        SELECT 1
        FROM public.studios s
        WHERE s.id = favorites.studio_id
        AND s.creator_user_id = auth.uid()
    )
    -- Add check: Ensure the headshot belongs to the specified studio
    AND EXISTS (
        SELECT 1
        FROM public.result_headshots rh
        WHERE rh.id = favorites.headshot_id
        AND rh.studio_id = favorites.studio_id
    )
);


-- Policy: Users can delete their own favorites
CREATE POLICY "Allow users to delete their own favorites"
ON public.favorites
FOR DELETE
USING (auth.uid() = user_id);
