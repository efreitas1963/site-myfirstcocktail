-- This file contains SQL to populate Supabase tables manually
-- Execute in Supabase SQL Editor

-- Note: You'll need to export data from JSON files and insert them
-- For now, disabling RLS policies to allow public inserts

ALTER TABLE public.ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.glasses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.liqueurs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.syrups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes DISABLE ROW LEVEL SECURITY;

-- After populating, run the seed script:
-- node seed_all_tables.js

-- Then re-enable RLS:
-- ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.glasses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.liqueurs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.syrups ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
