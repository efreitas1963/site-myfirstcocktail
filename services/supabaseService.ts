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

export async function getRecipes(): Promise<DrinkRecipe[]> {
  try {
    const response = await fetch('/recipes.json')
    const data = await response.json()
    console.log('Receitas carregadas (JSON):', data.length)
    return data || []
  } catch (error) {
    console.error('Error fetching recipes:', error)
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
      category: i.category || ''
    }))
  } catch (error) {
    console.error('Error fetching ingredients from Supabase:', error)
    try {
      const response = await fetch('/ingredients.json')
      const jsonData = await response.json()

      // Extract data from PHPMyAdmin export format
      let ingredients = jsonData
      if (Array.isArray(jsonData)) {
        const tableEntry = jsonData.find((item: any) => item.type === 'table' && item.data)
        if (tableEntry?.data) {
          ingredients = tableEntry.data
        }
      }

      console.log('Ingredientes carregados (JSON fallback):', ingredients.length)
      return (ingredients || []).map((i: any) => ({
        id: i.id.toString(),
        name: i.name,
        category: i.category || '',
        description: i.description || '',
        imageUrl: mapImageUrl(i.imageUrl)
      }))
    } catch {
      return []
    }
  }
}

export async function saveRecipe(recipe: DrinkRecipe) {
  return Promise.resolve(recipe)
}

export async function deleteRecipe(id: string) {
  return true
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
    const response = await fetch('/liqueurs.json')
    const data = await response.json()
    console.log('Licores carregados (JSON):', data.length)
    return (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description_liqueurs || '',
      ingredients: item.ingredients_liqueurs || [],
      instructions: item.method_liqueurs || [],
      yield_ml: item.yield_ml_liqueurs || '',
      storage: item.proportion_liqueurs || '',
      validity: item.validity || '',
      imageUrl: mapImageUrl(item.imageurl),
      createdAt: Date.now()
    }))
  } catch (error) {
    console.error('Error fetching liqueurs:', error)
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
    const response = await fetch('/syrups.json')
    const data = await response.json()
    console.log('Xaropes carregados (JSON):', data.length)
    return (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      ingredients: item.ingredients_syrups || [],
      instructions: item.method_syrups || [],
      yield_ml: item.yield_ml || '',
      storage: item.proportion || '',
      validity: item.validity || '',
      imageUrl: mapImageUrl(item.imageurl),
      createdAt: Date.now()
    }))
  } catch (error) {
    console.error('Error fetching syrups:', error)
    return []
  }
}

export async function saveSyrup(syrup: any) {
  return syrup
}

export async function deleteSyrup(id: string) {
  return true
}
