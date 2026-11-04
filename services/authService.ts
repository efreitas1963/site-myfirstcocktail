import { supabase } from './supabaseService'

// Autenticacao do modo administrador via Supabase Auth.
//
// Substitui a verificacao que existia em LoginModal.tsx, onde a senha estava
// escrita em texto puro no codigo — e portanto visivel no bundle que todo
// visitante baixa. Alem de nao esconder nada, aquela checagem so ocultava
// botoes na tela: o banco aceitava escrita de qualquer um.
//
// Com o Supabase Auth, a sessao autenticada viaja em cada requisicao ao banco,
// o que permite as policies de RLS distinguirem o administrador de um visitante
// qualquer. Sem isso as policies nao teriam como decidir quem pode escrever.

export interface SessaoAdmin {
  email: string
}

// E-mail da conta que administra o site. Qualquer outro usuario que se
// cadastre e um visitante comum: pode favoritar receitas, mas nao ve nem
// alcanca as telas de cadastro e edicao.
//
// A checagem aqui e so de interface. Quem protege o banco sao as policies de
// RLS: `escrita do admin` libera as tabelas de conteudo para authenticated, e
// a tabela `favorites` limita cada pessoa as proprias linhas via auth.uid().
const EMAIL_ADMIN = 'efreitas1963@gmail.com'

export function ehAdmin(sessao: SessaoAdmin | null): boolean {
  return sessao?.email?.toLowerCase() === EMAIL_ADMIN
}

export async function entrar(email: string, senha: string): Promise<SessaoAdmin> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: senha,
  })

  if (error) {
    // Mensagens do Supabase vem em ingles; traduz as mais comuns.
    if (error.message.includes('Invalid login credentials')) {
      throw new Error('E-mail ou senha incorretos.')
    }
    if (error.message.includes('Email not confirmed')) {
      throw new Error('E-mail ainda nao confirmado. Verifique sua caixa de entrada.')
    }
    throw new Error(error.message)
  }

  if (!data.user?.email) throw new Error('Nao foi possivel iniciar a sessao.')
  return { email: data.user.email }
}

// Cria uma conta de visitante. O Supabase envia um e-mail de confirmacao e a
// pessoa so consegue entrar depois de clicar no link.
// Devolve true quando a confirmacao e necessaria (o caso normal).
export async function cadastrar(email: string, senha: string): Promise<boolean> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password: senha,
  })

  if (error) {
    if (error.message.includes('already registered')) {
      throw new Error('Este e-mail ja tem conta. Use a aba Entrar.')
    }
    if (error.message.includes('at least')) {
      throw new Error('A senha precisa de pelo menos 6 caracteres.')
    }
    throw new Error(error.message)
  }

  // Sem sessao na resposta = o Supabase esta aguardando a confirmacao por e-mail
  return !data.session
}

export async function sair(): Promise<void> {
  await supabase.auth.signOut()
}

// Le a sessao salva pelo proprio Supabase (ele persiste e renova o token
// sozinho no localStorage). Devolve null quando nao ha ninguem logado.
export async function sessaoAtual(): Promise<SessaoAdmin | null> {
  const { data } = await supabase.auth.getSession()
  const email = data.session?.user?.email
  return email ? { email } : null
}

// Avisa a aplicacao quando a sessao muda — inclusive quando expira sozinha,
// caso em que o modo admin precisa ser desligado na interface.
export function aoMudarSessao(callback: (sessao: SessaoAdmin | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_evento, sessao) => {
    const email = sessao?.user?.email
    callback(email ? { email } : null)
  })
  return () => data.subscription.unsubscribe()
}
