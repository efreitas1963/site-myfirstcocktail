// Backup das tabelas do Supabase para arquivos JSON locais.
//
// Uso:
//   node scripts/backup-supabase.mjs            -> grava em backups/<data-hora>/
//   node scripts/backup-supabase.mjs --keep 30  -> mantem so os 30 backups mais recentes
//
// Nao precisa de chave secreta: le com a mesma chave anon do site. Serve para
// restaurar conteudo apagado por engano (ou por terceiros, enquanto a escrita
// no banco estiver aberta).

import { writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SUPA = 'https://vztlsfppfesdqhjzdfpj.supabase.co';
const KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_EzW-ynXhs_1XWBTiL0osCw_n2Zs4nm_';

const TABELAS = ['recipes', 'ingredients', 'glasses', 'liqueurs', 'syrups', 'sponsors'];

// Quantos backups manter (os mais antigos sao apagados). --keep 0 = manter todos.
const keepArg = process.argv.indexOf('--keep');
const KEEP = keepArg > -1 ? parseInt(process.argv[keepArg + 1], 10) : 30;

const PAGE = 1000; // o PostgREST limita o retorno; busca paginada garante tudo

async function baixarTabela(tabela) {
  const linhas = [];
  for (let offset = 0; ; offset += PAGE) {
    const url = `${SUPA}/rest/v1/${tabela}?select=*&limit=${PAGE}&offset=${offset}`;
    const res = await fetch(url, { headers: { apikey: KEY } });
    if (!res.ok) throw new Error(`${tabela}: HTTP ${res.status} — ${await res.text()}`);
    const lote = await res.json();
    linhas.push(...lote);
    if (lote.length < PAGE) break;
  }
  return linhas;
}

function limparAntigos(raiz) {
  if (KEEP <= 0 || !existsSync(raiz)) return;
  const pastas = readdirSync(raiz, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()
    .reverse(); // mais recentes primeiro (nome e a data em formato ordenavel)
  for (const velha of pastas.slice(KEEP)) {
    rmSync(join(raiz, velha), { recursive: true, force: true });
    console.log(`  removido backup antigo: ${velha}`);
  }
}

const agora = new Date();
const carimbo = agora.toISOString().slice(0, 19).replace(/[:T]/g, '-');
const raiz = 'backups';
const destino = join(raiz, carimbo);
mkdirSync(destino, { recursive: true });

console.log(`Backup em ${destino}`);
let totalLinhas = 0;
const resumo = {};
let falhou = false;

for (const tabela of TABELAS) {
  try {
    const linhas = await baixarTabela(tabela);
    writeFileSync(join(destino, `${tabela}.json`), JSON.stringify(linhas, null, 2));
    resumo[tabela] = linhas.length;
    totalLinhas += linhas.length;
    console.log(`  ${tabela.padEnd(12)} ${String(linhas.length).padStart(5)} registros`);
  } catch (err) {
    falhou = true;
    resumo[tabela] = `ERRO: ${err.message}`;
    console.error(`  ${tabela.padEnd(12)} FALHOU — ${err.message}`);
  }
}

writeFileSync(join(destino, '_resumo.json'), JSON.stringify({
  data: agora.toISOString(),
  projeto: SUPA,
  totalLinhas,
  tabelas: resumo,
}, null, 2));

limparAntigos(raiz);

console.log(`\nTotal: ${totalLinhas} registros.`);
if (falhou) {
  console.error('ATENCAO: ao menos uma tabela falhou — o backup esta incompleto.');
  process.exit(1);
}
