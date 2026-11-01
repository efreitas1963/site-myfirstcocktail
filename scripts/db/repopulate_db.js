#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://vztlsfppfesdqhjzdfpj.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_EzW-ynXhs_1XWBTiL0osCw_n2Zs4nm_';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function repopulateDatabase() {
  console.log('\n🔄 Repopulando banco com dados corretos...\n');

  // Load JSON files
  const liqueurs = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/liqueurs.json'), 'utf-8'));
  const syrups = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/syrups.json'), 'utf-8'));
  const glasses = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/glasses.json'), 'utf-8'));
  const ingredients = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/ingredients.json'), 'utf-8'));
  const recipes = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/recipes.json'), 'utf-8'));

  // Delete all data
  console.log('🗑️  Limpando dados antigos...');
  await supabase.from('recipe_ingredients').delete().neq('id', 0);
  await supabase.from('recipes').delete().neq('id', 0);
  await supabase.from('glasses').delete().neq('id', 0);
  await supabase.from('liqueurs').delete().neq('id', 0);
  await supabase.from('syrups').delete().neq('id', 0);
  await supabase.from('ingredients').delete().neq('id', 0);
  console.log('✅ Dados deletados\n');

  // 1. Insert glasses
  console.log('🔄 Inserindo copos...');
  const glassesFormatted = glasses
    .filter(g => g.name && g.name.trim())
    .map((g, idx) => ({
      id: idx + 1,
      name: g.name,
      technicalname: g.technicalName || null,
      capacityoz: g.capacityOz || null,
      capacityml: g.capacityMl || null,
      imageurl: g.imageUrl ? g.imageUrl.replace('/uploads/', '') : null
    }));

  const { error: glassesError } = await supabase.from('glasses').insert(glassesFormatted);
  if (glassesError) {
    console.error(`❌ Erro: ${glassesError.message}`);
  } else {
    console.log(`✅ ${glassesFormatted.length} copos inseridos\n`);
  }

  // 2. Insert liqueurs (com imageUrl correto - procurar arquivo)
  console.log('🔄 Inserindo licores...');
  const liqueursDir = path.join(__dirname, 'uploads/liqueurs');
  const liqueursFiles = fs.existsSync(liqueursDir) ? fs.readdirSync(liqueursDir) : [];

  const liqueursFormatted = liqueurs
    .filter(l => l.name && l.name.trim())
    .map((l, idx) => {
      // Procura imagem pelo nome
      let imageFile = null;
      const nameNormalized = l.name.toLowerCase().replace(/\s+/g, '-');

      for (const file of liqueursFiles) {
        if (file.toLowerCase().includes(nameNormalized) ||
            file.toLowerCase().includes(l.name.toLowerCase().split(' ')[0])) {
          imageFile = file;
          break;
        }
      }

      return {
        id: idx + 1,
        name: l.name,
        brand: l.brand || null,
        type: l.type || null,
        abv: l.abv || null,
        imageurl: imageFile || null,
        description: l.description || null
      };
    });

  const { error: liqueursError } = await supabase.from('liqueurs').insert(liqueursFormatted);
  if (liqueursError) {
    console.error(`❌ Erro: ${liqueursError.message}`);
  } else {
    const withImages = liqueursFormatted.filter(l => l.imageurl).length;
    console.log(`✅ ${liqueursFormatted.length} licores inseridos (${withImages} com imagens)\n`);
  }

  // 3. Insert syrups
  console.log('🔄 Inserindo xaropes...');
  const syrupsDir = path.join(__dirname, 'uploads/syrups');
  const syrupsFiles = fs.existsSync(syrupsDir) ? fs.readdirSync(syrupsDir) : [];

  const syrupsFormatted = syrups
    .filter(s => s.name && s.name.trim())
    .map((s, idx) => {
      let imageFile = null;
      const nameNormalized = s.name.toLowerCase().replace(/\s+/g, '-');

      for (const file of syrupsFiles) {
        if (file.toLowerCase().includes(nameNormalized) ||
            file.toLowerCase().includes(s.name.toLowerCase().split(' ')[0])) {
          imageFile = file;
          break;
        }
      }

      return {
        id: idx + 1,
        name: s.name,
        ingredients: s.ingredients || null,
        preparation: s.preparation || null,
        quantity: s.quantity || null,
        storagetime: s.storageTime || null,
        flavor: s.flavor || null,
        description: s.description || null,
        imageurl: imageFile || null,
        extra: s.extra || null
      };
    });

  const { error: syrupsError } = await supabase.from('syrups').insert(syrupsFormatted);
  if (syrupsError) {
    console.error(`❌ Erro: ${syrupsError.message}`);
  } else {
    const withImages = syrupsFormatted.filter(s => s.imageurl).length;
    console.log(`✅ ${syrupsFormatted.length} xaropes inseridos (${withImages} com imagens)\n`);
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

  const { error: ingredientsError } = await supabase.from('ingredients').insert(ingredientsFormatted);
  if (ingredientsError) {
    console.error(`❌ Erro: ${ingredientsError.message}`);
  } else {
    console.log(`✅ ${ingredientsFormatted.length} ingredientes inseridos\n`);
  }

  // 5. Insert recipes (com estrutura correta)
  console.log('🔄 Inserindo receitas...');
  const recipesDir = path.join(__dirname, 'uploads/recipes');
  const recipesFiles = fs.existsSync(recipesDir) ? fs.readdirSync(recipesDir) : [];

  const recipesFormatted = recipes
    .filter(r => r.title && r.title.trim())
    .map((r, idx) => {
      let imageFile = null;
      const nameNormalized = r.title.toLowerCase().replace(/\s+/g, '-');

      for (const file of recipesFiles) {
        if (file.toLowerCase().includes(nameNormalized)) {
          imageFile = file;
          break;
        }
      }

      return {
        id: idx + 1,
        name_pt: r.title,
        name_en: r.title,
        glass_id: r.glass_id || null,
        description: r.description || null,
        preparation: r.instructions || r.preparation || null,
        image_url: imageFile || null
      };
    });

  const { error: recipesError } = await supabase.from('recipes').insert(recipesFormatted);
  if (recipesError) {
    console.error(`❌ Erro: ${recipesError.message}`);
  } else {
    const withImages = recipesFormatted.filter(r => r.image_url).length;
    console.log(`✅ ${recipesFormatted.length} receitas inseridas (${withImages} com imagens)\n`);
  }

  console.log('=' .repeat(50));
  console.log('\n✨ BANCO REPOPULADO COM SUCESSO!\n');
  console.log('Agora execute: npm run build && npm run preview\n');
}

repopulateDatabase().catch(error => {
  console.error('❌ Erro:', error.message);
  process.exit(1);
});
