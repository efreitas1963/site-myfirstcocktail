import { DrinkRecipe, IngredientItem, CategoryItem, GlassType } from '../types.ts'

export async function initStorage() {
  return true
}

export async function getRecipes(): Promise<DrinkRecipe[]> {
  try {
    const response = await fetch('/recipes.json')
    const data = await response.json()
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
    const { data } = await supabase.from('glasses').select('*')
    return (data || []).map(g => ({
      id: g.id.toString(),
      name: g.name_pt || '',
      technicalName: g.name_en || '',
      capacityOz: g.capacity_oz || '',
      capacityMl: g.capacity_ml || '',
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
      category: i.category_id ? i.category_id.toString() : ''
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
  return []
}

export async function saveLiquor(liqueur: any) {
  return liqueur
}

export async function deleteLiquor(id: string) {
  return true
}

export async function getSyrups() {
  return []
}

export async function saveSyrup(syrup: any) {
  return syrup
}

export async function deleteSyrup(id: string) {
  return true
}
