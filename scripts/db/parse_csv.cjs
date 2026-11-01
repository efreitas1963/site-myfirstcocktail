const fs = require('fs');
const csv = fs.readFileSync('my_cocktail_db.csv', 'utf-8');
const lines = csv.split('\n').filter(l => l.trim());

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function escapeSQL(str) {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

let categories = [];
let glasses = [];
let ingredients = [];
let liqueurs = [];

let currentTable = null;
let headerMap = {};

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Detect table headers
  if (line.includes('"id","name"') && !line.includes('imageUrl') && !line.includes('category') && !line.includes('technicalName')) {
    currentTable = 'categories';
    headerMap = { id: 0, name: 1 };
    continue;
  } else if (line.includes('technicalName') && line.includes('capacityOz')) {
    currentTable = 'glasses';
    const cols = parseCSVLine(line);
    headerMap = {};
    cols.forEach((col, idx) => {
      if (col === 'id') headerMap.id = idx;
      else if (col === 'name') headerMap.name = idx;
      else if (col === 'technicalName') headerMap.technical_name = idx;
      else if (col === 'capacityOz') headerMap.capacity_oz = idx;
      else if (col === 'capacityMl') headerMap.capacity_ml = idx;
      else if (col === 'imageUrl') headerMap.image_url = idx;
    });
    continue;
  } else if (line.includes('"id","name","category","description","imageUrl"')) {
    currentTable = 'ingredients';
    headerMap = { id: 0, name: 1, category: 2, description: 3, image_url: 4 };
    continue;
  } else if (line.includes('ingredients_liqueurs') && line.includes('yield_ml_liqueurs')) {
    currentTable = 'liqueurs';
    const cols = parseCSVLine(line);
    headerMap = {};
    cols.forEach((col, idx) => {
      if (col === 'id') headerMap.id = idx;
      else if (col === 'title') headerMap.title = idx;
      else if (col === 'ingredients_liqueurs') headerMap.ingredients = idx;
      else if (col === 'yield_ml_liqueurs') headerMap.yield_ml = idx;
      else if (col === 'method_liqueurs') headerMap.method = idx;
      else if (col === 'description_liqueurs') headerMap.description = idx;
      else if (col === 'validity') headerMap.validity = idx;
      else if (col === 'imageURL') headerMap.image_url = idx;
    });
    continue;
  }

  if (currentTable && !line.includes('"id"')) {
    const cols = parseCSVLine(line);

    try {
      if (currentTable === 'categories' && cols.length >= 2) {
        categories.push({
          id: parseInt(cols[headerMap.id]),
          name: cols[headerMap.name]
        });
      }
      else if (currentTable === 'glasses' && cols.length > Math.max(...Object.values(headerMap))) {
        glasses.push({
          id: parseInt(cols[headerMap.id]),
          name: cols[headerMap.name],
          technical_name: cols[headerMap.technical_name],
          capacity_oz: cols[headerMap.capacity_oz],
          capacity_ml: cols[headerMap.capacity_ml],
          image_url: cols[headerMap.image_url]
        });
      }
      else if (currentTable === 'ingredients' && cols.length >= 5) {
        ingredients.push({
          id: parseInt(cols[headerMap.id]),
          name: cols[headerMap.name],
          category: cols[headerMap.category],
          description: cols[headerMap.description],
          image_url: cols[headerMap.image_url]
        });
      }
      else if (currentTable === 'liqueurs' && cols.length > Math.max(...Object.values(headerMap))) {
        liqueurs.push({
          id: parseInt(cols[headerMap.id]),
          title: cols[headerMap.title],
          ingredients: cols[headerMap.ingredients],
          yield_ml: cols[headerMap.yield_ml],
          method: cols[headerMap.method],
          description: cols[headerMap.description],
          validity: cols[headerMap.validity],
          image_url: cols[headerMap.image_url]
        });
      }
    } catch (e) {
      // Skip
    }
  }
}

function generateInsertSQL(tableName, columns, data) {
  if (data.length === 0) return '';

  let sql = `INSERT INTO public.${tableName} (${columns.join(', ')}) VALUES\n`;

  sql += data.map(row => {
    let values = columns.map(col => {
      const val = row[col];
      if (val === null || val === undefined || val === '') return 'NULL';
      if (typeof val === 'number') return val.toString();
      return `'${escapeSQL(val.toString())}'`;
    });
    return `(${values.join(', ')})`;
  }).join(',\n');

  sql += ';';
  return sql;
}

fs.writeFileSync('insert_categories.sql', generateInsertSQL('categories', ['id', 'name'], categories));
fs.writeFileSync('insert_glasses.sql', generateInsertSQL('glasses', ['id', 'name', 'technical_name', 'capacity_oz', 'capacity_ml', 'image_url'], glasses));
fs.writeFileSync('insert_ingredients.sql', generateInsertSQL('ingredients', ['id', 'name', 'category', 'description', 'image_url'], ingredients));
fs.writeFileSync('insert_liqueurs.sql', generateInsertSQL('liqueurs', ['id', 'title', 'ingredients', 'yield_ml', 'method', 'description', 'validity', 'image_url'], liqueurs));

console.log('Categories:', categories.length);
console.log('Glasses:', glasses.length);
console.log('Ingredients:', ingredients.length);
console.log('Liqueurs:', liqueurs.length);
