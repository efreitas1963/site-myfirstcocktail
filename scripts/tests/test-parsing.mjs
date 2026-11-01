// Test ingredient parsing logic directly

const UNIT_TO_ML = {
  'oz': 30,      // 1 oz = 30 ml
  'ml': 1,
  'cup': 240,
  'tbsp': 15,
  'tsp': 5,
  'dash': 2,
  'pinch': 1,
  'drop': 0.5,
};

function parseIngredient(ingredientStr) {
  if (!ingredientStr || typeof ingredientStr !== 'string') {
    return { name: '', measure: '' };
  }

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

  // Pattern: "name to top/complete"
  const toTopMatch = trimmed.match(/^(.+?)\s+(?:to\s+(?:top|complete))$/i);
  if (toTopMatch) {
    return { name: toTopMatch[1].trim(), measure: 'completar' };
  }

  // No measure found
  return { name: trimmed, measure: '' };
}

const testCases = [
  '1.5 oz Aperol',
  '2 oz Prosecco',
  '0.5 oz Fresh lime juice',
  '1 tbsp Simple syrup',
  '45 ml Vodka',
  'Prosecco to top',
  'Soda water to complete',
  'Fresh mint',
  'Orange slice',
  'Lime wedge for garnish'
];

console.log('=== Testing Ingredient Parsing ===\n');

testCases.forEach(test => {
  const result = parseIngredient(test);
  console.log(`Input: "${test}"`);
  console.log(`  → Name: "${result.name}"`);
  console.log(`  → Measure: "${result.measure}"`);
  console.log();
});
