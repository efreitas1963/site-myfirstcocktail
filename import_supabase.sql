-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

-- Glasses
CREATE TABLE IF NOT EXISTS glasses (
  id BIGSERIAL PRIMARY KEY,
  name_pt VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  capacity_oz VARCHAR(50),
  capacity_ml VARCHAR(50),
  image_url VARCHAR(255)
);

-- Ingredients
CREATE TABLE IF NOT EXISTS ingredients (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category_id BIGINT REFERENCES categories(id)
);

-- Liqueurs
CREATE TABLE IF NOT EXISTS liqueurs (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category_id BIGINT REFERENCES categories(id)
);

-- Recipes
CREATE TABLE IF NOT EXISTS recipes (
  id BIGSERIAL PRIMARY KEY,
  name_pt VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  glass_id BIGINT REFERENCES glasses(id),
  description TEXT,
  preparation TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Categories
INSERT INTO categories (id, name) VALUES 
(1,'Amargo/Bitters'),(2,'Bebida'),(3,'Destilado'),(4,'Especiaria'),(5,'Fruta'),
(6,'Licor'),(7,'Mixer'),(8,'Outros'),(9,'Refrigerante'),(10,'Suco'),(11,'Vinho/Vermute'),(12,'Xarope')
ON CONFLICT DO NOTHING;

