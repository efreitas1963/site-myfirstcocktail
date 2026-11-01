// Extrai TODOS os dados: recipes, ingredients, glasses, liqueurs, syrups
import fs from 'fs';

const backupPath = 'C:\\xampp\\htdocs\\mycocktail\\backup.sql';
const sqlContent = fs.readFileSync(backupPath, 'utf8');

function removeQuotes(str) {
  if (typeof str !== 'string') return str;
  if (str.startsWith("'") && str.endsWith("'")) {
    return str.slice(1, -1);
  }
  return str;
}

function unescapeJSON(str) {
  let result = str.replace(/\\\\"/g, '\\"');
  result = result.replace(/\\"/g, '"');
  return result;
}

function extractTable(tableName, fieldCount, fieldNames) {
  const regex = new RegExp(`INSERT INTO \`${tableName}\` VALUES \\(([\\s\\S]*?)\\);`, 'i');
  const match = sqlContent.match(regex);

  if (!match) {
    console.log(`⚠️  Tabela ${tableName} não encontrada`);
    return [];
  }

  const allData = match[1];
  const lines = allData.split('),(');
  const records = [];

  lines.forEach((line, idx) => {
    try {
      if (idx === 0) line = line.substring(1);
      if (idx === lines.length - 1) line = line.slice(0, -1);

      const fields = [];
      let current = '';
      let inQuote = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === "'" && (i === 0 || line[i - 1] !== '\\')) {
          inQuote = !inQuote;
          current += char;
        } else if (char === ',' && !inQuote) {
          fields.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      if (current) fields.push(current.trim());

      if (fields.length >= fieldCount) {
        const record = {};
        fieldNames.forEach((name, idx) => {
          if (idx >= fields.length) return;

          let value = fields[idx];

          // Tenta fazer parse como JSON se começar com [
          if (typeof value === 'string' && value.startsWith("'[")) {
            try {
              const unquoted = removeQuotes(value);
              const unescaped = unescapeJSON(unquoted);
              value = JSON.parse(unescaped);
            } catch (e) {
              value = removeQuotes(value);
            }
          } else if (typeof value === 'string' && (value === '0' || value === '1')) {
            value = value === '1';
          } else if (!isNaN(value) && value !== '') {
            value = parseInt(value) || value;
          } else {
            value = removeQuotes(value);
          }

          record[name] = value;
        });

        records.push(record);
      }
    } catch (e) {
      // Ignora
    }
  });

  return records;
}

// RECIPES (12 campos: id, title, description, ingredients, instructions, garnish, method, category, imageUrl, author, isFavorite, createdAt)
const recipes = extractTable('recipes', 12, [
  'id', 'title', 'description', 'ingredients', 'instructions', 'garnish', 'method', 'category', 'imageUrl', 'author', 'isFavorite', 'createdAt'
]);

// GLASSES (6 campos: id, name, technicalName, capacityOz, capacityMl, imageUrl)
const glasses = extractTable('glasses', 6, [
  'id', 'name', 'technicalName', 'capacityOz', 'capacityMl', 'imageUrl'
]);

// INGREDIENTS (4 campos: id, name, type, description, imageUrl)
const ingredients = extractTable('ingredients', 5, [
  'id', 'name', 'type', 'description', 'imageUrl'
]);

// LIQUEURS (muitos campos - pega os primeiros importantes)
// id, name, ingredients, preparation, method, serving, flavor, strength, description, ...
const liqueurs = extractTable('liqueurs', 10, [
  'id', 'name', 'ingredients', 'preparation', 'method', 'serving', 'flavor', 'strength', 'description', 'imageUrl'
]);

// SYRUPS (muitos campos também)
// id, name, ingredients, preparation, quantity, storageTime, flavor, description, ...
const syrups = extractTable('syrups', 10, [
  'id', 'name', 'ingredients', 'preparation', 'quantity', 'storageTime', 'flavor', 'description', 'imageUrl', 'extra'
]);

// Salva JSONs
fs.writeFileSync('./public/recipes.json', JSON.stringify(recipes, null, 2));
fs.writeFileSync('./public/glasses.json', JSON.stringify(glasses, null, 2));
fs.writeFileSync('./public/ingredients.json', JSON.stringify(ingredients, null, 2));
fs.writeFileSync('./public/liqueurs.json', JSON.stringify(liqueurs, null, 2));
fs.writeFileSync('./public/syrups.json', JSON.stringify(syrups, null, 2));

console.log('✅ Dados extraídos com sucesso:\n');
console.log(`📗 Recipes:     ${recipes.length} receitas`);
console.log(`🥃 Glasses:     ${glasses.length} tipos de copo`);
console.log(`🥬 Ingredients: ${ingredients.length} ingredientes`);
console.log(`🍷 Liqueurs:    ${liqueurs.length} licores`);
console.log(`🍯 Syrups:      ${syrups.length} xaropes`);

if (recipes[0]) {
  console.log(`\n📗 ${recipes[0].title} - ${recipes[0].ingredients?.length || 0} ingredientes, ${recipes[0].instructions?.length || 0} passos`);
}

if (ingredients[0]) {
  console.log(`🥬 ${ingredients[0].name} - ${ingredients[0].type}`);
}

if (liqueurs[0]) {
  console.log(`🍷 ${liqueurs[0].name}`);
}

if (syrups[0]) {
  console.log(`🍯 ${syrups[0].name}`);
}

if (glasses[0]) {
  console.log(`🥃 ${glasses[0].name} - ${glasses[0].capacityMl}`);
}
