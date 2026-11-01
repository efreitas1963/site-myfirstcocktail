import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://vztlsfppfesdqhjzdfpj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_EzW-ynXhs_1XWBTiL0osCw_n2Zs4nm_';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Carregar dados JSON que já extraímos
const liqueurs = JSON.parse(fs.readFileSync('./public/liqueurs.json', 'utf8'));
const syrups = JSON.parse(fs.readFileSync('./public/syrups.json', 'utf8'));

async function insertData() {
  try {
    console.log('Inserindo licores...');

    for (const liqueur of liqueurs) {
      const { error } = await supabase.from('liqueurs').insert({
        title: liqueur.name,
        ingredients_liqueurs: JSON.stringify(liqueur.ingredients || []),
        yield_ml_liqueurs: parseInt(liqueur.quantity) || null,
        proportion_liqueurs: liqueur.serving || null,
        method_liqueurs: Array.isArray(liqueur.preparation) ? liqueur.preparation.join('\n') : (liqueur.preparation || ''),
        description_liqueurs: liqueur.description || null,
        validity: liqueur.storageTime || null,
        imageURL: liqueur.imageUrl || null
      });

      if (error) {
        console.error(`Erro ao inserir ${liqueur.name}:`, error);
      } else {
        console.log(`✅ ${liqueur.name} inserido`);
      }
    }

    console.log('\nInserindo xaropes...');

    for (const syrup of syrups) {
      const { error } = await supabase.from('syrups').insert({
        title: syrup.name,
        ingredients_syrups: JSON.stringify(syrup.ingredients || []),
        yield_ml: parseInt(syrup.quantity) || null,
        proportion: syrup.serving || null,
        method_syrups: Array.isArray(syrup.preparation) ? syrup.preparation.join('\n') : (syrup.preparation || ''),
        description: syrup.description || null,
        validity: syrup.storageTime || null,
        imageURL: syrup.imageUrl || null
      });

      if (error) {
        console.error(`Erro ao inserir ${syrup.name}:`, error);
      } else {
        console.log(`✅ ${syrup.name} inserido`);
      }
    }

    console.log('\n✨ Dados inseridos com sucesso!');
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

insertData();
