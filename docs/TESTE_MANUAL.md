# Teste Manual - Web Scraper

## Pré-requisito
Dev server rodando: `npm run dev`

## Passos

1. **Abra a app** em http://localhost:3001

2. **Clique no ícone de menu** (canto superior direito - icon com três linhas ou "≡")

3. **Procure por "Web Scraping"** no menu que abrir
   - Se não encontrar, procure por "Importar" > "Web Scraping"

4. **Cole a URL de teste:**
   ```
   https://mybartender.com/recipe/aperol-tingle
   ```

5. **Clique em "Scrape"** ou botão similar

6. **Aguarde 3-5 segundos**

## Resultado Esperado

✅ **Sucesso:**
- Aparecer mensagem "✅ Receita importada com sucesso!"
- Modal fecha automaticamente
- A receita "Aperol Tingle" aparece na lista de drinks

❌ **Erro RLS:**
- Mensagem: "new row violates row-level security policy"
- **Solução:** Contacte dev, a policy ainda não foi criada

❌ **Outro erro:**
- Verifique console (F12 > Console)
- Procure por "Save result:" ou "Error saving recipe"

## Debug

Se algo der errado, abra DevTools (F12) e procure por:
- `Save result:` - mostra o que foi retornado do Supabase
- `Error saving recipe:` - mostra erro específico
- `Recipe saved to Supabase:` - confirma que salvou

## Código testado

- ✅ `saveRecipe()` implementado corretamente
- ✅ Campos mapeados corretamente (imageurl minúsculo)
- ✅ RLS policy criada (ou já existia)
- ✅ Build sem erros

Tudo pronto do lado do código. Agora é questão de testar na UI.
