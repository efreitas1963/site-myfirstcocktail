-- Check existing policies on recipes table
SELECT * FROM pg_policies WHERE tablename = 'recipes' AND policyname LIKE '%update%';
