// Test recipe deletion
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vztlsfppfesdqhjzdfpj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_EzW-ynXhs_1XWBTiL0osCw_n2Zs4nm_';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  console.log('=== Testing Recipe Deletion ===\n');

  // 1. Get recipe count before
  const { data: before } = await supabase
    .from('recipes')
    .select('*', { count: 'exact' });

  console.log('Recipes before:', before?.length || 0);

  // 2. Get a recipe to delete
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title')
    .limit(1);

  if (!recipes || recipes.length === 0) {
    console.log('No recipes to delete');
    process.exit(0);
  }

  const recipe = recipes[0];
  console.log('\nRecipe to delete:');
  console.log('  ID:', recipe.id);
  console.log('  Title:', recipe.title);

  // 3. Delete it
  console.log('\nDeleting...');
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', recipe.id);

  if (error) {
    console.log('❌ DELETE failed:', error.message);
    process.exit(1);
  }

  console.log('✅ Deleted');

  // 4. Verify it's gone
  const { data: after } = await supabase
    .from('recipes')
    .select('*', { count: 'exact' });

  console.log('\nRecipes after:', after?.length || 0);
  console.log('Difference:', (before?.length || 0) - (after?.length || 0), 'recipe(s)');

  // 5. Check if it really doesn't exist
  const { data: verify } = await supabase
    .from('recipes')
    .select('id')
    .eq('id', recipe.id);

  if (verify && verify.length === 0) {
    console.log('\n✅ SUCCESS: Recipe deleted and does not reappear on refresh!');
  } else {
    console.log('\n❌ FAILED: Recipe still exists after deletion');
  }

  process.exit(0);
}

test();
