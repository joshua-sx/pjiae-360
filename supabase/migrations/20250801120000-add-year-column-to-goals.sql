-- Add computed year column to goals table
ALTER TABLE public.goals
ADD COLUMN IF NOT EXISTS year INTEGER GENERATED ALWAYS AS (extract(year from start_date)) STORED;

-- Index for faster querying by year
CREATE INDEX idx_goals_year ON public.goals(year);
