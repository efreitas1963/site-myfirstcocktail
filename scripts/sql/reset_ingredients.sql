-- Delete and reset ingredients table
DELETE FROM ingredients;

-- Reset sequence
ALTER SEQUENCE ingredients_id_seq RESTART WITH 1;
