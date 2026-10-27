# ✅ Supabase Conectado!

## Status
- ✓ Credenciais adicionadas ao `.env.local`
- ✓ App já tem código pronto para usar Supabase
- ✓ Servidor de desenvolvimento rodando

## Como testar

### 1. Acesse o app
```
http://localhost:3001/mycocktail
```

### 2. Verifique se os dados carregam
- Vá ao navegador
- Abra o Console (F12 ou Ctrl+Shift+K)
- Procure por mensagens de sucesso/erro
- Se ver os coquetéis na tela = ✓ funcionando!

## Estrutura de Funcionamento

### Arquivo de Conexão
`src/lib/supabase.ts` - Cria a conexão com Supabase

### Serviço de Dados
`src/services/supabaseService.ts` - Funções para buscar dados:
- `getRecipes()` - pega 431 coquetéis
- `getIngredients()` - pega 337 ingredientes
- `getGlasses()` - pega 29 tipos de taças
- `getCategories()` - pega categorias
- `getLiqueurs()` - pega 49 licores
- `getSyrups()` - pega 21 xaropes

## Como usar no código

### Exemplo: Buscar todos os coquetéis
```javascript
import { getRecipes } from '@/services/supabaseService'

// Em um componente React
const recipes = await getRecipes()
console.log(recipes) // Array com 431 coquetéis
```

### Exemplo: Buscar ingredientes
```javascript
import { getIngredients } from '@/services/supabaseService'

const ingredients = await getIngredients()
```

## Troubleshooting

### "Dados não aparecem"
1. Abre o Console (F12)
2. Vê se tem erro
3. Se tiver erro de "permission denied" = RLS não está configurado
4. Se tiver erro de "table not found" = dados não foram carregados

### "Conexão recusada"
1. Verifique se `.env.local` tem as credenciais
2. Verifique se a URL está correta
3. Reinicie o servidor: `npm run dev`

### "Preciso rodar de novo"
```bash
npm run dev
```

## Estrutura dos Dados

### Recipes (Coquetéis)
```json
{
  "id": "uuid",
  "title": "Nome do Coquetel",
  "description": "Descrição",
  "ingredients": [
    {"name": "Ingrediente 1", "measure": "60 ml"}
  ],
  "instructions": ["passo 1", "passo 2"],
  "garnish": "Decoração",
  "method": "Batido",
  "category": "Clássico",
  "imageurl": "/uploads/recipes/..."
}
```

### Ingredients
```json
{
  "id": 1,
  "name": "Bourbon",
  "category": "Destilado",
  "description": "Descrição do ingrediente",
  "imageurl": "/uploads/ingredients/..."
}
```

## Próximos Passos

1. **Teste o app** - Veja se carrega os dados
2. **Customize** - Adicione filtros, busca, etc.
3. **Deploy** - Quando tiver pronto, sobe no Vercel
4. **Admin** - Depois criamos painel pra adicionar novos coquetéis

## Dúvidas?

Qualquer erro, manda a mensagem do console! 🍹
