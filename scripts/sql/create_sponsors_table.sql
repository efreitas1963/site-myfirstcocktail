-- Tabela de Apoio & Parceiros (vitrine de logos na home)
-- Execute no Supabase: Dashboard > SQL Editor > New query > cole > Run

CREATE TABLE IF NOT EXISTS public.sponsors (
  id          text PRIMARY KEY,
  name        text NOT NULL DEFAULT '',
  logo        text NOT NULL DEFAULT '',
  link        text NOT NULL DEFAULT '#',
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Mesmo padrao das outras tabelas do projeto: leitura/escrita via anon key
ALTER TABLE public.sponsors DISABLE ROW LEVEL SECURITY;

-- Carrega os 6 parceiros que hoje estao fixos no codigo (App.tsx)
INSERT INTO public.sponsors (id, name, logo, link, sort_order) VALUES
  ('1', 'Cocktail Channel', '/uploads/apoio-parceiros/cocktail-channel.png', '#', 1),
  ('2', 'Easy Drinks',      '/uploads/apoio-parceiros/easydrinks.png',       '#', 2),
  ('3', 'Drinkeros',        '/uploads/apoio-parceiros/logo-drinkeros.png',   '#', 3),
  ('4', 'Patrocinador',     '/uploads/apoio-parceiros/patrocinador.png',     '#', 4),
  ('5', 'Cocktail Channel', '/uploads/apoio-parceiros/cocktail-channel.png', '#', 5),
  ('6', 'Easy Drinks',      '/uploads/apoio-parceiros/easydrinks.png',       '#', 6)
ON CONFLICT (id) DO NOTHING;
