import { Firecrawl } from 'firecrawl';
import { DrinkRecipe, IngredientItem } from '../types';
import { translatePortuguese, translateIngredient } from './translationService';

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
export async function scrapeRecipeWebsite(
  url: string,
  urlTitle?: string
): Promise<{ content: string; imageUrl?: string }> {
  if (!API_KEY) {
    throw new Error('Firecrawl API não configurado. Entre em contato com o administrador.');
  }

  if (!app) throw new Error('Firecrawl não iniciado corretamente');

  try {
    console.log('[Firecrawl] Scraping URL:', url);
    // Use v2 API: scrape() instead of deprecated scrapeUrl()
    const result = await (app as any).scrape(url, {
      formats: ['markdown'],
      timeout: 30000,
    });

    if (!result || !result.markdown) {
      throw new Error('Nenhum conteúdo foi extraído da página');
    }

    console.log('[Firecrawl] Content length:', result.markdown.length);

    const imageUrl = result.metadata?.ogImage || undefined;
    if (imageUrl) console.log('[Firecrawl] Found image:', imageUrl);

    // Prepend URL title (from slug) to make extraction easier
    const content = urlTitle ? `# ${urlTitle}\n\n${result.markdown}` : result.markdown;

    return { content, imageUrl };
  } catch (error: any) {
    console.error('[Firecrawl] Scrape error:', {
      message: error.message,
      code: error.code,
      status: error.status
    });
    throw new Error(`Falha ao scrape: ${error.message || 'Network error'}`);
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
 * Detecta o método de preparo pelo texto (em inglês, antes da tradução)
 * Montado = montado direto no copo (ex: "pour", "build")
 * Batido = coqueteleira ou liquidificador (ex: "shake", "blend")
 * Mexido = mexido com bailarina em copo misturador (ex: "stir")
 */
function detectMethod(rawInstructions: string): 'Batido' | 'Mexido' | 'Montado' {
  const lower = rawInstructions.toLowerCase();
  if (/\b(shake|shaker|blend|blender)\b/.test(lower)) return 'Batido';
  if (/\bstir(red)?\b/.test(lower)) return 'Mexido';
  return 'Montado';
}

/**
 * Capitaliza a primeira letra de cada frase (início do texto e após . ! ?)
 */
export function capitalizeSentences(text: string): string {
  return text.replace(/(^\s*|[.!?]\s+)([a-zà-ú])/g, (_, prefix, letter) => prefix + letter.toUpperCase());
}

/**
 * Corta o texto de instruções no primeiro marcador de "boilerplate" conhecido
 * (caixa de comentários, botões de compartilhar, avaliação, aviso de consumo
 * responsável etc.), que em muitos blogs de receita vem logo depois do
 * passo-a-passo real, dentro da mesma seção "Instructions".
 */
function stripInstructionsBoilerplate(text: string): string {
  const stopMarkers = [
    /tried\s+this\s+recipe/i,
    /did\s+you\s+make\s+this/i,
    /leave\s+a\s+comment/i,
    /leave\s+a\s+reply/i,
    /rate\s+(?:this\s+)?recipe/i,
    /please\s+drink\s+responsibly/i,
    /\d+(?:\.\d+)?\s+from\s+\d+\s+votes?/i,
    /^\s*(?:pin|save|salvar|share|flip|tweet|print\s+recipe)\s*$/im,
  ];

  let cutIndex = text.length;
  for (const marker of stopMarkers) {
    const match = text.match(marker);
    if (match && match.index !== undefined && match.index < cutIndex) {
      cutIndex = match.index;
    }
  }

  return text.slice(0, cutIndex).trim();
}

/**
 * Extrai o conteúdo de uma seção markdown pelo título do heading (ex:
 * "Ingredients"/"Instructions"), delimitado pelo próximo heading de nível
 * igual ou mais alto (menos ou igual número de #). Um heading com MAIS #
 * (ex: "#### Toasted Marshmallow Syrup:" logo após um "### Instructions")
 * é um sub-rótulo dentro da própria seção, não o fim dela — usar apenas
 * "próximo heading de qualquer nível" como fim (como antes) cortava o
 * conteúdo real da seção fora quando ela tinha esses sub-rótulos.
 */
function extractSection(content: string, namePattern: string): string | null {
  const headingLineRegex = new RegExp(`^(#{1,6})\\s+(?:${namePattern})\\s*:?\\s*$`, 'im');
  const headingMatch = content.match(headingLineRegex);
  if (!headingMatch || headingMatch.index === undefined) return null;

  const level = headingMatch[1].length;
  const rest = content.slice(headingMatch.index + headingMatch[0].length);

  const closingRegex = new RegExp(`^#{1,${level}}\\s+.+$`, 'm');
  const closingMatch = rest.match(closingRegex);
  const end = closingMatch && closingMatch.index !== undefined ? closingMatch.index : rest.length;

  return rest.slice(0, end).trim();
}

/**
 * Parse receitas do conteúdo scrapeado
 * Converte markdown em estrutura DrinkRecipe
 */
export function parseScrapedRecipe(content: string): Partial<DrinkRecipe> {
  console.log('[Parser] Content length:', content.length);

  let title = 'Sem nome';

  // Strategy 0 (mais confiável): primeiro heading de nível 1 (#) do conteúdo.
  // Quando a URL é importada diretamente, esse heading é o nome extraído do
  // slug da URL (ex: "# Witch Doctor"/"# Alleluia"); senão, costuma ser o H1
  // real da página. Evita que uma linha solta da lista de ingredientes (ex:
  // um ingrediente sem medida, como "Limonada Gaseificada") seja confundida
  // com o título pela Strategy 1 abaixo.
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    const candidate = h1Match[1].trim();
    if (candidate.length > 1 && candidate.length < 80) {
      title = candidate;
      console.log('[Parser] Found title via H1 heading:', title);
    }
  }

  // Strategy 1: Look for a line that contains common cocktail name patterns
  // Usually appears as a standalone line or in quotes near the top
  // (só roda se a Strategy 0 não encontrou um H1 confiável)
  if (title === 'Sem nome') {
    const lines = content.split('\n');
    const cocktalNamePattern = /^([A-Z][a-z]*(?:\s+[A-Z][a-z]*)*(?:\s+Cocktail|\s+Drink)?)\s*$/;

    for (let i = 0; i < Math.min(30, lines.length); i++) {
      const line = lines[i].trim();
      if (line.length > 5 && line.length < 60) {
        const match = line.match(cocktalNamePattern);
        if (match) {
          title = match[1];
          console.log('[Parser] Found cocktail name in text:', title);
          break;
        }
      }
    }
  }

  // Strategy 2: If not found, look for headings that are actual recipe names (not sections)
  if (title === 'Sem nome') {
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

    // Skip obvious section headers
    const sectionPatterns = /^(why|what|how|jump|back|home|menu|recipe|ingredients|instructions|preparation|method|notes?|suggested|equipment|garnish|serving)/i;

    for (const heading of headings) {
      if (heading.text.length > 5 &&
        heading.text.length < 80 &&
        !sectionPatterns.test(heading.text)) {
        title = heading.text;
        console.log('[Parser] Found recipe heading:', title);
        break;
      }
    }
  }

  // Extract ingredients section (entre o heading "Ingredients"/"Ingredientes" e o
  // próximo heading de nível igual ou mais alto — um heading de nível mais baixo
  // é um sub-rótulo dentro da própria seção, não o fim dela). Aceita qualquer
  // nível de heading (#, ##, #####...) e o nome da seção em inglês ou português.
  const ingredientsSection = extractSection(content, 'Ingredients|Ingredientes');
  let ingredients: string[] = [];

  if (ingredientsSection) {
    // Extract only lines with format "- X oz Ingredient" or similar
    const bulletLines = ingredientsSection.match(/^-\s+(.+?)(?:\n|$)/gm) || [];
    // Alguns sites listam os ingredientes como linhas soltas, sem marcador "-"
    const rawLines = bulletLines.length > 0
      ? bulletLines.map(line => line.replace(/^-\s+/, ''))
      : ingredientsSection.split('\n').map(line => line.trim()).filter(Boolean);

    ingredients = rawLines
      .map(line => {
        let cleaned = line.trim()
        // Remove markdown links: [text](url) → " text " (com espaços, depois
        // colapsados), pois alguns sites colam o link direto no texto vizinho
        // sem espaço (ex: "1[orange](url)squeeze" viraria "1orangesqueeze"
        // se só tirássemos os colchetes)
        cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, ' $1 ').replace(/\s+/g, ' ').trim()
        // Insere espaço entre número/unidade/nome quando vêm colados (ex:
        // "2ozbourbon" → "2 oz bourbon", comum em alguns cards de receita)
        cleaned = cleaned
          .replace(/(\d)(oz|ml|cl|cups?|tbsp|tsp|dash(?:es)?|pinch(?:es)?|drops?)\b/gi, '$1 $2')
          // Só oz/ml/cl aqui (não dash/pinch/cup...): essas unidades não têm forma
          // plural "...es"/"...s" que seria prefixo de outra forma válida, o que
          // faria o regex (que exige letra logo depois, não um \b) confundir
          // "dashes " já bem espaçado com "dash" + "es" "colado" por engano.
          .replace(/\b(oz|ml|cl)([a-zà-ú])/gi, '$1 $2')
        return cleaned
      })
      .filter(line => {
        // Filter out links, images, sub-headings and short/boilerplate text
        return line.length > 3 &&
               !line.startsWith('[') &&
               !line.startsWith('!') &&
               !/^#{1,6}\s/.test(line) &&
               !line.toLowerCase().includes('see also') &&
               !line.toLowerCase().includes('veja também') &&
               !line.toLowerCase().includes('affiliate');
      });
  }

  console.log('[Parser] Final title:', title);
  // Aceita qualquer nível de heading e o nome da seção em inglês ou português
  const instructionsSection = extractSection(content, 'Modo de Preparo|Preparo|Preparação|Instructions?|Preparation|Method');

  console.log('[Parser] Ingredient count:', ingredients.length);

  const rawInstructionsFull = instructionsSection || content.substring(0, 500);
  const rawInstructions = stripInstructionsBoilerplate(rawInstructionsFull);
  const method = detectMethod(rawInstructions);

  // Converte itens de lista ("- Pour...", "1. Pour...", "Step 1: Pour...") em uma lista
  // de passos separados (um por linha), removendo marcações markdown (links, negrito,
  // itálico), o rótulo "Step N:"/numeração própria (a interface já numera cada passo)
  // e linhas de navegação/compartilhamento
  const instructionSteps = rawInstructions
    .split('\n')
    .map(line => line.trim())
    // remove linhas que são só imagem/link de imagem (ex: banners promocionais
    // de cursos), que não viram texto útil mesmo após remover a marcação markdown
    .filter(line => !/^\[?!\[/.test(line))
    // remove sub-headings dentro da própria seção (ex: "#### Toasted Marshmallow
    // Syrup:"), que agora ficam no conteúdo capturado por extractSection()
    .filter(line => !/^#{1,6}\s/.test(line))
    .map(line => line
      .replace(/^\s*(?:[-*•]+|\d+[.)])\s*/, '')       // remove marcadores de lista
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')          // links markdown -> apenas o texto
      .replace(/\*\*([^*]+)\*\*/g, '$1')                 // negrito
      .replace(/\*([^*]+)\*/g, '$1')                     // itálico
      .replace(/^step\s*\d+\s*[:.)]?\s*/i, '')           // remove rótulo "Step 1:" / "Step 1."
      .trim())
    .filter(Boolean)
    .filter(line => !/^(?:pin|save|salvar|share|flip|tweet|print recipe|rate recipe|jump to recipe)$/i.test(line))
    // Quando o site descreve o preparo inteiro em um único parágrafo (várias
    // frases numa linha só), separa cada frase em um passo individual
    .flatMap(line => line.split(/(?<=[.!?])\s+(?=[A-ZÀ-Ý0-9])/))
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => (/[.!?]$/.test(line) ? line : `${line}.`));

  // Traduz ingredientes e cada passo do preparo individualmente
  const translatedIngredients = ingredients.map(ing => translateIngredient(ing));
  const translatedInstructionSteps = instructionSteps.map(step => capitalizeSentences(translatePortuguese(step)));

  return {
    title,
    ingredients: translatedIngredients,
    preparation: translatedInstructionSteps,
    category: 'Sem categoria',
    method,
    notes: '',
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
