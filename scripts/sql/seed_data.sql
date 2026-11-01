-- Seed recipes into Supabase
-- Execute no SQL Editor: https://supabase.com/dashboard/project/vztlsfppfesdqhjzdfpj/sql/new

INSERT INTO recipes (id, name_pt, name_en, glass_id, description, preparation, image_url, created_at)
VALUES
  (1, 'Caipirinha', 'Caipirinha', 15, 'Drink clássico brasileiro feito com destilado branco, açúcar e limão', 'Coloque gelo crushed no copo, adicione metades de limão cortadas. Despeje açúcar e destilado. Mexa bem com o muddler.', '/uploads/recipes/caipirinha.jpg', NOW()),
  (2, 'Whisky Sour', 'Whisky Sour', 14, 'A combinação perfeita de destilado, cítrico e doçura, com uma textura sedosa.', 'Adicione bourbon, suco de limão, xarope simples e gelo na coqueteleira. Bata vigorosamente até gelar.', '/uploads/recipes/whisky-sour.jpg', NOW()),
  (3, 'Daiquiri', 'Daiquiri', 17, 'Um clássico cubano injustiçado. Quando bem feito, é fresco, complexo e revigorante.', 'Coloque rum branco, suco de limão e xarope na coqueteleira com gelo. Bata vigorosamente. Coe para taça gelada.', '/uploads/recipes/daiquiri.jpg', NOW()),
  (4, 'Margarita', 'Margarita', 20, 'O drink de Tequila mais famoso do mundo. Ácido, salgado e vibrante.', 'Passe limão na borda e cruste com sal. Bata tequila, cointreau e suco de limão. Coe para a taça.', '/uploads/recipes/margarita.jpg', NOW()),
  (5, 'Mojito', 'Mojito', 11, 'Drink refrescante com hortelã e rum branco', 'Coloque folhas de hortelã no copo. Adicione açúcar e rum. Complete com água com gelo. Mexa bem.', '/uploads/recipes/mojito.jpg', NOW())
ON CONFLICT (id) DO UPDATE SET
  name_pt = EXCLUDED.name_pt,
  name_en = EXCLUDED.name_en,
  glass_id = EXCLUDED.glass_id,
  description = EXCLUDED.description,
  preparation = EXCLUDED.preparation,
  image_url = EXCLUDED.image_url,
  created_at = EXCLUDED.created_at;
