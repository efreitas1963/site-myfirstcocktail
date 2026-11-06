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
    // Faz o link de confirmacao voltar para o site onde a conta foi criada.
    options: { emailRedirectTo: enderecoDeRetorno() },
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

// Endereco para onde o Supabase manda a pessoa de volta depois que ela clica
// no link do e-mail (confirmacao de conta ou redefinicao de senha).
//
// Sem isso o Supabase usa a "Site URL" configurada no painel, que em geral
// aponta para localhost — o link chegaria quebrado para quem usa o site em
// producao. Usar a origem da janela atual faz o link voltar para o mesmo
// endereco de onde a pessoa pediu, seja o site publicado ou o dev local.
//
// Importante: cada endereco usado aqui precisa estar na lista de "Redirect
// URLs" do painel do Supabase (Authentication > URL Configuration), senao o
// Supabase ignora o valor e cai na Site URL.
function enderecoDeRetorno(): string {
  return `${window.location.origin}/`
}

// Pede ao Supabase o e-mail com o link de redefinicao de senha.
//
// Nao revela se o e-mail existe ou nao: a resposta e a mesma nos dois casos,
// para nao transformar a tela em um detector de quem tem conta no site.
export async function pedirRedefinicaoSenha(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: enderecoDeRetorno(),
  })

  // Erro de limite de envio e o unico que vale mostrar — os demais costumam
  // ser "e-mail nao encontrado", que a gente deliberadamente nao expoe.
  if (error && error.message.toLowerCase().includes('rate limit')) {
    throw new Error('Muitas tentativas seguidas. Aguarde alguns minutos.')
  }
}

// Grava a nova senha. So funciona com a sessao temporaria que o Supabase cria
// quando a pessoa chega pelo link do e-mail de recuperacao.
export async function definirNovaSenha(senha: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: senha })

  if (error) {
    if (error.message.includes('at least')) {
      throw new Error('A senha precisa de pelo menos 6 caracteres.')
    }
    if (error.message.includes('should be different')) {
      throw new Error('A nova senha precisa ser diferente da anterior.')
    }
    if (error.message.includes('Auth session missing')) {
      throw new Error('O link expirou. Peca a redefinicao de novo.')
    }
    throw new Error(error.message)
  }
}

// Avisa quando a pessoa chega pelo link de redefinicao de senha.
//
// O Supabase le o token que vem no endereco (o trecho depois do `#`), cria uma
// sessao temporaria e dispara o evento PASSWORD_RECOVERY. E esse evento que
// diz a aplicacao para abrir a tela de nova senha — sem ele a pessoa voltaria
// ao site ja logada, sem nunca trocar a senha que esqueceu.
export function aoChegarPorRecuperacao(callback: () => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((evento) => {
    if (evento === 'PASSWORD_RECOVERY') callback()
  })
  return () => data.subscription.unsubscribe()
}
