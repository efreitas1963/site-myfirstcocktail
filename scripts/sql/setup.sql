-- Setup script for MyFirstCocktail
-- Copie e cole no SQL Editor: https://supabase.com/dashboard/project/vztlsfppfesdqhjzdfpj/sql/new

-- ===== ADD MISSING COLUMNS =====

-- Liqueurs
ALTER TABLE liqueurs ADD COLUMN IF NOT EXISTS imageUrl TEXT;

-- Syrups
ALTER TABLE syrups ADD COLUMN IF NOT EXISTS imageUrl TEXT;

-- Glasses
ALTER TABLE glasses ADD COLUMN IF NOT EXISTS capacityMl TEXT;
ALTER TABLE glasses ADD COLUMN IF NOT EXISTS capacityOz TEXT;
ALTER TABLE glasses ADD COLUMN IF NOT EXISTS technicalName TEXT;
ALTER TABLE glasses ADD COLUMN IF NOT EXISTS imageUrl TEXT;

-- ===== DISABLE RLS FOR PUBLIC READ ACCESS =====

ALTER TABLE liqueurs DISABLE ROW LEVEL SECURITY;
ALTER TABLE syrups DISABLE ROW LEVEL SECURITY;
ALTER TABLE glasses DISABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE recipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- ===== Feito! Agora execute: node setup_db.js =====
