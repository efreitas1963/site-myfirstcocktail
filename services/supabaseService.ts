import { DrinkRecipe, IngredientItem, CategoryItem, GlassType, Sponsor } from '../types.ts'
import { createClient } from '@supabase/supabase-js'
import { otimizarImagem } from './imageOptimizer'

const SUPABASE_URL = 'https://vztlsfppfesdqhjzdfpj.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_EzW-ynXhs_1XWBTiL0osCw_n2Zs4nm_'
// Exportado para o authService usar o MESMO cliente: a sessao de login fica
// guardada na instancia, e e ela que carrega o token em cada requisicao ao
// banco. Dois clientes separados fariam o login nao valer para as escritas.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Map local image paths to uploads folder
function mapImageUrl(url: string | null): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  if (url.startsWith('/uploads')) return url
  // Handle both "filename.jpg" and "glasses/filename.jpg" formats
  return `/uploads/${url}`
}

export async function initStorage() {
  return true
}

// Envia uma imagem para o bucket `images` e devolve a URL publica.
//
// Toda imagem passa antes por `otimizarImagem()`: as telas chegavam aqui com
// tratamentos diferentes (umas reduziam para 800px e gravavam JPEG, outras
// subiam o arquivo original de 9 MB), e o nome nem sempre batia com o formato
// do conteudo. Centralizar aqui garante que nada entre no Storage sem passar
// pela mesma regra.
//
// `pasta` separa os tipos de conteudo dentro do bucket: recipes, liqueurs,
// syrups, glasses, ingredients, apoio-parceiros.
export async function uploadImagemOtimizada(
  origem: Blob | File,
  pasta: string,
  nomeOriginal: string,
): Promise<string> {
  const { blob, filename } = await otimizarImagem(origem, nomeOriginal, pasta)
  const path = `uploads/${pasta}/${filename}`

  const { error } = await supabase.storage.from('images').upload(path, blob, {
    contentType: blob.type,
    upsert: true,
  })
  if (error) throw error

  const { data } = supabase.storage.from('images').getPublicUrl(path)
  return data.publicUrl
}

// Mantido pelo nome porque as telas de receita e a importacao de sites ja o
// chamam; hoje e so um atalho para o caminho unico acima.
export async function uploadRecipeImage(origem: Blob | File, filename: string): Promise<string> {
  return uploadImagemOtimizada(origem, 'recipes', filename)
}

export async function getRecipes(): Promise<DrinkRecipe[]> {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')

    if (error) throw error
    console.log('Receitas carregadas (Supabase):', data?.length || 0)

    const recipes = (data || []).map((r: any) => {
      const recipe = {
        id: r.id.toString(),
        title: r.title,
        description: r.description || '',
        ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
        instructions: Array.isArray(r.instructions) ? r.instructions : [],
        garnish: r.garnish || '',
        method: r.method || 'Batido',
        category: r.category || 'Popular',
        imageUrl: mapImageUrl(r.imageurl),
        author: r.autor || 'Internet',
        isFavorite: false,
        createdAt: Date.now()
      }

      return recipe
    })

    return recipes
  } catch (error) {
    console.error('Error fetching recipes from Supabase:', error)
    return []
  }
}

