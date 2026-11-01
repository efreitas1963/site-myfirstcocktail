// Test complete scraping flow with proper UUID
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vztlsfppfesdqhjzdfpj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_EzW-ynXhs_1XWBTiL0osCw_n2Zs4nm_';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  console.log('=== Testing Scrape Flow with UUID ===\n');

  // Simulate scraped recipe with proper UUID
  const uuid = crypto.randomUUID();
  console.log('Generated UUID:', uuid);

  const recipe = {
    id: uuid,
    title: 'Test Recipe ' + Date.now(),
    description: 'Test scraped recipe',
    ingredients: [
      { name: 'Vodka', measure: '50 ml' },
      { name: 'Lime juice', measure: '25 ml' }
    ],
    instructions: ['Mix and serve'],
    garnish: 'Lime wheel',
    method: 'Batido',
    category: 'Alcoólico',
    imageurl: ''
  };

  console.log('\nSaving recipe with UUID:', recipe.id);

  // Save
  const { data: inserted, error: insertErr } = await supabase
    .from('recipes')
    .insert([recipe])
    .select();

  if (insertErr) {
    console.error('❌ INSERT failed:', insertErr.message);
    process.exit(1);
  }

  console.log('✅ Saved');
  console.log('   ID:', inserted[0].id);

  // Try to delete using same UUID
  console.log('\nDeleting recipe with UUID:', uuid);
  const { error: deleteErr } = await supabase
    .from('recipes')
    .delete()
    .eq('id', uuid);

  if (deleteErr) {
    console.error('❌ DELETE failed:', deleteErr.message);
    process.exit(1);
  }

  console.log('✅ Deleted');

  // Verify it's gone
  const { data: verify } = await supabase
    .from('recipes')
    .select('id')
    .eq('id', uuid);

  if (verify && verify.length === 0) {
    console.log('\n✅ SUCCESS: Recipe with UUID saved, deleted, and gone!');
  } else {
    console.log('\n❌ FAILED: Recipe still exists');
  }

  process.exit(0);
}

test();
