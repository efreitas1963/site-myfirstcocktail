import html2canvas from 'html2canvas';
import { DrinkRecipe } from '../types.ts';
import { formatAuthorDisplay } from './recipeProcessingService';

// Gera o card de uma receita para publicar no Instagram (@myfirstcocktail),
// em três modelos visuais distintos que o usuário escolhe na hora:
//
//   1. claro   — foto no topo, conteúdo num painel branco (maior legibilidade)
//   2. escuro  — foto no topo, blocos roxos sobre fundo escuro
//   3. circulo — foto recortada em círculo sobre fundo roxo em degradê
//
// `renderRecipeCard()` devolve o JPEG de um modelo (usado pelas miniaturas do
// seletor) e `generateRecipeCard()` gera e salva o arquivo final, perguntando
// onde salvar quando o navegador suporta a File System Access API
// (Chrome/Edge); caso contrário cai no download padrão.

export type CardModel = 'claro' | 'escuro' | 'circulo';

export const CARD_MODELS: { id: CardModel; label: string; hint: string }[] = [
  { id: 'claro', label: 'Clássico', hint: 'Painel branco, leitura mais fácil' },
  { id: 'escuro', label: 'Noturno', hint: 'Fundo escuro com blocos roxos' },
  { id: 'circulo', label: 'Destaque', hint: 'Foto em círculo, fundo roxo' },
];

const FONT_LINK_ID = 'recipe-card-fonts';
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Dancing+Script:wght@700&family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap';

// 1080x1350 (4:5) é a proporção mais alta que o feed do Instagram aceita sem
// cortar. Antes o card saía na altura natural do conteúdo (1520 a 1659px
// conforme a receita), o que estourava esse limite e era recortado.
const CARD_W = 1080;
const CARD_H = 1350;
// Diâmetro do recorte redondo do modelo "circulo".
const CIRCLE_SIZE = 430;

const ROXO = '#9b2fe0';
const ROXO_CLARO = '#cf8bff';

// Centraliza texto em maiúsculas dentro de uma pílula.
//
// Duas armadilhas resolvidas aqui:
//
// 1. O html2canvas (que rasteriza o card) não aplica `align-items:center` a
//    texto — desenha a linha no topo da caixa. Daí o uso de line-height, que
//    ele respeita; é a mesma razão dos `translateY(-6px)` que já existiam nos
//    círculos numerados.
//
// 2. Mesmo com line-height, o texto fica visualmente baixo: a fonte reserva
//    espaço para descendentes (a Poppins pede ~5px em 13.5px) que MAIÚSCULAS
//    não usam. Medido: a tinta caía entre 10.5px e 24.5px numa caixa de 42px,
//    ou seja 17.5px de folga embaixo contra 10.5 em cima. `compensa` sobe a
//    linha por metade do descender para igualar as duas folgas.
//
// O `vertical-align:top` mantém as pílulas vizinhas alinhadas entre si — sem
// ele, caixas de alturas de linha diferentes assentam em linhas de base
// distintas e uma fica mais baixa que a outra.
function pill(text: string, opts: { h: number; radius: string; bg: string; color: string; size: number; weight: number; pad: number; tracking: string }): string {
  // line-height que centra MAIÚSCULAS verticalmente na caixa ao passar pelo
  // html2canvas. O fator 1.03 saiu de calibração: variando o line-height de 30
  // a 44px numa caixa de 42px com fonte 13.5px, as folgas acima/abaixo do texto
  // se igualam em ~28px, ou seja altura - fontSize*1.03. Cada 2px de
  // line-height desloca o texto 1px, então a conta precisa ser exata.
  const lh = Math.round(opts.h - opts.size * 1.03);
  // Nenhuma pílula leva `border`: o html2canvas desenha bordas por fora da
  // caixa mesmo com box-sizing:border-box, então a pílula com contorno saía
  // mais alta que a vizinha sem contorno e as duas ficavam desencontradas.
  // Todas as pílulas usam fundo sólido, que ele rasteriza na altura exata.
  return `<span style="box-sizing:border-box;display:inline-block;height:${opts.h}px;line-height:${lh}px;padding:0 ${opts.pad}px;border-radius:${opts.radius};background:${opts.bg};font-size:${opts.size}px;font-weight:${opts.weight};letter-spacing:${opts.tracking};text-transform:uppercase;color:${opts.color};white-space:nowrap;vertical-align:top;overflow:hidden;">${escapeHtml(text)}</span>`;
}