export async function getCategories(): Promise<CategoryItem[]> {
  try {
    const { data } = await supabase.from('categories').select('*')
    return (data || []).map(c => ({
      id: c.id,
      name: c.name
    }))
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export async function getGlasses(): Promise<GlassType[]> {
  try {
    const { data, error } = await supabase
      .from('glasses')
      .select('*')

    if (error) throw error
    console.log('Copos carregados (Supabase):', data?.length || 0)
    return (data || []).map((g: any) => ({
      id: g.id.toString(),
      name: g.name || '',
      technicalName: g.technicalname || '',
      capacityOz: g.capacityoz || '',
      capacityMl: g.capacityml || '',
      imageUrl: mapImageUrl(g.imageurl)
    }))
  } catch (error) {
    console.error('Error fetching glasses from Supabase:', error)
    try {
      const response = await fetch('/glasses.json')
      const data = await response.json()
      console.log('Copos carregados (JSON fallback):', data.length)
      return (data || []).map((g: any) => ({
        id: g.id.toString(),
        name: g.name || '',
        technicalName: g.technicalName || '',
        capacityOz: g.capacityOz || '',
        capacityMl: g.capacityMl || '',
        imageUrl: mapImageUrl(g.imageUrl)
      }))
    } catch {
      return []
    }
  }
}

export async function getIngredients(): Promise<IngredientItem[]> {
  try {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')

    if (error) throw error
    console.log('Ingredientes carregados (Supabase):', data?.length || 0)
    return (data || []).map((i: any) => ({
      id: i.id.toString(),
      name: i.name,
      category: i.category || '',
      description: i.description || '',
      imageUrl: mapImageUrl(i.imageurl)
    }))
  } catch (error) {
    console.error('Error fetching ingredients from Supabase:', error)
    return []
  }
}

export async function saveRecipe(recipe: DrinkRecipe) {
  try {
    const recipeId = String(recipe.id)
    const isUpdate = !!recipe.id

    console.log('[Supabase] Saving recipe:', { id: recipeId, title: recipe.title, isUpdate })

    // Block duplicates by title (case-insensitive), checking the database
    // directly instead of possibly-stale in-memory state. Excludes this
    // recipe itself so renaming/re-saving the same recipe still works.
    const { data: duplicates, error: dupErr } = await supabase
      .from('recipes')
      .select('id')
      .ilike('title', recipe.title.trim())

    if (dupErr) {
      console.error('[Supabase] Duplicate check failed:', dupErr.message)
    } else if (duplicates?.some(d => String(d.id) !== recipeId)) {
      throw new Error(`Já existe uma receita chamada "${recipe.title}"`)
    }

    const payload = {
      id: recipeId,
      title: recipe.title,
      description: recipe.description || '',
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || [],
      garnish: recipe.garnish || '',
      method: recipe.method || 'Batido',
      category: recipe.category || 'Popular',
      imageurl: recipe.imageUrl || '',
      autor: recipe.author || ''
    }

    // For existing recipes, delete old and insert new (RLS blocks UPDATE)
    if (isUpdate) {
      console.log('[Supabase] Deleting old recipe before reinsertion')
      const { error: deleteErr } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId)

      if (deleteErr) {
        console.error('[Supabase] DELETE failed:', deleteErr.message)
        throw new Error(`Delete failed: ${deleteErr.message}`)
      }
      console.log('[Supabase] Old recipe deleted successfully')
    }

    // INSERT (either new or reinserted)
    console.log('[Supabase] Inserting recipe')
    const { data: inserted, error: insertErr } = await supabase
      .from('recipes')
      .insert([payload])
      .select()

    if (insertErr) {
      console.error('[Supabase] INSERT failed:', insertErr.message)
      throw new Error(`Insert failed: ${insertErr.message}`)
    }

    if (!inserted || inserted.length === 0) {
      throw new Error('INSERT returned no data')
    }

    console.log('[Supabase] Recipe saved successfully')
    return inserted[0]
  } catch (error) {
    console.error('[Supabase] Error saving recipe:', error)
    throw error
  }
}

export async function deleteRecipe(id: string) {
  try {
    const recipeId = String(id)
    console.log('[Supabase] Deleting recipe:', recipeId)

    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', recipeId)

    if (error) {
      console.error('[Supabase] DELETE failed:', error.message)
      throw new Error(`Delete failed: ${error.message}`)
    }

    console.log('[Supabase] Recipe deleted successfully')
    return true
  } catch (error) {
    console.error('[Supabase] Error deleting recipe:', error)
    throw error
  }
}

export async function saveRecipesBulk(recipes: DrinkRecipe[]) {
  return recipes
}

export async function saveIngredient(ingredient: IngredientItem) {
  return ingredient
}

export async function deleteIngredient(id: string) {
  return true
}

export async function saveIngredientsBulk(ingredients: IngredientItem[]) {
  return ingredients
}

export async function getIngredientCategories() {
  return getCategories()
}

export async function saveIngredientCategories(categories: CategoryItem[]) {
  return categories
}

export async function deleteIngredientCategory(id: number) {
  return true
}

export async function saveGlass(glass: GlassType) {
  return glass
}

export async function deleteGlass(id: string) {
  return true
}

export async function getLiqueurs() {
  try {
    const { data, error } = await supabase
      .from('liqueurs')
      .select('*')

    if (error) throw error
    console.log('Licores carregados (Supabase):', data?.length || 0)
    return (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      ingredients: item.ingredients || [],
      instructions: item.instructions || [],
      yield_ml: item.yield_ml || '',
      storage: item.storage || '',
      validity: item.validity || '',
      imageUrl: mapImageUrl(item.imageurl),
      createdAt: Date.now()
    }))
  } catch (error) {
    console.error('Error fetching liqueurs from Supabase:', error)
    return []
  }
}

