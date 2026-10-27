#!/usr/bin/env node

import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const SUPABASE_URL = 'https://vztlsfppfesdqhjzdfpj.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dGxzZnBwZmVzZHFoanpkZnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyODA0MDAwMCwiZXhwIjoxNzM5NTY4MDAwfQ.dummykey';
const SUPABASE_ANON_KEY = 'sb_publishable_EzW-ynXhs_1XWBTiL0osCw_n2Zs4nm_';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function seedIngredients() {
  console.log('📦 Seeding ingredients...');
  const jsonData = JSON.parse(fs.readFileSync('public/ingredients.json', 'utf-8'));

  const tableEntry = jsonData.find(item => item.type === 'table' && item.data);
  const ingredients = tableEntry?.data || [];

  if (ingredients.length === 0) {
    console.log('⚠️ No ingredients found in JSON');
    return;
  }

  const { error } = await supabase
    .from('ingredients')
    .insert(ingredients.map(i => ({
      id: parseInt(i.id),
      name: i.name,
      category: i.category || '',
      description: i.description || '',
      imageurl: i.imageUrl || ''
    })));

  if (error) {
    console.error('❌ Error seeding ingredients:', error.message);
  } else {
    console.log(`✅ Seeded ${ingredients.length} ingredients`);
  }
}

async function seedGlasses() {
  console.log('🍷 Seeding glasses...');
  const glasses = JSON.parse(fs.readFileSync('public/glasses.json', 'utf-8'));

  const { error } = await supabase
    .from('glasses')
    .insert(glasses.map(g => ({
      id: g.id,
      name: g.name,
      technicalname: g.technicalName || '',
      capacityoz: g.capacityOz || '',
      capacityml: g.capacityMl || '',
      imageurl: g.imageUrl || ''
    })));

  if (error) {
    console.error('❌ Error seeding glasses:', error.message);
  } else {
    console.log(`✅ Seeded ${glasses.length} glasses`);
  }
}

async function seedLiqueurs() {
  console.log('🥃 Seeding liqueurs...');
  const liqueurs = JSON.parse(fs.readFileSync('public/liqueurs.json', 'utf-8'));

  const { error } = await supabase
    .from('liqueurs')
    .insert(liqueurs.map(l => ({
      id: l.id,
      title: l.title,
      description: l.description_liqueurs || '',
      ingredients: l.ingredients_liqueurs || [],
      instructions: l.method_liqueurs || [],
      yield_ml: l.yield_ml_liqueurs || '',
      storage: l.proportion_liqueurs || '',
      validity: l.validity || '',
      imageurl: l.imageurl || ''
    })));

  if (error) {
    console.error('❌ Error seeding liqueurs:', error.message);
  } else {
    console.log(`✅ Seeded ${liqueurs.length} liqueurs`);
  }
}

async function seedSyrups() {
  console.log('🍯 Seeding syrups...');
  const syrups = JSON.parse(fs.readFileSync('public/syrups.json', 'utf-8'));

  const { error } = await supabase
    .from('syrups')
    .insert(syrups.map(s => ({
      id: s.id,
      title: s.title,
      description: s.description || '',
      ingredients: s.ingredients_syrups || [],
      instructions: s.method_syrups || [],
      yield_ml: s.yield_ml || '',
      storage: s.proportion || '',
      validity: s.validity || '',
      imageurl: s.imageurl || ''
    })));

  if (error) {
    console.error('❌ Error seeding syrups:', error.message);
  } else {
    console.log(`✅ Seeded ${syrups.length} syrups`);
  }
}

async function seedRecipes() {
  console.log('🍹 Seeding recipes...');
  const recipes = JSON.parse(fs.readFileSync('public/recipes.json', 'utf-8'));

  const { error } = await supabase
    .from('recipes')
    .insert(recipes.map((r, idx) => ({
      id: r.id || randomUUID(),
      title: r.title,
      description: r.description || '',
      ingredients: r.ingredients || [],
      instructions: r.instructions || [],
      garnish: r.garnish || '',
      method: r.method || 'Batido',
      category: r.category || 'Popular',
      imageurl: r.imageUrl || ''
    })));

  if (error) {
    console.error('❌ Error seeding recipes:', error.message);
  } else {
    console.log(`✅ Seeded ${recipes.length} recipes`);
  }
}

async function main() {
  console.log('🚀 Starting seed...\n');
  try {
    await seedIngredients();
    await seedGlasses();
    await seedLiqueurs();
    await seedSyrups();
    await seedRecipes();
    console.log('\n✨ Seed completed!');
  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

main();
