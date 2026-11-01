-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow public update recipes" ON public.recipes;
DROP POLICY IF EXISTS "Allow all operations" ON public.recipes;

-- Create permissive UPDATE policy
CREATE POLICY "allow_public_update"
ON public.recipes
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Create permissive INSERT policy
CREATE POLICY "allow_public_insert"
ON public.recipes
FOR INSERT
WITH CHECK (true);

-- Create permissive SELECT policy
CREATE POLICY "allow_public_select"
ON public.recipes
FOR SELECT
USING (true);

-- Verify policies exist
SELECT policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'recipes'
ORDER BY policyname;
