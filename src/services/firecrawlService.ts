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

  // Find all heading patterns and take the first substantial one (not navigation)
  const headings = content.match(/^#+\s+(.+)$/gm) || [];
  console.log('[Parser] Found headings count:', headings.length);

  let title = 'Sem nome';

  // Try different title extraction strategies
  // 1. Look for h1/h2/h3 that's a recipe name (not too short, not a common header)
  if (headings.length > 0) {
    for (const heading of headings) {
      const match = heading.match(/#+\s+(.+)$/);
      if (match) {
        const candidate = match[1].trim();
        // Skip common navigation/section headers
        if (candidate.length > 5 &&
          !candidate.match(/^(Follow|Share|Why|What|How|Jump|Back|Home|Menu)/i) &&
          candidate.length < 80) {
          title = candidate;
          console.log('[Parser] Found good heading:', title);
          break;
        }
      }
    }
  }

  // 2. If still no good title, look for capitalized words (likely cocktail names)
  if (title === 'Sem nome') {
    const lines = content.split('\n');
    for (const line of lines.slice(0, 20)) {
      const trimmed = line.trim();
      // Look for lines that look like recipe titles (2-4 capitalized words)
      if (trimmed.match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}$/) &&
        trimmed.length > 5 && trimmed.length < 50) {
        title = trimmed;
        console.log('[Parser] Found from capitalized words:', title);
        break;
      }
    }
  }

  const ingredientMatches = content.match(/[-•]\s+(.+?)(?:\s*-\s*(.+?))?$/gm) || [];
  const instructionsMatch = content.match(/##\s+(?:Modo de preparo|Instructions|Preparation|Method)\n([\s\S]*?)(?=##|$)/i);

  console.log('[Parser] Final extracted title:', title);

  const ingredients: string[] = ingredientMatches.map((line) => {
    const cleaned = line.replace(/^[-•]\s+/, '').trim();
    return cleaned;
  });

  console.log('[Parser] Extracted ingredients count:', ingredients.length);

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
