-- Insert Ingredients (sample)
INSERT INTO ingredients (name, category_id) VALUES
('Bourbon', 3),
('Rum Branco', 3),
('Tequila', 3),
('Suco de Limão', 10),
('Xarope Simples', 12),
('Cointreau', 6)
ON CONFLICT DO NOTHING;

-- Insert Recipes (sample - Clássicos)
INSERT INTO recipes (name_pt, name_en, glass_id, description, preparation) VALUES
('Caipirinha', 'Caipirinha', 15, 'Drink clássico brasileiro feito com destilado branco, açúcar e limão', 'Coloque gelo crushed no copo, adicione metades de limão cortadas. Despeje açúcar e destilado. Mexa bem com o muddler.'),
('Whisky Sour', 'Whisky Sour', 14, 'A combinação perfeita de destilado, cítrico e doçura', 'Adicione bourbon, suco de limão, xarope simples e gelo na coqueteleira. Bata vigorosamente.'),
('Daiquiri', 'Daiquiri', 17, 'Um clássico cubano com rum branco e limão fresco', 'Coloque rum branco, suco de limão e xarope na coqueteleira. Bata com gelo. Coe para taça gelada.'),
('Margarita', 'Margarita', 20, 'O drink de Tequila mais famoso, ácido, salgado e vibrante', 'Passe limão na borda e cruste com sal. Bata tequila, cointreau e suco de limão. Coe para a taça.'),
('Mojito', 'Mojito', 11, 'Drink refrescante com hortelã e rum branco', 'Coloque folhas de hortelã no copo. Adicione açúcar e rum. Complete com água com gelo.')
ON CONFLICT DO NOTHING;
