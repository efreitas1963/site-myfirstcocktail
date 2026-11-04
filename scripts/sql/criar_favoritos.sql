-- ============================================================================
-- FAVORITOS POR USUARIO
-- ============================================================================
--
-- Execute no Supabase: Dashboard > SQL Editor > New query > cole tudo > Run
--   https://supabase.com/dashboard/project/vztlsfppfesdqhjzdfpj/sql/new
--
-- Hoje o coracao das receitas nao guarda nada: a tabela `recipes` nao tem
-- coluna de favorito e `getRecipes()` forca isFavorite:false em todas. O
-- marcador acende na tela e some ao recarregar a pagina.
--
-- Esta tabela guarda o vinculo usuario -> receita. Cada pessoa enxerga e
-- altera apenas os proprios favoritos; ninguem ve os favoritos de outro.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.favorites (
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id  uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, recipe_id)
);

-- Busca "meus favoritos" e a consulta mais frequente da tela.
CREATE INDEX IF NOT EXISTS favorites_user_idx ON public.favorites (user_id);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Remove policies anteriores de qualquer nome antes de recriar. Confiar em
-- DROP por nome ja deixou a tabela `recipes` aberta uma vez: policies antigas
-- com outros nomes sobreviveram e seguiam liberando escrita anonima.
DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies
           WHERE schemaname = 'public' AND tablename = 'favorites'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.favorites', p.policyname);
  END LOOP;
END $$;

-- auth.uid() e o id do usuario logado. Como ele entra na condicao, cada pessoa
-- so alcanca as proprias linhas — tanto para ler quanto para gravar.
CREATE POLICY "ve os proprios favoritos" ON public.favorites
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "adiciona os proprios favoritos" ON public.favorites
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "remove os proprios favoritos" ON public.favorites
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================================
-- CONFERENCIA: deve listar as 3 policies, todas para authenticated
-- ============================================================================
SELECT policyname AS policy, cmd AS operacao, roles
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'favorites'
ORDER BY policyname;
