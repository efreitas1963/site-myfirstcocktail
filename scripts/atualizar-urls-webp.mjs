// Troca .jpg/.jpeg/.png por .webp na coluna imageurl das tabelas do Supabase.
//
// Roda depois de converter-webp.mjs. Sem este passo o site continuaria pedindo
// os arquivos antigos: quem decide o que a tela carrega e a URL gravada no
// banco, nao o arquivo que existe na pasta.
//
// Simulacao (nao escreve nada):  node --env-file=.env.local scripts/atualizar-urls-webp.mjs
// Gravando:                      node --env-file=.env.local scripts/atualizar-urls-webp.mjs --gravar
//
// So altera linhas cujo .webp ja existe em public/uploads. Uma URL apontando
// para arquivo inexistente fica como esta: trocar a extensao nesse caso
// trocaria uma imagem quebrada por outra, escondendo o problema real.

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
  console.error('Faltam SUPABASE_URL / SUPABASE_ANON_KEY. Rode com --env-file=.env.local')
  process.exit(1)
}

// A escrita exige sessao de administrador: as policies de RLS so liberam
// alteracao de conteudo para o e-mail do admin (restringir_escrita_ao_admin.sql).
const EMAIL = process.env.ADMIN_EMAIL
const SENHA = process.env.ADMIN_SENHA

const gravar = process.argv.includes('--gravar')
const TABELAS = ['recipes', 'liqueurs', 'syrups', 'glasses', 'ingredients']

async function entrarComoAdmin() {
  if (!EMAIL || !SENHA) return null
  const r = await fetch(`${URL_BASE}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: CHAVE, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: SENHA }),
  })
  if (!r.ok) {
    console.error('Login do admin falhou:', await r.text())
    process.exit(1)
  }
  const { access_token } = await r.json()
  return access_token
}

const token = gravar ? await entrarComoAdmin() : null
if (gravar && !token) {
  console.error('Para gravar, defina ADMIN_EMAIL e ADMIN_SENHA no ambiente.')
  process.exit(1)
}

const cabecalhos = {
  apikey: CHAVE,
  Authorization: `Bearer ${token || CHAVE}`,
  'Content-Type': 'application/json',
}

console.log(gravar ? '>> GRAVANDO' : '>> SIMULACAO (nada sera escrito)')
console.log('')

let totalTrocadas = 0
let totalSemArquivo = 0
let totalJaWebp = 0
const semArquivo = []

for (const tabela of TABELAS) {
  const r = await fetch(`${URL_BASE}/rest/v1/${tabela}?select=id,imageurl`, { headers: cabecalhos })
  const linhas = await r.json()

  let trocadas = 0
  for (const linha of linhas) {
    const atual = linha.imageurl || ''
    if (!atual.startsWith('/uploads')) continue
    if (atual.endsWith('.webp')) { totalJaWebp++; continue }
    if (!/\.(jpe?g|png)$/i.test(atual)) continue

    const nova = atual.replace(/\.(jpe?g|png)$/i, '.webp')
    const arquivo = path.join(process.cwd(), 'public', decodeURIComponent(nova))

    if (!fs.existsSync(arquivo)) {
      totalSemArquivo++
      semArquivo.push(`${tabela}: ${atual}`)
      continue
    }

    if (gravar) {
      const up = await fetch(`${URL_BASE}/rest/v1/${tabela}?id=eq.${encodeURIComponent(linha.id)}`, {
        method: 'PATCH',
        headers: { ...cabecalhos, Prefer: 'return=minimal' },
        body: JSON.stringify({ imageurl: nova }),
      })
      if (!up.ok) {
        console.error(`  falha em ${tabela}/${linha.id}:`, await up.text())
        continue
      }
    }
    trocadas++
  }

  console.log(`${tabela.padEnd(12)} ${trocadas} URLs`)
  totalTrocadas += trocadas
}

console.log('')
console.log(`trocadas:        ${totalTrocadas}`)
console.log(`ja eram .webp:   ${totalJaWebp}`)
console.log(`sem arquivo:     ${totalSemArquivo}  (mantidas como estao)`)
if (semArquivo.length) semArquivo.forEach((s) => console.log('  ' + s))
