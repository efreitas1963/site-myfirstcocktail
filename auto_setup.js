#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://vztlsfppfesdqhjzdfpj.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Step 1: Generate SQL file for manual execution
function generateSetupSQL() {
  const sql = `-- Setup script for MyFirstCocktail
-- Copie e cole no SQL Editor: https://supabase.com/dashboard/project/vztlsfppfesdqhjzdfpj/sql/new

-- ===== ADD MISSING COLUMNS =====

-- Liqueurs
ALTER TABLE liqueurs ADD COLUMN IF NOT EXISTS imageUrl TEXT;

-- Syrups
ALTER TABLE syrups ADD COLUMN IF NOT EXISTS imageUrl TEXT;

-- Glasses
ALTER TABLE glasses ADD COLUMN IF NOT EXISTS capacityMl TEXT;
ALTER TABLE glasses ADD COLUMN IF NOT EXISTS capacityOz TEXT;
ALTER TABLE glasses ADD COLUMN IF NOT EXISTS technicalName TEXT;
ALTER TABLE glasses ADD COLUMN IF NOT EXISTS imageUrl TEXT;

-- ===== DISABLE RLS FOR PUBLIC READ ACCESS =====

ALTER TABLE liqueurs DISABLE ROW LEVEL SECURITY;
ALTER TABLE syrups DISABLE ROW LEVEL SECURITY;
ALTER TABLE glasses DISABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE recipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- ===== Feito! Agora execute: node setup_db.js =====
`;

  fs.writeFileSync(path.join(__dirname, 'setup.sql'), sql);
  return sql;
}

// Step 2: Seed data into tables (after schema is set up)
async function seedDatabase() {
  if (!SERVICE_ROLE_KEY) {
    console.log('⚠️  SERVICE_ROLE_KEY não definida. Usando anon key para seeding...');
  }

  const supabaseKey = SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(SUPABASE_URL, supabaseKey);

  console.log('\n📦 Carregando dados dos JSONs...');

  // Load JSON files
  const liqueurs = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/data/liqueurs.json'), 'utf-8'));
  const syrups = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/data/syrups.json'), 'utf-8'));
  const glasses = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/data/glasses.json'), 'utf-8'));
  const ingredients = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/data/ingredients.json'), 'utf-8'));

  console.log(`✅ Dados carregados: ${liqueurs.length} licores, ${syrups.length} xaropes, ${glasses.length} copos, ${ingredients.length} ingredientes\n`);

  // Insert liqueurs
  console.log('🔄 Inserindo licores...');
  const liqueursFormatted = liqueurs
    .filter(l => l.name && l.name.trim())
    .map((l, idx) => ({
      id: idx + 1,
      name: l.name,
      brand: l.brand || null,
      type: l.type || null,
      abv: l.abv || null,
      imageUrl: l.imageUrl || null,
      description: l.description || null
    }));

  const { error: liqueursError, data: liqueursData } = await supabase
    .from('liqueurs')
    .upsert(liqueursFormatted, { onConflict: 'id' });

  if (liqueursError) {
    console.error(`❌ Erro ao inserir licores: ${liqueursError.message}`);
  } else {
    console.log(`✅ ${liqueursFormatted.length} licores inseridos\n`);
  }

  // Insert syrups
  console.log('🔄 Inserindo xaropes...');
  const syrupsFormatted = syrups
    .filter(s => s.name && s.name.trim())
    .map((s, idx) => ({
      id: idx + 1,
      name: s.name,
      ingredients: s.ingredients || null,
      preparation: s.preparation || null,
      quantity: s.quantity || null,
      storageTime: s.storageTime || null,
      flavor: s.flavor || null,
      description: s.description || null,
      imageUrl: s.imageUrl || null,
      extra: s.extra || null
    }));

  const { error: syrupsError } = await supabase
    .from('syrups')
    .upsert(syrupsFormatted, { onConflict: 'id' });

  if (syrupsError) {
    console.error(`❌ Erro ao inserir xaropes: ${syrupsError.message}`);
  } else {
    console.log(`✅ ${syrupsFormatted.length} xaropes inseridos\n`);
  }

  // Insert glasses
  console.log('🔄 Inserindo copos...');
  const glassesFormatted = glasses
    .filter(g => g.name && g.name.trim())
    .map((g, idx) => ({
      id: idx + 1,
      name: g.name,
      technicalName: g.technicalName || null,
      capacityOz: g.capacityOz || null,
      capacityMl: g.capacityMl || null,
      imageUrl: g.imageUrl || null
    }));

  const { error: glassesError } = await supabase
    .from('glasses')
    .upsert(glassesFormatted, { onConflict: 'id' });

  if (glassesError) {
    console.error(`❌ Erro ao inserir copos: ${glassesError.message}`);
  } else {
    console.log(`✅ ${glassesFormatted.length} copos inseridos\n`);
  }

  // Insert ingredients
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
    .upsert(ingredientsFormatted, { onConflict: 'id' });

  if (ingredientsError) {
    console.error(`❌ Erro ao inserir ingredientes: ${ingredientsError.message}`);
  } else {
    console.log(`✅ ${ingredientsFormatted.length} ingredientes inseridos\n`);
  }

  console.log('✨ Seeding concluído!\n');
}

async function main() {
  console.log('\n🚀 Configuração automática do MyFirstCocktail\n');
  console.log('=' .repeat(50));

  // Step 1: Generate SQL
  console.log('\n📋 Etapa 1: Gerando script SQL...');
  const setupSQL = generateSetupSQL();
  console.log('✅ Script gerado: setup.sql\n');

  // Step 2: Show instructions
  console.log('📝 Etapa 2: INSTRUÇÕES MANUAIS\n');
  console.log('Como executar o script SQL no Supabase:');
  console.log('  1. Abra: https://supabase.com/dashboard/project/vztlsfppfesdqhjzdfpj/sql/new');
  console.log('  2. Cole o conteúdo de "setup.sql" (arquivo gerado neste diretório)');
  console.log('  3. Clique em "RUN"');
  console.log('  4. Volte aqui e execute: node auto_setup.js --seed\n');

  // Step 3: If seed flag is set, insert data
  if (process.argv.includes('--seed')) {
    console.log('🌱 Etapa 3: Seeding de dados...\n');
    try {
      await seedDatabase();
      console.log('=' .repeat(50));
      console.log('\n✅ TUDO PRONTO! Próximas etapas:');
      console.log('  1. npm run build          # Build para produção');
      console.log('  2. npm run preview        # Testa localmente');
      console.log('  3. vercel --prod          # Deploy no Vercel\n');
    } catch (error) {
      console.error('❌ Erro durante seeding:', error.message);
      process.exit(1);
    }
  } else {
    console.log('=' .repeat(50));
    console.log('\n⏭️  Após executar o SQL no Supabase, execute:\n');
    console.log('   node auto_setup.js --seed\n');
  }
}

main().catch(error => {
  console.error('❌ Erro:', error.message);
  process.exit(1);
});
