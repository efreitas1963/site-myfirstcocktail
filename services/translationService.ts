// Dicionário de tradução inglês → português para receitas
const translations: [RegExp, string][] = [
  // Garnish words (alta prioridade antes de single words)
  // "garnish with" (uso como verbo) precisa vir antes da regra de substantivo abaixo
  [/garnish with/gi, 'decore com'],
  [/\bgarnish\b/gi, 'guarnição'],
  [/for garnish/gi, 'para guarnição'],
  [/as garnish/gi, 'como guarnição'],

  // Multi-word phrases (longer first to avoid partial replacements)
  [/measure all ingredients and/gi, 'meça todos os ingredientes e'],
  [/into wine glass/gi, 'em copo de vinho'],
  [/orange wedge/gi, 'fatia de laranja'],
  [/orange slice/gi, 'fatia de laranja'],
  [/lime wedge/gi, 'fatia de limão'],
  [/lime slice/gi, 'fatia de limão'],
  [/lemon wedge/gi, 'fatia de limão'],
  [/lemon slice/gi, 'fatia de limão'],
  [/grapefruit wedge/gi, 'fatia de grapefruit'],
  [/grapefruit slice/gi, 'fatia de grapefruit'],
  [/mint leaf/gi, 'folha de hortelã'],
  [/soda water/gi, 'água com gás'],
  [/cranberry juice/gi, 'suco de cranberry'],
  [/lemon juice/gi, 'suco de limão'],
  [/lime juice/gi, 'suco de limão'],
  [/orange juice/gi, 'suco de laranja'],
  [/grapefruit juice/gi, 'suco de grapefruit'],
  [/demerara syrup/gi, 'xarope de demerara'],
  [/simple syrup/gi, 'xarope simples'],
  [/grenadine syrup/gi, 'xarope de grenadine'],
  [/maple syrup/gi, 'xarope de bordo'],
  [/agave syrup/gi, 'xarope de agave'],
  [/cocktail shaker/gi, 'coqueteleira'],
  [/crushed ice/gi, 'gelo picado'],
  [/double strain/gi, 'coe duas vezes'],
  [/food coloring/gi, 'corante alimentício'],
  [/evenly combined/gi, 'bem misturado'],
  [/ancho reyes/gi, 'Ancho Reyes'],
  [/serve immediately/gi, 'sirva imediatamente'],
  [/fill with/gi, 'encha com'],
  [/top with/gi, 'complete com'],
  [/cocktail glass/gi, 'copo de coquetel'],
  [/wine glass/gi, 'copo de vinho'],
  [/to taste/gi, 'a gosto'],
  [/to top/gi, 'para completar'],

  // Single words (longer patterns first to avoid partial replacements)
  [/\bMeasure\b/g, 'Meça'],
  [/\bmeasure\b/g, 'meça'],
  [/\bStep\b/g, 'Passo'],
  [/\bstep\b/g, 'passo'],
  [/\bingredients\b/gi, 'ingredientes'],
  [/\benough\b/gi, 'suficiente'],
  [/\bwithout\b/gi, 'sem'],
  [/\bovercrowding\b/gi, 'superlotação'],
  [/\bchilled\b/gi, 'gelado'],
  [/\bchill\b/gi, 'gelar'],
  [/\bdrink\b/gi, 'bebida'],
  [/\bmixture\b/gi, 'mistura'],
  [/\bthoroughly\b/gi, 'bem'],
  [/\buntil\b/gi, 'até'],
  [/\bnearly\b/gi, 'quase'],
  [/\bfull\b/gi, 'cheio'],
  [/\binto\b/gi, 'em'],
  [/\bover\b/gi, 'sobre'],
  [/\bice\b/gi, 'gelo'],
  [/\bcrushed\b/gi, 'picado'],
  [/\bfresh\b/gi, 'fresco'],
  [/\bjuice\b/gi, 'suco'],
  [/\bsyrup\b/gi, 'xarope'],
  [/\bslice\b/gi, 'fatia'],
  [/\bwedge\b/gi, 'fatia'],
  [/\bglass\b/gi, 'copo'],
  [/\ball\b/gi, 'todos os'],
  [/\bwell\b/gi, 'bem'],
  [/\bmix\b/gi, 'misture'],
  [/\bdip\b/gi, 'molhe'],
  [/\bcombined\b/gi, 'combinado'],
  [/\bcombine\b/gi, 'combine'],
  [/\bprepared\b/gi, 'preparado'],
  [/\bprepare\b/gi, 'prepare'],
  [/\bhard\b/gi, 'vigorosamente'],
  [/\brim\b/gi, 'borda'],
  [/\bevenly\b/gi, 'uniformemente'],
  [/\bof\b/gi, 'de'],
  [/\bfor\b/gi, 'para'],
  [/\bhoney\b/gi, 'mel'],
  [/\bred\b/gi, 'vermelho'],
  [/\bwhite\b/gi, 'branco'],
  [/\bsugar\b/gi, 'açúcar'],
  [/\bwater\b/gi, 'água'],
  [/\bminutes?\b/gi, 'minutos'],
  [/\bheat\b/gi, 'fogo'],
  [/\bcontainer\b/gi, 'recipiente'],
  [/\bweeks?\b/gi, 'semanas'],
  [/\bflame\b/gi, 'chama'],
  [/\bsurface\b/gi, 'superfície'],
  [/\bseparate\b/gi, 'separado'],
  [/\blarge\b/gi, 'grande'],
  [/\bcube\b/gi, 'cubo'],
  [/\btoasted\b/gi, 'tostado'],
  [/\bseconds\b/gi, 'segundos'],
  [/\bshake\b/gi, 'agite'],
  [/\bstir\b/gi, 'mexa'],
  [/\bstrain\b/gi, 'coe'],
  [/\bpour\b/gi, 'despeje'],
  [/\bserve\b/gi, 'sirva'],
  [/\badd\b/gi, 'adicione'],
  [/\bwith\b/gi, 'com'],
  [/\bto\b/gi, 'para'],
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
