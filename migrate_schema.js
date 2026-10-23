#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://vztlsfppfesdqhjzdfpj.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ ERRO: Variável SUPABASE_SERVICE_ROLE_KEY não definida');
  console.error('\n📝 Para obter a chave:');
  console.error('   1. Acesse: https://supabase.com/dashboard/project/vztlsfppfesdqhjzdfpj/settings/api');
  console.error('   2. Copie a chave "service_role"');
  console.error('   3. Configure a variável de ambiente:');
  console.error('\n      PowerShell:');
  console.error('      $env:SUPABASE_SERVICE_ROLE_KEY = "sua-chave-aqui"');
  console.error('      node migrate_schema.js');
  console.error('\n      Ou crie arquivo .env.local com:');
  console.error('      SUPABASE_SERVICE_ROLE_KEY=sua-chave-aqui');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function runMigration() {
  console.log('🔄 Iniciando migração de schema...\n');

  const sqlMigrations = [
    // Add missing columns
    {
      name: 'Add imageUrl to liqueurs',
      sql: `ALTER TABLE liqueurs ADD COLUMN IF NOT EXISTS imageUrl TEXT;`
    },
    {
      name: 'Add columns to syrups',
      sql: `ALTER TABLE syrups ADD COLUMN IF NOT EXISTS imageUrl TEXT;`
    },
    {
      name: 'Add columns to glasses',
      sql: `
        ALTER TABLE glasses ADD COLUMN IF NOT EXISTS capacityMl TEXT;
        ALTER TABLE glasses ADD COLUMN IF NOT EXISTS capacityOz TEXT;
        ALTER TABLE glasses ADD COLUMN IF NOT EXISTS technicalName TEXT;
        ALTER TABLE glasses ADD COLUMN IF NOT EXISTS imageUrl TEXT;
      `
    },
    // Disable RLS
    {
      name: 'Disable RLS on liqueurs',
      sql: `ALTER TABLE liqueurs DISABLE ROW LEVEL SECURITY;`
    },
    {
      name: 'Disable RLS on syrups',
      sql: `ALTER TABLE syrups DISABLE ROW LEVEL SECURITY;`
    },
    {
      name: 'Disable RLS on glasses',
      sql: `ALTER TABLE glasses DISABLE ROW LEVEL SECURITY;`
    },
    {
      name: 'Disable RLS on ingredients',
      sql: `ALTER TABLE ingredients DISABLE ROW LEVEL SECURITY;`
    },
    {
      name: 'Disable RLS on recipes',
      sql: `ALTER TABLE recipes DISABLE ROW LEVEL SECURITY;`
    },
    {
      name: 'Disable RLS on recipe_ingredients',
      sql: `ALTER TABLE recipe_ingredients DISABLE ROW LEVEL SECURITY;`
    },
    {
      name: 'Disable RLS on categories',
      sql: `ALTER TABLE categories DISABLE ROW LEVEL SECURITY;`
    }
  ];

  for (const migration of sqlMigrations) {
    try {
      console.log(`⏳ ${migration.name}...`);
      const { error } = await supabase.rpc('exec_sql', {
        sql_string: migration.sql
      }).catch(() => {
        // If exec_sql RPC doesn't exist, try direct query (may not work for DDL)
        return supabase.sql`${migration.sql}`;
      });

      if (error) {
        // Some errors are expected (column already exists, etc)
        if (error.message.includes('already exists') ||
            error.message.includes('already disabled')) {
          console.log(`   ℹ️  ${error.message}`);
        } else {
          console.error(`   ❌ ${error.message}`);
        }
      } else {
        console.log(`   ✅ Sucesso`);
      }
    } catch (err) {
      console.error(`   ⚠️  ${err.message}`);
    }
  }

  console.log('\n✨ Migração concluída!\n');
  console.log('Próximas etapas:');
  console.log('  1. node setup_db.js       # Popula tabelas');
  console.log('  2. node test_data_load.js # Verifica dados');
  console.log('  3. npm run build          # Build production');
}

runMigration().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
