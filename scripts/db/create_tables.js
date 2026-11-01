import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://vztlsfppfesdqhjzdfpj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dGxzZnBwZmVzZHFoanpkZnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMDA2NTkzMywiZXhwIjoxNzE1NjE3OTMzfQ.7JxF0cXIJqNm8n0Y3o5QQyaLxF_vC8v8dFNM0m6K7Po';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createTables() {
  try {
    console.log('Criando tabelas no Supabase...');

    // Criar tabela liqueurs
    const { error: liqueurError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS liqueurs (
          id BIGSERIAL PRIMARY KEY,
          title VARCHAR(120) NOT NULL,
          ingredients_liqueurs TEXT NOT NULL,
          yield_ml_liqueurs INTEGER,
          proportion_liqueurs VARCHAR(60),
          method_liqueurs TEXT NOT NULL,
          description_liqueurs TEXT,
          validity VARCHAR(100),
          imageURL VARCHAR(255),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    });

    if (liqueurError) {
      console.log('Nota: Tabela liqueurs pode já existir:', liqueurError.message);
    } else {
      console.log('✅ Tabela liqueurs criada com sucesso!');
    }

    // Criar tabela syrups
    const { error: syrupError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS syrups (
          id BIGSERIAL PRIMARY KEY,
          title VARCHAR(120) NOT NULL,
          ingredients_syrups TEXT NOT NULL,
          yield_ml INTEGER,
          proportion VARCHAR(60),
          method_syrups TEXT NOT NULL,
          description TEXT,
          validity VARCHAR(100),
          imageURL VARCHAR(255),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    });

    if (syrupError) {
      console.log('Nota: Tabela syrups pode já existir:', syrupError.message);
    } else {
      console.log('✅ Tabela syrups criada com sucesso!');
    }

    console.log('Tabelas criadas! Agora insira os dados SQL manualmente no painel Supabase.');
  } catch (error) {
    console.error('Erro:', error);
  }
}

createTables();
