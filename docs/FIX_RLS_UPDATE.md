# Correção: RLS bloqueando UPDATE de receitas

## Problema
Ao editar receitas, erro: `new row violates row-level security policy (USING expression) for table "recipes"`

Significa que a policy UPDATE de receitas requer autenticação ou não existe.

## Solução

Execute este SQL no Supabase SQL Editor:

```sql
-- Allow public update for recipes
CREATE POLICY "Allow public update recipes" ON public.recipes 
FOR UPDATE 
USING (true) 
WITH CHECK (true);
```

### Passo a Passo
1. Acesse: https://supabase.com/dashboard/project/vztlsfppfesdqhjzdfpj/sql/new
2. Cole o SQL acima
3. Clique em **Run**
4. Aguarde "Success"

Pronto! Agora consegue editar receitas.
