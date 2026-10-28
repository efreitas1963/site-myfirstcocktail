import { DrinkRecipe, IngredientItem, CategoryItem, GlassType } from '../types.ts'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vztlsfppfesdqhjzdfpj.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_EzW-ynXhs_1XWBTiL0osCw_n2Zs4nm_'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

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

// Upload a blob to the 'images' storage bucket and return its public URL
export async function uploadRecipeImage(blob: Blob, filename: string): Promise<string> {
  const path = `uploads/recipes/${filename}`
  const { error } = await supabase.storage.from('images').upload(path, blob, {
    contentType: blob.type || 'image/jpeg',
    upsert: true,
  })
  if (error) throw error

  const { data } = supabase.storage.from('images').getPublicUrl(path)
  return data.publicUrl
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
