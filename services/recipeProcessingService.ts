// Recipe processing: convert units, parse ingredients, download images
import { IngredientItem } from '../types';

// Conversion rates to ml
const UNIT_TO_ML: Record<string, number> = {
  'oz': 30,      // 1 oz = 30 ml
  'ml': 1,
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
 * Parse ingredient string into name and measure
 * Examples:
 *   "1.5 oz Aperol" → {name: "Aperol", measure: "45 ml"}
 *   "Prosecco to top" → {name: "Prosecco", measure: "to top"}
 *   "Fresh lime juice" → {name: "Fresh lime juice", measure: ""}
 */
export function parseIngredient(ingredientStr: string): ParsedIngredient {
  if (!ingredientStr || typeof ingredientStr !== 'string') {
    return { name: '', measure: '' };
  }

  const trimmed = ingredientStr.trim();

  // Pattern: "number unit name" (e.g., "1.5 oz Aperol", "2 tbsp lime juice")
  const numberUnitMatch = trimmed.match(/^([\d.]+)\s+(oz|ml|cup|tbsp|tsp|dash|pinch|drop)\s+(.+)$/i);
  if (numberUnitMatch) {
    const amount = parseFloat(numberUnitMatch[1]);
    const unit = numberUnitMatch[2].toLowerCase();
    const name = numberUnitMatch[3].trim();

    // Convert oz to ml if needed
    let measure = `${amount} ${unit}`;
    if (unit === 'oz') {
      const mlAmount = (amount * UNIT_TO_ML[unit]).toFixed(0);
      measure = `${mlAmount} ml`;
    }

    return { name, measure };
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
    return { name: ingredientName, measure: 'completar' };
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
  return { name: cleanedIngredient, measure: '' };
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
    const filename = `${safeName}${ext}`;

    console.log('[Image] Downloaded successfully:', filename, 'Size:', blob.size);

    // Return path where image should be stored
    // Note: In a real app, you would upload blob to Supabase Storage
    // For now, just return the path and let frontend handle it
    const imagePath = `/uploads/recipes/${filename}`;
    console.log('[Image] Image path:', imagePath);

    return imagePath;
  } catch (error) {
    console.error('[Image] Error downloading image:', error);
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

  const translations: Record<string, string> = {
    'lime wheel': 'rodela de limão',
    'lemon wheel': 'rodela de limão',
    'lime wedge': 'fatia de limão',
    'lemon wedge': 'fatia de limão',
    'orange wheel': 'rodela de laranja',
    'orange wedge': 'fatia de laranja',
    'orange slice': 'fatia de laranja',
    'mint leaf': 'folha de hortelã',
    'mint sprig': 'ramo de hortelã',
    'cherry': 'cereja',
    'olive': 'azeitona',
    'salt rim': 'borda de sal',
    'sugar rim': 'borda de açúcar',
    'cinnamon': 'canela',
  };

  const lower = garnish.toLowerCase();

  // Check for exact matches
  for (const [english, portuguese] of Object.entries(translations)) {
    if (lower.includes(english)) {
      return garnish.replace(new RegExp(english, 'i'), portuguese);
    }
  }

  // If no exact match, just clean up the text
  return garnish
    .replace(/\s+(?:for\s+)?(?:garnish|rim).*$/i, '')
    .trim();
}
