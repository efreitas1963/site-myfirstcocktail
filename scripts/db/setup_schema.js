#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://vztlsfppfesdqhjzdfpj.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_ID = 'vztlsfppfesdqhjzdfpj';

if (!SERVICE_ROLE_KEY) {
  console.error('\n❌ ERRO: Variável SUPABASE_SERVICE_ROLE_KEY não definida\n');
  console.error('📝 Para obter a chave:');
  console.error('   1. Abra: https://supabase.com/dashboard/project/' + PROJECT_ID + '/settings/api');
  console.error('   2. Copie a chave "service_role" completa');
  console.error('   3. Execute:\n');
  console.error('   Windows (PowerShell):');
  console.error('   $env:SUPABASE_SERVICE_ROLE_KEY = "sua-chave-aqui"');
  console.error('   node setup_schema.js\n');
  console.error('   Linux/Mac:');
  console.error('   export SUPABASE_SERVICE_ROLE_KEY="sua-chave-aqui"');
  console.error('   node setup_schema.js\n');
  process.exit(1);
}

// Use service role key for admin access
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

async function executeSql(sql) {
  try {
    // Try using the query function with raw SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_string: sql
    });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    // Fallback: try using fetch directly to Postgres connection
    return await executeViaFetch(sql);
  }
}

async function executeViaFetch(sql) {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    return { success: true, data: await response.json() };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function setupSchema() {
  console.log('\n🔄 Configurando schema do Supabase...\n');

  const migrations = [
    {
      name: 'Adicionar coluna imageUrl em liqueurs',
      sql: `ALTER TABLE liqueurs ADD COLUMN IF NOT EXISTS imageUrl TEXT;`
    },
    {
      name: 'Adicionar colunas em syrups',
      sql: `ALTER TABLE syrups ADD COLUMN IF NOT EXISTS imageUrl TEXT;`
    },
    {
      name: 'Adicionar colunas em glasses',
      sql: `
        ALTER TABLE glasses ADD COLUMN IF NOT EXISTS capacityMl TEXT;
        ALTER TABLE glasses ADD COLUMN IF NOT EXISTS capacityOz TEXT;
        ALTER TABLE glasses ADD COLUMN IF NOT EXISTS technicalName TEXT;
        ALTER TABLE glasses ADD COLUMN IF NOT EXISTS imageUrl TEXT;
      `
    },
    {
      name: 'Desabilitar RLS em liqueurs',
      sql: `ALTER TABLE liqueurs DISABLE ROW LEVEL SECURITY;`
    },
    {
      name: 'Desabilitar RLS em syrups',
      sql: `ALTER TABLE syrups DISABLE ROW LEVEL SECURITY;`
    },
    {
      name: 'Desabilitar RLS em glasses',
      sql: `ALTER TABLE glasses DISABLE ROW LEVEL SECURITY;`
    },
    {
      name: 'Desabilitar RLS em ingredients',
      sql: `ALTER TABLE ingredients DISABLE ROW LEVEL SECURITY;`
    },
    {
      name: 'Desabilitar RLS em recipes',
      sql: `ALTER TABLE recipes DISABLE ROW LEVEL SECURITY;`
    },
    {
      name: 'Desabilitar RLS em recipe_ingredients',
      sql: `ALTER TABLE recipe_ingredients DISABLE ROW LEVEL SECURITY;`
    },
    {
      name: 'Desabilitar RLS em categories',
      sql: `ALTER TABLE categories DISABLE ROW LEVEL SECURITY;`
    }
  ];

  let successCount = 0;
  let skipCount = 0;

  for (const migration of migrations) {
    process.stdout.write(`⏳ ${migration.name}... `);

    try {
      const result = await executeSql(migration.sql);

      if (result.success) {
        console.log('✅');
        successCount++;
      } else if (result.error?.includes('already exists') ||
                 result.error?.includes('already disabled')) {
        console.log('ℹ️  (já existe)');
        skipCount++;
      } else {
        console.log(`⚠️  ${result.error || 'erro desconhecido'}`);
      }
    } catch (err) {
      if (err.message?.includes('already exists') ||
          err.message?.includes('already disabled')) {
        console.log('ℹ️  (já existe)');
        skipCount++;
      } else {
        console.log(`❌ ${err.message}`);
      }
    }
  }

  console.log(`\n✨ Schema setup completo!`);
  console.log(`   ${successCount} novas alterações`);
  console.log(`   ${skipCount} já existentes\n`);
  console.log('Próximas etapas:');
  console.log('  1. node setup_db.js       # Popula tabelas com dados');
  console.log('  2. node test_data_load.js # Verifica se dados carregam');
  console.log('  3. npm run build          # Build para produção');
  console.log('  4. npm run preview        # Testa localmente');
}

setupSchema().catch(error => {
  console.error('\n❌ Erro fatal:', error.message);
  console.error('\nTente verificar:');
  console.error('  1. SERVICE_ROLE_KEY está correta?');
  console.error('  2. Projeto Supabase existe?');
  console.error('  3. Conexão com internet está OK?');
  process.exit(1);
});
