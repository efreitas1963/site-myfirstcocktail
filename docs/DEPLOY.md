# Deploy — MyFirstCocktail

Arquitetura atual: **Vercel (frontend) + Supabase (PostgreSQL)**.
Histórico: o projeto já passou por XAMPP e por um plano de Railway/MySQL — ambos abandonados.

- Produção: https://site-myfirstcocktail.vercel.app
- Supabase: https://vztlsfppfesdqhjzdfpj.supabase.co
- Repo: https://github.com/efreitas1963/site-myfirstcocktail

## Deploy

Push na `main` dispara build automático na Vercel. Nada manual.

```bash
git push origin main
```

Para deploy manual (precisa de `npm i -g vercel`):

```bash
vercel --prod
```

## Build local

```bash
npm install
npm run dev       # dev server na porta 3000
npm run build     # gera dist/
npm run preview   # serve o dist/
npm run lint      # tsc --noEmit
```

`dist/` é gerado e **não** deve ser commitado.

## Variáveis de ambiente

Em `.env.local` (local) e no painel da Vercel (produção):

| Variável | Uso |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | endpoint do Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | chave pública de leitura |
| `VITE_FIRECRAWL_API_KEY` | import de receitas via Firecrawl (API cloud) |

## Supabase

- RLS desabilitado para `SELECT` (anon key lê).
- Tabela `recipes` precisa da coluna `autor`:
  ```sql
  ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS autor character varying;
  ```
- Scripts de setup/seed/migração: `scripts/db/` e `scripts/sql/`.
  Esses scripts leem imagens de `public/uploads/`.

## Imagens

Ficam em `public/uploads/` (receitas, ingredientes, copos, licores, xaropes) e são
publicadas junto com o site. `api/proxy-image.ts` é uma serverless function da Vercel
que baixa imagens de sites que bloqueiam CORS.

## Troubleshooting

**Imagens 404:**
1. Console do navegador (F12) para ver o caminho pedido.
2. Confirmar que subiu: `curl https://site-myfirstcocktail.vercel.app/uploads/liqueurs/licor-abacaxi.jpg`
3. Limpar cache e recarregar.
4. Logs da Vercel no dashboard do projeto.

**Build quebra na Vercel mas passa local:**
Checar se alguma variável de ambiente falta no painel da Vercel.

**Import de receita salva conteúdo errado:**
Ver `FIRECRAWL_INTEGRATION.md` — sites com JS pesado precisam de `waitFor`.
