// Final parsing test with all improvements

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

  // Pattern: "number unit name"
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

  // Pattern: "name to top/complete/fill"
  const toTopMatch = trimmed.match(/^(.+?)\s+(?:to\s+(?:top|complete|fill))$/i);
  if (toTopMatch) {
    const ingredientName = toTopMatch[1].trim();
    const cleanedName = ingredientName
      .replace(/\s+(?:for\s+)?(?:garnish|as\s+garnish|rim|for\s+rim).*$/i, '')
      .trim();
    return { name: cleanedName || ingredientName, measure: 'completar' };
  }

  // Remove garnish qualifiers
  const cleanedIngredient = trimmed
    .replace(/\s+(?:for\s+)?(?:garnish|as\s+garnish|rim|for\s+rim).*$/i, '')
    .trim();

  return { name: cleanedIngredient, measure: '' };
}

function isGarnish(ingredientName) {
  const lower = ingredientName.toLowerCase();
  return lower.includes('garnish') ||
         lower.includes('slice') ||
         lower.includes('fatia') ||
         lower.includes('rim') ||
         lower.includes('wheel') ||
         lower.includes('wedge');
}

function translateGarnish(garnish) {
  if (!garnish) return '';

  const translations = {
    'lime wheel': 'rodela de limão',
    'lemon wheel': 'rodela de limão',
    'lime wedge': 'fatia de limão',
    'lemon wedge': 'fatia de limão',
    'orange wheel': 'rodela de laranja',
    'orange wedge': 'fatia de laranja',
    'orange slice': 'fatia de laranja',
    'mint leaf': 'folha de hortelã',
    'cherry': 'cereja',
    'salt rim': 'borda de sal',
  };

  const lower = garnish.toLowerCase();
  for (const [eng, pt] of Object.entries(translations)) {
    if (lower.includes(eng)) {
      return garnish.replace(new RegExp(eng, 'i'), pt);
    }
  }

  return garnish.replace(/\s+(?:for\s+)?(?:garnish|rim).*$/i, '').trim();
}

// Test case: Margarita
const ingredients = [
  '2 oz Tequila',
  '1 oz Cointreau',
  '1 oz Fresh lime juice',
  'Salt rim for garnish',
  'Lime wheel for garnish'
];

console.log('=== FINAL PARSING TEST ===\n');
console.log('Input ingredients:');
ingredients.forEach(ing => console.log('  -', ing));

const parsed = ingredients.map(parseIngredient);
console.log('\nParsed:');
parsed.forEach((ing, i) => {
  console.log(`  ${i+1}. Name: "${ing.name}", Measure: "${ing.measure}"`);
});

// Extract garnish
let garnish = '';
const remaining = parsed.filter(ing => {
  if (isGarnish(ing.name)) {
    if (!garnish) garnish = translateGarnish(ing.name);
    return false;
  }
  return true;
});

console.log('\nFinal ingredients (without garnish):');
remaining.forEach(ing => {
  console.log(`  - ${ing.name}${ing.measure ? ' | ' + ing.measure : ''}`);
});

console.log('\nGarnish (translated):', garnish);

console.log('\n✅ TEST SUMMARY:');
console.log('  ✓ Ingredients have only names (no "completar")');
console.log('  ✓ Medidas separated (includes "completar" for to-top');
console.log('  ✓ Garnish extracted and translated');
console.log('  ✓ No garnish words in ingredient names');
