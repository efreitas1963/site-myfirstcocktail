import { supabase } from '../lib/supabase'
import { DrinkRecipe, IngredientItem, CategoryItem, GlassType } from '../types.ts'

export async function initStorage() {
  try {
    const { data } = await supabase.from('recipes').select('id').limit(1)
    return true
  } catch {
    return false
  }
}

export async function getRecipes(): Promise<DrinkRecipe[]> {
  try {
    const { data } = await supabase.from('recipes').select('*')
    return (data || []).map(r => ({
      id: r.id.toString(),
      title: r.name_pt || '',
      description: r.description || '',
      ingredients: [],
      instructions: r.preparation ? [r.preparation] : [],
      garnish: '',
      method: 'Batido',
      category: 'Clássico',
      imageUrl: r.image_url || '',
      author: 'Internet',
      isFavorite: false,
      createdAt: new Date(r.created_at).getTime()
    }))
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
    const { data } = await supabase.from('glasses').select('*')
    return (data || []).map(g => ({
      id: g.id.toString(),
      name: g.name_pt || '',
      nameEn: g.name_en || '',
      capacity: g.capacity_ml || '',
      imageUrl: g.image_url || ''
    }))
  } catch (error) {
    console.error('Error fetching glasses:', error)
    return []
  }
}

export async function getIngredients(): Promise<IngredientItem[]> {
  try {
    const { data } = await supabase.from('ingredients').select('*')
    return (data || []).map(i => ({
      id: i.id.toString(),
      name: i.name,
      categoryId: i.category_id
    }))
  } catch (error) {
    console.error('Error fetching ingredients:', error)
    return []
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
    console.log('Liqueurs carregados:', data.length)
    return data || []
  } catch (error) {
    console.error('Error fetching liqueurs from JSON:', error)
    try {
      const { data } = await supabase.from('liqueurs').select('*')
      return (data || []).map(l => ({
        id: l.id.toString(),
        name: l.name,
        ingredients: l.ingredients,
        preparation: l.preparation,
        method: l.method,
        serving: l.serving,
        flavor: l.flavor,
        strength: l.strength,
        description: l.description,
        imageUrl: l.imageUrl || ''
      }))
    } catch (dbError) {
      console.error('Error fetching liqueurs from database:', dbError)
      return []
    }
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
    console.log('Syrups carregados:', data.length)
    return data || []
  } catch (error) {
    console.error('Error fetching syrups from JSON:', error)
    try {
      const { data } = await supabase.from('syrups').select('*')
      return (data || []).map(s => ({
        id: s.id.toString(),
        name: s.name,
        ingredients: s.ingredients,
        preparation: s.preparation,
        quantity: s.quantity,
        storageTime: s.storageTime,
        flavor: s.flavor,
        description: s.description,
        imageUrl: s.imageUrl || ''
      }))
    } catch (dbError) {
      console.error('Error fetching syrups from database:', dbError)
      return []
    }
  }
}

export async function saveSyrup(syrup: any) {
  return syrup
}

export async function deleteSyrup(id: string) {
  return true
}
