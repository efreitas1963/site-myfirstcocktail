-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';

-- Wait and check current schema
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('liqueurs', 'syrups', 'glasses')
ORDER BY table_name, ordinal_position;
