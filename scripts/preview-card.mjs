// Renderiza o card de uma receita no navegador headless e salva um PNG,
// para conferir o layout sem precisar clicar no site. Uso:
//   node scripts/preview-card.mjs <titulo> [arquivo-saida.png]
// Requer o dev server rodando em http://localhost:3000.
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const SUPA = 'https://vztlsfppfesdqhjzdfpj.supabase.co';
const KEY = 'sb_publishable_EzW-ynXhs_1XWBTiL0osCw_n2Zs4nm_';
const DEV = 'http://localhost:3000';

const titulo = process.argv[2] || 'Manhattan';
const out = process.argv[3] || `cards/preview_${titulo.toLowerCase().replace(/\W+/g, '_')}.png`;

const res = await fetch(`${SUPA}/rest/v1/recipes?select=*&title=ilike.*${encodeURIComponent(titulo)}*&limit=1`, {
  headers: { apikey: KEY },
});
const [row] = await res.json();
if (!row) { console.error(`Receita "${titulo}" nao encontrada.`); process.exit(1); }

const recipe = {
  id: row.id,
  title: row.title,
  description: row.description || '',
  ingredients: row.ingredients || [],
  instructions: row.instructions || [],
  garnish: row.garnish || '',
  method: row.method || '',
  category: row.category || '',
  imageUrl: row.imageurl || '',
  isFavorite: false,
  author: row.autor || '',
  createdAt: Date.now(),
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on('console', (m) => console.log('  [browser]', m.text()));
page.on('pageerror', (e) => console.log('  [erro]', e.message));

// carrega o app pra herdar origin/fontes, depois chama o gerador via import do Vite
await page.goto(DEV, { waitUntil: 'networkidle' });

const dataUrl = await page.evaluate(async (recipe) => {
  const mod = await import('/services/generateRecipeCard.ts');
  // repete o caminho interno do gerador, mas devolve a imagem em vez de baixar
  const orig = URL.createObjectURL;
  let captured = null;
  URL.createObjectURL = (blob) => { captured = blob; return orig(blob); };
  // impede o diálogo de salvar arquivo
  delete window.showSaveFilePicker;
  const click = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {};
  try {
    await mod.generateRecipeCard(recipe);
  } finally {
    URL.createObjectURL = orig;
    HTMLAnchorElement.prototype.click = click;
  }
  if (!captured) return null;
  return await new Promise((resolve) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.readAsDataURL(captured);
  });
}, recipe);

await browser.close();

if (!dataUrl) { console.error('Nao foi possivel capturar a imagem gerada.'); process.exit(1); }
const b64 = dataUrl.split(',')[1];
writeFileSync(out, Buffer.from(b64, 'base64'));
console.log(`salvo: ${out}`);
