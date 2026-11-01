-- Insert sample recipes (extracted from backup)
INSERT INTO recipes (name_pt, name_en, glass_id, description, preparation) VALUES
('Caipirinha', 'Caipirinha', 15, 'Drink clássico brasileiro', 'Coloque gelo, açúcar e limão no copo. Adicione vodka. Mexa bem.')
ON CONFLICT DO NOTHING;
