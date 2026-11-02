import html2canvas from 'html2canvas';
import { DrinkRecipe } from '../types.ts';
import { formatAuthorDisplay } from './recipeProcessingService';

// Gera um card de receita no modelo usado no Instagram (@myfirstcocktail):
// fundo preto, acentos roxo-neon, título em Anton, badges, ingredientes/preparo.
// O resultado é salvo como .jpg, perguntando ao usuário onde salvar quando o
// navegador suportar a File System Access API (Chrome/Edge); caso contrário,
// cai no download padrão do navegador.

const FONT_LINK_ID = 'recipe-card-fonts';
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Anton&family=Dancing+Script:wght@700&family=Poppins:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap';

// O card é exportado no tamanho natural do seu próprio conteúdo (1080px de
// largura fixa, altura variando com a receita) — forçar um canvas fixo
// (1080x1350 ou 1080x1920) deixava bastante barra preta vazia em cima/embaixo
// quando a receita era curta. O Instagram aceita qualquer proporção entre
// quadrado (1:1) e retrato (4:5) sem cortar nem adicionar barras, e o layout
// abaixo (foto no topo, conteúdo embaixo) naturalmente fica nessa faixa.
const CARD_BG = '#0b0a0d';

function ensureFontsLoaded(): Promise<void> {
  return new Promise((resolve) => {
    if (!document.getElementById(FONT_LINK_ID)) {
      const link = document.createElement('link');
      link.id = FONT_LINK_ID;
      link.rel = 'stylesheet';
      link.href = FONT_HREF;
      document.head.appendChild(link);
    }
    // dá um tick pro navegador registrar o <link> antes de pedir o carregamento das fontes
    setTimeout(async () => {
      try {
        // carrega TODOS os pesos realmente usados no card. Faltar um aqui (ex: o 600
        // dos badges) cria uma corrida: se o html2canvas desenhar antes desse peso
        // terminar de baixar, ele usa uma fonte substituta com métrica diferente,
        // deixando o texto desalinhado de forma inconsistente entre uma geração e outra.
        await Promise.all([
          document.fonts.load('400 88px Anton'),
          document.fonts.load('700 100px "Dancing Script"'),
          document.fonts.load('400 16px Poppins'),
          document.fonts.load('500 16px Poppins'),
          document.fonts.load('600 16px Poppins'),
          document.fonts.load('700 16px Poppins'),
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

function resolveImageSrc(url?: string): string {
  if (!url) return '';
  try {
    const abs = new URL(url, window.location.origin);
    if (abs.origin !== window.location.origin) {
      // imagem de outro domínio: passa pelo proxy pra não "sujar" o canvas com CORS
      return `/api/proxy-image?url=${encodeURIComponent(abs.toString())}`;
    }
    return abs.toString();
  } catch {
    return url;
  }
}

function escapeHtml(str: string | undefined | null): string {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

// Ícones (24x24, stroke) por valor de categoria/método; pessoa pro autor.
const BADGE_ICONS: Record<string, string> = {
  'Alcoólico': '<path d="M9 2h6M10 2v5.5L6 12a3 3 0 0 0-1 2.2V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5.8a3 3 0 0 0-1-2.2l-4-4.5V2M6.5 15h11"/>',
  'Sem Álcool': '<path d="M12 2s7 7.5 7 12a7 7 0 1 1-14 0c0-4.5 7-12 7-12Z"/>',
  'Clássico': '<path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.9-6.3 3.9 1.7-7-5.4-4.7 7.1-.6L12 2Z"/>',
  'Popular': '<path d="M12 21s-7-4.4-9.5-9A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 21.5 12c-2.5 4.6-9.5 9-9.5 9Z"/>',
  'Shot': '<path d="M6 3h12l-2 15.2A2 2 0 0 1 14 20h-4a2 2 0 0 1-2-1.8L6 3Z"/><path d="M5 3h14"/>',
  'Batido': '<circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/>',
  'Mexido': '<path d="M12 3a9 9 0 1 0 9 9"/><path d="M12 3v9l6 6"/>',
  'Montado': '<path d="M7 3h10l-1.2 15.2A2 2 0 0 1 13.8 20h-3.6a2 2 0 0 1-2-1.8L7 3Z"/><path d="M6 8h12"/>',
};
const PERSON_ICON = '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>';
const CART_ICON = '<circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M3 4h2l2.6 12.4a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 8H6"/>';
const SHAKER_ICON = '<path d="M8 2h8l1 4-3 3v10a2 2 0 0 1-2 2 2 2 0 0 1-2-2V9L7 6l1-4Z"/><path d="M7 9h10"/>';

// Círculo de métrica (Método/Rendimento) no topo do card, no modelo do post de
// referência do Instagram: ícone num anel roxo, rótulo pequeno em maiúsculas,
// valor em branco embaixo. Só mostra dados que a receita realmente tem.
function infoCircleHtml(label: string, value: string, iconOrNumber: { icon: string } | { number: string }): string {
  const inner = 'icon' in iconOrNumber
    ? `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#c084fc" stroke-width="1.8" style="display:block;">${iconOrNumber.icon}</svg>`
    : `<span style="font-family:'Anton',sans-serif;font-size:26px;color:#c084fc;line-height:1;display:block;transform:translateY(-11px);">${escapeHtml(iconOrNumber.number)}</span>`;
  return `
  <div style="display:flex;flex-direction:column;align-items:center;width:112px;text-align:center;">
    <div style="width:64px;height:64px;border-radius:50%;background:#1c1a21;border:1.5px solid #9b2fe0;display:flex;align-items:center;justify-content:center;margin-bottom:10px;">${inner}</div>
    <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#a79fb0;">${escapeHtml(label)}</div>
    <div style="font-size:14px;font-weight:700;color:#fff;margin-top:2px;">${escapeHtml(value)}</div>
  </div>`;
}

// Cabeçalho de painel com ícone num círculo roxo ao lado do título (Ingredientes/Modo de Preparo),
// dentro do card claro — por isso o título fica roxo-escuro em vez de roxo-claro (que não lê bem em fundo branco)
function panelHeadingHtml(title: string, iconPath: string): string {
  return `
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
    <div style="flex-shrink:0;width:34px;height:34px;border-radius:50%;background:#9b2fe0;display:flex;align-items:center;justify-content:center;">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2" style="display:block;">${iconPath}</svg>
    </div>
    <div style="font-size:19px;font-weight:700;color:#6b21a8;text-transform:uppercase;">${escapeHtml(title)}</div>
  </div>`;
}

// Divide o título em "resto" (fonte Anton, igual sempre foi) + "última
// palavra" (fonte script, Dancing Script), reproduzindo o efeito de mistura
// de fontes do modelo de referência (ex: "150 BPM" + "Ice" em cursiva).
// Títulos de uma palavra só (ex: "#Natal") ficam inteiros em Anton — dividir
// uma palavra única deixaria o título inteiro em script, fugindo do efeito.
function titleHtml(title: string): string {
  const parts = title.trim().split(/\s+/);
  if (parts.length < 2) {
    return `<span style="font-family:'Anton',sans-serif;">${escapeHtml(title)}</span>`;
  }
  const last = parts.pop()!;
  const rest = parts.join(' ');
  return `<span style="font-family:'Anton',sans-serif;">${escapeHtml(rest)} </span><span style="font-family:'Dancing Script',cursive;font-weight:700;font-size:1.25em;">${escapeHtml(last)}</span>`;
}

function buildCardHtml(recipe: DrinkRecipe, heroHeight: number): string {
  const imgSrc = resolveImageSrc(recipe.imageUrl);
  // logo.png tem fundo transparente (texto roxo/preto) e some no card escuro;
  // logo-512.png tem fundo branco sólido, por isso é a usada aqui
  const logoSrc = `${window.location.origin}/img/logo-512.png`;
  const authorDisplay = formatAuthorDisplay(recipe.author) || 'Internet';

  const infoCircles = [
    recipe.category ? infoCircleHtml('Categoria', recipe.category, { icon: BADGE_ICONS[recipe.category] || PERSON_ICON }) : '',
    recipe.method ? infoCircleHtml('Método', recipe.method, { icon: BADGE_ICONS[recipe.method] || PERSON_ICON }) : '',
    infoCircleHtml('Rendimento', '1 porção', { number: '1' }),
    infoCircleHtml('Fonte', authorDisplay, { icon: PERSON_ICON }),
  ].filter(Boolean).join('');

  // Linha "amount | name" clara (card branco), amount em roxo à esquerda numa
  // coluna de largura fixa, nome em cinza-escuro à direita — igual ao modelo
  // de referência. A guarnição (quando existe) entra como última linha,
  // identificada com o rótulo "Guarnição" no lugar da quantidade (não tem
  // quantidade real pra mostrar, mas precisa deixar claro que não é um
  // ingrediente comum).
  const ingredientRow = (amount: string, name: string) => `
    <div style="display:flex;gap:14px;padding:11px 0;border-bottom:1px solid #ece9f0;font-size:15px;">
      <span style="flex-shrink:0;width:92px;color:#9b2fe0;font-weight:700;white-space:nowrap;">${escapeHtml(amount)}</span>
      <span style="color:#241f29;font-weight:500;">${escapeHtml(name)}</span>
    </div>
  `;
  const ingredientsHtml = (recipe.ingredients || []).map((ing) => ingredientRow(ing.measure, ing.name)).join('')
    + (recipe.garnish ? ingredientRow('Guarnição', recipe.garnish) : '');

  const stepsHtml = (recipe.instructions || []).map((step, idx) => `
    <div style="display:flex;gap:14px;align-items:flex-start;font-size:15px;line-height:1.5;color:#3a3340;${idx > 0 ? 'margin-top:12px;' : ''}">
      <span style="flex-shrink:0;width:24px;height:24px;background:#9b2fe0;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;"><span style="transform:translateY(-6px);">${idx + 1}</span></span>
      <span>${escapeHtml(step)}</span>
    </div>
  `).join('');

  return `
  <div style="width:1080px;background:#0b0a0d;color:#fff;font-family:'Poppins',sans-serif;overflow:hidden;">
    <div style="position:relative;height:${heroHeight}px;overflow:hidden;background:#000;">
      ${imgSrc ? `<img src="${imgSrc}" crossorigin="anonymous" style="position:absolute;top:0;right:0;bottom:0;left:0;width:100%;height:100%;object-fit:contain;" />` : ''}
    </div>

    <div style="padding:40px 44px 0;">
      <h1 style="font-weight:400;font-size:72px;line-height:1.05;text-transform:uppercase;margin:0;">${titleHtml(recipe.title)}</h1>
      ${recipe.description ? `<p style="font-style:italic;font-size:19px;color:#d8d2e0;line-height:1.5;margin:16px 0 0;max-width:700px;">${escapeHtml(recipe.description)}</p>` : ''}
      <div style="width:130px;height:3px;background:#9b2fe0;border-radius:2px;margin:24px 0 26px;"></div>
      <div style="display:flex;gap:18px;flex-wrap:wrap;margin-bottom:28px;">${infoCircles}</div>

      <div style="background:#fff;border-radius:18px;padding:26px 30px;">
        ${panelHeadingHtml('Ingredientes', CART_ICON)}
        ${ingredientsHtml}
        <div style="margin-top:22px;">${panelHeadingHtml('Modo de Preparo', SHAKER_ICON)}</div>
        ${stepsHtml}
      </div>
    </div>

    <div style="display:flex;align-items:center;justify-content:space-between;padding:26px 44px;margin-top:36px;border-top:1px solid #2b2832;">
      <div style="display:flex;align-items:center;gap:14px;">
        <img src="${logoSrc}" crossorigin="anonymous" style="width:52px;height:52px;border-radius:50%;object-fit:cover;" />
        <div>
          <div style="font-size:17px;font-weight:700;text-transform:uppercase;">MyFirstCocktail</div>
          <div style="font-size:13px;color:#a79fb0;">Beba com moderação</div>
        </div>
      </div>
      <div style="font-size:15px;font-weight:700;color:#c084fc;">MYFIRSTCOCKTAIL.COM.BR</div>
    </div>
  </div>
  `;
}

function waitForImages(container: HTMLElement): Promise<void[]> {
  const imgs = Array.from(container.querySelectorAll('img'));
  return Promise.all(imgs.map((img) => {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();
    return new Promise<void>((resolve) => {
      img.addEventListener('load', () => resolve(), { once: true });
      img.addEventListener('error', () => resolve(), { once: true }); // não trava em imagem quebrada
      setTimeout(resolve, 5000); // trava de segurança
    });
  }));
}

function slugify(title: string): string {
  return title
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'receita';
}

// Mede a proporção real da foto (sem baixar de novo — só lê as dimensões já em
// cache do navegador) pra dimensionar a faixa do topo exatamente do tamanho da
// imagem inteira, sem cortar nem sobrar nada (object-fit:contain na altura certa).
function measureImageRatio(src: string): Promise<number> {
  return new Promise((resolve) => {
    if (!src) { resolve(16 / 9); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 16 / 9);
    img.onerror = () => resolve(16 / 9);
    img.src = src;
  });
}

export async function generateRecipeCard(recipe: DrinkRecipe): Promise<void> {
  await ensureFontsLoaded();

  const imgSrc = resolveImageSrc(recipe.imageUrl);
  const ratio = await measureImageRatio(imgSrc);
  const heroHeight = Math.round(1080 / ratio);

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '0';
  container.innerHTML = buildCardHtml(recipe, heroHeight);
  document.body.appendChild(container);

  try {
    await waitForImages(container);
    // dá um respiro de um frame pro navegador aplicar fontes/estilos antes de capturar
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const cardEl = container.firstElementChild as HTMLElement;
    const sourceCanvas = await html2canvas(cardEl, {
      backgroundColor: CARD_BG,
      useCORS: true,
      scale: 1,
      logging: false,
    });

    const blob: Blob | null = await new Promise((resolve) => sourceCanvas.toBlob(resolve, 'image/jpeg', 0.92));
    if (!blob) throw new Error('Falha ao gerar a imagem do card.');

    const filename = `card_${slugify(recipe.title)}.jpg`;

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
        if (err?.name === 'AbortError') return; // usuário cancelou o diálogo de salvar
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
  } finally {
    document.body.removeChild(container);
  }
}
