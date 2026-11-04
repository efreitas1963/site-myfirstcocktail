-- ============================================================================
-- RESTRINGIR A ESCRITA A CONTA DO ADMINISTRADOR
-- ============================================================================
--
-- Execute no Supabase: Dashboard > SQL Editor > New query > cole tudo > Run
--   https://supabase.com/dashboard/project/vztlsfppfesdqhjzdfpj/sql/new
--
-- RODE ESTE SCRIPT ANTES DE ABRIR O CADASTRO PUBLICO.
--
-- POR QUE
--
-- As policies criadas em habilitar_rls_com_auth.sql liberam escrita para o
-- papel `authenticated`, ou seja, para QUALQUER usuario logado. Enquanto so
-- existia a conta do administrador isso era equivalente a "so o admin
-- escreve". A partir do momento em que visitantes puderem criar conta para
-- favoritar receitas, cada novo cadastro ganharia tambem permissao de apagar
-- e alterar todo o conteudo do site.
--
-- Este script troca a condicao: em vez de "esta logado", passa a exigir "e o
-- e-mail do administrador". Visitantes logados continuam lendo tudo e mexendo
-- nos proprios favoritos, mas nao alcancam as tabelas de conteudo.
-- ============================================================================

DO $$
DECLARE
  t text;
  p record;
BEGIN
  FOREACH t IN ARRAY ARRAY['recipes','ingredients','glasses','liqueurs','syrups','sponsors']
  LOOP
    -- remove todas as policies existentes da tabela, qualquer que seja o nome
    FOR p IN SELECT policyname FROM pg_policies
             WHERE schemaname = 'public' AND tablename = t
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, t);
    END LOOP;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

    -- leitura: qualquer visitante, logado ou nao
    EXECUTE format($f$
      CREATE POLICY "leitura publica" ON public.%I
        FOR SELECT TO anon, authenticated USING (true)
    $f$, t);

    -- escrita: somente a conta do administrador.
    -- auth.jwt()->>'email' le o e-mail de dentro do token da sessao.
    EXECUTE format($f$
      CREATE POLICY "escrita do admin" ON public.%I
        FOR ALL TO authenticated
        USING ((auth.jwt() ->> 'email') = 'efreitas1963@gmail.com')
        WITH CHECK ((auth.jwt() ->> 'email') = 'efreitas1963@gmail.com')
    $f$, t);
  END LOOP;
END $$;

-- ============================================================================
-- CONFERENCIA: 12 linhas (2 policies x 6 tabelas).
-- A coluna `condicao` deve citar o e-mail do admin nas policies de escrita.
-- ============================================================================
SELECT tablename AS tabela, policyname AS policy, cmd AS operacao,
       qual AS condicao
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('recipes','ingredients','glasses','liqueurs','syrups','sponsors')
ORDER BY tablename, policyname;
