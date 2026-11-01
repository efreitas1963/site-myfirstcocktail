import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://vztlsfppfesdqhjzdfpj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_EzW-ynXhs_1XWBTiL0osCw_n2Zs4nm_';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setupDatabase() {
  try {
    console.log('🔄 Carregando dados dos JSONs...');

    const liqueurs = JSON.parse(fs.readFileSync('./public/liqueurs.json', 'utf8'));
    const syrups = JSON.parse(fs.readFileSync('./public/syrups.json', 'utf8'));
    const ingredients = JSON.parse(fs.readFileSync('./public/ingredients.json', 'utf8'));
    const glasses = JSON.parse(fs.readFileSync('./public/glasses.json', 'utf8'));
    const recipes = JSON.parse(fs.readFileSync('./public/recipes.json', 'utf8'));

    console.log(`✅ Dados carregados:\n  - ${liqueurs.length} licores\n  - ${syrups.length} xaropes\n  - ${ingredients.length} ingredientes\n  - ${glasses.length} copos\n  - ${recipes.length} receitas`);

    console.log('\n🔄 Inserindo licores...');
    const liqueursFormatted = liqueurs
      .filter(l => l.name && l.name.trim())
      .map((l, idx) => ({
        id: idx + 1,
        name: l.name,
        ingredients: l.ingredients || null,
        preparation: l.preparation || null,
        method: l.method || null,
        serving: l.serving || null,
        flavor: l.flavor || null,
        strength: l.strength || null,
        description: l.description || null,
        imageUrl: l.imageUrl || null
      }));

    const { error: liqueursError } = await supabase
      .from('liqueurs')
      .upsert(liqueursFormatted, { onConflict: 'id' });

    if (liqueursError) {
      console.error('❌ Erro ao inserir licores:', liqueursError.message);
    } else {
      console.log(`✅ ${liqueursFormatted.length} licores inseridos`);
    }

    console.log('\n🔄 Inserindo xaropes...');
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
      console.error('❌ Erro ao inserir xaropes:', syrupsError.message);
    } else {
      console.log(`✅ ${syrupsFormatted.length} xaropes inseridos`);
    }

    console.log('\n🔄 Inserindo ingredientes...');
    const ingredientsFormatted = ingredients
      .filter(i => i.name && i.name.trim())
      .map((i, idx) => ({
        id: idx + 1,
        name: i.name
      }));

    const { error: ingredientsError } = await supabase
      .from('ingredients')
      .upsert(ingredientsFormatted, { onConflict: 'id' });

    if (ingredientsError) {
      console.error('❌ Erro ao inserir ingredientes:', ingredientsError.message);
    } else {
      console.log(`✅ ${ingredientsFormatted.length} ingredientes inseridos`);
    }

    console.log('\n🔄 Inserindo copos...');
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
      console.error('❌ Erro ao inserir copos:', glassesError.message);
    } else {
      console.log(`✅ ${glassesFormatted.length} copos inseridos`);
    }

    console.log('\n⏭️ Pulando receitas - usar JSON por enquanto');
    console.log('   Receitas carregam via getRecipes() do JSON')

    console.log('\n✨ Database setup completo!');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

setupDatabase();
