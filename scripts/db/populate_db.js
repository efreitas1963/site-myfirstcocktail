#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://vztlsfppfesdqhjzdfpj.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_EzW-ynXhs_1XWBTiL0osCw_n2Zs4nm_';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function populateDatabase() {
  console.log('\n📦 Carregando dados dos JSONs...\n');

  // Load JSON files
  const liqueurs = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/liqueurs.json'), 'utf-8'));
  const syrups = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/syrups.json'), 'utf-8'));
  const glasses = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/glasses.json'), 'utf-8'));
  const ingredients = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/ingredients.json'), 'utf-8'));
  const recipes = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/recipes.json'), 'utf-8'));

  console.log(`✅ Dados carregados:`);
  console.log(`   - ${liqueurs.length} licores`);
  console.log(`   - ${syrups.length} xaropes`);
  console.log(`   - ${glasses.length} copos`);
  console.log(`   - ${ingredients.length} ingredientes`);
  console.log(`   - ${recipes.length} receitas\n`);

  // 1. Insert glasses first (referenced by recipes)
  console.log('🔄 Inserindo copos...');
  const glassesFormatted = glasses
    .filter(g => g.name && g.name.trim())
    .map((g, idx) => ({
      id: idx + 1,
      name: g.name,
      technicalname: g.technicalName || null,
      capacityoz: g.capacityOz || null,
      capacityml: g.capacityMl || null,
      imageurl: g.imageUrl || null
    }));

  const { error: glassesError, data: glassesData } = await supabase
    .from('glasses')
    .insert(glassesFormatted);

  if (glassesError) {
    console.error(`❌ Erro: ${glassesError.message}`);
  } else {
    console.log(`✅ ${glassesFormatted.length} copos inseridos\n`);
  }

  // 2. Insert liqueurs
  console.log('🔄 Inserindo licores...');
  const liqueursFormatted = liqueurs
    .filter(l => l.name && l.name.trim())
    .map((l, idx) => ({
      id: idx + 1,
      name: l.name,
      brand: l.brand || null,
      type: l.type || null,
      abv: l.abv || null,
      imageurl: l.imageUrl || null,
      description: l.description || null
    }));

  const { error: liqueursError } = await supabase
    .from('liqueurs')
    .insert(liqueursFormatted);

  if (liqueursError) {
    console.error(`❌ Erro: ${liqueursError.message}`);
  } else {
    console.log(`✅ ${liqueursFormatted.length} licores inseridos\n`);
  }

  // 3. Insert syrups
  console.log('🔄 Inserindo xaropes...');
  const syrupsFormatted = syrups
    .filter(s => s.name && s.name.trim())
    .map((s, idx) => ({
      id: idx + 1,
      name: s.name,
      ingredients: s.ingredients || null,
      preparation: s.preparation || null,
      quantity: s.quantity || null,
      storagetime: s.storageTime || null,
      flavor: s.flavor || null,
      description: s.description || null,
      imageurl: s.imageUrl || null,
      extra: s.extra || null
    }));

  const { error: syrupsError } = await supabase
    .from('syrups')
    .insert(syrupsFormatted);

  if (syrupsError) {
    console.error(`❌ Erro: ${syrupsError.message}`);
  } else {
    console.log(`✅ ${syrupsFormatted.length} xaropes inseridos\n`);
  }

  // 4. Insert ingredients
  console.log('🔄 Inserindo ingredientes...');
  const ingredientsFormatted = ingredients
    .filter(i => i.name && i.name.trim())
    .map((i, idx) => ({
      id: idx + 1,
      name: i.name,
      type: i.type || null,
      description: i.description || null
    }));

  const { error: ingredientsError } = await supabase
    .from('ingredients')
    .insert(ingredientsFormatted);

  if (ingredientsError) {
    console.error(`❌ Erro: ${ingredientsError.message}`);
  } else {
    console.log(`✅ ${ingredientsFormatted.length} ingredientes inseridos\n`);
  }

  // 5. Insert recipes
  console.log('🔄 Inserindo receitas...');
  const recipesFormatted = recipes
    .filter(r => r.name_pt && r.name_pt.trim())
    .map((r, idx) => ({
      id: idx + 1,
      name_pt: r.name_pt,
      name_en: r.name_en || null,
      glass_id: r.glass_id || null,
      description: r.description || null,
      preparation: r.preparation || null,
      image_url: r.image_url || null
    }));

  const { error: recipesError } = await supabase
    .from('recipes')
    .insert(recipesFormatted);

  if (recipesError) {
    console.error(`❌ Erro: ${recipesError.message}`);
  } else {
    console.log(`✅ ${recipesFormatted.length} receitas inseridas\n`);
  }

  // 6. Insert recipe_ingredients (if data exists)
  console.log('🔄 Inserindo ingredientes das receitas...');
  let recipeIngredientsCount = 0;

  try {
    const recipeIngredientsList = [];
    let id = 1;

    for (const recipe of recipes) {
      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        for (const ing of recipe.ingredients) {
          recipeIngredientsList.push({
            id: id++,
            recipe_id: recipe.id,
            ingredient_id: ing.ingredient_id,
            quantity: ing.quantity || null,
            unit: ing.unit || null
          });
        }
      }
    }

    if (recipeIngredientsList.length > 0) {
      const { error: riError } = await supabase
        .from('recipe_ingredients')
        .insert(recipeIngredientsList);

      if (riError) {
        console.log(`⚠️  Pulando: ${riError.message}`);
      } else {
        recipeIngredientsCount = recipeIngredientsList.length;
        console.log(`✅ ${recipeIngredientsList.length} ingredientes de receitas inseridos\n`);
      }
    } else {
      console.log(`⚠️  Nenhum ingrediente de receita para inserir\n`);
    }
  } catch (err) {
    console.log(`⚠️  Erro ao inserir ingredientes de receitas: ${err.message}\n`);
  }

  console.log('=' .repeat(50));
  console.log('\n✨ BANCO DE DADOS POPULADO COM SUCESSO!\n');
  console.log('Resumo:');
  console.log(`  ✅ ${glassesFormatted.length} copos`);
  console.log(`  ✅ ${liqueursFormatted.length} licores`);
  console.log(`  ✅ ${syrupsFormatted.length} xaropes`);
  console.log(`  ✅ ${ingredientsFormatted.length} ingredientes`);
  console.log(`  ✅ ${recipesFormatted.length} receitas`);
  if (recipeIngredientsCount > 0) {
    console.log(`  ✅ ${recipeIngredientsCount} ingredientes de receitas`);
  }
  console.log('\n');
}

populateDatabase().catch(error => {
  console.error('❌ Erro fatal:', error.message);
  process.exit(1);
});
