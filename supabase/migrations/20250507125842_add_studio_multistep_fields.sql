ALTER TABLE public.studios
ADD COLUMN plan text NOT NULL DEFAULT 'Starter',
ADD COLUMN attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN attire_ids text[] NOT NULL DEFAULT '{}',
ADD COLUMN background_ids text[] NOT NULL DEFAULT '{}',
ADD COLUMN images jsonb;