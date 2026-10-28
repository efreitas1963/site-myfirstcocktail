// Recipe processing: convert units, parse ingredients, download images
import { IngredientItem } from '../types';
import { uploadRecipeImage } from './supabaseService';

function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formata o campo "autor" para exibição: se for uma URL (receita importada
 * via scraper), mostra só o nome do site, sem protocolo, "www." ou caminho.
 * Ex: "https://mybartender.com/drinks/witch-doctor" → "mybartender"
 * Qualquer valor que não seja uma URL (ex: "Internet", nome digitado
 * manualmente) é retornado como veio.
 */
export function formatAuthorDisplay(author?: string | null): string {
  if (!author) return '';

  try {
    const url = new URL(author);
    const host = url.hostname.replace(/^www\./i, '');
    return host.split('.')[0];
  } catch {
    return author;
  }
}

// Conversion rates to ml
const UNIT_TO_ML: Record<string, number> = {
  'oz': 30,      // 1 oz = 30 ml
  'ml': 1,
  'cl': 10,      // 1 cl = 10 ml (comum em sites de receita em português/europeus)
  'cup': 240,
  'tbsp': 15,    // tablespoon
  'tsp': 5,      // teaspoon
  'dash': 2,
  'pinch': 1,
  'drop': 0.5,
};

interface ParsedIngredient {
  name: string;
  measure: string; // "30 ml", "1.5 oz", "to top", etc
}

/**
 * Converte uma quantidade em texto (decimal ou fração) para número.
 * Examples: "1.5" → 1.5, "1/2" → 0.5, "3/4" → 0.75
 */
function parseAmount(raw: string): number {
  const fraction = raw.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fraction) {
    return parseInt(fraction[1], 10) / parseInt(fraction[2], 10);
  }
  return parseFloat(raw);
}

/**
 * Parse ingredient string into name and measure
 * Examples:
 *   "1.5 oz Aperol" → {name: "Aperol", measure: "45 ml"}
 *   "1 oz. Rivi Gin" → {name: "Rivi Gin", measure: "30 ml"}
 *   "1/2 oz. Angostura Bitters" → {name: "Angostura Bitters", measure: "15 ml"}
 *   "Prosecco to top" → {name: "Prosecco", measure: "to top"}
 *   "Fresh lime juice" → {name: "Fresh lime juice", measure: ""}
 */
export function parseIngredient(ingredientStr: string): ParsedIngredient {
  if (!ingredientStr || typeof ingredientStr !== 'string') {
    return { name: '', measure: '' };
  }

  const trimmed = ingredientStr.trim();

  // Pattern: "number unit name" (e.g., "1.5 oz Aperol", "1 oz. Rivi Gin", "1/2 oz. Angostura Bitters")
  // O ponto após a unidade ("oz.") e frações ("1/2", "3/4") são opcionais.
  const numberUnitMatch = trimmed.match(/^(\d+(?:\.\d+)?(?:\s*\/\s*\d+)?)\s+(oz|ml|cl|cup|tbsp|tsp|dash|pinch|drop)\.?\s+(.+)$/i);
  if (numberUnitMatch) {
    const amount = parseAmount(numberUnitMatch[1]);
    const unit = numberUnitMatch[2].toLowerCase();
    const name = numberUnitMatch[3].trim();

    // Convert oz to ml if needed
    let measure = `${amount} ${unit}`;
    if (unit === 'oz') {
      const mlAmount = (amount * UNIT_TO_ML[unit]).toFixed(0);
      measure = `${mlAmount} ml`;
    }

    return { name: capitalizeFirst(name), measure };
  }

  // Pattern: "name to top" or "name to complete" or "name para completar" (e.g., "Prosecco to top", "Prosecco para completar")
  const toTopMatch = trimmed.match(/^(.+?)\s+(?:(?:to|para)\s+(?:top|complete|completar|fill))$/i);
  if (toTopMatch) {
    let ingredientName = toTopMatch[1].trim();
    // Remove words like "for garnish", "as garnish" from name
    ingredientName = ingredientName
      .replace(/\s+(?:para|for)\s+(?:guarnição|garnish|chilling|chill).*$/i, '')
      .replace(/\s+(?:until|to\s+chill|enough).*$/i, '')
      .trim();
    return { name: capitalizeFirst(ingredientName), measure: 'completar' };
  }

  // Remove garnish qualifiers and cooking instructions from ingredient name
  let cleanedIngredient = trimmed
    .replace(/^(?:enough\s+)/i, '')  // Remove "enough" prefix
    .replace(/\s+(?:para|for)\s+(?:guarnição|garnish).*$/i, '')  // Remove garnish suffix
    .replace(/\s+(?:to\s+)?(?:chill|thoroughly|without|overcrowding|chilling).*$/i, '')  // Remove cooking instructions
    .replace(/\s+(?:the\s+)?(?:drink|copo|glass).*$/i, '')  // Remove references to glass/drink
    .trim();

  // If nothing left, return original
  if (!cleanedIngredient) {
    cleanedIngredient = trimmed;
  }

  // No measure found - entire string is ingredient name
  return { name: capitalizeFirst(cleanedIngredient), measure: '' };
}

