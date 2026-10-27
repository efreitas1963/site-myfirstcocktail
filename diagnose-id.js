// Script para investigar tipos de ID no Supabase
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vztlsfppfesdqhjzdfpj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_EzW-ynXhs_1XWBTiL0osCw_n2Zs4nm_';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function diagnose() {
  console.log('=== Diagnosticando tipos de ID ===\n');

  // Buscar uma receita
  const { data, error } = await supabase
    .from('recipes')
    .select('id, title')
    .limit(1);

  if (error) {
    console.error('Erro ao buscar:', error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('Nenhuma receita encontrada');
    process.exit(0);
  }

  const recipe = data[0];
  console.log('Receita encontrada:');
  console.log('  title:', recipe.title);
  console.log('  id (raw):', recipe.id);
  console.log('  id (typeof):', typeof recipe.id);
  console.log('  id (JSON):', JSON.stringify(recipe.id));
  console.log('  id.toString():', recipe.id.toString());

  // Testar UPDATE com valor exato
  console.log('\n=== Testando UPDATE ===');

  const { data: updated, error: updateError } = await supabase
    .from('recipes')
    .update({ description: 'TEST UPDATE ' + Date.now() })
    .eq('id', recipe.id)
    .select();

  if (updateError) {
    console.error('UPDATE falhou:', updateError.message);
    console.error('Detalhes:', updateError.details);
  } else {
    console.log('UPDATE retornou linhas:', updated.length);
    if (updated.length > 0) {
      console.log('✅ UPDATE funcionou! Linhas afetadas:', updated.length);
    } else {
      console.log('❌ UPDATE não encontrou o registro');
    }
  }

  process.exit(0);
}

diagnose();
