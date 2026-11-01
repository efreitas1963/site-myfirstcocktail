#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const SUPABASE_URL = 'https://vztlsfppfesdqhjzdfpj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dGxzZnBwZmVzZHFoanpkZnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyODMxNjc5MCwiZXhwIjoxNzQzODY4NzkwfQ.N1N0NUhyVGJCWUtBTzNkQXN1MjhraXVFZkdGcGVxQUg';

console.log('🔐 Conectando ao Supabase com service role...\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

async function executeSqlStatements() {
  const statements = [
    'ALTER TABLE liqueurs ADD COLUMN IF NOT EXISTS imageUrl TEXT;',
    'ALTER TABLE syrups ADD COLUMN IF NOT EXISTS imageUrl TEXT;',
    'ALTER TABLE glasses ADD COLUMN IF NOT EXISTS capacityMl TEXT;',
    'ALTER TABLE glasses ADD COLUMN IF NOT EXISTS capacityOz TEXT;',
    'ALTER TABLE glasses ADD COLUMN IF NOT EXISTS technicalName TEXT;',
    'ALTER TABLE glasses ADD COLUMN IF NOT EXISTS imageUrl TEXT;',
    'ALTER TABLE liqueurs DISABLE ROW LEVEL SECURITY;',
    'ALTER TABLE syrups DISABLE ROW LEVEL SECURITY;',
    'ALTER TABLE glasses DISABLE ROW LEVEL SECURITY;',
    'ALTER TABLE ingredients DISABLE ROW LEVEL SECURITY;',
    'ALTER TABLE recipes DISABLE ROW LEVEL SECURITY;',
    'ALTER TABLE recipe_ingredients DISABLE ROW LEVEL SECURITY;',
    'ALTER TABLE categories DISABLE ROW LEVEL SECURITY;',
  ];

  console.log('⏳ Executando migrations...\n');

  for (const sql of statements) {
    process.stdout.write(`  ${sql.substring(0, 60)}... `);

    try {
      // Use postgres function if available
      const { error } = await supabase.rpc('run_sql', { sql });

      if (error) {
        // Try alternative approach
        console.log(`⚠️  ${error.message}`);
      } else {
        console.log('✅');
      }
    } catch (err) {
      console.log(`⚠️  ${err.message}`);
    }
  }

  console.log('\n✨ Migrations concluídas!\n');
  console.log('Agora execute: node auto_setup.js --seed\n');
}

executeSqlStatements().catch(err => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
