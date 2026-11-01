#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://vztlsfppfesdqhjzdfpj.supabase.co';
// Use service role key if available, otherwise anon key
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_EzW-ynXhs_1XWBTiL0osCw_n2Zs4nm_';

console.log('Usando chave:', SUPABASE_KEY.substring(0, 20) + '...');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

async function uploadImagesToStorage() {
  console.log('\n📸 Fazendo upload de imagens para Supabase Storage...\n');

  const uploadDirs = ['glasses', 'liqueurs', 'syrups', 'recipes', 'ingredients'];
  let totalUploaded = 0;
  let totalFailed = 0;

  for (const dir of uploadDirs) {
    const dirPath = path.join(__dirname, 'uploads', dir);

    if (!fs.existsSync(dirPath)) {
      console.log(`⚠️  Pasta não existe: uploads/${dir}`);
      continue;
    }

    console.log(`🔄 Enviando imagens de ${dir}...`);
    const files = fs.readdirSync(dirPath).filter(f => !f.startsWith('.'));

    for (const file of files) {
      const filePath = path.join(dirPath, file);

      try {
        const fileContent = fs.readFileSync(filePath);
        const remotePath = `${dir}/${file}`;

        // Get MIME type based on file extension
        const ext = path.extname(file).toLowerCase();
        let mimeType = 'application/octet-stream';
        if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
        if (ext === '.png') mimeType = 'image/png';
        if (ext === '.gif') mimeType = 'image/gif';
        if (ext === '.webp') mimeType = 'image/webp';

        const { error } = await supabase.storage
          .from('images')
          .upload(remotePath, fileContent, {
            cacheControl: '3600',
            upsert: true,
            contentType: mimeType
          });

        if (error) {
          console.error(`  ❌ ${remotePath}: ${error.message}`);
          totalFailed++;
        } else {
          console.log(`  ✅ ${remotePath}`);
          totalUploaded++;
        }
      } catch (err) {
        console.error(`  ❌ ${file}: ${err.message}`);
        totalFailed++;
      }
    }
  }

  console.log(`\n✨ Upload concluído!`);
  console.log(`  ✅ ${totalUploaded} imagens enviadas`);
  if (totalFailed > 0) {
    console.log(`  ❌ ${totalFailed} falharam`);
  }

  // Now update database URLs to point to storage
  console.log('\n🔗 Atualizando URLs no banco de dados...\n');

  const STORAGE_URL = `${SUPABASE_URL}/storage/v1/object/public/images`;

  // Update glasses
  const { data: glasses } = await supabase.from('glasses').select('*');
  for (const glass of glasses || []) {
    if (glass.imageurl) {
      const newUrl = `${STORAGE_URL}/glasses/${glass.imageurl.split('/').pop()}`;
      await supabase.from('glasses').update({ imageurl: newUrl }).eq('id', glass.id);
    }
  }
  console.log(`✅ ${glasses?.length || 0} copos atualizados`);

  // Update liqueurs
  const { data: liqueurs } = await supabase.from('liqueurs').select('*');
  for (const liqueur of liqueurs || []) {
    if (liqueur.imageurl) {
      const newUrl = `${STORAGE_URL}/liqueurs/${liqueur.imageurl.split('/').pop()}`;
      await supabase.from('liqueurs').update({ imageurl: newUrl }).eq('id', liqueur.id);
    }
  }
  console.log(`✅ ${liqueurs?.length || 0} licores atualizados`);

  // Update syrups
  const { data: syrups } = await supabase.from('syrups').select('*');
  for (const syrup of syrups || []) {
    if (syrup.imageurl) {
      const newUrl = `${STORAGE_URL}/syrups/${syrup.imageurl.split('/').pop()}`;
      await supabase.from('syrups').update({ imageurl: newUrl }).eq('id', syrup.id);
    }
  }
  console.log(`✅ ${syrups?.length || 0} xaropes atualizados`);

  // Update recipes
  const { data: recipes } = await supabase.from('recipes').select('*');
  for (const recipe of recipes || []) {
    if (recipe.image_url) {
      const newUrl = `${STORAGE_URL}/recipes/${recipe.image_url.split('/').pop()}`;
      await supabase.from('recipes').update({ image_url: newUrl }).eq('id', recipe.id);
    }
  }
  console.log(`✅ ${recipes?.length || 0} receitas atualizadas`);

  console.log('\n✨ TUDO PRONTO! Imagens agora estão no Supabase Storage\n');
  console.log('Próximo passo: fazer novo deploy\n');
  console.log('No PowerShell, execute:\n');
  console.log('  vercel --prod\n');
}

uploadImagesToStorage().catch(error => {
  console.error('❌ Erro:', error.message);
  process.exit(1);
});
