// Confere, depois da migracao, se toda URL gravada no banco tem arquivo no
// disco. Nao escreve nada.
//
//   node --env-file=.env.local scripts/conferir-webp.mjs
//
// Uma URL sem arquivo correspondente e uma imagem quebrada na tela — e o tipo
// de falha que so aparece quando alguem abre a pagina certa, entao vale medir
// de uma vez em vez de descobrir aos poucos.

import fs from 'node:fs'
import path from 'node:path'

const URL_BASE =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL
const CHAVE =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!URL_BASE || !CHAVE) {
  console.error('Faltam as variaveis do Supabase. Rode com --env-file=.env.local')
  process.exit(1)
}

const TABELAS = ['recipes', 'liqueurs', 'syrups', 'glasses', 'ingredients']
const cabecalhos = { apikey: CHAVE, Authorization: `Bearer ${CHAVE}` }

let webp = 0
let antigas = 0
let storage = 0
let vazias = 0
const quebradas = []
const naoConvertidas = []

for (const tabela of TABELAS) {
  const r = await fetch(`${URL_BASE}/rest/v1/${tabela}?select=id,imageurl`, { headers: cabecalhos })
  const linhas = await r.json()

  for (const linha of linhas) {
    const u = linha.imageurl || ''
    if (!u) { vazias++; continue }
    if (!u.startsWith('/uploads')) { storage++; continue }

    if (u.endsWith('.webp')) {
      webp++
      const arquivo = path.join(process.cwd(), 'public', decodeURIComponent(u))
      if (!fs.existsSync(arquivo)) quebradas.push(`${tabela}: ${u}`)
    } else {
      antigas++
      naoConvertidas.push(`${tabela}: ${u}`)
    }
  }
}

console.log(`em .webp         : ${webp}`)
console.log(`ainda .jpg/.png  : ${antigas}`)
console.log(`no Storage       : ${storage}`)
console.log(`sem imagem       : ${vazias}`)
console.log('')
console.log(quebradas.length ? `ARQUIVO FALTANDO : ${quebradas.length}` : 'todos os .webp existem no disco')
quebradas.forEach((q) => console.log('  ' + q))
if (naoConvertidas.length) {
  console.log('\nnao convertidas:')
  naoConvertidas.forEach((n) => console.log('  ' + n))
}
