// Extrai receitas do backup.sql e gera JSON
import fs from 'fs';
import path from 'path';

const backupPath = 'C:\\xampp\\htdocs\\mycocktail\\backup.sql';
const sqlContent = fs.readFileSync(backupPath, 'utf8');

// Encontra a linha com INSERT INTO recipes
const recipesMatch = sqlContent.match(/INSERT INTO `recipes` VALUES \(([\s\S]*?)\);/);
if (!recipesMatch) {
  console.error('Não encontrou recipes no SQL');
  process.exit(1);
}

const recipesData = recipesMatch[1];

// Parse das linhas de receita
const lines = recipesData.split('),(');
const recipes = [];

lines.forEach((line, idx) => {
  try {
    // Remove parênteses extras
    if (idx === 0) line = line.substring(1);
    if (idx === lines.length - 1) line = line.slice(0, -1);

    // Split por vírgula (cuidado com strings)
    const parts = [];
    let current = '';
    let inQuotes = false;
    let inJson = false;
    let brackets = 0;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === "'" && (i === 0 || line[i-1] !== '\\')) {
        inQuotes = !inQuotes;
      }
      if (char === '[' && inQuotes) brackets++;
      if (char === ']' && inQuotes) brackets--;

      if (char === ',' && !inQuotes && brackets === 0) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current) parts.push(current.trim());

    if (parts.length >= 11) {
      const id = parts[0];
      const title = parts[1].slice(1, -1); // Remove quotes
      const description = parts[2].slice(1, -1);
      const ingredientsRaw = parts[3];
      const instructionsRaw = parts[4];
      const garnish = parts[5].slice(1, -1);
      const method = parts[6].slice(1, -1);
      const category = parts[7].slice(1, -1);
      const imageUrl = parts[8].slice(1, -1);
      const author = parts[9].slice(1, -1);
      const isFavorite = parts[10] === '0' ? false : true;
      const createdAt = parseInt(parts[11]) || Date.now();

      // Parse JSON arrays
      let ingredients = [];
      let instructions = [];

      try {
        ingredients = JSON.parse(ingredientsRaw);
      } catch (e) {
        ingredients = [];
      }

      try {
        instructions = JSON.parse(instructionsRaw);
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
    console.error('Erro ao processar linha:', e.message);
  }
});

// Salva como JSON
const outputPath = './public/recipes.json';
fs.writeFileSync(outputPath, JSON.stringify(recipes, null, 2));

console.log(`✅ ${recipes.length} receitas extraídas e salvas em ${outputPath}`);
