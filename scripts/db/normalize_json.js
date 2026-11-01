#!/usr/bin/env node

import fs from 'fs';

// Read JSONs
const liqueurs = JSON.parse(fs.readFileSync('public/liqueurs.json'));
const syrups = JSON.parse(fs.readFileSync('public/syrups.json'));
const glasses = JSON.parse(fs.readFileSync('public/glasses.json'));

// Normalize liqueurs
const liqueursNorm = liqueurs.map(l => ({
  id: l.id,
  title: l.title,
  ingredients_liqueurs: l.ingredients_liqueurs,
  yield_ml_liqueurs: l.yield_ml_liqueurs,
  proportion_liqueurs: l.proportion_liqueurs,
  method_liqueurs: l.method_liqueurs,
  description_liqueurs: l.description_liqueurs,
  imageurl: l.imageURL,  // Minúscula
  validity: l.validity
}));

// Normalize syrups
const syrupsNorm = syrups.map(s => ({
  id: s.id,
  title: s.title,
  ingredients_syrups: s.ingredients_syrups,
  yield_ml: s.yield_ml,
  proportion: s.proportion,
  method_syrups: s.method_syrups,
  description: s.description,
  imageurl: s.imageURL,  // Minúscula
  validity: s.validity
}));

// Normalize glasses
const glassesNorm = glasses.map(g => ({
  id: g.id,
  name: g.name,
  technicaname: g.technicaName,  // Minúscula
  capacityoz: g.capacityOz,  // Minúscula
  capacityml: g.capacityMl,  // Minúscula
  imageurl: g.imageUrl  // Minúscula
}));

// Save
fs.writeFileSync('public/liqueurs.json', JSON.stringify(liqueursNorm, null, 2));
fs.writeFileSync('public/syrups.json', JSON.stringify(syrupsNorm, null, 2));
fs.writeFileSync('public/glasses.json', JSON.stringify(glassesNorm, null, 2));

console.log('✅ JSONs normalizados com campos minúsculos');
