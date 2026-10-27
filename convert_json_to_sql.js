#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Helper to escape SQL strings
function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

// Helper to convert JSON to JSONB string for SQL
function jsonToSql(obj) {
  if (!obj) return 'NULL';
  return escapeSql(JSON.stringify(obj));
}

// Process ingredients.json
function processIngredients() {
  console.log('Processing ingredients.json...');
  const rawData = fs.readFileSync('public/ingredients.json', 'utf8');
  const data = JSON.parse(rawData);

  // Find the data array (PHPMyAdmin format)
  const ingredientsArray = data.find(d => d.type === 'table' && d.name === 'ingredients')?.data || [];

  let sql = '-- Ingredients Insert Statement\n';
  sql += `-- Total: ${ingredientsArray.length} records\n`;
  sql += 'INSERT INTO public.ingredients (id, name, category, description, imageurl) VALUES\n';

  const lines = ingredientsArray.map((ing, idx) => {
    const id = ing.id || idx + 1;
    const name = ing.name || '';
    const category = ing.category || '';
    const description = ing.description || '';
    const imageurl = ing.imageUrl || ing.imageurl || '';

    return `(${id}, ${escapeSql(name)}, ${escapeSql(category)}, ${escapeSql(description)}, ${escapeSql(imageurl)})`;
  });

  sql += lines.join(',\n') + '\nON CONFLICT (id) DO NOTHING;\n';

  fs.writeFileSync('ingredients_insert.sql', sql);
  console.log(`✓ Created ingredients_insert.sql (${ingredientsArray.length} records)`);
}

// Process liqueurs.json
function processLiqueurs() {
  console.log('Processing liqueurs.json...');
  const rawData = fs.readFileSync('public/liqueurs.json', 'utf8');
  const liqueursArray = JSON.parse(rawData);

  let sql = '-- Liqueurs Insert Statement\n';
  sql += `-- Total: ${liqueursArray.length} records\n`;
  sql += 'INSERT INTO public.liqueurs (id, title, description, ingredients, instructions, yield_ml, storage, validity, imageurl) VALUES\n';

  const lines = liqueursArray.map((liqueur) => {
    const id = liqueur.id || 1;
    const title = liqueur.title || '';
    const description = liqueur.description_liqueurs || '';
    const ingredients = liqueur.ingredients_liqueurs || [];
    const instructions = liqueur.method_liqueurs || [];
    const yield_ml = liqueur.yield_ml_liqueurs || '';
    const storage = liqueur.proportion_liqueurs || '';
    const validity = liqueur.validity || '';
    const imageurl = liqueur.imageurl || '';

    return `(${id}, ${escapeSql(title)}, ${escapeSql(description)}, ${jsonToSql(ingredients)}, ${jsonToSql(instructions)}, ${escapeSql(yield_ml)}, ${escapeSql(storage)}, ${escapeSql(validity)}, ${escapeSql(imageurl)})`;
  });

  sql += lines.join(',\n') + '\nON CONFLICT (id) DO NOTHING;\n';

  fs.writeFileSync('liqueurs_insert.sql', sql);
  console.log(`✓ Created liqueurs_insert.sql (${liqueursArray.length} records)`);
}

// Process syrups.json
function processSyrups() {
  console.log('Processing syrups.json...');
  const rawData = fs.readFileSync('public/syrups.json', 'utf8');
  const syrupsArray = JSON.parse(rawData);

  let sql = '-- Syrups Insert Statement\n';
  sql += `-- Total: ${syrupsArray.length} records\n`;
  sql += 'INSERT INTO public.syrups (id, title, description, ingredients, instructions, yield_ml, storage, validity, imageurl) VALUES\n';

  const lines = syrupsArray.map((syrup) => {
    const id = syrup.id || 1;
    const title = syrup.title || '';
    const description = syrup.description || '';
    const ingredients = syrup.ingredients_syrups || [];
    const instructions = syrup.method_syrups || [];
    const yield_ml = syrup.yield_ml || '';
    const storage = syrup.proportion || '';
    const validity = syrup.validity || '';
    const imageurl = syrup.imageurl || '';

    return `(${id}, ${escapeSql(title)}, ${escapeSql(description)}, ${jsonToSql(ingredients)}, ${jsonToSql(instructions)}, ${escapeSql(yield_ml)}, ${escapeSql(storage)}, ${escapeSql(validity)}, ${escapeSql(imageurl)})`;
  });

  sql += lines.join(',\n') + '\nON CONFLICT (id) DO NOTHING;\n';

  fs.writeFileSync('syrups_insert.sql', sql);
  console.log(`✓ Created syrups_insert.sql (${syrupsArray.length} records)`);
}

// Main
try {
  processIngredients();
  processLiqueurs();
  processSyrups();
  console.log('\n✅ All SQL files generated successfully!');
  console.log('\nNext steps:');
  console.log('1. Go to Supabase Dashboard → SQL Editor');
  console.log('2. Run: supabase_complete_setup.sql');
  console.log('3. Then run each of the generated files:');
  console.log('   - ingredients_insert.sql');
  console.log('   - liqueurs_insert.sql');
  console.log('   - syrups_insert.sql');
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}
