import { Firecrawl } from 'firecrawl';
import { DrinkRecipe, IngredientItem } from '../types';

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

/**
 * Scrape receitas de um site
 * Retorna markdown limpo e estruturado
 */
export async function scrapeRecipeWebsite(url: string): Promise<string> {
  if (!app) throw new Error('Firecrawl não configurado');

  try {
    // Use v2 API: scrape() instead of deprecated scrapeUrl()
    const result = await (app as any).scrape(url, {
      formats: ['markdown'],
      timeout: 30000,
    });

    if (!result || !result.markdown) {
      throw new Error('Nenhum conteúdo foi extraído da página');
    }

    return result.markdown;
  } catch (error) {
    console.error('Erro ao fazer scrape:', error);
    throw error;
  }
}

/**
 * Search por receitas na web
 * Retorna URLs e conteúdo de múltiplas fontes
 */
export async function searchRecipes(query: string, limit = 5) {
  if (!app) throw new Error('Firecrawl não configurado');

  try {
    const results = await app.search(`${query} cocktail recipe`, { limit });
    return results;
  } catch (error) {
    console.error('Erro ao buscar receitas:', error);
    throw error;
  }
}

/**
 * Parse receitas do conteúdo scrapeado
 * Converte markdown em estrutura DrinkRecipe
 */
export function parseScrapedRecipe(content: string): Partial<DrinkRecipe> {
  console.log('[Parser] Content length:', content.length);

  let title = 'Sem nome';

  // Strategy: Find the first non-navigation heading that appears BEFORE "Ingredients"
  const ingredientsIndex = content.toLowerCase().indexOf('ingredients');
  console.log('[Parser] Ingredients section at:', ingredientsIndex);

  // Find all headings
  const headingRegex = /^#+\s+(.+)$/gm;
  let match;
  const headings: Array<{ text: string; index: number }> = [];

  while ((match = headingRegex.exec(content)) !== null) {
    headings.push({
      text: match[1].trim(),
      index: match.index,
    });
  }

  console.log('[Parser] Found headings:', headings.map(h => h.text).slice(0, 5));

  // Get headings that appear before "Ingredients" section
  const headingsBeforeIngredients = ingredientsIndex > 0
    ? headings.filter(h => h.index < ingredientsIndex)
    : headings;

  // Find first substantial heading (skip navigation, short headers)
  const navigationPatterns = /^(follow|share|why|what|how|jump|back|home|menu|recipe|ingredients|instructions|preparation|method|notes?)/i;

  for (const heading of headingsBeforeIngredients) {
    if (heading.text.length > 5 &&
      heading.text.length < 80 &&
      !navigationPatterns.test(heading.text)) {
      title = heading.text;
      console.log('[Parser] Found recipe title heading:', title);
      break;
    }
  }

  // Fallback: if still not found, take first heading that's not too short
  if (title === 'Sem nome' && headingsBeforeIngredients.length > 0) {
    for (const heading of headingsBeforeIngredients) {
      if (heading.text.length > 3 && heading.text.length < 80) {
        title = heading.text;
        console.log('[Parser] Fallback heading:', title);
        break;
      }
    }
  }

  const ingredientMatches = content.match(/[-•]\s+(.+?)(?:\s*-\s*(.+?))?$/gm) || [];
  const instructionsMatch = content.match(/##\s+(?:Modo de preparo|Instructions|Preparation|Method)\n([\s\S]*?)(?=##|$)/i);

  console.log('[Parser] Final title:', title);

  const ingredients: string[] = ingredientMatches.map((line) => {
    const cleaned = line.replace(/^[-•]\s+/, '').trim();
    return cleaned;
  });

  console.log('[Parser] Ingredient count:', ingredients.length);

  const instructions = instructionsMatch ? instructionsMatch[1].trim() : content.substring(0, 500);

  return {
    title,
    ingredients,
    preparation: instructions,
    category: 'Sem categoria',
    notes: 'Importado via Firecrawl',
  };
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
