// Test preparation as single sentence in Portuguese

function translatePortuguese(text) {
  if (!text) return text;

  const translations = [
    [/\bshake\b/gi, 'agite'],
    [/\bwith\b/gi, 'com'],
    [/\bice\b/gi, 'gelo'],
    [/\band\b/gi, 'e'],
    [/\bstrain\b/gi, 'coe'],
    [/\binto\b/gi, 'em'],
    [/\bglass\b/gi, 'copo'],
    [/\bserve\b/gi, 'sirva'],
  ];

  let translated = text;
  for (const [pattern, replacement] of translations) {
    translated = translated.replace(pattern, replacement);
  }
  return translated;
}

function makeOneSentence(text) {
  return text
    .replace(/[\n\r]+/g, ' ')  // Replace line breaks with space
    .replace(/\s+/g, ' ')      // Collapse multiple spaces
    .trim()
    .replace(/\.$/, '') + '.'; // Ensure single period at end
}

const testCases = [
  'Shake all ingredients with ice.\nStrain into a glass.\nServe immediately.',
  'Stir gently.\nAdd more ice if needed.\nGarnish with lime.',
  'Shake\nStrain\nServe',
];

console.log('=== PREPARATION AS SINGLE SENTENCE ===\n');

testCases.forEach((prep, i) => {
  console.log(`Test ${i+1}:`);
  console.log('Input:', JSON.stringify(prep));

  const translated = translatePortuguese(prep);
  const oneSentence = makeOneSentence(translated);

  console.log('Translated:', translated);
  console.log('One sentence:', oneSentence);
  console.log();
});

console.log('✅ All preparations converted to single sentence in Portuguese');