function ensureFontsLoaded(): Promise<void> {
  return new Promise((resolve) => {
    if (!document.getElementById(FONT_LINK_ID)) {
      const link = document.createElement('link');
      link.id = FONT_LINK_ID;
      link.rel = 'stylesheet';
      link.href = FONT_HREF;
      document.head.appendChild(link);
    }
    // dá um tick pro navegador registrar o <link> antes de pedir as fontes
    setTimeout(async () => {
      try {
        // Carrega TODOS os pesos realmente usados. Faltar um aqui cria uma
        // corrida: se o html2canvas desenhar antes do peso terminar de baixar,
        // ele usa uma fonte substituta com métrica diferente e o texto sai
        // desalinhado de forma inconsistente entre uma geração e outra.
        await Promise.all([
          document.fonts.load('400 88px Anton'),
          document.fonts.load('400 96px "Bebas Neue"'),
          document.fonts.load('700 100px "Dancing Script"'),
          document.fonts.load('400 16px Poppins'),
          document.fonts.load('500 16px Poppins'),
          document.fonts.load('600 16px Poppins'),
          document.fonts.load('700 16px Poppins'),
          document.fonts.load('800 16px Poppins'),
          document.fonts.load('italic 400 21px Poppins'),
        ]);
        await document.fonts.ready;
      } catch {
        // Font Loading API indisponível; segue mesmo assim
      }
      resolve();
    }, 50);
  });
}

function toAbsoluteUrl(url: string): string {
  try {
    return new URL(url, window.location.origin).toString();
  } catch {
    return url;
  }
}

// Carrega a imagem já validando que ela serve pro canvas. Uma imagem de outra
// origem só pode ser desenhada pelo html2canvas se vier com CORS liberado;
// sem isso o canvas fica "sujo" e a exportação falha.
//
// Tenta direto primeiro e só cai no proxy se o navegador recusar. Mandar tudo
// pro /api/proxy-image sem testar quebrava a foto no ambiente local, porque o
// dev server do Vite não executa funções serverless: a rota caía no fallback
// da SPA e devolvia index.html (HTTP 200, text/html) no lugar da imagem. E era
// desnecessário — as fotos ficam no Storage do próprio Supabase do projeto,
// que já responde com Access-Control-Allow-Origin: *.
function loadCardImage(rawUrl: string): Promise<string> {
  const abs = toAbsoluteUrl(rawUrl);
  if (abs.startsWith(`${window.location.origin}/`)) return Promise.resolve(abs);

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(abs);
    img.onerror = () => resolve(`/api/proxy-image?url=${encodeURIComponent(abs)}`);
    img.src = abs;
    setTimeout(() => resolve(`/api/proxy-image?url=${encodeURIComponent(abs)}`), 6000);
  });
}

