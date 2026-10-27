// Test save logic
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vztlsfppfesdqhjzdfpj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_EzW-ynXhs_1XWBTiL0osCw_n2Zs4nm_';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSave() {
  console.log('=== Testing Recipe Save Logic ===\n');

  // Get an existing recipe
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title')
    .limit(1);

  if (!recipes || recipes.length === 0) {
    console.log('No recipes found');
    process.exit(0);
  }

  const recipe = recipes[0];
  console.log('Testing with recipe:', recipe);

  // Test UPDATE
  console.log('\n1. Testing UPDATE...');
  const { data: updated, error: updateErr } = await supabase
    .from('recipes')
    .update({ description: `TEST ${Date.now()}` })
    .eq('id', String(recipe.id))
    .select();

  if (updateErr) {
    console.log('   ❌ UPDATE error:', updateErr.message);
  } else {
    console.log('   UPDATE returned rows:', updated?.length || 0);
    if (updated && updated.length > 0) {
      console.log('   ✅ UPDATE worked!');
    } else {
      console.log('   ❌ UPDATE returned 0 rows');
    }
  }

  // Test DELETE + INSERT
  console.log('\n2. Testing DELETE + INSERT...');
  const { error: deleteErr } = await supabase
    .from('recipes')
    .delete()
    .eq('id', String(recipe.id));

  if (deleteErr) {
    console.log('   ❌ DELETE error:', deleteErr.message);
  } else {
    console.log('   ✅ DELETE succeeded');
  }

  const payload = {
    id: recipe.id,
    title: recipe.title + ' [REINSERTED]',
    description: `Reinserted at ${new Date().toISOString()}`,
    ingredients: [],
    instructions: [],
    garnish: '',
    method: 'Batido',
    category: 'Popular',
    imageurl: ''
  };

  const { data: inserted, error: insertErr } = await supabase
    .from('recipes')
    .insert([payload])
    .select();

  if (insertErr) {
    console.log('   ❌ INSERT error:', insertErr.message);
  } else {
    console.log('   INSERT returned rows:', inserted?.length || 0);
    if (inserted && inserted.length > 0) {
      console.log('   ✅ INSERT worked!');
    }
  }

  process.exit(0);
}

testSave();
