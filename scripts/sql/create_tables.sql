-- Create ingredients table
CREATE TABLE IF NOT EXISTS public.ingredients (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  imageurl VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create glasses table
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

-- Create liqueurs table
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

-- Create syrups table
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

-- Create recipes table
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

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glasses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liqueurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syrups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access
CREATE POLICY "Allow public read" ON public.ingredients FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.glasses FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.liqueurs FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.syrups FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.recipes FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.categories FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete (for admin panel later)
CREATE POLICY "Allow authenticated insert" ON public.ingredients FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON public.ingredients FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON public.ingredients FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert" ON public.glasses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON public.glasses FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON public.glasses FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert" ON public.liqueurs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON public.liqueurs FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON public.liqueurs FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert" ON public.syrups FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON public.syrups FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON public.syrups FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert" ON public.recipes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON public.recipes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON public.recipes FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert" ON public.categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON public.categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON public.categories FOR DELETE USING (auth.role() = 'authenticated');
