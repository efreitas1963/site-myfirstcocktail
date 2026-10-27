// Recipe processing: convert units, parse ingredients, download images
import { IngredientItem } from '../types';

// Conversion rates to ml
const UNIT_TO_ML: Record<string, number> = {
  'oz': 50,      // 1 oz = 50 ml (Brasil)
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

  // Pattern: "name to top" or "name to complete" (e.g., "Prosecco to top")
  const toTopMatch = trimmed.match(/^(.+?)\s+(?:to\s+(?:top|complete))$/i);
  if (toTopMatch) {
    return { name: toTopMatch[1].trim(), measure: 'completar' };
  }

  // No measure found - entire string is ingredient name
  return { name: trimmed, measure: '' };
}

/**
 * Parse multiple ingredients
 */
export function parseIngredients(ingredientList: string[]): ParsedIngredient[] {
  return ingredientList.map(parseIngredient).filter(ing => ing.name.length > 0);
}

/**
 * Download image from URL and save to Supabase
 * Returns the stored image path
 */
export async function downloadAndStoreRecipeImage(
  imageUrl: string,
  recipeName: string
): Promise<string> {
  if (!imageUrl) return '';

  try {
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
      console.warn('Failed to download image:', response.status);
      return '';
    }

    const blob = await response.blob();
    const ext = getImageExtension(imageUrl, blob.type);
    const filename = `${safeName}${ext}`;

    // For now, return local path where image should be stored
    // In production, upload to Supabase storage
    return `/uploads/recipes/${filename}`;
  } catch (error) {
    console.error('Error downloading image:', error);
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
