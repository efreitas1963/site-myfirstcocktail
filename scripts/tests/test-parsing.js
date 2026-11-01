import { parseIngredient } from './services/recipeProcessingService.ts';

const testCases = [
  '1.5 oz Aperol',
  '2 oz Prosecco',
  '0.5 oz Fresh lime juice',
  '1 tbsp Simple syrup',
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
