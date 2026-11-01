// Full test: get recipe, edit it, and save
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vztlsfppfesdqhjzdfpj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_EzW-ynXhs_1XWBTiL0osCw_n2Zs4nm_';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  console.log('=== Testing Full Save Cycle ===\n');

  // 1. Get existing recipe count
  const { data: before } = await supabase
    .from('recipes')
    .select('*', { count: 'exact' });

  console.log('Recipes before:', before?.length || 0);

  // 2. Get a recipe to edit
  const { data: recipes } = await supabase
    .from('recipes')
    .select('*')
    .limit(1);

  if (!recipes || recipes.length === 0) {
    console.log('No recipes found');
    process.exit(0);
  }

  const original = recipes[0];
  console.log('\nOriginal recipe:');
  console.log('  ID:', original.id);
  console.log('  Title:', original.title);
  console.log('  Description:', original.description);

  // 3. Simulate save (delete + insert)
  console.log('\n--- Simulating save ---');

  const edited = {
    ...original,
    title: original.title + ' [EDITED ' + Date.now() + ']',
    description: 'Modified at ' + new Date().toISOString()
  };

  // Delete old
  console.log('Deleting old recipe...');
  const { error: deleteErr } = await supabase
    .from('recipes')
    .delete()
    .eq('id', original.id);

  if (deleteErr) {
    console.log('❌ DELETE failed:', deleteErr.message);
    process.exit(1);
  }
  console.log('✅ Deleted');

  // Insert edited
  console.log('Inserting edited recipe...');
  const { data: inserted, error: insertErr } = await supabase
    .from('recipes')
    .insert([{
      id: edited.id,
      title: edited.title,
      description: edited.description,
      ingredients: edited.ingredients,
      instructions: edited.instructions,
      garnish: edited.garnish,
      method: edited.method,
      category: edited.category,
      imageurl: edited.imageurl
    }])
    .select();

  if (insertErr) {
    console.log('❌ INSERT failed:', insertErr.message);
    process.exit(1);
  }
  console.log('✅ Inserted');

  // 4. Verify no duplicate
  const { data: after } = await supabase
    .from('recipes')
    .select('*', { count: 'exact' });

  console.log('\nRecipes after:', after?.length || 0);
  console.log('Change:', (after?.length || 0) - (before?.length || 0), 'recipes');

  // 5. Verify content updated
  const { data: verify } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', original.id)
    .single();

  console.log('\nVerifying updated content:');
  console.log('  Title matches:', verify?.title === edited.title ? '✅' : '❌');
  console.log('  Description matches:', verify?.description === edited.description ? '✅' : '❌');
  console.log('  ID unchanged:', verify?.id === original.id ? '✅' : '❌');

  if (verify?.title === edited.title && verify?.description === edited.description && verify?.id === original.id) {
    console.log('\n🎉 SUCCESS: Recipe updated without duplication!');
  } else {
    console.log('\n❌ FAILED: Content mismatch');
  }

  process.exit(0);
}

test();
