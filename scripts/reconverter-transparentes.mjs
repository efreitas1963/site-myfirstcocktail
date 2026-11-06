// Regera em WebP, preservando a transparencia, os PNGs que tinham canal alfa.
//
// A passada geral (converter-webp.mjs) achata tudo contra fundo branco, o que
// serve para foto — mas desenho de copo, logo de parceiro e recorte de
// ingrediente sao exibidos sobre o fundo da pagina, que tem textura: achatados,
// aparecem dentro de um retangulo branco.
//
// Rodar depois de converter-webp.mjs, sobre os mesmos arquivos.

import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const RAIZ = path.join(process.cwd(), 'public', 'uploads')
const LADO_MAXIMO = 1200
const QUALIDADE = 82
const QUALIDADE_ALFA = 90

function listarPngs(dir) {
  const achados = []
  for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
    const caminho = path.join(dir, entrada.name)
    if (entrada.isDirectory()) achados.push(...listarPngs(caminho))
    else if (/\.png$/i.test(entrada.name)) achados.push(caminho)
  }
  return achados
}

let regeradas = 0
let bytes = 0

for (const png of listarPngs(RAIZ)) {
  const meta = await sharp(png).metadata()
  if (!meta.hasAlpha) continue

  const destino = png.replace(/\.png$/i, '.webp')
  const buffer = await sharp(png)
    .rotate()
    .resize(LADO_MAXIMO, LADO_MAXIMO, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALIDADE, alphaQuality: QUALIDADE_ALFA })
    .toBuffer()

  fs.writeFileSync(destino, buffer)
  regeradas++
  bytes += buffer.length
}

console.log(`${regeradas} imagens regeradas com transparencia`)
console.log(`total: ${(bytes / 1024).toFixed(0)} KB`)
