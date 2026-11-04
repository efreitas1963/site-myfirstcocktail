// Gera 3 modelos alternativos de card para comparacao visual.
// Uso: node scripts/preview-models.mjs [titulo]
// Requer o dev server rodando em http://localhost:3000.
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const SUPA = 'https://vztlsfppfesdqhjzdfpj.supabase.co';
const KEY = 'sb_publishable_EzW-ynXhs_1XWBTiL0osCw_n2Zs4nm_';
const DEV = 'http://localhost:3000';
const W = 1080, H = 1350;

const titulo = process.argv[2] || 'Alleluia';

const res = await fetch(`${SUPA}/rest/v1/recipes?select=*&title=ilike.*${encodeURIComponent(titulo)}*&limit=1`, { headers: { apikey: KEY } });
const [row] = await res.json();
if (!row) { console.error(`Receita "${titulo}" nao encontrada.`); process.exit(1); }

const r = {
  title: row.title,
  description: row.description || '',
  ingredients: row.ingredients || [],
  instructions: row.instructions || [],
  garnish: row.garnish || '',
  method: row.method || '',
  category: row.category || '',
  imageUrl: row.imageurl || '',
  author: (row.autor || 'Internet').replace(/^https?:\/\/(www\.)?/, '').split('/')[0].split('.')[0],
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.log('[erro]', e.message));

const FONTS = 'https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Dancing+Script:wght@700&family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------- MODELO 1: Faixa diagonal + painel claro ----------
// Foto grande no topo cortada em diagonal, conteudo em cartao branco.
// Aposta em contraste maximo: texto escuro sobre branco le a qualquer tamanho.
const modelo1 = () => `
<div style="width:${W}px;height:${H}px;position:relative;overflow:hidden;background:#0b0a0d;font-family:'Poppins',sans-serif;">
  <div style="position:absolute;top:0;left:0;right:0;height:620px;overflow:hidden;background:#000;">
    <img src="${r.imageUrl}" crossorigin="anonymous" style="width:100%;height:100%;object-fit:cover;" />
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,0) 35%,rgba(0,0,0,.35) 100%);"></div>
  </div>
  <div style="position:absolute;top:0;left:0;right:0;padding:34px 44px;display:flex;gap:10px;">
    <span style="padding:9px 20px;border-radius:999px;background:#9b2fe0;font-size:14px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#fff;">${esc(r.category)}</span>
    <span style="padding:9px 20px;border-radius:999px;background:rgba(255,255,255,.18);border:1.5px solid rgba(255,255,255,.5);font-size:14px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#fff;">${esc(r.method)}</span>
  </div>
  <div style="position:absolute;top:560px;left:0;right:0;bottom:0;background:#fff;border-radius:46px 46px 0 0;padding:40px 46px 0;display:flex;flex-direction:column;">
    <h1 style="font-family:'Anton',sans-serif;font-size:78px;line-height:.95;text-transform:uppercase;margin:0;color:#17121c;letter-spacing:-.01em;">${esc(r.title)}</h1>
    <div style="display:flex;align-items:center;gap:10px;margin:14px 0 20px;">
      <div style="width:64px;height:5px;background:#9b2fe0;border-radius:3px;"></div>
      <span style="font-size:14px;font-weight:700;color:#7b6b88;text-transform:uppercase;letter-spacing:.08em;">${esc(r.method)} &middot; 1 porção &middot; ${esc(r.author)}</span>
    </div>
    <div style="display:flex;gap:30px;flex:1;min-height:0;">
      <div style="width:390px;flex-shrink:0;">
        <div style="font-family:'Anton',sans-serif;font-size:25px;color:#9b2fe0;text-transform:uppercase;margin-bottom:14px;letter-spacing:.02em;">Ingredientes</div>
        ${r.ingredients.map(i => `
          <div style="display:flex;gap:10px;padding:9px 0;border-bottom:1.5px solid #efeaf4;">
            <span style="min-width:74px;text-align:right;font-size:15.5px;font-weight:800;color:#9b2fe0;">${esc(i.measure)}</span>
            <span style="font-size:15.5px;font-weight:600;color:#241f29;">${esc(i.name)}</span>
          </div>`).join('')}
        ${r.garnish ? `<div style="margin-top:16px;padding:14px 16px;background:#f7f2fb;border-radius:12px;border-left:5px solid #9b2fe0;">
          <div style="font-size:12px;font-weight:800;color:#9b2fe0;text-transform:uppercase;letter-spacing:.09em;margin-bottom:4px;">Guarnição</div>
          <div style="font-size:14.5px;color:#3a3340;font-weight:600;">${esc(r.garnish)}</div></div>` : ''}
      </div>
      <div style="flex:1;min-width:0;">
        <div style="font-family:'Anton',sans-serif;font-size:25px;color:#9b2fe0;text-transform:uppercase;margin-bottom:14px;letter-spacing:.02em;">Modo de Preparo</div>
        ${r.instructions.map((s, i) => `
          <div style="display:flex;gap:12px;margin-bottom:12px;">
            <span style="flex-shrink:0;width:27px;height:27px;border-radius:50%;background:#17121c;color:#fff;font-size:13px;font-weight:800;display:flex;align-items:center;justify-content:center;"><span style="transform:translateY(-6px);">${i + 1}</span></span>
            <span style="font-size:14.5px;line-height:1.45;color:#3a3340;font-weight:500;">${esc(s)}</span>
          </div>`).join('')}
      </div>
    </div>
    <div style="margin-top:auto;padding:20px 0 22px;border-top:2px solid #efeaf4;display:flex;align-items:center;justify-content:space-between;">
      <div style="display:flex;align-items:center;gap:12px;">
        <img src="/img/logo-512.png" crossorigin="anonymous" style="width:46px;height:46px;border-radius:50%;" />
        <div><div style="font-family:'Anton',sans-serif;font-size:19px;color:#17121c;text-transform:uppercase;">MyFirstCocktail</div>
        <div style="font-size:12px;color:#8a7d94;">Beba com moderação</div></div>
      </div>
      <div style="font-size:14px;font-weight:800;color:#9b2fe0;letter-spacing:.03em;">MYFIRSTCOCKTAIL.COM.BR</div>
    </div>
  </div>
</div>`;

