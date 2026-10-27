-- Create an upsert function that bypasses RLS
CREATE OR REPLACE FUNCTION public.upsert_recipe(
  p_id TEXT,
  p_title TEXT,
  p_description TEXT,
  p_ingredients JSONB,
  p_instructions TEXT[],
  p_garnish TEXT,
  p_method TEXT,
  p_category TEXT,
  p_imageurl TEXT
)
RETURNS TABLE (
  id TEXT,
  title TEXT,
  description TEXT,
  ingredients JSONB,
  instructions TEXT[],
  garnish TEXT,
  method TEXT,
  category TEXT,
  imageurl TEXT
) AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.recipes (id, title, description, ingredients, instructions, garnish, method, category, imageurl)
  VALUES (p_id, p_title, p_description, p_ingredients, p_instructions, p_garnish, p_method, p_category, p_imageurl)
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    ingredients = EXCLUDED.ingredients,
    instructions = EXCLUDED.instructions,
    garnish = EXCLUDED.garnish,
    method = EXCLUDED.method,
    category = EXCLUDED.category,
    imageurl = EXCLUDED.imageurl
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION public.upsert_recipe TO public, anon, authenticated;
