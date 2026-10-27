# Correção: Permissão para editar e deletar receitas

## Problema
Não consegue editar ou deletar receitas porque RLS bloqueia UPDATE e DELETE.

## Solução
Execute este SQL no Supabase SQL Editor:

```sql
-- Allow public update for recipes
CREATE POLICY "Allow public update recipes" ON public.recipes FOR UPDATE WITH CHECK (true);

-- Allow public delete for recipes  
CREATE POLICY "Allow public delete recipes" ON public.recipes FOR DELETE USING (true);
```

### Passo a Passo
1. Acesse: https://supabase.com/dashboard/project/vztlsfppfesdqhjzdfpj/sql/new
2. Cole o SQL acima
3. Clique em **Run**
4. Aguarde "Success"

Pronto! Agora consegue editar e deletar receitas.
