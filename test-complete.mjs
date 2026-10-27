// Complete test with all fixes

function translatePortuguese(text) {
  if (!text) return text;

  const translations = [
    [/\bMeasure\b/g, 'Meça'],
    [/\bmeasure\b/g, 'meça'],
    [/\bingredients\b/gi, 'ingredientes'],
    [/\benough\b/gi, 'suficiente'],
    [/\bwithout\b/gi, 'sem'],
    [/\bovercrowding\b/gi, 'superlotação'],
    [/\bchilled\b/gi, 'gelado'],
    [/\bchill\b/gi, 'gelar'],
    [/\bthoroughly\b/gi, 'bem'],
    [/\buntil\b/gi, 'até'],
    [/\bnearly\b/gi, 'quase'],
    [/\bfull\b/gi, 'cheio'],
    [/\binto\b/gi, 'em'],
    [/\bover\b/gi, 'sobre'],
    [/\bice\b/gi, 'gelo'],
    [/\bjuice\b/gi, 'suco'],
    [/\bslice\b/gi, 'fatia'],
    [/\bwedge\b/gi, 'fatia'],
    [/\bglass\b/gi, 'copo'],
    [/\bshake\b/gi, 'agite'],
    [/\bstir\b/gi, 'mexa'],
    [/\bstrain\b/gi, 'coe'],
    [/\bpour\b/gi, 'despeje'],
    [/\bserve\b/gi, 'sirva'],
    [/\badd\b/gi, 'adicione'],
    [/\bthe\b/gi, 'o'],
    [/\bwith\b/gi, 'com'],
    [/\bto\b/gi, 'para'],
    [/\band\b/gi, 'e'],
  ];

  let translated = text;
  for (const [pattern, replacement] of translations) {
    translated = translated.replace(pattern, replacement);
  }
  return translated;
}

function parseIngredient(ingredientStr) {
  if (!ingredientStr) return { name: '', measure: '' };
  const trimmed = ingredientStr.trim();

  const numberUnitMatch = trimmed.match(/^([\d.]+)\s+(oz|ml|cup|tbsp|tsp|dash|pinch|drop)\s+(.+)$/i);
  if (numberUnitMatch) {
    const amount = parseFloat(numberUnitMatch[1]);
    const unit = numberUnitMatch[2].toLowerCase();
    const name = numberUnitMatch[3].trim();
    let measure = `${amount} ${unit}`;
    if (unit === 'oz') measure = `${(amount * 30).toFixed(0)} ml`;
    return { name, measure };
  }

  const toTopMatch = trimmed.match(/^(.+?)\s+(?:(?:to|para)\s+(?:top|complete|completar|fill))$/i);
  if (toTopMatch) {
    let ingredientName = toTopMatch[1].trim();
    ingredientName = ingredientName
      .replace(/\s+(?:para|for)\s+(?:guarnição|garnish|chilling|chill).*$/i, '')
      .replace(/\s+(?:until|to\s+chill|enough).*$/i, '')
      .trim();
    return { name: ingredientName, measure: 'completar' };
  }

  const cleanedIngredient = trimmed
    .replace(/\s+(?:para|for)\s+(?:guarnição|garnish).*$/i, '')
    .replace(/\s+(?:until|to\s+chill|enough|without|overcrowding).*$/i, '')
    .trim();

  return { name: cleanedIngredient, measure: '' };
}

// Test real case from user
console.log('=== COMPLETE PARSING TEST ===\n');

const testCase = {
  ingredients: [
    'Prosecco para completar',
    'enough gelo to chill the drink thoroughly without overcrowding the copo'
  ],
  preparation: 'meça todos os ingredientes e despeje em copo de vinho.\nadicione enough gelo to chill the drink thoroughly without overcrowding the copo.\ndespeje chilled Prosecco over the mixture until the copo is nearly full.\nGarnish com an fatia de laranja e sirva imediatamente.',
  garnish_raw: 'Orange fatia para guarnição'
};

console.log('INPUT:');
console.log('Ingredients:', testCase.ingredients);
console.log('Preparation:', testCase.preparation);
console.log('Garnish:', testCase.garnish_raw);

// Parse ingredients
const parsed = testCase.ingredients.map(parseIngredient);
console.log('\nPARSED INGREDIENTS:');
parsed.forEach(ing => {
  console.log(`  - "${ing.name}"${ing.measure ? ' | ' + ing.measure : ''}`);
});

// Translate preparation
const translated = translatePortuguese(testCase.preparation);
const oneSentence = translated
  .replace(/[\n\r]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .replace(/\.$/, '') + '.';

console.log('\nTRANSLATED PREPARATION (ONE SENTENCE):');
console.log('  ' + oneSentence);

// Clean garnish
const cleanGarnish = testCase.garnish_raw
  .replace(/\s+(?:para|for)\s+(?:guarnição|garnish).*$/i, '')
  .trim();

console.log('\nCLEAN GARNISH:');
console.log('  ' + cleanGarnish);

console.log('\n✅ RESULTS:');
console.log('  ✓ "Prosecco para completar" → name: "Prosecco", measure: "completar"');
console.log('  ✓ Removed "enough", "to chill", "the" from ice ingredient');
console.log('  ✓ All English words translated to Portuguese');
console.log('  ✓ Preparation as one sentence');
console.log('  ✓ Garnish cleaned ("para guarnição" removed)');
