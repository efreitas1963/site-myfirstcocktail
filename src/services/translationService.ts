// Dicionário de tradução inglês → português para receitas
const translations: [RegExp, string][] = [
  // Multi-word phrases (longer first to avoid partial replacements)
  [/measure all ingredients and/gi, 'meça todos os ingredientes e'],
  [/into wine glass/gi, 'em copo de vinho'],
  [/orange wedge/gi, 'fatia de laranja'],
  [/orange slice/gi, 'fatia de laranja'],
  [/soda water/gi, 'água com gás'],
  [/cranberry juice/gi, 'suco de cranberry'],
  [/ancho reyes/gi, 'Ancho Reyes'],
  [/serve immediately/gi, 'sirva imediatamente'],
  [/fill with/gi, 'encha com'],
  [/top with/gi, 'complete com'],
  [/garish with/gi, 'decore com'],
  [/cocktail glass/gi, 'copo de coquetel'],
  [/wine glass/gi, 'copo de vinho'],
  [/to taste/gi, 'a gosto'],
  [/to top/gi, 'para completar'],

  // Single words
  [/\bMeasure\b/g, 'Meça'],
  [/\bmeasure\b/g, 'meça'],
  [/\bingredients\b/gi, 'ingredientes'],
  [/\binto\b/gi, 'em'],
  [/\bice\b/gi, 'gelo'],
  [/\bfresh\b/gi, 'fresco'],
  [/\bjuice\b/gi, 'suco'],
  [/\bslice\b/gi, 'fatia'],
  [/\bwedge\b/gi, 'fatia'],
  [/\bgarish\b/gi, 'guarnição'],
  [/\bglass\b/gi, 'copo'],
  [/\bshake\b/gi, 'agite'],
  [/\bstir\b/gi, 'mexa'],
  [/\bstrain\b/gi, 'coe'],
  [/\bpour\b/gi, 'despeje'],
  [/\bserve\b/gi, 'sirva'],
  [/\badd\b/gi, 'adicione'],
  [/\band\b/gi, 'e'],
];

export function translatePortuguese(text: string): string {
  if (!text) return text;

  let translated = text;

  // Apply translations in order
  for (const [pattern, replacement] of translations) {
    translated = translated.replace(pattern, replacement);
  }

  return translated;
}

export function translateIngredient(ingredient: string): string {
  // Mantém medida, traduz apenas o nome
  const match = ingredient.match(/^([\d.\s\w/]+?)\s+(.+)$/);
  if (!match) return ingredient;

  const [, measure, name] = match;
  const translatedName = translatePortuguese(name);

  return `${measure} ${translatedName}`.trim();
}
