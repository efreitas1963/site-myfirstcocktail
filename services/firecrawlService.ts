import { Firecrawl } from 'firecrawl';
import { DrinkRecipe } from '../types';

interface FirecrawlRecipeData {
  title: string;
  ingredients: Array<{ name: string; measure?: string }>;
  instructions: string;
  imageUrl?: string;
  category?: string;
}

// Use FIRECRAWL_API_KEY from environment (Vercel secret)
// In development, can also use VITE_FIRECRAWL_API_KEY from .env.local
const API_KEY =
  (import.meta.env.FIRECRAWL_API_KEY as string) ||
  (import.meta.env.VITE_FIRECRAWL_API_KEY as string) ||
  '';

if (!API_KEY) {
  console.warn('FIRECRAWL_API_KEY não configurada. Web scraping desabilitado.');
}

const app = API_KEY ? new Firecrawl({ apiKey: API_KEY }) : null;

export interface ExtractedRecipe {
  title: string;
  ingredients: Array<{ amount: string; name: string }>;
  instructions: string[];
  garnish?: string;
  method?: 'Batido' | 'Mexido' | 'Montado';
  isAlcoholic?: boolean;
  imageUrl?: string;
}

// Schema + prompt para o modo "json" do Firecrawl: em vez de regex em cima do
// markdown (frágil — cada site estrutura cabeçalhos/listas de um jeito, e
// qualquer site fora do formato esperado quebrava a extração), pede pra um
// LLM extrair os campos da receita diretamente da página e já traduzir pra
// português, funcionando em qualquer site e com tradução bem mais fluente
// que o dicionário local.
const RECIPE_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string', description: 'The cocktail/drink recipe name, in Brazilian Portuguese' },
    ingredients: {
      type: 'array',
      description: 'Each real ingredient with its amount and name from the recipe\'s own ingredient list — never substitutions, equipment, or marketing/navigation text. Do not include the garnish here, it goes in the separate "garnish" field. Never include plain ice ("ice", "gelo", "crushed ice", "ice cubes") as an ingredient, even if the ingredient list mentions it — it is assumed and may still be described in the instructions. Translate the ingredient name to Brazilian Portuguese unless it is a brand/product name.',
      items: {
        type: 'object',
        properties: {
          amount: { type: 'string', description: 'Quantity and unit exactly as written (e.g. "60 ml", "2 oz", "1/2", "6"), or empty string if the ingredient just tops up the drink with no fixed amount' },
          name: { type: 'string', description: 'Ingredient name only, without the amount, in Brazilian Portuguese (keep brand/product names as-is)' },
        },
        required: ['name'],
      },
    },
    instructions: {
      type: 'array',
      description: 'Each real preparation step in order, translated into natural, fluent Brazilian Portuguese, as plain text. No navigation/marketing/ad/comment text, no step numbers or bullet markers.',
      items: { type: 'string' },
    },
    garnish: { type: 'string', description: "The drink's garnish/decoration, in Brazilian Portuguese, as just the item (e.g. \"Fatia de laranja\"), empty string if there is none" },
    method: { type: 'string', enum: ['Batido', 'Mexido', 'Montado'], description: 'Batido = shaken in a cocktail shaker; Mexido = stirred with a bar spoon; Montado = built/poured directly, no shaking or stirring' },
    isAlcoholic: { type: 'boolean', description: 'true if any ingredient contains alcohol (spirits, liqueurs, wine, beer, bitters with alcohol, etc), false if the recipe is entirely non-alcoholic (mocktail)' },
    imageUrl: { type: 'string', description: 'URL of the main photo of the finished drink, empty string if none found' },
  },
  required: ['title', 'ingredients', 'instructions'],
};

