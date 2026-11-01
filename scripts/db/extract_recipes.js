// Extrai receitas do backup.sql - versão final
import fs from 'fs';

const backupPath = 'C:\\xampp\\htdocs\\mycocktail\\backup.sql';
const sqlContent = fs.readFileSync(backupPath, 'utf8');

const recipesMatch = sqlContent.match(/INSERT INTO `recipes` VALUES \(([\s\S]*?)\);/);
if (!recipesMatch) {
  console.error('Não encontrou recipes');
  process.exit(1);
}

const allRecipes = recipesMatch[1];
const recipeLines = allRecipes.split('),(');
const recipes = [];

recipeLines.forEach((recipeStr, idx) => {
  try {
    if (idx === 0) recipeStr = recipeStr.substring(1);
    if (idx === recipeLines.length - 1) recipeStr = recipeStr.slice(0, -1);

    // Parse campos respeitando aspas e conteúdo JSON
    const fields = [];
    let current = '';
    let inQuote = false;

    for (let i = 0; i < recipeStr.length; i++) {
      const char = recipeStr[i];

      // Detecta start/end de quote (não escapado)
      if (char === "'" && (i === 0 || recipeStr[i - 1] !== '\\')) {
        inQuote = !inQuote;
        current += char;
      } else if (char === ',' && !inQuote) {
        // Fim do campo
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current) fields.push(current.trim());

    if (fields.length === 12) {
      const id = fields[0];
      const title = removeQuotes(fields[1]);
      const description = removeQuotes(fields[2]);
      const ingredientsRaw = removeQuotes(fields[3]);
      const instructionsRaw = removeQuotes(fields[4]);
      const garnish = removeQuotes(fields[5]);
      const method = removeQuotes(fields[6]);
      const category = removeQuotes(fields[7]);
      const imageUrl = removeQuotes(fields[8]);
      const author = removeQuotes(fields[9]);
      const isFavorite = fields[10] === '0' ? false : true;
      const createdAt = parseInt(fields[11]) || Date.now();

      // Parse JSON com unescape
      let ingredients = [];
      let instructions = [];

      try {
        const unescapedIng = ingredientsRaw.replace(/\\"/g, '"');
        ingredients = JSON.parse(unescapedIng);
        if (!Array.isArray(ingredients)) ingredients = [];
      } catch (e) {
        ingredients = [];
      }

      try {
        // Unescape duplo: \\\" → \"  →  "
        let unescapedInst = instructionsRaw.replace(/\\\\"/g, '\\"');
        unescapedInst = unescapedInst.replace(/\\"/g, '"');
        instructions = JSON.parse(unescapedInst);
        if (!Array.isArray(instructions)) instructions = [];
      } catch (e) {
        instructions = [];
      }

      recipes.push({
        id: id.toString(),
        title,
        description,
        ingredients,
        instructions,
        garnish,
        method,
        category,
        imageUrl,
        author,
        isFavorite,
        createdAt
      });
    }
  } catch (e) {
    // Ignora
  }
});

function removeQuotes(str) {
  if (typeof str !== 'string') return str;
  if (str.startsWith("'") && str.endsWith("'")) {
    return str.slice(1, -1);
  }
  return str;
}

const outputPath = './public/recipes.json';
fs.writeFileSync(outputPath, JSON.stringify(recipes, null, 2));

console.log(`✅ ${recipes.length} receitas com dados completos`);
if (recipes[0]) {
  console.log(`\n${recipes[0].title}:`);
  console.log(`  - Ingredientes: ${recipes[0].ingredients.length}`);
  console.log(`  - Instruções: ${recipes[0].instructions.length}`);
  if (recipes[0].instructions[0]) {
    console.log(`  - Ex: "${recipes[0].instructions[0]}"`);
  }
}
