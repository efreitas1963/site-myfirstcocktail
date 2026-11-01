# Setup Final do MyFirstCocktail

## Passo 1: Preparar Supabase (1 vez - 2 minutos)

1. **Abra SQL Editor:**
   https://supabase.com/dashboard/project/vztlsfppfesdqhjzdfpj/sql/new

2. **Cole este SQL e clique RUN:**

```sql
-- Add missing columns
ALTER TABLE liqueurs ADD COLUMN IF NOT EXISTS imageUrl TEXT;
ALTER TABLE syrups ADD COLUMN IF NOT EXISTS imageUrl TEXT;
ALTER TABLE glasses ADD COLUMN IF NOT EXISTS capacityMl TEXT;
ALTER TABLE glasses ADD COLUMN IF NOT EXISTS capacityOz TEXT;
ALTER TABLE glasses ADD COLUMN IF NOT EXISTS technicalName TEXT;
ALTER TABLE glasses ADD COLUMN IF NOT EXISTS imageUrl TEXT;

-- Disable RLS for public read access
ALTER TABLE liqueurs DISABLE ROW LEVEL SECURITY;
ALTER TABLE syrups DISABLE ROW LEVEL SECURITY;
ALTER TABLE glasses DISABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE recipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
```

3. **Espere completar (deve dizer "Success")**

## Passo 2: Popular Dados (automático - 30 segundos)

Execute no terminal:

```bash
cd D:\Projetos-claude-code\site myfirstcocktail
node auto_setup.js --seed
```

Isso vai:
- Ler dados dos JSONs (liqueurs, syrups, glasses, ingredients)
- Inserir tudo no Supabase
- Mostrar resumo do que foi inserido

## Passo 3: Testar Localmente

```bash
npm run build
npm run preview
```

Abra http://localhost:4173 no navegador. Deve mostrar receitas carregando.

## Passo 4: Deploy Vercel

```bash
vercel --prod
```

Quando perguntar pelas env vars:
- `VITE_SUPABASE_URL`: https://vztlsfppfesdqhjzdfpj.supabase.co
- `VITE_SUPABASE_ANON_KEY`: sb_publishable_EzW-ynXhs_1XWBTiL0osCw_n2Zs4nm_

---

## Se tiver problemas:

**Receitas não carregam?**
- Abra browser console (F12)
- Procure por erros de fetch
- Verifique que Supabase tem dados: https://supabase.com/dashboard/project/vztlsfppfesdqhjzdfpj/editor/recipes

**Erro ao executar SQL?**
- Copie e cole cada linha separadamente se alguma falhar
- Ou tente: `ALTER TABLE recipes DISABLE ROW LEVEL SECURITY;` etc

**Erro ao rodar auto_setup.js --seed?**
- Verifique que os arquivos JSON existem em `public/data/`
- Tente com: `node -r dotenv/config auto_setup.js --seed`