const RECIPE_PROMPT =
  'Extract this cocktail/drink recipe\'s structured data. Always output the title, ingredient names, ' +
  'instructions and garnish in natural, fluent Brazilian Portuguese — translate from the source ' +
  'language if it is not already Portuguese, but keep brand/product names (e.g. "Smirnoff", "Rivi Gin", ' +
  '"Angostura Bitters") as-is rather than translating them. Ignore navigation, ads, discounts, related ' +
  'products, comments, equipment lists, and any other content that is not the recipe itself.';

/**
 * Extrai uma receita estruturada (título, ingredientes, modo de preparo,
 * guarnição, método, imagem) de qualquer site de receita usando o modo
 * "json" do Firecrawl — um LLM lê a página e já devolve os campos certos,
 * traduzidos, em vez de depender de regex em cima da estrutura de markdown
 * de cada site (frágil e específica demais).
 */
export async function scrapeAndExtractRecipe(url: string): Promise<ExtractedRecipe> {
  if (!API_KEY) {
    throw new Error('Firecrawl API não configurado. Entre em contato com o administrador.');
  }
  if (!app) throw new Error('Firecrawl não iniciado corretamente');

  try {
    console.log('[Firecrawl] Extracting recipe from:', url);
    // waitFor: alguns sites (ex: lojas VTEX como br.thebar.com) carregam o
    // conteúdo da receita via JavaScript depois do carregamento inicial da
    // página. Sem esperar, a extração roda em cima de uma página ainda vazia
    // e o LLM inventa uma receita inteira do zero em vez de reportar que não
    // achou nada — então o wait é essencial pra extração ser real, não um
    // ajuste de performance.
    const result: any = await (app as any).scrape(url, {
      formats: [{ type: 'json', schema: RECIPE_SCHEMA, prompt: RECIPE_PROMPT }],
      waitFor: 5000,
      timeout: 45000,
    });

    const data = result?.json;
    if (!data || !data.title || !Array.isArray(data.ingredients) || data.ingredients.length === 0) {
      throw new Error('Não consegui identificar uma receita nessa página.');
    }

    console.log('[Firecrawl] Extracted:', { title: data.title, ingredientCount: data.ingredients.length, stepCount: data.instructions?.length });

    return {
      title: data.title,
      ingredients: data.ingredients,
      instructions: Array.isArray(data.instructions) ? data.instructions : [],
      garnish: data.garnish || '',
      method: (['Batido', 'Mexido', 'Montado'] as const).includes(data.method) ? data.method : undefined,
      isAlcoholic: typeof data.isAlcoholic === 'boolean' ? data.isAlcoholic : undefined,
      imageUrl: data.imageUrl || result?.metadata?.ogImage || undefined,
    };
  } catch (error: any) {
    console.error('[Firecrawl] Extract error:', {
      message: error.message,
      code: error.code,
      status: error.status,
    });
    throw new Error(`Falha ao extrair receita: ${error.message || 'Network error'}`);
  }
}

/**
 * Search por receitas na web
 * Retorna URLs e conteúdo de múltiplas fontes
 */
export async function searchRecipes(query: string, limit = 5) {
  if (!app) throw new Error('Firecrawl não configurado');

  try {
    // app.search() retorna { web: [...] }, não um array puro.
    const results: any = await app.search(`${query} cocktail recipe`, { limit });
    return Array.isArray(results) ? results : results?.web || [];
  } catch (error) {
    console.error('Erro ao buscar receitas:', error);
    throw error;
  }
}

/**
 * Capitaliza a primeira letra de cada frase (início do texto e após . ! ?)
 */
export function capitalizeSentences(text: string): string {
  return text.replace(/(^\s*|[.!?]\s+)([a-zà-ú])/g, (_, prefix, letter) => prefix + letter.toUpperCase());
}

/**
 * Scrape The Cocktail DB (ou similar) e retorna receitas estruturadas
 */
