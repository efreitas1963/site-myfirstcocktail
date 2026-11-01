-- Add missing columns to existing tables

-- Add imageUrl to liqueurs table
ALTER TABLE liqueurs ADD COLUMN imageUrl TEXT;

-- Add missing columns to syrups table
ALTER TABLE syrups ADD COLUMN imageUrl TEXT;

-- Add missing columns to glasses table
ALTER TABLE glasses ADD COLUMN capacityMl TEXT;
ALTER TABLE glasses ADD COLUMN capacityOz TEXT;
ALTER TABLE glasses ADD COLUMN technicalName TEXT;
ALTER TABLE glasses ADD COLUMN imageUrl TEXT;

-- Disable RLS on all tables for public read access
ALTER TABLE liqueurs DISABLE ROW LEVEL SECURITY;
ALTER TABLE syrups DISABLE ROW LEVEL SECURITY;
ALTER TABLE glasses DISABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE recipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Create public read policies
CREATE POLICY "liqueurs_public_read" ON liqueurs FOR SELECT USING (true);
CREATE POLICY "syrups_public_read" ON syrups FOR SELECT USING (true);
CREATE POLICY "glasses_public_read" ON glasses FOR SELECT USING (true);
CREATE POLICY "ingredients_public_read" ON ingredients FOR SELECT USING (true);
CREATE POLICY "recipes_public_read" ON recipes FOR SELECT USING (true);
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (true);
