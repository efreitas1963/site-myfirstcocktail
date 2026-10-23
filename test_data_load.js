import { supabase } from './services/supabase.js';

async function testDataLoad() {
  console.log('🧪 Testando carregamento de dados...\n');

  try {
    // Test liqueurs
    const { data: liqueurs, error: e1 } = await supabase
      .from('liqueurs')
      .select('*')
      .limit(1);
    
    if (e1) {
      console.error('❌ Liqueurs:', e1.message);
    } else {
      console.log(`✅ Liqueurs: ${liqueurs?.length || 0} encontrados`);
    }

    // Test syrups
    const { data: syrups, error: e2 } = await supabase
      .from('syrups')
      .select('*')
      .limit(1);
    
    if (e2) {
      console.error('❌ Syrups:', e2.message);
    } else {
      console.log(`✅ Syrups: ${syrups?.length || 0} encontrados`);
    }

    // Test glasses
    const { data: glasses, error: e3 } = await supabase
      .from('glasses')
      .select('*')
      .limit(1);
    
    if (e3) {
      console.error('❌ Glasses:', e3.message);
    } else {
      console.log(`✅ Glasses: ${glasses?.length || 0} encontrados`);
    }

    // Test ingredients
    const { data: ingredients, error: e4 } = await supabase
      .from('ingredients')
      .select('count')
      .single();
    
    if (e4) {
      console.error('❌ Ingredients:', e4.message);
    } else {
      console.log(`✅ Ingredients: ${ingredients?.count || 0} encontrados`);
    }

  } catch (error) {
    console.error('Erro:', error.message);
  }
}

testDataLoad();
