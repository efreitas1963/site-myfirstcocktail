#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://vztlsfppfesdqhjzdfpj.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_EzW-ynXhs_1XWBTiL0osCw_n2Zs4nm_';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to find image file in a directory
function findImageFile(dir, name) {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir);

  // Try exact name match first
  if (files.includes(name)) return name;

  // Try case-insensitive match
  const nameUpper = name.toUpperCase();
  const found = files.find(f => f.toUpperCase() === nameUpper);
  if (found) return found;

  return null;
}

async function fixImageUrls() {
  console.log('\n🔧 Corrigindo URLs de imagens...\n');

  // Fix glasses
  console.log('🔄 Corrigindo copos...');
  const { data: glasses } = await supabase.from('glasses').select('*');
  let glassesFixed = 0;

  for (const glass of glasses || []) {
    const imageName = `${glass.name}.png`;
    const imagePath = path.join(__dirname, 'uploads/glasses', imageName);

    if (fs.existsSync(imagePath)) {
      await supabase.from('glasses').update({ imageurl: imageName }).eq('id', glass.id);
      glassesFixed++;
    }
  }
  console.log(`✅ ${glassesFixed} copos com imagem encontrada\n`);

  // Fix liqueurs
  console.log('🔄 Corrigindo licores...');
  const liqueursDir = path.join(__dirname, 'uploads/liqueurs');
  const { data: liqueurs } = await supabase.from('liqueurs').select('*');
  let liqueursFixed = 0;

  for (const liqueur of liqueurs || []) {
    // Try common patterns for liqueur image names
    const patterns = [
      `licor-${liqueur.name.toLowerCase().replace(/ /g, '-')}.jpg`,
      `licor-${liqueur.name.toLowerCase().replace(/ /g, '-')}.png`,
      liqueur.name.toLowerCase().replace(/ /g, '-') + '.jpg',
      liqueur.name.toLowerCase().replace(/ /g, '-') + '.png'
    ];

    let found = null;
    for (const pattern of patterns) {
      const fullPath = path.join(liqueursDir, pattern);
      if (fs.existsSync(fullPath)) {
        found = pattern;
        break;
      }
    }

    if (found) {
      await supabase.from('liqueurs').update({ imageurl: found }).eq('id', liqueur.id);
      liqueursFixed++;
    }
  }
  console.log(`✅ ${liqueursFixed} licores com imagem encontrada\n`);

  // Fix syrups
  console.log('🔄 Corrigindo xaropes...');
  const syrupsDir = path.join(__dirname, 'uploads/syrups');
  const { data: syrups } = await supabase.from('syrups').select('*');
  let syrupsFixed = 0;

  for (const syrup of syrups || []) {
    const patterns = [
      `${syrup.name.toLowerCase().replace(/ /g, '-')}.jpg`,
      `${syrup.name.toLowerCase().replace(/ /g, '-')}.png`,
      `xarope-${syrup.name.toLowerCase().replace(/ /g, '-')}.jpg`,
      `xarope-${syrup.name.toLowerCase().replace(/ /g, '-')}.png`
    ];

    let found = null;
    for (const pattern of patterns) {
      const fullPath = path.join(syrupsDir, pattern);
      if (fs.existsSync(fullPath)) {
        found = pattern;
        break;
      }
    }

    if (found) {
      await supabase.from('syrups').update({ imageurl: found }).eq('id', syrup.id);
      syrupsFixed++;
    }
  }
  console.log(`✅ ${syrupsFixed} xaropes com imagem encontrada\n`);

  // Fix recipes
  console.log('🔄 Corrigindo receitas...');
  const recipesDir = path.join(__dirname, 'uploads/recipes');
  const { data: recipes } = await supabase.from('recipes').select('*');
  let recipesFixed = 0;

  for (const recipe of recipes || []) {
    const patterns = [
      `${recipe.name_pt.toLowerCase().replace(/ /g, '-')}.jpg`,
      `${recipe.name_pt.toLowerCase().replace(/ /g, '-')}.png`,
      `${recipe.name_en?.toLowerCase().replace(/ /g, '-') || ''}.jpg`,
      `${recipe.name_en?.toLowerCase().replace(/ /g, '-') || ''}.png`
    ];

    let found = null;
    for (const pattern of patterns) {
      if (pattern === '.jpg' || pattern === '.png') continue;
      const fullPath = path.join(recipesDir, pattern);
      if (fs.existsSync(fullPath)) {
        found = pattern;
        break;
      }
    }

    if (found) {
      await supabase.from('recipes').update({ image_url: found }).eq('id', recipe.id);
      recipesFixed++;
    }
  }
  console.log(`✅ ${recipesFixed} receitas com imagem encontrada\n`);

  console.log('=' .repeat(50));
  console.log('\n✨ URLs de imagens corrigidas!\n');
  console.log('Agora execute: npm run build && npm run preview\n');
}

fixImageUrls().catch(error => {
  console.error('❌ Erro:', error.message);
  process.exit(1);
});
