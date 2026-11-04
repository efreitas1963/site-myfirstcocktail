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