/**
 * Parse multiple ingredients
 */
export function parseIngredients(ingredientList: string[]): ParsedIngredient[] {
  return ingredientList.map(parseIngredient).filter(ing => ing.name.length > 0);
}

/**
 * Download image from URL and save to local folder
 * Returns the stored image path
 */
export async function downloadAndStoreRecipeImage(
  imageUrl: string,
  recipeName: string
): Promise<string> {
  if (!imageUrl) return '';

  try {
    console.log('[Image] Downloading from:', imageUrl);

    // Sanitize recipe name: remove spaces, special chars
    const safeName = recipeName
      .toLowerCase()
      .replace(/\s+/g, '-')           // spaces to dashes
      .replace(/[^a-z0-9-]/g, '')     // remove special chars
      .replace(/-+/g, '-')             // collapse multiple dashes
      .slice(0, 100);                  // max 100 chars

    // Download image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.warn('[Image] Failed to download:', response.status);
      return '';
    }

    const blob = await response.blob();
    const ext = getImageExtension(imageUrl, blob.type);
    const filename = `${safeName}-${Date.now()}${ext}`;

    console.log('[Image] Downloaded successfully:', filename, 'Size:', blob.size);

    const publicUrl = await uploadRecipeImage(blob, filename);
    console.log('[Image] Uploaded to Supabase Storage:', publicUrl);

    return publicUrl;
  } catch (error) {
    console.error('[Image] Error downloading/uploading image:', error);
    return '';
  }
}

/**
 * Determine image extension from URL or MIME type
 */
function getImageExtension(url: string, mimeType: string): string {
  // Try to get from URL first
  const urlPath = new URL(url, 'http://dummy').pathname;
  if (urlPath.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
    return urlPath.slice(urlPath.lastIndexOf('.'));
  }

  // Fall back to MIME type
  const mimeMap: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
  };
  return mimeMap[mimeType.toLowerCase()] || '.jpg';
}

/**
 * Translate garnish to Portuguese
 */
export function translateGarnish(garnish: string): string {
  if (!garnish) return '';

  // First remove all trailing qualifiers
  let clean = garnish
    .replace(/\s+(?:para|for)\s+(?:guarnição|garnish).*$/i, '')
    .replace(/\s+(?:em|in|como|as)\s+(?:garnish|guarnição).*$/i, '')
    .replace(/\s+fatia\s*$/i, '')  // Remove trailing "fatia"
    .replace(/\s+em\s+fatia.*$/i, '')  // Remove "em fatia"
    .trim();

  const lower = clean.toLowerCase();

  // Multi-word matches first
  if (lower.match(/orange\s+(?:slice|wedge|wheel|fatia)/i)) return 'fatia de laranja';
  if (lower.includes('orange slice') || lower.includes('orange wedge')) return 'fatia de laranja';
  if (lower.includes('orange wheel')) return 'rodela de laranja';

  if (lower.includes('lime slice') || lower.includes('lime wedge')) return 'fatia de limão';
  if (lower.includes('lime wheel')) return 'rodela de limão';

  if (lower.includes('lemon slice') || lower.includes('lemon wedge')) return 'fatia de limão';
  if (lower.includes('lemon wheel')) return 'rodela de limão';

  if (lower.includes('mint leaf')) return 'folha de hortelã';
  if (lower.includes('mint sprig')) return 'ramo de hortelã';

  if (lower.includes('salt rim')) return 'borda de sal';
  if (lower.includes('sugar rim')) return 'borda de açúcar';

  // Single fruit names
  if (lower.includes('orange')) return 'fatia de laranja';
  if (lower.includes('lime')) return 'fatia de limão';
  if (lower.includes('lemon')) return 'fatia de limão';
  if (lower.includes('cherry')) return 'cereja';
  if (lower.includes('olive')) return 'azeitona';
  if (lower.includes('cinnamon')) return 'canela';
  if (lower.includes('mint')) return 'hortelã';

  return clean;
}
