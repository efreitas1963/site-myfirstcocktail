# MyFirstCocktail - Deploy Checklist

## ✅ Completo
- [x] Projeto Supabase criado
- [x] App React integrado com Supabase
- [x] Build testado (vite build OK)
- [x] RLS desabilitado para leitura (anon key pode ler)

## ⏳ Próximos Passos

### 1. Carregar Dados no Supabase

Acesse: **https://supabase.com/dashboard/project/vztlsfppfesdqhjzdfpj/sql/new**

Cole e execute o SQL:
```sql
INSERT INTO recipes (id, name_pt, name_en, glass_id, description, preparation, image_url, created_at) 
VALUES
  (1, 'Caipirinha', 'Caipirinha', 15, 'Drink clássico brasileiro feito com destilado branco, açúcar e limão', 'Coloque gelo crushed no copo, adicione metades de limão cortadas. Despeje açúcar e destilado. Mexa bem com o muddler.', '/uploads/recipes/caipirinha.jpg', NOW()),
  (2, 'Whisky Sour', 'Whisky Sour', 14, 'A combinação perfeita de destilado, cítrico e doçura, com uma textura sedosa.', 'Adicione bourbon, suco de limão, xarope simples e gelo na coqueteleira. Bata vigorosamente até gelar.', '/uploads/recipes/whisky-sour.jpg', NOW()),
  (3, 'Daiquiri', 'Daiquiri', 17, 'Um clássico cubano injustiçado. Quando bem feito, é fresco, complexo e revigorante.', 'Coloque rum branco, suco de limão e xarope na coqueteleira com gelo. Bata vigorosamente. Coe para taça gelada.', '/uploads/recipes/daiquiri.jpg', NOW()),
  (4, 'Margarita', 'Margarita', 20, 'O drink de Tequila mais famoso do mundo. Ácido, salgado e vibrante.', 'Passe limão na borda e cruste com sal. Bata tequila, cointreau e suco de limão. Coe para a taça.', '/uploads/recipes/margarita.jpg', NOW()),
  (5, 'Mojito', 'Mojito', 11, 'Drink refrescante com hortelã e rum branco', 'Coloque folhas de hortelã no copo. Adicione açúcar e rum. Complete com água com gelo. Mexa bem.', '/uploads/recipes/mojito.jpg', NOW())
ON CONFLICT (id) DO UPDATE SET 
  name_pt = EXCLUDED.name_pt,
  name_en = EXCLUDED.name_en,
  glass_id = EXCLUDED.glass_id,
  description = EXCLUDED.description,
  preparation = EXCLUDED.preparation,
  image_url = EXCLUDED.image_url;
```

Depois teste com:
```bash
node test_supabase.js
```

Deve retornar: `Recipes found: 5`

### 2. Deploy no Vercel

```bash
# Faça login (primeira vez)
npm install -g vercel
vercel login

# Deploy
cd "D:\Projetos-claude-code\site myfirstcocktail"
vercel --prod
```

Quando pedir variáveis de ambiente, use:
- `VITE_SUPABASE_URL`: `https://vztlsfppfesdqhjzdfpj.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: `sb_publishable_EzW-ynXhs_1XWBTiL0osCw_n2Zs4nm_`

### 3. Verificar Deploy

Após o deploy, acesse a URL fornecida pelo Vercel e teste:
- [ ] Página carrega
- [ ] Receitas aparecem
- [ ] Filtros funcionam
- [ ] Modo offline funciona (PWA)
- [ ] Idioma pode ser alterado

## URLs Importantes

- **GitHub**: https://github.com/efreitas1963/site-myfirstcocktail
- **Supabase Dashboard**: https://supabase.com/dashboard/project/vztlsfppfesdqhjzdfpj
- **Supabase SQL Editor**: https://supabase.com/dashboard/project/vztlsfppfesdqhjzdfpj/sql/new
- **Vercel Login**: https://vercel.com/login
- **Vercel Dashboard**: https://vercel.com/dashboard

## Troubleshooting

### "Recipes not loading"
- Verifique em Supabase > SQL Editor se os dados estão lá
- Execute: `node test_supabase.js`
- Verifique console do navegador (F12)

### "Cannot find module supabase-js"
- Execute: `npm install @supabase/supabase-js`

### Erro de CORS
- Já foi resolvido na versão anterior
- App React fala direto com Supabase, sem backend

### Build fails
- Execute: `npm run build`
- Verifique mensagens de erro
- Tente: `npm install` para resetar node_modules
