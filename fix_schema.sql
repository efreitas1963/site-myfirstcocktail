-- Delete tables with wrong schema
DROP TABLE IF EXISTS recipe_ingredients CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS glasses CASCADE;
DROP TABLE IF EXISTS liqueurs CASCADE;
DROP TABLE IF EXISTS syrups CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Recreate with correct columns from start
CREATE TABLE liqueurs (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  type TEXT,
  abv NUMERIC,
  imageUrl TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE syrups (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  ingredients TEXT,
  preparation TEXT,
  quantity TEXT,
  storageTime TEXT,
  flavor TEXT,
  description TEXT,
  imageUrl TEXT,
  extra TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE glasses (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  technicalName TEXT,
  capacityOz TEXT,
  capacityMl TEXT,
  imageUrl TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ingredients (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE categories (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE recipes (
  id BIGINT PRIMARY KEY,
  name_pt TEXT NOT NULL,
  name_en TEXT,
  glass_id BIGINT REFERENCES glasses(id),
  description TEXT,
  preparation TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE recipe_ingredients (
  id BIGINT PRIMARY KEY,
  recipe_id BIGINT NOT NULL REFERENCES recipes(id),
  ingredient_id BIGINT NOT NULL REFERENCES ingredients(id),
  quantity TEXT,
  unit TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Disable RLS for all tables
ALTER TABLE liqueurs DISABLE ROW LEVEL SECURITY;
ALTER TABLE syrups DISABLE ROW LEVEL SECURITY;
ALTER TABLE glasses DISABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE recipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients DISABLE ROW LEVEL SECURITY;