export async function saveLiquor(liqueur: any) {
  return liqueur
}

export async function deleteLiquor(id: string) {
  return true
}

export async function getSyrups() {
  try {
    const { data, error } = await supabase
      .from('syrups')
      .select('*')

    if (error) throw error
    console.log('Xaropes carregados (Supabase):', data?.length || 0)
    return (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      ingredients: item.ingredients || [],
      instructions: item.instructions || [],
      yield_ml: item.yield_ml || '',
      storage: item.storage || '',
      validity: item.validity || '',
      imageUrl: mapImageUrl(item.imageurl),
      createdAt: Date.now()
    }))
  } catch (error) {
    console.error('Error fetching syrups from Supabase:', error)
    return []
  }
}

export async function saveSyrup(syrup: any) {
  return syrup
}

export async function deleteSyrup(id: string) {
  return true
}

// ---------------------------------------------------------------------------
// Apoio & Parceiros (sponsors)
// ---------------------------------------------------------------------------

// Logo de patrocinador. Antes subia o arquivo escolhido sem tocar, o que
// deixava um logo de varios MB no cabecalho de uma secao pequena da tela.
// O nome unico continua garantido pelo instante que `otimizarImagem` embute:
// a chave anonima pode criar objetos novos mas nao sobrescrever (RLS).
export async function uploadSponsorLogo(file: File | Blob, filename: string): Promise<string> {
  return uploadImagemOtimizada(file, 'apoio-parceiros', filename)
}

export async function getSponsors(): Promise<Sponsor[]> {
  try {
    const { data, error } = await supabase
      .from('sponsors')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error
    return (data || []).map((item: any) => ({
      id: String(item.id),
      name: item.name || '',
      logo: mapImageUrl(item.logo),
      link: item.link || '#',
      sortOrder: item.sort_order ?? 0,
    }))
  } catch (error) {
    console.error('Error fetching sponsors from Supabase:', error)
    return []
  }
}

// Replaces the whole list: deletes the rows that are gone, then re-inserts
// the current ones. Mirrors saveRecipe()'s delete-then-insert approach, which
// this project uses because RLS blocks UPDATE.
export async function saveSponsors(sponsors: Sponsor[]): Promise<Sponsor[]> {
  const payload = sponsors.map((sp, i) => ({
    id: String(sp.id),
    name: sp.name || '',
    logo: sp.logo || '',
    link: sp.link || '#',
    sort_order: i + 1,
  }))

  const { data: existing, error: readErr } = await supabase
    .from('sponsors')
    .select('id')
  if (readErr) throw new Error(`Falha ao ler parceiros: ${readErr.message}`)

  const keepIds = new Set(payload.map(p => p.id))
  const removedIds = (existing || [])
    .map((r: any) => String(r.id))
    .filter(id => !keepIds.has(id))

  if (removedIds.length > 0) {
    const { error: delErr } = await supabase
      .from('sponsors')
      .delete()
      .in('id', removedIds)
    if (delErr) throw new Error(`Falha ao remover parceiros: ${delErr.message}`)
  }

  if (payload.length > 0) {
    const presentIds = payload.map(p => p.id)
    const { error: clearErr } = await supabase
      .from('sponsors')
      .delete()
      .in('id', presentIds)
    if (clearErr) throw new Error(`Falha ao atualizar parceiros: ${clearErr.message}`)

    const { error: insErr } = await supabase
      .from('sponsors')
      .insert(payload)
    if (insErr) throw new Error(`Falha ao salvar parceiros: ${insErr.message}`)
  }

  return getSponsors()
}
