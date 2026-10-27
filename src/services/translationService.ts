// Dicionário simples de tradução inglês → português
const translations: Record<string, string> = {
  // Spirits
  'aperol': 'Aperol',
  'prosecco': 'Prosecco',
  'soda water': 'água com gás',
  'cranberry juice': 'suco de cranberry',
  'ancho reyes': 'Ancho Reyes',
  'orange slice': 'fatia de laranja',
  'garnish': 'guarnição',
  'glass': 'copo',
  'shaken': 'agitado',
  'stirred': 'mexido',
  'built': 'montado',

  // Instructions
  'shake': 'agite',
  'stir': 'mexa',
  'strain': 'coe',
  'pour': 'despeje',
  'top with': 'complete com',
  'fill': 'encha',
  'serve': 'sirva',
  'add': 'adicione',
  'ice': 'gelo',
  'fresh': 'fresco',
  'juice': 'suco',
  'oz': 'oz',
  'ml': 'ml',
};

export function translatePortuguese(text: string): string {
  if (!text) return text;

  let translated = text;

  // Traduz palavras-chave conhecidas
  Object.entries(translations).forEach(([en, pt]) => {
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    translated = translated.replace(regex, pt);
  });

  return translated;
}

// Traduz apenas ingredientes
export function translateIngredient(ingredient: string): string {
  // Mantém medida, traduz apenas o nome
  // "1.5 oz Aperol" → "1.5 oz Aperol" (nomes próprios não traduz)
  // Mas traduz nomes comuns

  const match = ingredient.match(/^([\d.\s\w/]+?)\s+(.+)$/);
  if (!match) return ingredient;

  const [, measure, name] = match;
  const translatedName = translatePortuguese(name);

  return `${measure} ${translatedName}`.trim();
}