// ---------- MODELO 2: Foto lateral + faixa vertical de cor ----------
// Divide o card: foto ocupa o topo inteiro, conteudo escuro embaixo com
// blocos coloridos. Marca d'agua grande e unica (nao ladrilhada) atras.
const modelo2 = () => `
<div style="width:${W}px;height:${H}px;position:relative;overflow:hidden;background:#140f1a;font-family:'Poppins',sans-serif;color:#fff;">
  <div style="position:absolute;top:0;left:0;right:0;height:560px;overflow:hidden;">
    <img src="${r.imageUrl}" crossorigin="anonymous" style="width:100%;height:100%;object-fit:cover;" />
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,15,26,.35) 0%,rgba(20,15,26,0) 40%,rgba(20,15,26,.95) 100%);"></div>
  </div>
  <img src="/img/logo.png" crossorigin="anonymous" style="position:absolute;bottom:90px;right:-120px;width:620px;opacity:.07;" />
  <div style="position:absolute;top:36px;left:44px;display:flex;gap:10px;">
    <span style="padding:10px 22px;border-radius:6px;background:#9b2fe0;font-size:13.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;">${esc(r.category)}</span>
    <span style="padding:10px 22px;border-radius:6px;background:rgba(0,0,0,.55);border:1.5px solid rgba(255,255,255,.35);font-size:13.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;">${esc(r.method)}</span>
  </div>
  <div style="position:absolute;top:430px;left:0;right:0;bottom:0;padding:0 46px;display:flex;flex-direction:column;">
    <h1 style="font-family:'Bebas Neue',sans-serif;font-size:96px;line-height:.9;text-transform:uppercase;margin:0;letter-spacing:.01em;text-shadow:0 4px 24px rgba(0,0,0,.9);">${esc(r.title)}</h1>
    ${r.description ? `<p style="font-size:17px;font-style:italic;color:#d2c7dd;margin:10px 0 0;max-width:640px;line-height:1.4;">${esc(r.description)}</p>` : ''}
    <div style="display:flex;gap:9px;margin:22px 0 20px;">
      ${[['MÉTODO', r.method], ['RENDE', '1 porção'], ['FONTE', r.author]].map(([k, v]) => `
        <div style="flex:1;background:linear-gradient(135deg,#9b2fe0 0%,#6b1bb0 100%);border-radius:12px;padding:13px 16px;">
          <div style="font-size:10.5px;font-weight:800;letter-spacing:.12em;opacity:.85;">${k}</div>
          <div style="font-size:16px;font-weight:800;margin-top:3px;">${esc(v)}</div>
        </div>`).join('')}
    </div>
    <div style="display:flex;gap:16px;flex:1;min-height:0;">
      <div style="width:400px;flex-shrink:0;background:rgba(255,255,255,.07);border:1.5px solid rgba(155,47,224,.55);border-radius:18px;padding:20px 22px;">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:30px;color:#cf8bff;letter-spacing:.04em;margin-bottom:12px;">INGREDIENTES</div>
        ${r.ingredients.map(i => `
          <div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.12);">
            <span style="min-width:72px;text-align:right;font-size:15px;font-weight:800;color:#cf8bff;">${esc(i.measure)}</span>
            <span style="font-size:15px;color:#f0eaf6;font-weight:500;">${esc(i.name)}</span>
          </div>`).join('')}
        ${r.garnish ? `<div style="margin-top:14px;font-size:13.5px;color:#cbbfd8;"><b style="color:#cf8bff;">Guarnição:</b> ${esc(r.garnish)}</div>` : ''}
      </div>
      <div style="flex:1;min-width:0;background:rgba(255,255,255,.07);border:1.5px solid rgba(155,47,224,.55);border-radius:18px;padding:20px 22px;">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:30px;color:#cf8bff;letter-spacing:.04em;margin-bottom:12px;">MODO DE PREPARO</div>
        ${r.instructions.map((s, i) => `
          <div style="display:flex;gap:11px;margin-bottom:11px;">
            <span style="flex-shrink:0;width:25px;height:25px;border-radius:7px;background:#9b2fe0;font-size:12.5px;font-weight:800;display:flex;align-items:center;justify-content:center;"><span style="transform:translateY(-6px);">${i + 1}</span></span>
            <span style="font-size:14px;line-height:1.45;color:#e8e1ef;">${esc(s)}</span>
          </div>`).join('')}
      </div>
    </div>
    <div style="margin-top:auto;padding:18px 0 26px;display:flex;align-items:center;justify-content:space-between;">
      <div style="display:flex;align-items:center;gap:12px;">
        <img src="/img/logo-512.png" crossorigin="anonymous" style="width:46px;height:46px;border-radius:50%;" />
        <div><div style="font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:.05em;">MYFIRSTCOCKTAIL</div>
        <div style="font-size:12px;color:#9a8ca6;">Beba com moderação</div></div>
      </div>
      <div style="padding:10px 22px;border-radius:8px;background:#9b2fe0;font-size:13.5px;font-weight:800;letter-spacing:.04em;">MYFIRSTCOCKTAIL.COM.BR</div>
    </div>
  </div>
</div>`;

