#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://vztlsfppfesdqhjzdfpj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_EzW-ynXhs_1XWBTiL0osCw_n2Zs4nm_';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seedSupabase() {
  console.log('\n🌱 Seeding Supabase com dados...\n');

  // Load JSONs
  const liqueurs = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/liqueurs.json')));
  const syrups = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/syrups.json')));
  const glasses = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/glasses.json')));
  const recipes = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/recipes.json')));

  // Insert liqueurs
  console.log('🔄 Inserindo licores...');
  const { error: liqueursError } = await supabase.from('liqueurs').insert(liqueurs);
  if (liqueursError) {
    console.error(`❌ Erro: ${liqueursError.message}`);
  } else {
    console.log(`✅ ${liqueurs.length} licores inseridos`);
  }

  // Insert syrups
  console.log('🔄 Inserindo xaropes...');
  const { error: syrupsError } = await supabase.from('syrups').insert(syrups);
  if (syrupsError) {
    console.error(`❌ Erro: ${syrupsError.message}`);
  } else {
    console.log(`✅ ${syrups.length} xaropes inseridos`);
  }

  // Insert glasses
  console.log('🔄 Inserindo copos...');
  const { error: glassesError } = await supabase.from('glasses').insert(glasses);
  if (glassesError) {
    console.error(`❌ Erro: ${glassesError.message}`);
  } else {
    console.log(`✅ ${glasses.length} copos inseridos`);
  }

  // Insert recipes (remove imageUrl and isFavorite fields)
  console.log('🔄 Inserindo receitas...');
  const recipesNorm = recipes.map(r => {
    const { imageUrl, isFavorite, ...rest } = r;
    return rest;
  });
  const { error: recipesError } = await supabase.from('recipes').insert(recipesNorm);
  if (recipesError) {
    console.error(`❌ Erro: ${recipesError.message}`);
  } else {
    console.log(`✅ ${recipesNorm.length} receitas inseridas`);
  }

  console.log('\n✨ Supabase populado com sucesso!\n');
}

seedSupabase().catch(err => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
