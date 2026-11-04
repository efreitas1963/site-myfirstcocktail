import { supabase } from './supabaseService'

// Favoritos por usuario.
//
// Antes o coracao das receitas nao guardava nada: a tabela `recipes` nao tem
// coluna de favorito e `getRecipes()` forca isFavorite:false em todas, entao o
// marcador acendia na tela e sumia ao recarregar. Alem disso o clique chamava
// `saveRecipe()`, que grava na tabela `recipes` — fechada a visitantes desde
// que o RLS foi ligado.
//
// A tabela `favorites` guarda o vinculo usuario -> receita, com policies que
// limitam cada pessoa as proprias linhas (ver scripts/sql/criar_favoritos.sql).

// Ids das receitas favoritadas pelo usuario logado. Devolve vazio para quem
// nao esta logado — nao e erro, so nao ha favoritos a mostrar.
export async function listarFavoritos(): Promise<Set<string>> {
  const { data: sessao } = await supabase.auth.getSession()
  if (!sessao.session) return new Set()

  const { data, error } = await supabase
    .from('favorites')
    .select('recipe_id')

  if (error) {
    console.error('Erro ao carregar favoritos:', error)
    return new Set()
  }
  return new Set((data || []).map((f: any) => String(f.recipe_id)))
}

export async function adicionarFavorito(recipeId: string): Promise<void> {
  const { data: sessao } = await supabase.auth.getSession()
  const userId = sessao.session?.user?.id
  if (!userId) throw new Error('Entre na sua conta para salvar favoritos.')

  const { error } = await supabase
    .from('favorites')
    .insert([{ user_id: userId, recipe_id: recipeId }])

  // 23505 = chave duplicada: ja era favorito, o resultado desejado ja vale
  if (error && error.code !== '23505') throw new Error(error.message)
}

export async function removerFavorito(recipeId: string): Promise<void> {
  const { data: sessao } = await supabase.auth.getSession()
  const userId = sessao.session?.user?.id
  if (!userId) throw new Error('Entre na sua conta para alterar favoritos.')

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)

  if (error) throw new Error(error.message)
}
