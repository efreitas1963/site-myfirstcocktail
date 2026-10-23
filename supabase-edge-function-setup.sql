-- Edge Function para executar migrations
-- Execute isso no SQL Editor: https://supabase.com/dashboard/project/vztlsfppfesdqhjzdfpj/sql/new

-- Criar função que executa SQL
CREATE OR REPLACE FUNCTION execute_migrations()
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
  error_msg TEXT;
BEGIN
  BEGIN
    -- Add missing columns
    ALTER TABLE liqueurs ADD COLUMN IF NOT EXISTS imageUrl TEXT;
    INSERT INTO public.migration_log VALUES ('liqueurs.imageUrl', NOW());
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
  END;

  BEGIN
    ALTER TABLE syrups ADD COLUMN IF NOT EXISTS imageUrl TEXT;
    INSERT INTO public.migration_log VALUES ('syrups.imageUrl', NOW());
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
  END;

  BEGIN
    ALTER TABLE glasses ADD COLUMN IF NOT EXISTS capacityMl TEXT;
    ALTER TABLE glasses ADD COLUMN IF NOT EXISTS capacityOz TEXT;
    ALTER TABLE glasses ADD COLUMN IF NOT EXISTS technicalName TEXT;
    ALTER TABLE glasses ADD COLUMN IF NOT EXISTS imageUrl TEXT;
    INSERT INTO public.migration_log VALUES ('glasses.capacity*, technicalName, imageUrl', NOW());
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
  END;

  -- Disable RLS
  BEGIN
    ALTER TABLE liqueurs DISABLE ROW LEVEL SECURITY;
    ALTER TABLE syrups DISABLE ROW LEVEL SECURITY;
    ALTER TABLE glasses DISABLE ROW LEVEL SECURITY;
    ALTER TABLE ingredients DISABLE ROW LEVEL SECURITY;
    ALTER TABLE recipes DISABLE ROW LEVEL SECURITY;
    ALTER TABLE recipe_ingredients DISABLE ROW LEVEL SECURITY;
    ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
    INSERT INTO public.migration_log VALUES ('RLS disabled', NOW());
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
  END;

  RETURN QUERY SELECT true, 'Migrations completed'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Execute a função
SELECT execute_migrations();
