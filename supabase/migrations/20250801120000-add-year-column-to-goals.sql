-- Add computed year column to goals table
ALTER TABLE public.goals
ADD COLUMN IF NOT EXISTS year INTEGER GENERATED ALWAYS AS (extract(year from start_date)) STORED;
