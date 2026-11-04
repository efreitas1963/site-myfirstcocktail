-- ============================================================================
-- PROTECAO DO BANCO: leitura publica, escrita so para o administrador logado
-- ============================================================================
--
-- Execute no Supabase: Dashboard > SQL Editor > New query > cole tudo > Run
--   https://supabase.com/dashboard/project/vztlsfppfesdqhjzdfpj/sql/new
--
-- IMPORTANTE: rode este script SOMENTE DEPOIS de:
--   1. criar o usuario administrador em Authentication > Users; e
--   2. confirmar que consegue entrar no site com esse e-mail e senha.
--
-- Hoje qualquer pessoa com a chave anon (que vai publica no bundle do site)
-- pode apagar ou alterar todas as tabelas. Este script fecha isso: visitantes
-- continuam lendo tudo normalmente, mas escrever passa a exigir uma sessao
-- autenticada — a que o login do site cria.
--
-- Para desfazer, veja o bloco comentado no fim do arquivo.
-- ============================================================================

-- ---------------------------------------------------------------- recipes
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leitura publica" ON public.recipes;
CREATE POLICY "leitura publica" ON public.recipes
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "escrita do admin" ON public.recipes;
CREATE POLICY "escrita do admin" ON public.recipes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ------------------------------------------------------------ ingredients
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leitura publica" ON public.ingredients;
CREATE POLICY "leitura publica" ON public.ingredients
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "escrita do admin" ON public.ingredients;
CREATE POLICY "escrita do admin" ON public.ingredients
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------- glasses
ALTER TABLE public.glasses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leitura publica" ON public.glasses;
CREATE POLICY "leitura publica" ON public.glasses
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "escrita do admin" ON public.glasses;
CREATE POLICY "escrita do admin" ON public.glasses
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- --------------------------------------------------------------- liqueurs
ALTER TABLE public.liqueurs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leitura publica" ON public.liqueurs;
CREATE POLICY "leitura publica" ON public.liqueurs
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "escrita do admin" ON public.liqueurs;
CREATE POLICY "escrita do admin" ON public.liqueurs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------- syrups
ALTER TABLE public.syrups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leitura publica" ON public.syrups;
CREATE POLICY "leitura publica" ON public.syrups
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "escrita do admin" ON public.syrups;
CREATE POLICY "escrita do admin" ON public.syrups
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- --------------------------------------------------------------- sponsors
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leitura publica" ON public.sponsors;
CREATE POLICY "leitura publica" ON public.sponsors
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "escrita do admin" ON public.sponsors;
CREATE POLICY "escrita do admin" ON public.sponsors
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- CONFERENCIA: deve listar as 6 tabelas com rls_ativa = true
-- ============================================================================
SELECT tablename AS tabela, rowsecurity AS rls_ativa
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('recipes','ingredients','glasses','liqueurs','syrups','sponsors')
ORDER BY tablename;

-- ============================================================================
-- PARA DESFAZER (so se algo der errado e voce precisar voltar ao estado
-- anterior). Isto reabre o banco para qualquer um escrever:
--
--   ALTER TABLE public.recipes     DISABLE ROW LEVEL SECURITY;
--   ALTER TABLE public.ingredients DISABLE ROW LEVEL SECURITY;
--   ALTER TABLE public.glasses     DISABLE ROW LEVEL SECURITY;
--   ALTER TABLE public.liqueurs    DISABLE ROW LEVEL SECURITY;
--   ALTER TABLE public.syrups      DISABLE ROW LEVEL SECURITY;
--   ALTER TABLE public.sponsors    DISABLE ROW LEVEL SECURITY;
-- ============================================================================
