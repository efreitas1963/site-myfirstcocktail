# Supabase Setup Guide

## 1. Obter Service Role Key

1. Acesse: https://supabase.com/dashboard/project/vztlsfppfesdqhjzdfpj/settings/api
2. Em **Project API Keys**, copie a chave **service_role**
3. Configure a variável de ambiente:

```bash
# Windows PowerShell
$env:SUPABASE_SERVICE_ROLE_KEY = "sua-chave-aqui"
node setup_supabase.js

# Ou no .env.local (para testes locais)
SUPABASE_SERVICE_ROLE_KEY=sua-chave-aqui
```

## 2. Opção A: Desabilitar RLS (mais simples para dev)

1. Acesse: https://supabase.com/dashboard/project/vztlsfppfesdqhjzdfpj/sql/new
2. Execute estes comandos SQL:

```sql
-- Desabilita RLS em todas as tabelas
ALTER TABLE recipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE glasses DISABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients DISABLE ROW LEVEL SECURITY;
```

3. Depois execute:

```bash
node insert_data.js
```

## 3. Opção B: Configurar RLS corretamente (mais seguro)

Se preferir manter RLS, crie policies para leitura pública:

```sql
-- Recipes: read public
CREATE POLICY "Enable read access for all users" ON recipes
  FOR SELECT USING (true);

-- Glasses: read public
CREATE POLICY "Enable read access for all users" ON glasses
  FOR SELECT USING (true);

-- Ingredients: read public
CREATE POLICY "Enable read access for all users" ON ingredients
  FOR SELECT USING (true);

-- Categories: read public
CREATE POLICY "Enable read access for all users" ON categories
  FOR SELECT USING (true);

-- Recipe Ingredients: read public
CREATE POLICY "Enable read access for all users" ON recipe_ingredients
  FOR SELECT USING (true);
```

## 4. Verificar Dados

```bash
node test_supabase.js
```

Deve mostrar as 5 receitas inseridas.

## 5. Deploy no Vercel

```bash
# 1. Faça login no Vercel
vercel login

# 2. Deploy
vercel --prod

# 3. Configure variáveis de ambiente no Vercel:
# - VITE_SUPABASE_URL: https://vztlsfppfesdqhjzdfpj.supabase.co
# - VITE_SUPABASE_ANON_KEY: sb_publishable_EzW-ynXhs_1XWBTiL0osCw_n2Zs4nm_
```

## URLs do Projeto

- **Supabase Dashboard**: https://supabase.com/dashboard/project/vztlsfppfesdqhjzdfpj
- **GitHub Repo**: https://github.com/efreitas1963/site-myfirstcocktail
- **Deploy Preview**: (será atualizado após Vercel deploy)