// ---------- MODELO 3: Foto recortada em circulo, fundo colorido ----------
// Mais editorial: fundo em degrade de marca, foto em destaque circular,
// tipografia grande. O mais "chamativo" dos tres.
const modelo3 = () => `
<div style="width:${W}px;height:${H}px;position:relative;overflow:hidden;background:linear-gradient(160deg,#2a1240 0%,#15091f 55%,#0b0a0d 100%);font-family:'Poppins',sans-serif;color:#fff;">
  <div style="position:absolute;top:-190px;right:-170px;width:620px;height:620px;border-radius:50%;background:radial-gradient(circle,rgba(155,47,224,.55) 0%,rgba(155,47,224,0) 70%);"></div>
  <div style="position:absolute;bottom:-130px;left:-150px;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,rgba(207,139,255,.28) 0%,rgba(207,139,255,0) 70%);"></div>
  <div style="position:absolute;top:44px;left:0;right:0;text-align:center;">
    <div style="display:inline-block;padding:9px 26px;border-radius:999px;border:2px solid #cf8bff;font-size:13px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#cf8bff;">${esc(r.category)} &middot; ${esc(r.method)}</div>
  </div>
  <div style="position:absolute;top:104px;left:50%;transform:translateX(-50%);width:430px;height:430px;border-radius:50%;overflow:hidden;border:7px solid rgba(207,139,255,.5);box-shadow:0 20px 70px rgba(0,0,0,.75);">
    <img src="${r.imageUrl}" crossorigin="anonymous" style="width:100%;height:100%;object-fit:cover;" />
  </div>
  <div style="position:absolute;top:566px;left:0;right:0;text-align:center;padding:0 50px;">
    <h1 style="font-family:'Anton',sans-serif;font-size:80px;line-height:.94;text-transform:uppercase;margin:0;text-shadow:0 4px 30px rgba(0,0,0,.6);">${esc(r.title)}</h1>
    ${r.description ? `<p style="font-size:17px;font-style:italic;color:#cfc3db;margin:12px auto 0;max-width:720px;line-height:1.4;">${esc(r.description)}</p>` : ''}
  </div>
  <div style="position:absolute;top:${r.description ? 718 : 690}px;left:46px;right:46px;bottom:0;display:flex;flex-direction:column;">
    <div style="display:flex;gap:14px;align-items:flex-start;flex:1;min-height:0;">
      <div style="width:398px;flex-shrink:0;background:rgba(255,255,255,.09);backdrop-filter:blur(2px);border-radius:20px;padding:20px 24px;border-top:4px solid #cf8bff;">
        <div style="font-family:'Anton',sans-serif;font-size:24px;letter-spacing:.03em;color:#cf8bff;text-transform:uppercase;margin-bottom:12px;">Ingredientes</div>
        ${r.ingredients.map(i => `
          <div style="display:flex;gap:10px;padding:7.5px 0;border-bottom:1px solid rgba(255,255,255,.14);">
            <span style="min-width:72px;text-align:right;font-size:15px;font-weight:800;color:#fff;">${esc(i.measure)}</span>
            <span style="font-size:15px;color:#e3daec;font-weight:500;">${esc(i.name)}</span>
          </div>`).join('')}
        ${r.garnish ? `<div style="margin-top:13px;font-size:13.5px;color:#cfc3db;"><b style="color:#cf8bff;">Guarnição:</b> ${esc(r.garnish)}</div>` : ''}
      </div>
      <div style="flex:1;min-width:0;background:rgba(255,255,255,.09);backdrop-filter:blur(2px);border-radius:20px;padding:20px 24px;border-top:4px solid #cf8bff;">
        <div style="font-family:'Anton',sans-serif;font-size:24px;letter-spacing:.03em;color:#cf8bff;text-transform:uppercase;margin-bottom:12px;">Modo de Preparo</div>
        ${r.instructions.map((s, i) => `
          <div style="display:flex;gap:11px;margin-bottom:11px;">
            <span style="flex-shrink:0;width:26px;height:26px;border-radius:50%;border:2px solid #cf8bff;font-size:12.5px;font-weight:800;display:flex;align-items:center;justify-content:center;color:#cf8bff;"><span style="transform:translateY(-6px);">${i + 1}</span></span>
            <span style="font-size:14px;line-height:1.45;color:#e8e1ef;">${esc(s)}</span>
          </div>`).join('')}
      </div>
    </div>
    <div style="margin-top:auto;padding:18px 0 28px;display:flex;align-items:center;justify-content:space-between;">
      <div style="display:flex;align-items:center;gap:12px;">
        <img src="/img/logo-512.png" crossorigin="anonymous" style="width:48px;height:48px;border-radius:50%;" />
        <div><div style="font-family:'Anton',sans-serif;font-size:20px;text-transform:uppercase;">MyFirstCocktail</div>
        <div style="font-size:12px;color:#a497b0;">Beba com moderação</div></div>
      </div>
      <div style="padding:11px 24px;border-radius:999px;border:2px solid #cf8bff;font-size:13.5px;font-weight:800;color:#cf8bff;letter-spacing:.04em;">MYFIRSTCOCKTAIL.COM.BR</div>
    </div>
  </div>
</div>`;

const modelos = [['modelo1', modelo1], ['modelo2', modelo2], ['modelo3', modelo3]];

await page.goto(DEV, { waitUntil: 'domcontentloaded' });

for (const [nome, fn] of modelos) {
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8">
    <link rel="stylesheet" href="${FONTS}">
    <style>*{margin:0;padding:0;box-sizing:border-box}body{width:${W}px;height:${H}px;overflow:hidden}</style>
    <base href="${DEV}/"></head><body>${fn()}</body></html>`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H }, type: 'jpeg', quality: 92 });
  writeFileSync(`cards/${nome}.jpg`, buf);
  console.log(`salvo: cards/${nome}.jpg`);
}

await browser.close();
