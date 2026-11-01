-- ============================================
-- SUPABASE COMPLETE SETUP
-- Cocktails Database - Full Schema & Data
-- ============================================

-- Step 1: Create Tables
-- ============================================

-- Ingredients table
CREATE TABLE IF NOT EXISTS public.ingredients (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  imageurl VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Glasses table
CREATE TABLE IF NOT EXISTS public.glasses (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  technicalname VARCHAR(255),
  capacityoz VARCHAR(50),
  capacityml VARCHAR(50),
  imageurl VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Recipes table
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  ingredients JSONB,
  instructions JSONB,
  garnish VARCHAR(255),
  method VARCHAR(100),
  category VARCHAR(100),
  imageurl VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Liqueurs table
CREATE TABLE IF NOT EXISTS public.liqueurs (
  id INTEGER PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  ingredients JSONB,
  instructions JSONB,
  yield_ml VARCHAR(50),
  storage VARCHAR(255),
  validity VARCHAR(100),
  imageurl VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Syrups table
CREATE TABLE IF NOT EXISTS public.syrups (
  id INTEGER PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  ingredients JSONB,
  instructions JSONB,
  yield_ml VARCHAR(50),
  storage VARCHAR(255),
  validity VARCHAR(100),
  imageurl VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Step 2: Enable Row Level Security
-- ============================================

ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glasses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liqueurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syrups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS Policies (Public Read Access)
-- ============================================

-- Ingredients policies
CREATE POLICY "Allow public read" ON public.ingredients FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.ingredients FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON public.ingredients FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON public.ingredients FOR DELETE USING (auth.role() = 'authenticated');

-- Glasses policies
CREATE POLICY "Allow public read" ON public.glasses FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.glasses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON public.glasses FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON public.glasses FOR DELETE USING (auth.role() = 'authenticated');

-- Recipes policies
CREATE POLICY "Allow public read" ON public.recipes FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.recipes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON public.recipes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON public.recipes FOR DELETE USING (auth.role() = 'authenticated');

-- Liqueurs policies
CREATE POLICY "Allow public read" ON public.liqueurs FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.liqueurs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON public.liqueurs FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON public.liqueurs FOR DELETE USING (auth.role() = 'authenticated');

-- Syrups policies
CREATE POLICY "Allow public read" ON public.syrups FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.syrups FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON public.syrups FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON public.syrups FOR DELETE USING (auth.role() = 'authenticated');

-- Categories policies
CREATE POLICY "Allow public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON public.categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON public.categories FOR DELETE USING (auth.role() = 'authenticated');

-- Step 4: Populate Data
-- ============================================

-- Insert Glasses
INSERT INTO public.glasses (id, name, technicalname, capacityoz, capacityml, imageurl) VALUES
(1, 'CÁLICE DE VINHO', NULL, '8-14 oz', '240-420 ml', '/uploads/glasses/All-Purpose-Wine-Goblet.png'),
(2, 'CANECA DE CERVEJA', NULL, '12-20 oz', '360-600 ml', '/uploads/glasses/Beer-Mug.png'),
(3, 'CANECA PARA COQUETÉIS QUENTES', NULL, '8-10 oz', '240-300 ml', '/uploads/glasses/Irish-Coffee-Glass.png'),
(4, 'COPO COLLINS', NULL, '8-14 oz', '240-420 ml', '/uploads/glasses/Collins-Glass.png'),
(5, 'COPO CORDIAL', NULL, '1-3 oz', '30-90 ml', '/uploads/glasses/Cordial-Glass.png'),
(7, 'COPO DE CHOPP', NULL, '10-20 oz', '300-600 ml', '/uploads/glasses/Pilsner-Glass.png'),
(8, 'COPO DE PONCHE', NULL, '6-8 oz', '180-240 ml', '/uploads/glasses/Punch-Cup.png'),
(9, 'COPO DE SHOT', NULL, '1-3 oz', '30-90 ml', '/uploads/glasses/Shot-Glass.png'),
(10, 'COPO DOUBLE OLD-FASHIONED', NULL, '8-10 oz', '240-300 ml', '/uploads/glasses/Double-Old-Fashioned-Glass.png'),
(11, 'COPO HIGHBALL', NULL, '8-10 oz', '240-300 ml', '/uploads/glasses/Highball-Glass.png'),
(12, 'COPO HURRICANE', NULL, '16-20 oz', '480-600 ml', '/uploads/glasses/Hurricane-Glass.png'),
(13, 'COPO JIGGER', NULL, '2-3 oz', '60-90 ml', '/uploads/glasses/Jigger-Glass.png'),
(14, 'COPO OLD-FASHIONED', NULL, '5-6 oz', '150-180 ml', '/uploads/glasses/Old-Fashioned-Glass.png'),
(15, 'COPO ON THE ROCKS', NULL, '8-12 oz', '240-360 ml', '/uploads/glasses/On-The-Rocks.png'),
(16, 'COPO ZOMBIE', NULL, '12-20 oz', '360-600 ml', '/uploads/glasses/Zombie-Glass.png'),
(17, 'TAÇA CHAMPANHE SAUCER', NULL, '6-9 oz', '180-270 ml', '/uploads/glasses/Champagne-Saucer-Glass.png'),
(18, 'TAÇA DE CONHAQUE', NULL, '10-16 oz', '300-480 ml', '/uploads/glasses/Brandy-Glass.png'),
(19, 'TAÇA DE COQUETEL', NULL, '4-12 oz', '120-360 ml', '/uploads/glasses/Cocktail-Glass.png'),
(20, 'TAÇA DE VINHO BRANCO', NULL, '8-14 oz', '240-420 ml', '/uploads/glasses/White-Wine-Glass.png'),
(21, 'TAÇA DE VINHO TINTO', NULL, '8-14 oz', '240-420 ml', '/uploads/glasses/Red-Wine-Glass.png'),
(22, 'TAÇA FIESTA', NULL, '8-12 oz', '240-360 ml', '/uploads/glasses/Fiesta-Glass.png'),
(23, 'TAÇA FLUTE', NULL, '6-9 oz', '180-270 ml', '/uploads/glasses/Flute-Glass.png'),
(24, 'TAÇA PARFAIT', NULL, '5-6 oz', '150-180 ml', '/uploads/glasses/Parfait-Glass.png'),
(25, 'TAÇA PONY', NULL, '2-3 oz', '60-90 ml', '/uploads/glasses/Pony-Glass.png'),
(26, 'TAÇA SHERRY', NULL, '4-6 oz', '120-180 ml', '/uploads/glasses/Sherry-Glass.png'),
(27, 'TAÇA SOUR', NULL, '4-6 oz', '120-180 ml', '/uploads/glasses/Sour-Glass.png'),
(28, 'TAÇA TULIPA', NULL, '6-9 oz', '180-270 ml', '/uploads/glasses/Tulip-Glass.png'),
(29, 'COPO DE CERVEJA', NULL, '16-20 oz', '480-600 ml', '/uploads/glasses/Beer-Glass.png')
ON CONFLICT (id) DO NOTHING;

-- Note: Ingredients table has 346+ records. For bulk insert, use the JSON data directly.
-- Run this Node.js script to generate INSERT statements:
-- See separate ingredient_bulk_insert.sql file for complete ingredient data

-- Insert sample Recipes
INSERT INTO public.recipes (title, description, ingredients, instructions, garnish, method, category, imageurl) VALUES
('Whisky Sour', 'A combinação perfeita de destilado, cítrico e doçura, com uma textura sedosa.',
  '[{"name":"Bourbon (Whiskey)","measure":"60 ml"},{"name":"Suco de Limão Siciliano","measure":"30 ml"},{"name":"Xarope Simples","measure":"15 ml"},{"name":"Clara de Ovo","measure":"15 ml (Opcional)"},{"name":"Angostura Aromatic Bitters","measure":"2 dashes"}]',
  '["Adicione todos os ingredientes na coqueteleira.","Faça o Dry Shake (bater sem gelo) para emulsificar a clara.","Adicione gelo e bata vigorosamente.","Coe para um copo baixo com gelo."]',
  'Twist de laranja e cereja', 'Batido', 'Clássico', '/uploads/recipes/whisky-sour.jpg'),
('Daiquiri', 'Um clássico cubano injustiçado. Quando bem feito, é fresco, complexo e revigorante.',
  '[{"name":"Rum Branco","measure":"60 ml"},{"name":"Suco de Limão","measure":"30 ml"},{"name":"Xarope Simples","measure":"15 ml"}]',
  '["Adicione todos os ingredientes na coqueteleira com gelo.","Bata vigorosamente até a coqueteleira gelar bem.","Coe duplamente para uma taça coupette gelada."]',
  'Twist de limão', 'Batido', 'Clássico', '/uploads/recipes/Daiquiri.jpg'),
('Margarita', 'O drink de Tequila mais famoso do mundo. Ácido, salgado e vibrante.',
  '[{"name":"Tequila Blanco ou Prata","measure":"50 ml"},{"name":"Cointreau (Triple Sec)","measure":"30 ml"},{"name":"Suco de Limão","measure":"20 ml"}]',
  '["Passe um limão na borda da taça e cruste com sal.","Bata todos os ingredientes na coqueteleira com gelo.","Coe para a taça preparada com ou sem gelo novo."]',
  'Roda de limão e borda de sal', 'Batido', 'Clássico', '/uploads/recipes/margarita.jpg')
ON CONFLICT DO NOTHING;

-- ============================================
-- HOW TO LOAD BULK DATA (Ingredients, Liqueurs, Syrups)
-- ============================================
--
-- For tables with hundreds of records (ingredients, liqueurs, syrups):
--
-- 1. Use the Node.js script: seed_supabase.js (already in project)
-- 2. Or manually import via Supabase Dashboard:
--    - Go to SQL Editor
--    - Paste the content of: ingredient_bulk_insert.sql
--    - Execute
--
-- Files to create:
-- - ingredient_bulk_insert.sql (from public/ingredients.json)
-- - liqueurs_bulk_insert.sql (from public/liqueurs.json)
-- - syrups_bulk_insert.sql (from public/syrups.json)
-- ============================================
