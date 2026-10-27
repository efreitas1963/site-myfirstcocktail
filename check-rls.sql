-- Check RLS policies on recipes table
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'recipes'
ORDER BY policyname;
