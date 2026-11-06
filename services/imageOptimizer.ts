// Preparo das imagens antes de subir para o Storage.
//
// Antes cada tela resolvia isso por conta propria, e com resultados diferentes:
// receitas, ingredientes e copos redimensionavam para 800px e gravavam JPEG,
// enquanto licores, xaropes, patrocinadores e a importacao de sites subiam o
// arquivo original intacto. Foi por esses ultimos que entraram imagens de 8 e
// 9 MB — numa pagina de celular, cada uma delas e o download inteiro antes da
// foto aparecer.
//
// Havia ainda um erro silencioso nas telas que "ja convertiam": o canvas
// gravava JPEG mas o nome do arquivo mantinha a extensao do original, entao um
// .png enviado virava um arquivo JPEG chamado .png. Navegador aguenta, porque
// olha o conteudo e nao o nome, mas o Storage guardava o contentType errado.
//
// Aqui tudo passa por um caminho so: redimensiona, converte para WebP e devolve
// o nome ja com a extensao certa.

/** Maior lado da imagem depois do redimensionamento, em pixels. */
const LADO_MAXIMO = 1200

/**
 * Qualidade do WebP (0 a 1).
 *
 * 0.82 fica no ponto em que a diferenca para o original nao aparece em foto de
 * drink, que e imagem com textura — justamente o tipo que esconde artefato de
 * compressao. Abaixo de 0.75 comeca a sujar area de cor lisa, como fundo.
 */
const QUALIDADE = 0.82

export interface ImagemPronta {
  blob: Blob
  /** Nome ja saneado e com a extensao .webp. */
  filename: string
}

/**
 * Transforma o nome original em algo seguro para usar como caminho no Storage,
 * trocando a extensao por .webp e acrescentando o instante atual.
 *
 * O sufixo de tempo existe porque a chave anonima do Supabase pode criar
 * objetos novos mas nao sobrescrever os que ja existem (regra de RLS): dois
 * envios de "foto.jpg" colidiriam, e o segundo falharia.
 */
export function nomeWebp(nomeOriginal: string, prefixoPadrao = 'imagem'): string {
  const base = nomeOriginal
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100) || prefixoPadrao

  return `${base}-${Date.now()}.webp`
}

/**
 * Le a imagem, reduz o maior lado para LADO_MAXIMO e devolve um WebP.
 *
 * Imagens menores que o limite nao sao ampliadas — esticar nao acrescenta
 * detalhe, so peso.
 *
 * Se o navegador nao souber gravar WebP (Safari antigo), cai para JPEG com o
 * nome correspondente, em vez de falhar o envio.
 */
export async function otimizarImagem(
  origem: Blob | File,
  nomeOriginal: string,
  prefixoPadrao = 'imagem',
): Promise<ImagemPronta> {
  const bitmap = await carregarBitmap(origem)

  const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height))
  const largura = Math.round(bitmap.width * escala)
  const altura = Math.round(bitmap.height * escala)

  const canvas = document.createElement('canvas')
  canvas.width = largura
  canvas.height = altura

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Nao foi possivel preparar a imagem.')

  // WebP guarda transparencia, entao o desenho vai direto sobre o canvas
  // vazio. Logo de parceiro e recorte de ingrediente aparecem sobre o fundo
  // da pagina, que tem textura: achatar contra branco deixaria um retangulo
  // visivel em volta.
  //
  // O fundo branco so entra quando a conversao cai para JPEG, que nao guarda
  // transparencia — sem ele, o transparente viraria preto.
  ctx.drawImage(bitmap, 0, 0, largura, altura)

  // close() so existe em ImageBitmap; o caminho alternativo devolve <img>.
  if ('close' in bitmap) bitmap.close()

  let blob = await paraBlob(canvas, 'image/webp')
  let extensao = '.webp'

  if (!blob) {
    // Caminho do JPEG: repinta tudo sobre branco antes, porque o que ja foi
    // desenhado pode ter areas transparentes.
    ctx.globalCompositeOperation = 'destination-over'
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, largura, altura)
    ctx.globalCompositeOperation = 'source-over'

    blob = await paraBlob(canvas, 'image/jpeg')
    extensao = '.jpg'
  }
  if (!blob) throw new Error('Nao foi possivel converter a imagem.')

  return {
    blob,
    filename: nomeWebp(nomeOriginal, prefixoPadrao).replace(/\.webp$/, extensao),
  }
}

// createImageBitmap decodifica fora da thread principal, o que evita travar a
// tela em imagem grande. Nem todo navegador aceita Blob direto, entao existe o
// caminho pelo <img> com object URL.
async function carregarBitmap(origem: Blob | File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(origem)
    } catch {
      // formato que o createImageBitmap recusa: tenta pelo <img>
    }
  }

  const url = URL.createObjectURL(origem)
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Arquivo nao e uma imagem valida.'))
      img.src = url
    })
  } finally {
    // Revogar aqui e seguro: o decode ja terminou quando a promise resolveu.
    URL.revokeObjectURL(url)
  }
}

function paraBlob(canvas: HTMLCanvasElement, tipo: string): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (b) => {
        // toBlob devolve PNG silenciosamente quando nao conhece o formato
        // pedido; conferir o tipo evita gravar PNG achando que e WebP.
        resolve(b && b.type === tipo ? b : null)
      },
      tipo,
      QUALIDADE,
    )
  })
}
