-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create ingredients table
CREATE TABLE IF NOT EXISTS public.ingredients (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create glasses table
CREATE TABLE IF NOT EXISTS public.glasses (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  technical_name VARCHAR(255),
  capacity_oz VARCHAR(50),
  capacity_ml VARCHAR(50),
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create liqueurs table
CREATE TABLE IF NOT EXISTS public.liqueurs (
  id INTEGER PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  ingredients JSONB,
  yield_ml VARCHAR(50),
  method JSONB,
  description TEXT,
  validity VARCHAR(100),
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Disable RLS temporarily for seeding
ALTER TABLE public.ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.glasses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.liqueurs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
