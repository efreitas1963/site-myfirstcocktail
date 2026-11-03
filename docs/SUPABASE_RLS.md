# Supabase — RLS e correções aplicadas

Políticas de Row Level Security que precisaram de ajuste durante o desenvolvimento.
Consolidado dos antigos `FIX_RLS_*.md`.

## Estado atual

- `SELECT` liberado para a chave anon (leitura pública do catálogo).
- `INSERT`/`UPDATE`/`DELETE` exigiam política explícita — sem ela, a operação
  falhava **silenciosamente** (sem erro no cliente, linha simplesmente não mudava).

## Conferir políticas

```sql
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

```sql
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname IN ('recipes','ingredients','glasses','liqueurs','syrups');
```

## Liberar leitura pública

```sql
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read" ON public.recipes
  FOR SELECT USING (true);
```

## Liberar edição/exclusão

```sql
CREATE POLICY "anon update" ON public.recipes
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "anon delete" ON public.recipes
  FOR DELETE USING (true);
```

> Isso deixa a tabela aberta para qualquer portador da anon key. Aceitável para
> um catálogo público sem login; se entrar autenticação, trocar `true` por uma
> checagem de `auth.uid()`.

## Coluna faltante

O app sempre envia `autor`, mas a tabela não tinha a coluna — import do scraper
falhava no save:

```sql
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS autor character varying;
```

## Chave de serviço

Para scripts de migração que precisam contornar RLS, use a **service_role key**
(Dashboard → Settings → API). Nunca a exponha no frontend nem commite — ela
ignora todas as políticas.