export async function scrapeCocktailDatabase(databaseUrl: string) {
  if (!app) throw new Error('Firecrawl não configurado');

  try {
    // Use v2 API: scrape() instead of deprecated scrapeUrl()
    const result = await (app as any).scrape(databaseUrl, {
      formats: ['markdown'],
      timeout: 30000,
    });

    // Parse markdown or content as JSON if possible
    try {
      const jsonData = JSON.parse(result.markdown);
      const recipes = parseJsonRecipes(jsonData);
      return recipes;
    } catch {
      // If not JSON, try parsing as markdown
      return [];
    }
  } catch (error) {
    console.error('Erro ao scrape DB:', error);
    throw error;
  }
}

/**
 * Helper para extrair receitas de JSON estruturado
 */
function parseJsonRecipes(jsonData: any): Partial<DrinkRecipe>[] {
  const recipes: Partial<DrinkRecipe>[] = [];

  // Suporta múltiplos formatos JSON
  const items = Array.isArray(jsonData)
    ? jsonData
    : jsonData.drinks || jsonData.recipes || jsonData.items || [jsonData];

  items.forEach((item: any) => {
    if (!item.name && !item.title) return; // Skip sem título

    const recipe: Partial<DrinkRecipe> = {
      title: item.name || item.title || 'Sem nome',
      ingredients: extractIngredients(item),
      preparation: item.instructions || item.preparation || '',
      category: item.category || item.type || 'Sem categoria',
      imageUrl: item.image || item.strDrinkThumb || '',
      notes: `Importado: ${new Date().toLocaleDateString()}`,
    };

    recipes.push(recipe);
  });

  return recipes;
}

/**
 * Extrai ingredientes de formato JSON variável
 */
function extractIngredients(item: any): string[] {
  const ingredients: string[] = [];

  // Formato: strIngredient1, strMeasure1, strIngredient2, strMeasure2...
  if (item.strIngredient1) {
    for (let i = 1; i <= 15; i++) {
      const ingredient = item[`strIngredient${i}`];
      const measure = item[`strMeasure${i}`];
      if (ingredient) {
        ingredients.push(measure ? `${measure} ${ingredient}` : ingredient);
      }
    }
  }
  // Formato: ingredients array
  else if (Array.isArray(item.ingredients)) {
    item.ingredients.forEach((ing: any) => {
      const name = ing.name || ing.ingredient || '';
      const measure = ing.measure || ing.amount || '';
      if (name) {
        ingredients.push(measure ? `${measure} ${name}` : name);
      }
    });
  }
  // Formato: single string
  else if (typeof item.ingredients === 'string') {
    return item.ingredients.split(',').map((s) => s.trim());
  }

  return ingredients;
}

/**
 * Interact mode: click, type, espera antes de scrape
 * Útil para sites com conteúdo dinâmico
 */
export async function interactAndScrape(
  url: string,
  actions: Array<{ action: string; [key: string]: any }>
) {
  if (!app) throw new Error('Firecrawl não configurado');

  try {
    // Use v2 API: scrape() instead of deprecated scrapeUrl()
    const result = await (app as any).scrape(url, {
      formats: ['markdown'],
      actions: actions as any,
      timeout: 30000,
    });

    if (!result.markdown) {
      throw new Error('Nenhum conteúdo extraído após interação');
    }

    return result.markdown;
  } catch (error) {
    console.error('Erro ao interact:', error);
    throw error;
  }
}

/**
 * Batch scrape múltiplas URLs
 */
export async function batchScrapeRecipes(urls: string[]) {
  if (!app) throw new Error('Firecrawl não configurado');

  try {
    const results = await Promise.all(
      urls.map((url) =>
        app!.scrapeUrl(url, { formats: ['markdown'] }).catch((err) => ({
          markdown: `Erro ao scrape ${url}: ${err.message}`,
        }))
      )
    );

    return results;
  } catch (error) {
    console.error('Erro ao batch scrape:', error);
    throw error;
  }
}

/**
 * Validate Firecrawl API key
 */
export function isFirecrawlConfigured(): boolean {
  return !!API_KEY && !!app;
}
