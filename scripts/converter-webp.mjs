// Converte as imagens de public/uploads para WebP.
//
// Por padrao roda em modo simulacao: mede o que aconteceria e nao escreve nada.
// Para gravar de verdade:  node scripts/converter-webp.mjs --gravar
// Para apagar os originais depois de conferir:  --gravar --apagar-originais
//
// O que o site le fica no banco (coluna imageurl de recipes, liqueurs, syrups,
// glasses e ingredients), entao converter os arquivos sem atualizar o banco
// quebraria todas as fotos. Quem cuida das URLs e o script atualizar-urls-webp.mjs,
// rodado depois deste.

import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const RAIZ = path.join(process.cwd(), 'public', 'uploads')
const LADO_MAXIMO = 1200
const QUALIDADE = 82

const gravar = process.argv.includes('--gravar')
const apagarOriginais = process.argv.includes('--apagar-originais')

function listarImagens(dir) {
  const achados = []
  for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
    const caminho = path.join(dir, entrada.name)
    if (entrada.isDirectory()) achados.push(...listarImagens(caminho))
    else if (/\.(jpe?g|png)$/i.test(entrada.name)) achados.push(caminho)
  }
  return achados
}

const imagens = listarImagens(RAIZ)
console.log(`${imagens.length} imagens em public/uploads`)
console.log(gravar ? '>> GRAVANDO' : '>> SIMULACAO (nada sera escrito)')
console.log('')

let bytesAntes = 0
let bytesDepois = 0
let convertidas = 0
let falhas = 0
const erros = []

for (const origem of imagens) {
  const destino = origem.replace(/\.(jpe?g|png)$/i, '.webp')
  const tamanhoAntes = fs.statSync(origem).size

  try {
    // withoutEnlargement evita esticar imagem que ja e menor que o limite:
    // ampliar nao acrescenta detalhe, so peso.
    const buffer = await sharp(origem)
      .rotate() // respeita a orientacao EXIF antes de redimensionar
      .resize(LADO_MAXIMO, LADO_MAXIMO, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: QUALIDADE })
      .toBuffer()

    bytesAntes += tamanhoAntes
    bytesDepois += buffer.length
    convertidas++

    if (gravar) {
      fs.writeFileSync(destino, buffer)
      if (apagarOriginais) fs.unlinkSync(origem)
    }
  } catch (err) {
    falhas++
    erros.push(`${path.relative(RAIZ, origem)}: ${err.message}`)
  }
}

const mb = (b) => (b / 1048576).toFixed(1)
console.log(`convertidas: ${convertidas}`)
console.log(`falhas:      ${falhas}`)
console.log('')
console.log(`antes:   ${mb(bytesAntes)} MB`)
console.log(`depois:  ${mb(bytesDepois)} MB`)
console.log(`reducao: ${(100 - (bytesDepois / bytesAntes) * 100).toFixed(1)}%`)

if (erros.length) {
  console.log('\nerros:')
  erros.slice(0, 20).forEach((e) => console.log('  ' + e))
  if (erros.length > 20) console.log(`  ... e mais ${erros.length - 20}`)
}
