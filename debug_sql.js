import fs from 'fs';

const backupPath = 'C:\\xampp\\htdocs\\mycocktail\\backup.sql';
const sqlContent = fs.readFileSync(backupPath, 'utf8');

const recipesMatch = sqlContent.match(/INSERT INTO `recipes` VALUES \(([\s\S]*?)\);/);
const allRecipes = recipesMatch[1];

// Pega primeira receita
const firstRecipe = allRecipes.split('),(')[0].substring(1);

console.log('PRIMEIRA RECEITA (primeiros 2000 chars):');
console.log(firstRecipe.substring(0, 2000));

// Conta quantos campos tem
let fields = 0;
let inQuote = false;

for (let i = 0; i < firstRecipe.length; i++) {
  if (firstRecipe[i] === "'" && firstRecipe[i - 1] !== '\\') {
    inQuote = !inQuote;
  }
  if (firstRecipe[i] === ',' && !inQuote) {
    fields++;
  }
}

console.log('\n\nTotal de campos: ' + (fields + 1));
