import html2canvas from 'html2canvas';
import { DrinkRecipe } from '../types.ts';
import { formatAuthorDisplay } from './recipeProcessingService';

// Gera um card de receita no modelo usado no Instagram (@myfirstcocktail):
// fundo preto, acentos roxo-neon, título em Anton, badges, ingredientes/preparo.
// O resultado é salvo como .jpg, perguntando ao usuário onde salvar quando o
// navegador suportar a File System Access API (Chrome/Edge); caso contrário,
// cai no download padrão do navegador.

const FONT_LINK_ID = 'recipe-card-fonts';
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Anton&family=Poppins:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap';

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
        await Promise.all([
          document.fonts.load('400 88px Anton'),
          document.fonts.load('700 17px Poppins'),
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

function badgeHtml(label: string, iconPath: string): string {
  // o conteúdo interno é deslocado -3px (transform não afeta o tamanho da pílula)
  // pra compensar um desvio sistemático do html2canvas ao medir a baseline da fonte
  return `<span style="display:inline-block;background:#9b2fe0;color:#fff;font-size:13px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;padding:7px 16px;border-radius:999px;"><span style="display:flex;align-items:center;gap:6px;line-height:1;transform:translateY(-3px);"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;display:block;">${iconPath}</svg><span style="line-height:1;">${escapeHtml(label)}</span></span></span>`;
}

function buildCardHtml(recipe: DrinkRecipe): string {
  const imgSrc = resolveImageSrc(recipe.imageUrl);
  // logo.png tem fundo transparente (texto roxo/preto) e some no card escuro;
  // logo-512.png tem fundo branco sólido, por isso é a usada aqui
  const logoSrc = `${window.location.origin}/img/logo-512.png`;
  const authorDisplay = formatAuthorDisplay(recipe.author) || 'Internet';

  const badges = [
    recipe.category ? badgeHtml(recipe.category, BADGE_ICONS[recipe.category] || PERSON_ICON) : '',
    recipe.method ? badgeHtml(recipe.method, BADGE_ICONS[recipe.method] || PERSON_ICON) : '',
    authorDisplay ? badgeHtml(authorDisplay, PERSON_ICON) : '',
  ].filter(Boolean).join('');

  const ingredientsHtml = (recipe.ingredients || []).map((ing) => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid #2b2832;font-size:17px;">
      <span style="color:#f1eef4;font-weight:500;">${escapeHtml(ing.name)}</span>
      <span style="color:#c084fc;font-weight:700;">${escapeHtml(ing.measure)}</span>
    </div>
  `).join('');

  const stepsHtml = (recipe.instructions || []).map((step, idx) => `
    <div style="display:flex;gap:14px;align-items:flex-start;font-size:16px;line-height:1.55;color:#e9e5ee;${idx > 0 ? 'margin-top:14px;' : ''}">
      <span style="flex-shrink:0;width:26px;height:26px;background:#9b2fe0;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;"><span style="transform:translateY(-6px);">${idx + 1}</span></span>
      <span>${escapeHtml(step)}</span>
    </div>
  `).join('');

  const hasGarnish = !!recipe.garnish;

  return `
  <div style="width:1080px;background:#0b0a0d;color:#fff;font-family:'Poppins',sans-serif;overflow:hidden;">
    <div style="position:relative;min-height:520px;display:flex;align-items:flex-end;padding:40px 48px 36px;overflow:hidden;">
      ${imgSrc ? `<img src="${imgSrc}" crossorigin="anonymous" style="position:absolute;top:0;right:0;height:100%;width:62%;object-fit:cover;filter:brightness(.75);" />` : ''}
      <div style="position:absolute;inset:0;background:linear-gradient(90deg,#0b0a0d 0%,#0b0a0d 38%,rgba(11,10,13,.55) 58%,rgba(11,10,13,0) 78%);"></div>
      <div style="position:relative;max-width:620px;">
        <div style="display:flex;gap:10px;margin-bottom:22px;flex-wrap:wrap;">${badges}</div>
        <h1 style="font-family:'Anton',sans-serif;font-weight:400;font-size:88px;line-height:1;text-transform:uppercase;margin:0;">${escapeHtml(recipe.title)}</h1>
        ${recipe.description ? `<p style="font-style:italic;font-size:21px;color:#d8d2e0;line-height:1.5;margin:18px 0 0;max-width:520px;">${escapeHtml(recipe.description)}</p>` : ''}
        <div style="width:150px;height:3px;background:#9b2fe0;border-radius:2px;margin-top:56px;"></div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:${hasGarnish ? '1.35fr 1fr' : '1fr'};gap:24px;padding:36px 48px 44px;">
      <div>
        <div style="background:#17151b;border:1px solid #2b2832;border-radius:18px;padding:26px 28px;margin-bottom:24px;">
          <div style="font-size:21px;font-weight:700;color:#c084fc;text-transform:uppercase;margin-bottom:18px;">Ingredientes</div>
          ${ingredientsHtml}
        </div>
        <div style="background:#17151b;border:1px solid #2b2832;border-radius:18px;padding:26px 28px;">
          <div style="font-size:21px;font-weight:700;color:#c084fc;text-transform:uppercase;margin-bottom:18px;">Modo de Preparo</div>
          ${stepsHtml}
        </div>
      </div>
      ${hasGarnish ? `
      <div>
        <div style="background:#17151b;border:1px solid #2b2832;border-radius:18px;padding:26px 28px;">
          <div style="font-size:16px;font-weight:700;color:#c084fc;text-transform:uppercase;margin-bottom:18px;">Guarnição</div>
          <div style="font-size:16px;color:#f1eef4;font-weight:500;">${escapeHtml(recipe.garnish)}</div>
        </div>
      </div>` : ''}
    </div>

    <div style="display:flex;align-items:center;justify-content:space-between;padding:26px 48px;border-top:1px solid #2b2832;">
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

export async function generateRecipeCard(recipe: DrinkRecipe): Promise<void> {
  await ensureFontsLoaded();

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '0';
  container.innerHTML = buildCardHtml(recipe);
  document.body.appendChild(container);

  try {
    await waitForImages(container);
    // dá um respiro de um frame pro navegador aplicar fontes/estilos antes de capturar
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const cardEl = container.firstElementChild as HTMLElement;
    const canvas = await html2canvas(cardEl, {
      backgroundColor: '#0b0a0d',
      useCORS: true,
      scale: 1,
      logging: false,
    });

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
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
