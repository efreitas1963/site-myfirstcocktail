# Scripts

Scripts internos de manutenção do banco (não fazem parte do app publicado).

- `db/` — scripts Node avulsos de seed/migração/import do Supabase e de upload de imagens.
- `sql/` — arquivos `.sql` de setup, migração, backup e inserts manuais.
- `tests/` — scripts avulsos de teste manual (não é uma suíte automatizada).

**Execute sempre a partir da raiz do projeto**, ex: `node scripts/db/seed_supabase.js`.
Vários scripts resolvem `public/` e `uploads/` a partir da raiz do projeto; rodá-los de outro diretório pode fazer com que não encontrem os arquivos.
