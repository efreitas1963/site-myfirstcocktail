-- ============================================================================
-- CORRECAO: a tabela recipes continua aceitando escrita anonima
-- ============================================================================
--
-- Execute no Supabase: Dashboard > SQL Editor > New query > cole tudo > Run
--   https://supabase.com/dashboard/project/vztlsfppfesdqhjzdfpj/sql/new
--
-- POR QUE ISTO E NECESSARIO
--
-- Depois de rodar habilitar_rls_com_auth.sql, as tabelas ingredients, glasses,
-- liqueurs, syrups e sponsors passaram a recusar escrita anonima — verificado:
-- INSERT devolve 401 com "new row violates row-level security policy".
--
-- Mas `recipes` continuou aceitando: um INSERT anonimo devolveu 201 e criou a
-- linha. Causa: essa tabela ja tinha policies de antes (provavelmente criadas
-- quando o scraper precisou salvar), e o `DROP POLICY IF EXISTS` do script
-- anterior so removia as policies com os nomes que ele mesmo criava. As
-- antigas sobreviveram e continuam liberando escrita para o papel anon.
--
-- As outras 5 tabelas nao tinham policies previas, por isso fecharam certo.
--
-- Este script remove TODAS as policies de recipes, seja qual for o nome, e
-- recria apenas o par correto.
-- ============================================================================

-- 1. Mostra o que existe hoje (para registro antes da limpeza)
SELECT policyname AS policy_atual, cmd AS operacao, roles
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'recipes'
ORDER BY policyname;

-- 2. Remove todas as policies da tabela, qualquer que seja o nome
DO $$
DECLARE
  p record;
BEGIN
  FOR p IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'recipes'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.recipes', p.policyname);
  END LOOP;
END $$;

-- 3. Garante o RLS ligado e recria o par correto
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leitura publica" ON public.recipes
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "escrita do admin" ON public.recipes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Remove a linha de teste criada durante a verificacao de seguranca,
--    se ela ainda existir. Nao e conteudo real.
DELETE FROM public.recipes WHERE title = '__TESTE_SEGURANCA__';

-- ============================================================================
-- CONFERENCIA: deve listar exatamente 2 policies
--   "leitura publica"  SELECT  {anon,authenticated}
--   "escrita do admin" ALL     {authenticated}
-- ============================================================================
SELECT policyname AS policy, cmd AS operacao, roles
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'recipes'
ORDER BY policyname;
