#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://vztlsfppfesdqhjzdfpj.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_EzW-ynXhs_1XWBTiL0osCw_n2Zs4nm_';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const STORAGE_URL = `${SUPABASE_URL}/storage/v1/object/public/images`;

async function updateImageUrls() {
  console.log('\n🔗 Atualizando URLs de imagens no banco...\n');

  // Update glasses
  console.log('🔄 Atualizando copos...');
  const { error: glassesError } = await supabase
    .from('glasses')
    .update({ imageurl: null })
    .neq('imageurl', null)
    .then(async () => {
      // Get all glasses and update with new URL
      const { data } = await supabase.from('glasses').select('*');
      const updates = data.map(g => ({
        ...g,
        imageurl: g.imageurl ? `${STORAGE_URL}/${g.imageurl.replace('/uploads/', '').replace('uploads/', '')}` : null
      }));

      for (const glass of updates) {
        if (glass.imageurl && !glass.imageurl.includes('http')) {
          await supabase.from('glasses').update({ imageurl: `${STORAGE_URL}/glasses/${glass.name.toLowerCase().replace(/ /g, '-')}.png` }).eq('id', glass.id);
        }
      }
      return { error: null };
    });

  if (glassesError) {
    console.error(`❌ Erro: ${glassesError.message}`);
  } else {
    console.log(`✅ Copos atualizados`);
  }

  // Update liqueurs
  console.log('🔄 Atualizando licores...');
  const { data: liqueurs } = await supabase.from('liqueurs').select('*');

  for (const liqueur of liqueurs) {
    if (liqueur.imageurl) {
      const imageName = liqueur.imageurl.split('/').pop();
      const newUrl = `${STORAGE_URL}/liqueurs/${imageName}`;
      await supabase.from('liqueurs').update({ imageurl: newUrl }).eq('id', liqueur.id);
    }
  }
  console.log(`✅ ${liqueurs.length} licores atualizados`);

  // Update syrups
  console.log('🔄 Atualizando xaropes...');
  const { data: syrups } = await supabase.from('syrups').select('*');

  for (const syrup of syrups) {
    if (syrup.imageurl) {
      const imageName = syrup.imageurl.split('/').pop();
      const newUrl = `${STORAGE_URL}/syrups/${imageName}`;
      await supabase.from('syrups').update({ imageurl: newUrl }).eq('id', syrup.id);
    }
  }
  console.log(`✅ ${syrups.length} xaropes atualizados`);

  // Update recipes
  console.log('🔄 Atualizando receitas...');
  const { data: recipes } = await supabase.from('recipes').select('*');

  for (const recipe of recipes) {
    if (recipe.image_url) {
      const imageName = recipe.image_url.split('/').pop();
      const newUrl = `${STORAGE_URL}/recipes/${imageName}`;
      await supabase.from('recipes').update({ image_url: newUrl }).eq('id', recipe.id);
    }
  }
  console.log(`✅ ${recipes.length} receitas atualizadas`);

  console.log('\n✨ URLs de imagens atualizadas!\n');
}

updateImageUrls().catch(error => {
  console.error('❌ Erro:', error.message);
  process.exit(1);
});
