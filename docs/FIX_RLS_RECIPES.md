# Correção: Web Scraper não salva receitas

## Problema Identificado

**Causa raiz:** RLS (Row Level Security) do Supabase bloqueia inserts anônimos na tabela `recipes`.

Erro ao salvar: `new row violates row-level security policy for table "recipes"`

## Solução

Execute este SQL no Supabase SQL Editor:

```sql
-- Allow public insert for recipes (for web scraper)
CREATE POLICY "Allow public insert recipes" ON public.recipes FOR INSERT WITH CHECK (true);
```

### Passo a Passo

1. Acesse: https://supabase.com/dashboard/project/vztlsfppfesdqhjzdfpj/sql/new
2. Cole o SQL acima
3. Clique em **Run** (botão azul)
4. Aguarde "Success"

## Verificar

Depois de executar, teste novamente:
1. Abra a app
2. Menu → Importar → Web Scraping
3. Cole: `https://mybartender.com/recipe/aperol-tingle`
4. Clique Scrape
5. Deve salvar com sucesso ✅

## Segurança

⚠️ `WITH CHECK (true)` permite inserts públicos sem autenticação. Para produção:

- Usar Supabase Auth + autenticar usuários
- Ou usar Edge Function com service_role key
- Ou validar input no backend

Por agora, funciona bem para seu caso de teste.
