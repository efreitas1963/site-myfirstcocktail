#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Read raw Phpmyadmin exports
const liqueursRaw = JSON.parse(fs.readFileSync('D:\\bases\\liqueurs.json'));
const syrupsRaw = JSON.parse(fs.readFileSync('D:\\bases\\syrups.json'));
const glassesRaw = JSON.parse(fs.readFileSync('D:\\bases\\glasses.json'));

// Extract table data (PhpMyAdmin format has metadata)
function extractTableData(jsonData) {
  for (let item of jsonData) {
    if (item.type === 'table' && item.data) {
      return item.data;
    }
  }
  return [];
}

const liqueursData = extractTableData(liqueursRaw);
const syrupsData = extractTableData(syrupsRaw);
const glassesData = extractTableData(glassesRaw);

// Format liqueurs
const liqueurs = liqueursData.map(l => ({
  id: parseInt(l.id),
  title: l.title,
  ingredients_liqueurs: l.ingredients_liqueurs ? JSON.parse(l.ingredients_liqueurs) : [],
  yield_ml_liqueurs: l.yield_ml_liqueurs,
  proportion_liqueurs: l.proportion_liqueurs,
  method_liqueurs: l.method_liqueurs ? JSON.parse(l.method_liqueurs) : [],
  description_liqueurs: l.description_liqueurs,
  imageURL: l.imageURL,
  validity: l.validity
}));

// Format syrups
const syrups = syrupsData.map(s => ({
  id: parseInt(s.id),
  title: s.title,
  ingredients_syrups: s.ingredients_syrups ? JSON.parse(s.ingredients_syrups) : [],
  yield_ml: s.yield_ml,
  proportion: s.proportion,
  method_syrups: s.method_syrups ? JSON.parse(s.method_syrups) : [],
  description: s.description,
  imageURL: s.imageURL,
  validity: s.validity
}));

// Format glasses
const glasses = glassesData.map(g => ({
  id: parseInt(g.id),
  name: g.name,
  technicaName: g.technicaName,
  capacityOz: g.capacityOz,
  capacityMl: g.capacityMl,
  imageUrl: g.imageUrl
}));

console.log(`Liqueurs: ${liqueurs.length}`);
console.log(`Syrups: ${syrups.length}`);
console.log(`Glasses: ${glasses.length}`);

// Save formatted JSON to project
fs.writeFileSync('D:\\Projetos-claude-code\\site myfirstcocktail\\public\\liqueurs.json', JSON.stringify(liqueurs, null, 2));
fs.writeFileSync('D:\\Projetos-claude-code\\site myfirstcocktail\\public\\syrups.json', JSON.stringify(syrups, null, 2));
fs.writeFileSync('D:\\Projetos-claude-code\\site myfirstcocktail\\public\\glasses.json', JSON.stringify(glasses, null, 2));

console.log('\n✅ JSONs formatados e salvos!');

// Verify
const verified = JSON.parse(fs.readFileSync('D:\\Projetos-claude-code\\site myfirstcocktail\\public\\liqueurs.json'));
console.log('VERIFICAÇÃO - Licor 1:', verified[0].title, '-> imageURL:', verified[0].imageURL);
