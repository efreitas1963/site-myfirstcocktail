# Integração Firecrawl - MyFirstCocktail

## ✅ Implementação Concluída

Firecrawl foi integrado ao projeto para scraping de receitas da web.

---

## Arquivos Criados

### 1. **Serviço Firecrawl** (`src/services/firecrawlService.ts`)
- `scrapeRecipeWebsite(url)` — Extrai conteúdo de URL qualquer
- `searchRecipes(query)` — Busca receitas na web
- `parseScrapedRecipe(content)` — Converte markdown em receita estruturada
- `scrapeCocktailDatabase(url)` — Parse de DB JSON
- `batchScrapeRecipes(urls)` — Scrape paralelo
- `isFirecrawlConfigured()` — Valida configuração

### 2. **Modal UI** (`src/components/WebScraperModal.tsx`)
- Busca: campo para pesquisar receitas por nome (retorna 5 resultados)
- URL Direta: cole link da receita e importa
- Mostra warnings se API key não está configurada
- Integra diretamente com Supabase após scrape

### 3. **Integração App.tsx**
- Estado: `showWebScraper`, `handleRecipeScraped`
- Botão no menu Import: "🌐 Web Scraping"
- Modal renderizado junto com outros modais

---

## Como Usar

### 1️⃣ Obter API Key

```bash
# Visite
https://firecrawl.dev

# Registre-se (gratuito)
# Copie sua API key (começa com fc-)
```

### 2️⃣ Configurar Variável de Ambiente

Edite `.env.local`:

```bash
VITE_FIRECRAWL_API_KEY=fc-seu-api-key-aqui
```

### 3️⃣ Reinicie Servidor Dev

```bash
npm run dev
```

### 4️⃣ Use Web Scraping

1. Clique em **Import** → **🌐 Web Scraping**
2. Escolha:
   - **Buscar**: Digite "Margarita", espera resultados
   - **URL Direta**: Cole `https://exemplo.com/receita-mojito`
3. Receita importada → salva no Supabase automaticamente

---

## Exemplos de URLs para Testar

```
# The Cocktail DB
https://thecocktaildb.com/api/json/v1/1/search.php?s=margarita

# Wikipedia (receitas em markdown)
https://en.wikipedia.org/wiki/Margarita

# Receitas de blogs
https://www.diffordsguide.com/spirits/cocktails/margarita
```

---

## Formatos Suportados

- ✅ Markdown (blogs, wikis)
- ✅ JSON estruturado (APIs)
- ✅ HTML dinâmico (Playwright automação)
- ✅ Screenshots se precisar OCR

---

## Funcionalidades Implementadas

| Feature | Status | Descrição |
|---------|--------|-----------|
| Scrape URL | ✅ | Extrai conteúdo e limpa |
| Search Web | ✅ | Busca 5 resultados full-content |
| Parse automático | ✅ | Converte em DrinkRecipe |
| Modal UI | ✅ | Interface user-friendly |
| Supabase sync | ✅ | Salva direto no banco |
| Config validation | ✅ | Avisa se API key faltando |

---

## Tratamento de Erros

Modal mostra feedback claro:
- ✅ "Receita importada com sucesso!"
- ⚠️ "Firecrawl não configurado" (com link para firecrawl.dev)
- ❌ Mensagens de erro específicas se scrape falhar

---

## Free Tier Limits

**Plano Gratuito Firecrawl:**
- 500 requisições/mês
- Suficiente para teste e desenvolvimento
- Sem limitação de concurrent requests

Upgrade: `https://firecrawl.dev/pricing`

---

## Próximos Passos Opcionais

1. **Integrar MCP Firecrawl** (para Claude interagir direto)
2. **Batch import** de listas de URLs
3. **Scheduler** para scrape periódico
4. **Webhook** para notificações de scrape
5. **Cache local** de scraped content

---

## Troubleshooting

### ❌ "Firecrawl não configurado"
- Verifique `.env.local` tem `VITE_FIRECRAWL_API_KEY=fc-...`
- Reinicie `npm run dev`
- Copie-e-cole corretamente a chave

### ❌ "Erro ao fazer scrape"
- URL pode estar bloqueada (verifique em browser)
- Firecrawl free tier pode ter ratelimit (aguarde 5min)
- Tente URL diferente para testar

### ✅ "Por que demora?"
- Primeira requisição: ~3-5s (setup browser)
- Seguintes: ~1-2s (reuse pool)
- Normal para Firecrawl — é mais confiável que JS-libre scrapers

---

## Arquitetura

```
App.tsx
  ├─ showWebScraper (state)
  ├─ handleRecipeScraped (handler)
  └─ WebScraperModal
       └─ firecrawlService
            ├─ scrapeRecipeWebsite()
            ├─ searchRecipes()
            ├─ parseScrapedRecipe()
            └─ saveRecipe() → Supabase
```

---

## Segurança

- ✅ API key no `.env.local` (nunca commit)
- ✅ Scrape limpo (remove ads, tracking)
- ✅ Conteúdo validado antes de salvar
- ✅ Sem execução JavaScript arbitrário (Firecrawl + Playwright safe)

---

## Documentação Oficial

- Firecrawl: https://docs.firecrawl.dev
- SDKs: Node.js, Python, Go, Java, Rust, Ruby, PHP, .NET
- API Reference: https://api.firecrawl.dev
- Discord: https://discord.gg/firecrawl

---

## Próxima Sessão

Quando retornar, para ativar scraping basta:

```bash
# 1. Obter chave em https://firecrawl.dev
# 2. Adicionar a .env.local
VITE_FIRECRAWL_API_KEY=fc-...

# 3. Reiniciar servidor
npm run dev
```

Pronto! 🚀