function escapeHtml(str: string | undefined | null): string {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

interface CardData {
  title: string;
  description: string;
  ingredients: { name: string; measure: string }[];
  instructions: string[];
  garnish: string;
  method: string;
  category: string;
  author: string;
  imgSrc: string;
  logoSrc: string;
  watermarkSrc: string;
}

function toCardData(recipe: DrinkRecipe, imgSrc: string): CardData {
  return {
    title: recipe.title || '',
    description: recipe.description || '',
    ingredients: recipe.ingredients || [],
    instructions: recipe.instructions || [],
    garnish: recipe.garnish || '',
    method: recipe.method || '',
    category: recipe.category || '',
    author: formatAuthorDisplay(recipe.author) || 'Internet',
    imgSrc,
    // logo.png tem fundo transparente (some no card escuro, serve de marca
    // d'água); logo-512.png tem fundo branco sólido e é a usada no rodapé.
    logoSrc: `${window.location.origin}/img/logo-512.png`,
    watermarkSrc: `${window.location.origin}/img/logo.png`,
  };
}

// ---------------------------------------------------------------- modelo 1

// Foto ocupa o topo inteiro; o conteúdo vem num painel branco de cantos
// arredondados. É o de maior contraste: texto escuro sobre branco é o que
// melhor resiste à compressão do Instagram e à leitura no celular.
function buildClaro(d: CardData): string {
  const ingredientes = d.ingredients.map((i) => `
    <div style="display:flex;gap:10px;padding:9px 0;border-bottom:1.5px solid #efeaf4;">
      <span style="min-width:74px;text-align:right;font-size:15.5px;font-weight:800;color:${ROXO};">${escapeHtml(i.measure)}</span>
      <span style="font-size:15.5px;font-weight:600;color:#241f29;">${escapeHtml(i.name)}</span>
    </div>`).join('');

  const passos = d.instructions.map((s, i) => `
    <div style="display:flex;gap:12px;margin-bottom:12px;">
      <span style="flex-shrink:0;width:27px;height:27px;border-radius:50%;background:#17121c;color:#fff;font-size:13px;font-weight:800;display:flex;align-items:center;justify-content:center;"><span style="transform:translateY(-6px);">${i + 1}</span></span>
      <span style="font-size:14.5px;line-height:1.45;color:#3a3340;font-weight:500;">${escapeHtml(s)}</span>
    </div>`).join('');

  return `
  <div style="width:${CARD_W}px;height:${CARD_H}px;position:relative;overflow:hidden;background:#0b0a0d;font-family:'Poppins',sans-serif;">
    <!-- background-size:cover em vez de <img> com object-fit: o html2canvas
         ignora object-fit e estica a foto, deixando o drink achatado. -->
    <div style="position:absolute;top:0;left:0;right:0;height:620px;overflow:hidden;background:#000;">
      ${d.imgSrc ? `<div style="position:absolute;top:0;right:0;bottom:0;left:0;background-image:url('${d.imgSrc}');background-size:cover;background-position:center;"></div>` : ''}
      <div style="position:absolute;top:0;right:0;bottom:0;left:0;background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,0) 35%,rgba(0,0,0,.35) 100%);"></div>
    </div>
    <div style="position:absolute;top:34px;left:44px;right:44px;font-size:0;">
      ${d.category ? pill(d.category, { h: 40, radius: '999px', bg: ROXO, color: '#fff', size: 14, weight: 800, pad: 20, tracking: '.09em' }) : ''}
      ${d.method ? `<span style="display:inline-block;width:10px;"></span>${pill(d.method, { h: 40, radius: '999px', bg: 'rgba(0,0,0,.55)', color: '#fff', size: 14, weight: 700, pad: 20, tracking: '.09em' })}` : ''}
    </div>
    <div id="mfc-sheet" style="position:absolute;top:560px;left:0;right:0;bottom:0;background:#fff;border-radius:46px 46px 0 0;padding:40px 46px 0;display:flex;flex-direction:column;">
      <!-- padding-bottom reserva o transbordo do Anton: a fonte desenha abaixo
           da própria caixa de linha e, sem essa folga, a linha de dados logo
           abaixo era coberta pelas letras do título. -->
      <h1 style="font-family:'Anton',sans-serif;font-size:78px;line-height:1;text-transform:uppercase;margin:0;padding-bottom:22px;color:#17121c;letter-spacing:-.01em;">${escapeHtml(d.title)}</h1>
      <div style="display:flex;align-items:center;gap:10px;margin:0 0 20px;">
        <div style="width:64px;height:5px;background:${ROXO};border-radius:3px;"></div>
        <span style="font-size:14px;font-weight:700;color:#7b6b88;text-transform:uppercase;letter-spacing:.08em;">${escapeHtml(d.method)} &middot; 1 porção &middot; ${escapeHtml(d.author)}</span>
      </div>
      <div style="display:flex;gap:30px;flex:1;min-height:0;">
        <div style="width:390px;flex-shrink:0;">
          <div style="font-family:'Anton',sans-serif;font-size:25px;color:${ROXO};text-transform:uppercase;margin-bottom:14px;letter-spacing:.02em;">Ingredientes</div>
          ${ingredientes}
          ${d.garnish ? `<div style="margin-top:16px;padding:14px 16px;background:#f7f2fb;border-radius:12px;border-left:5px solid ${ROXO};">
            <div style="font-size:12px;font-weight:800;color:${ROXO};text-transform:uppercase;letter-spacing:.09em;margin-bottom:4px;">Guarnição</div>
            <div style="font-size:14.5px;color:#3a3340;font-weight:600;">${escapeHtml(d.garnish)}</div></div>` : ''}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-family:'Anton',sans-serif;font-size:25px;color:${ROXO};text-transform:uppercase;margin-bottom:14px;letter-spacing:.02em;">Modo de Preparo</div>
          ${passos}
        </div>
      </div>
      <div data-spacer="1" style="flex:1 1 0;min-height:0;"></div>
      <div style="padding:20px 0 22px;border-top:2px solid #efeaf4;display:flex;align-items:center;justify-content:space-between;height:46px;box-sizing:content-box;">
        <div style="display:flex;align-items:center;gap:12px;height:46px;">
          <img src="${d.logoSrc}" crossorigin="anonymous" style="width:46px;height:46px;border-radius:50%;object-fit:cover;flex-shrink:0;" />
          <div style="display:flex;flex-direction:column;justify-content:center;">
            <div style="font-family:'Anton',sans-serif;font-size:19px;color:#17121c;text-transform:uppercase;line-height:1.2;">MyFirstCocktail</div>
            <div style="font-size:12px;color:#8a7d94;line-height:1.2;">Beba com moderação</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;font-size:14px;font-weight:800;color:${ROXO};letter-spacing:.03em;line-height:1;">MYFIRSTCOCKTAIL.COM.BR</div>
      </div>
    </div>
  </div>`;
}

// ---------------------------------------------------------------- modelo 2

// Foto no topo, título grande em Bebas Neue sobre ela, três blocos roxos com
// os dados e dois painéis translúcidos. A marca d'água é um logo grande e
// único no canto (ladrilhar deixava o fundo visualmente ruidoso).
function buildEscuro(d: CardData): string {
  const blocos = [['MÉTODO', d.method], ['RENDE', '1 porção'], ['FONTE', d.author]]
    .filter(([, v]) => v)
    .map(([k, v]) => `
      <div style="flex:1;background:linear-gradient(135deg,${ROXO} 0%,#6b1bb0 100%);border-radius:12px;padding:13px 16px;">
        <div style="font-size:10.5px;font-weight:800;letter-spacing:.12em;opacity:.85;">${k}</div>
        <div style="font-size:16px;font-weight:800;margin-top:3px;">${escapeHtml(v)}</div>
      </div>`).join('');

  const ingredientes = d.ingredients.map((i) => `
    <div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.12);">
      <span style="min-width:72px;text-align:right;font-size:15px;font-weight:800;color:${ROXO_CLARO};">${escapeHtml(i.measure)}</span>
      <span style="font-size:15px;color:#f0eaf6;font-weight:500;">${escapeHtml(i.name)}</span>
    </div>`).join('');

  const passos = d.instructions.map((s, i) => `
    <div style="display:flex;gap:11px;margin-bottom:11px;">
      <span style="flex-shrink:0;width:25px;height:25px;border-radius:7px;background:${ROXO};font-size:12.5px;font-weight:800;display:flex;align-items:center;justify-content:center;"><span style="transform:translateY(-6px);">${i + 1}</span></span>
      <span style="font-size:14px;line-height:1.45;color:#e8e1ef;">${escapeHtml(s)}</span>
    </div>`).join('');

  return `
  <div style="width:${CARD_W}px;height:${CARD_H}px;position:relative;overflow:hidden;background:#140f1a;font-family:'Poppins',sans-serif;color:#fff;">
    <!-- background-size:cover em vez de <img> com object-fit: o html2canvas
         ignora object-fit e estica a foto para preencher a caixa, deixando o
         drink achatado. Com background ele respeita a proporção original. -->
    <div style="position:absolute;top:0;left:0;right:0;height:560px;overflow:hidden;background:#000;">
      ${d.imgSrc ? `<div style="position:absolute;top:0;right:0;bottom:0;left:0;background-image:url('${d.imgSrc}');background-size:cover;background-position:center;"></div>` : ''}
      <div style="position:absolute;top:0;right:0;bottom:0;left:0;background:linear-gradient(180deg,rgba(20,15,26,.35) 0%,rgba(20,15,26,0) 40%,rgba(20,15,26,.95) 100%);"></div>
    </div>
    <img src="${d.watermarkSrc}" crossorigin="anonymous" style="position:absolute;bottom:90px;right:-120px;width:620px;opacity:.07;" />
    <div style="position:absolute;top:36px;left:44px;right:44px;font-size:0;">
      ${d.category ? pill(d.category, { h: 42, radius: '6px', bg: ROXO, color: '#fff', size: 13.5, weight: 800, pad: 22, tracking: '.1em' }) : ''}
      ${d.method ? `<span style="display:inline-block;width:10px;"></span>${pill(d.method, { h: 42, radius: '6px', bg: 'rgba(0,0,0,.62)', color: '#fff', size: 13.5, weight: 700, pad: 22, tracking: '.1em' })}` : ''}
    </div>
    <!-- O bloco começa mais acima (antes 430px) e o título ganhou line-height
         folgado: com .9 as letras do Bebas Neue transbordavam a própria caixa
         e os blocos roxos, posicionados logo abaixo, cobriam a base delas. -->
    <div id="mfc-sheet" style="position:absolute;top:396px;left:0;right:0;bottom:0;padding:0 46px;display:flex;flex-direction:column;">
      <!-- O Bebas Neue desenha bem abaixo da sua própria linha de base: em 96px
           a tinta desce até ~94px enquanto a caixa de linha tem 111px, e o
           navegador ainda centra a linha dentro dela. O resultado é que as
           letras vazavam por baixo e os blocos roxos cobriam o título. Daí o
           padding-bottom generoso, que reserva esse transbordo. -->
      <h1 style="font-family:'Bebas Neue',sans-serif;font-size:96px;line-height:1;text-transform:uppercase;margin:0;padding-bottom:30px;letter-spacing:.01em;text-shadow:0 4px 24px rgba(0,0,0,.9);">${escapeHtml(d.title)}</h1>
      ${d.description ? `<p style="font-size:17px;font-style:italic;color:#d2c7dd;margin:0;max-width:640px;line-height:1.4;">${escapeHtml(d.description)}</p>` : ''}
      <div style="display:flex;gap:9px;margin:16px 0 20px;">${blocos}</div>
      <div style="display:flex;gap:16px;flex:1;min-height:0;">
        <div style="width:400px;flex-shrink:0;background:rgba(255,255,255,.07);border:1.5px solid rgba(155,47,224,.55);border-radius:18px;padding:20px 22px;">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:30px;color:${ROXO_CLARO};letter-spacing:.04em;margin-bottom:12px;">INGREDIENTES</div>
          ${ingredientes}
          ${d.garnish ? `<div style="margin-top:14px;font-size:13.5px;color:#cbbfd8;"><b style="color:${ROXO_CLARO};">Guarnição:</b> ${escapeHtml(d.garnish)}</div>` : ''}
        </div>
        <div style="flex:1;min-width:0;background:rgba(255,255,255,.07);border:1.5px solid rgba(155,47,224,.55);border-radius:18px;padding:20px 22px;">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:30px;color:${ROXO_CLARO};letter-spacing:.04em;margin-bottom:12px;">MODO DE PREPARO</div>
          ${passos}
        </div>
      </div>
      <div data-spacer="1" style="flex:1 1 0;min-height:0;"></div>
      <!-- Altura fixa no rodapé e nos dois lados: o botão da direita e o bloco
           do logo tinham alturas próprias diferentes, e o space-between os
           deixava em linhas de base distintas. -->
      <div style="padding:18px 0 26px;display:flex;align-items:center;justify-content:space-between;height:46px;box-sizing:content-box;">
        <div style="display:flex;align-items:center;gap:12px;height:46px;">
          <img src="${d.logoSrc}" crossorigin="anonymous" style="width:46px;height:46px;border-radius:50%;object-fit:cover;flex-shrink:0;" />
          <div style="display:flex;flex-direction:column;justify-content:center;">
            <div style="font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:.05em;line-height:1.1;">MYFIRSTCOCKTAIL</div>
            <div style="font-size:12px;color:#9a8ca6;line-height:1.2;">Beba com moderação</div>
          </div>
        </div>
        <div style="box-sizing:border-box;height:40px;line-height:26px;padding:0 22px;border-radius:8px;background:${ROXO};font-size:13.5px;font-weight:800;letter-spacing:.04em;white-space:nowrap;">MYFIRSTCOCKTAIL.COM.BR</div>
      </div>
    </div>
  </div>`;
}

// ---------------------------------------------------------------- modelo 3

// Fundo roxo em degradê com halos de luz e a foto recortada num círculo. O
// recorte circular isola o drink do fundo da própria foto, o que ajuda quando
// a cena original é escura ou poluída.
function buildCirculo(d: CardData): string {
  const ingredientes = d.ingredients.map((i) => `
    <div style="display:flex;gap:10px;padding:7.5px 0;border-bottom:1px solid rgba(255,255,255,.14);">
      <span style="min-width:72px;text-align:right;font-size:15px;font-weight:800;color:#fff;">${escapeHtml(i.measure)}</span>
      <span style="font-size:15px;color:#e3daec;font-weight:500;">${escapeHtml(i.name)}</span>
    </div>`).join('');

  const passos = d.instructions.map((s, i) => `
    <div style="display:flex;gap:11px;margin-bottom:11px;">
      <span style="flex-shrink:0;width:26px;height:26px;border-radius:50%;border:2px solid ${ROXO_CLARO};font-size:12.5px;font-weight:800;display:flex;align-items:center;justify-content:center;color:${ROXO_CLARO};"><span style="transform:translateY(-6px);">${i + 1}</span></span>
      <span style="font-size:14px;line-height:1.45;color:#e8e1ef;">${escapeHtml(s)}</span>
    </div>`).join('');

  const selo = [d.category, d.method].filter(Boolean).join(' &middot; ');

  return `
  <div style="width:${CARD_W}px;height:${CARD_H}px;position:relative;overflow:hidden;background:linear-gradient(160deg,#2a1240 0%,#15091f 55%,#0b0a0d 100%);font-family:'Poppins',sans-serif;color:#fff;">
    <div style="position:absolute;top:-190px;right:-170px;width:620px;height:620px;border-radius:50%;background:radial-gradient(circle,rgba(155,47,224,.55) 0%,rgba(155,47,224,0) 70%);"></div>
    <div style="position:absolute;bottom:-130px;left:-150px;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,rgba(207,139,255,.28) 0%,rgba(207,139,255,0) 70%);"></div>
    ${selo ? `<div style="position:absolute;top:44px;left:0;right:0;text-align:center;font-size:0;">
      <span style="box-sizing:border-box;display:inline-block;height:40px;line-height:27px;padding:0 26px;border-radius:999px;border:2px solid ${ROXO_CLARO};font-size:13px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:${ROXO_CLARO};white-space:nowrap;">${selo}</span>
    </div>` : ''}
    <div style="position:absolute;top:104px;left:${(CARD_W - CIRCLE_SIZE) / 2}px;width:${CIRCLE_SIZE}px;height:${CIRCLE_SIZE}px;border-radius:50%;overflow:hidden;border:7px solid rgba(207,139,255,.5);box-shadow:0 20px 70px rgba(0,0,0,.75);background:#000;">
      ${d.imgSrc ? `<div style="position:absolute;top:0;right:0;bottom:0;left:0;background-image:url('${d.imgSrc}');background-size:cover;background-position:center;"></div>` : ''}
    </div>
    <div style="position:absolute;top:566px;left:0;right:0;text-align:center;padding:0 50px;">
      <h1 style="font-family:'Anton',sans-serif;font-size:80px;line-height:1;text-transform:uppercase;margin:0;padding-bottom:12px;text-shadow:0 4px 30px rgba(0,0,0,.6);">${escapeHtml(d.title)}</h1>
      ${d.description ? `<p style="font-size:17px;font-style:italic;color:#cfc3db;margin:0 auto;max-width:720px;line-height:1.4;">${escapeHtml(d.description)}</p>` : ''}
    </div>
    <div id="mfc-sheet" style="position:absolute;top:${d.description ? 718 : 690}px;left:46px;right:46px;bottom:0;display:flex;flex-direction:column;">
      <div style="display:flex;gap:14px;align-items:flex-start;flex:1;min-height:0;">
        <div style="width:398px;flex-shrink:0;background:rgba(255,255,255,.09);border-radius:20px;padding:20px 24px;border-top:4px solid ${ROXO_CLARO};">
          <div style="font-family:'Anton',sans-serif;font-size:24px;letter-spacing:.03em;color:${ROXO_CLARO};text-transform:uppercase;margin-bottom:12px;">Ingredientes</div>
          ${ingredientes}
          ${d.garnish ? `<div style="margin-top:13px;font-size:13.5px;color:#cfc3db;"><b style="color:${ROXO_CLARO};">Guarnição:</b> ${escapeHtml(d.garnish)}</div>` : ''}
        </div>
        <div style="flex:1;min-width:0;background:rgba(255,255,255,.09);border-radius:20px;padding:20px 24px;border-top:4px solid ${ROXO_CLARO};">
          <div style="font-family:'Anton',sans-serif;font-size:24px;letter-spacing:.03em;color:${ROXO_CLARO};text-transform:uppercase;margin-bottom:12px;">Modo de Preparo</div>
          ${passos}
        </div>
      </div>
      <div data-spacer="1" style="flex:1 1 0;min-height:0;"></div>
      <div style="padding:18px 0 28px;display:flex;align-items:center;justify-content:space-between;height:48px;box-sizing:content-box;">
        <div style="display:flex;align-items:center;gap:12px;height:48px;">
          <img src="${d.logoSrc}" crossorigin="anonymous" style="width:48px;height:48px;border-radius:50%;object-fit:cover;flex-shrink:0;" />
          <div style="display:flex;flex-direction:column;justify-content:center;">
            <div style="font-family:'Anton',sans-serif;font-size:20px;text-transform:uppercase;line-height:1.2;">MyFirstCocktail</div>
            <div style="font-size:12px;color:#a497b0;line-height:1.2;">Beba com moderação</div>
          </div>
        </div>
        <div style="box-sizing:border-box;height:42px;line-height:28px;padding:0 24px;border-radius:999px;border:2px solid ${ROXO_CLARO};font-size:13.5px;font-weight:800;color:${ROXO_CLARO};letter-spacing:.04em;white-space:nowrap;">MYFIRSTCOCKTAIL.COM.BR</div>
      </div>
    </div>
  </div>`;
}

const BUILDERS: Record<CardModel, (d: CardData) => string> = {
  claro: buildClaro,
  escuro: buildEscuro,
  circulo: buildCirculo,
};

// Uma receita longa pode estourar a altura fixa do card. Em vez de cortar, o
// bloco de conteúdo é reduzido proporcionalmente: ele é medido numa largura
// maior (1/k) e desenhado com scale(k), de modo que o resultado volte a ocupar
// exatamente a área original sem distorcer. Só encolhe — ampliar uma receita
// curta deixaria a tipografia fora de escala em relação à foto.
const MIN_SCALE = 0.62;

function fitSheet(container: HTMLElement): void {
  const sheet = container.querySelector('#mfc-sheet') as HTMLElement | null;
  if (!sheet) return;

  const available = sheet.offsetHeight;
  if (!available) return;

  // Altura real do conteúdo: a soma dos filhos, pulando o espaçador elástico
  // (ele absorve justamente a sobra que se quer medir). Ler scrollHeight não
  // serve porque o próprio painel tem altura fixa pelo posicionamento.
  const measure = (el: HTMLElement): number => {
    let total = 0;
    for (const child of Array.from(el.children) as HTMLElement[]) {
      if (child.dataset.spacer === '1') continue;
      const cs = getComputedStyle(child);
      total += child.offsetHeight + parseFloat(cs.marginTop || '0') + parseFloat(cs.marginBottom || '0');
    }
    const cs = getComputedStyle(el);
    return total + parseFloat(cs.paddingTop || '0') + parseFloat(cs.paddingBottom || '0');
  };

  let k = 1;
  for (let pass = 0; pass < 4; pass++) {
    const used = measure(sheet);
    if (used <= available / k + 1) break;
    const next = Math.max(MIN_SCALE, (available / used) * k);
    if (Math.abs(next - k) < 0.003) break;
    k = next;
    // Compensa a escala alargando o conteúdo, para ele continuar ocupando a
    // largura inteira do card depois do scale().
    sheet.style.width = `${sheet.offsetWidth / k}px`;
    sheet.style.height = `${available / k}px`;
    sheet.style.transformOrigin = 'top left';
    sheet.style.transform = `scale(${k})`;
    if (k === MIN_SCALE) break;
  }
}

function waitForOne(src: string): Promise<void> {
  return new Promise((resolve) => {
    const probe = new Image();
    probe.crossOrigin = 'anonymous';
    probe.onload = () => resolve();
    probe.onerror = () => resolve(); // não trava em imagem quebrada
    probe.src = src;
    setTimeout(resolve, 5000); // trava de segurança
  });
}

// Espera as <img> e também as fotos declaradas via background-image (o modelo
// "circulo" usa background porque o html2canvas rende object-fit de forma
// inconsistente). Rasterizar antes de a foto carregar produz um card com o
// buraco vazio no lugar dela.
function waitForImages(container: HTMLElement): Promise<void[]> {
  const pending: Promise<void>[] = [];

  for (const img of Array.from(container.querySelectorAll('img'))) {
    if (img.complete && img.naturalWidth > 0) continue;
    pending.push(new Promise<void>((resolve) => {
      img.addEventListener('load', () => resolve(), { once: true });
      img.addEventListener('error', () => resolve(), { once: true });
      setTimeout(resolve, 5000);
    }));
  }

  for (const el of Array.from(container.querySelectorAll<HTMLElement>('*'))) {
    const bg = getComputedStyle(el).backgroundImage;
    const match = bg && bg.match(/url\(["']?(.+?)["']?\)/);
    if (match) pending.push(waitForOne(match[1]));
  }

  return Promise.all(pending);
}

function slugify(title: string): string {
  return title
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'receita';
}

// Desenha um modelo e devolve o JPEG. `quality` mais baixa serve às miniaturas
// do seletor, que não precisam de resolução de publicação.
async function renderToBlob(recipe: DrinkRecipe, model: CardModel, imgSrc: string, quality: number): Promise<Blob> {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '0';
  container.innerHTML = BUILDERS[model](toCardData(recipe, imgSrc));
  document.body.appendChild(container);

  try {
    await waitForImages(container);
    // um respiro de dois frames pro navegador aplicar fontes e estilos
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    fitSheet(container);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const canvas = await html2canvas(container.firstElementChild as HTMLElement, {
      backgroundColor: '#0b0a0d',
      useCORS: true,
      scale: 1,
      width: CARD_W,
      height: CARD_H,
      windowWidth: CARD_W,
      windowHeight: CARD_H,
      logging: false,
    });

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob) throw new Error('Falha ao gerar a imagem do card.');
    return blob;
  } finally {
    document.body.removeChild(container);
  }
}

// Miniaturas para o seletor de modelo. Devolve uma URL de objeto por modelo —
// quem chamar deve liberá-las com URL.revokeObjectURL ao fechar o seletor.
export async function renderRecipeCardPreviews(recipe: DrinkRecipe): Promise<Record<CardModel, string>> {
  await ensureFontsLoaded();
  const imgSrc = recipe.imageUrl ? await loadCardImage(recipe.imageUrl) : '';

  const out = {} as Record<CardModel, string>;
  for (const { id } of CARD_MODELS) {
    const blob = await renderToBlob(recipe, id, imgSrc, 0.72);
    out[id] = URL.createObjectURL(blob);
  }
  return out;
}

// Gera o card no modelo escolhido e salva o arquivo.
export async function generateRecipeCard(recipe: DrinkRecipe, model: CardModel = 'claro'): Promise<void> {
  await ensureFontsLoaded();
  const imgSrc = recipe.imageUrl ? await loadCardImage(recipe.imageUrl) : '';
  const blob = await renderToBlob(recipe, model, imgSrc, 0.92);

  const filename = `card_${slugify(recipe.title)}_${model}.jpg`;

  const picker = (window as any).showSaveFilePicker;
  if (typeof picker === 'function') {
    try {
      const handle = await picker({
        suggestedName: filename,
        types: [{ description: 'Imagem JPEG', accept: { 'image/jpeg': ['.jpg'] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err: any) {
      if (err?.name === 'AbortError') return; // usuário cancelou o diálogo
      // qualquer outro erro: cai no fallback de download abaixo
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
