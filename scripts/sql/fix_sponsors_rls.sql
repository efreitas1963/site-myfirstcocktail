-- Passo 2: desligar RLS da tabela sponsors e garantir as 6 linhas iniciais
-- Execute no Supabase: Dashboard > SQL Editor > New query > cole > Run

ALTER TABLE public.sponsors DISABLE ROW LEVEL SECURITY;

INSERT INTO public.sponsors (id, name, logo, link, sort_order) VALUES
  ('1', 'Cocktail Channel', '/uploads/apoio-parceiros/cocktail-channel.png', '#', 1),
  ('2', 'Easy Drinks',      '/uploads/apoio-parceiros/easydrinks.png',       '#', 2),
  ('3', 'Drinkeros',        '/uploads/apoio-parceiros/logo-drinkeros.png',   '#', 3),
  ('4', 'Patrocinador',     '/uploads/apoio-parceiros/patrocinador.png',     '#', 4),
  ('5', 'Cocktail Channel', '/uploads/apoio-parceiros/cocktail-channel.png', '#', 5),
  ('6', 'Easy Drinks',      '/uploads/apoio-parceiros/easydrinks.png',       '#', 6)
ON CONFLICT (id) DO NOTHING;

-- Conferencia: deve retornar 6 linhas
SELECT id, name, sort_order FROM public.sponsors ORDER BY sort_order;
