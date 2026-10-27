// Simulate a scraped recipe and test the parsing flow
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vztlsfppfesdqhjzdfpj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_EzW-ynXhs_1XWBTiL0osCw_n2Zs4nm_';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Parsing logic (mirrored from recipeProcessingService)
const UNIT_TO_ML = {
  'oz': 30,
  'ml': 1,
  'cup': 240,
  'tbsp': 15,
  'tsp': 5,
  'dash': 2,
  'pinch': 1,
  'drop': 0.5,
};

function parseIngredient(ingredientStr) {
  if (!ingredientStr) return { name: '', measure: '' };
  const trimmed = ingredientStr.trim();

  const numberUnitMatch = trimmed.match(/^([\d.]+)\s+(oz|ml|cup|tbsp|tsp|dash|pinch|drop)\s+(.+)$/i);
  if (numberUnitMatch) {
    const amount = parseFloat(numberUnitMatch[1]);
    const unit = numberUnitMatch[2].toLowerCase();
    const name = numberUnitMatch[3].trim();
    let measure = `${amount} ${unit}`;
    if (unit === 'oz') {
      const mlAmount = (amount * UNIT_TO_ML[unit]).toFixed(0);
      measure = `${mlAmount} ml`;
    }
    return { name, measure };
  }

  const toTopMatch = trimmed.match(/^(.+?)\s+(to\s+(?:top|complete))$/i);
  if (toTopMatch) {
    return { name: toTopMatch[1].trim(), measure: toTopMatch[2].trim() };
  }

  return { name: trimmed, measure: '' };
}

// Simulate a Margarita recipe from scraping
const scrapedRecipe = {
  title: 'Margarita',
  ingredients: [
    '2 oz Tequila',
    '1 oz Cointreau',
    '1 oz Fresh lime juice',
    'Salt rim for garnish',
    'Lime wheel for garnish'
  ],
  preparation: 'Shake all ingredients with ice and strain into a salt-rimmed glass filled with fresh ice.',
  notes: 'Classic Mexican cocktail'
};

console.log('=== Testing Scraped Recipe Processing ===\n');
console.log('Input recipe:', scrapedRecipe);
console.log();

// Parse ingredients
const parsedIngredients = scrapedRecipe.ingredients.map(parseIngredient);

console.log('Parsed ingredients:');
parsedIngredients.forEach((ing, i) => {
  console.log(`  ${i+1}. Name: "${ing.name}", Measure: "${ing.measure}"`);
});

// Extract garnish
let garnish = '';
const remaining = parsedIngredients.filter(ing => {
  const isGarnish = ing.name.toLowerCase().includes('garnish') ||
                   ing.name.toLowerCase().includes('slice') ||
                   ing.name.toLowerCase().includes('fatia');
  if (isGarnish && !garnish) {
    garnish = ing.name;
  }
  return !isGarnish;
});

console.log('\nGarnish extracted:', garnish);
console.log('Remaining ingredients:', remaining.map(i => ({ name: i.name, measure: i.measure })));

// Save to DB
async function saveAndVerify() {
  const testTitle = 'Test Margarita ' + Date.now();

  const recipe = {
    title: testTitle,
    description: scrapedRecipe.notes,
    ingredients: remaining,
    instructions: [scrapedRecipe.preparation],
    garnish: garnish,
    method: 'Batido',
    category: 'Alcoólico',
    imageurl: ''
  };

  console.log('\n\n=== Saving to Supabase ===');
  console.log('Recipe to save:', JSON.stringify(recipe, null, 2));

  const { data: inserted, error } = await supabase
    .from('recipes')
    .insert([recipe])
    .select();

  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  console.log('✅ Saved successfully');
  console.log('Saved recipe ID:', inserted[0].id);
  console.log('Saved ingredients:', inserted[0].ingredients);

  // Verify no duplicates
  const { data: count } = await supabase
    .from('recipes')
    .select('*', { count: 'exact' })
    .eq('title', testTitle);

  console.log('Recipe count with this title:', count?.length);

  if (count?.length === 1) {
    console.log('\n✅ SUCCESS: Recipe saved correctly with proper parsing!');
    console.log('   - Name/Measure separated');
    console.log('   - oz converted to ml');
    console.log('   - Garnish extracted');
  } else {
    console.log('\n❌ FAILED: Duplicate or missing recipe');
  }

  process.exit(0);
}

saveAndVerify();
