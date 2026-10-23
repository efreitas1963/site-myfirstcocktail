#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://vztlsfppfesdqhjzdfpj.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_EzW-ynXhs_1XWBTiL0osCw_n2Zs4nm_';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function uploadImages() {
  console.log('\n📸 Fazendo upload de imagens para Supabase Storage...\n');

  const uploadDirs = ['glasses', 'liqueurs', 'syrups', 'ingredients', 'recipes'];
  let totalUploaded = 0;
  let totalFailed = 0;

  for (const dir of uploadDirs) {
    const dirPath = path.join(__dirname, 'uploads', dir);

    if (!fs.existsSync(dirPath)) {
      console.log(`⚠️  Pasta não existe: ${dir}`);
      continue;
    }

    console.log(`🔄 Enviando imagens de ${dir}...`);
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const fileContent = fs.readFileSync(filePath);
      const remotePath = `${dir}/${file}`;

      try {
        const { error } = await supabase.storage
          .from('images')
          .upload(remotePath, fileContent, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) {
          console.error(`  ❌ ${remotePath}: ${error.message}`);
          totalFailed++;
        } else {
          console.log(`  ✅ ${remotePath}`);
          totalUploaded++;
        }
      } catch (err) {
        console.error(`  ❌ ${remotePath}: ${err.message}`);
        totalFailed++;
      }
    }
  }

  console.log(`\n✨ Upload concluído!`);
  console.log(`  ✅ ${totalUploaded} imagens enviadas`);
  if (totalFailed > 0) {
    console.log(`  ❌ ${totalFailed} falharam`);
  }
  console.log('\n');
}

uploadImages().catch(error => {
  console.error('❌ Erro:', error.message);
  process.exit(1);
});
