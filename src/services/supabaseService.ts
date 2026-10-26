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
    const response = await fetch('/recipes.json')
    const data = await response.json()
    console.log('Receitas carregadas:', data.length)
    return data || []
  } catch (error) {
    console.error('Error fetching recipes from JSON:', error)
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
    } catch (dbError) {
      console.error('Error fetching recipes from database:', dbError)
      return []
    }
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

export async function getGlassesJSON() {
  try {
    const response = await fetch('/glasses.json')
    return await response.json()
  } catch {
    return []
  }
}

export async function getIngredientsJSON() {
  try {
    const response = await fetch('/ingredients.json')
    return await response.json()
  } catch {
    return []
  }
}

export async function getGlasses(): Promise<GlassType[]> {
  try {
    const response = await fetch('/glasses.json')
    const data = await response.json()
    console.log('Copos carregados:', data.length)
    return (data || []).map((g: any) => ({
      id: g.id.toString(),
      name: g.name || '',
      nameEn: g.name || '',
      capacity: g.capacityMl || '',
      imageUrl: g.imageUrl || ''
    }))
  } catch (error) {
    console.error('Error fetching glasses from JSON:', error)
    try {
      const { data } = await supabase.from('glasses').select('*')
      return (data || []).map(g => ({
        id: g.id.toString(),
        name: g.name_pt || '',
        nameEn: g.name_en || '',
        capacity: g.capacity_ml || '',
        imageUrl: g.image_url || ''
      }))
    } catch (dbError) {
      console.error('Error fetching glasses from database:', dbError)
      return []
    }
  }
}

export async function getIngredients(): Promise<IngredientItem[]> {
  try {
    const response = await fetch('/ingredients.json')
    const data = await response.json()
    console.log('Ingredientes carregados:', data.length)
    return (data || []).map((i: any) => ({
      id: i.id.toString(),
      name: i.name,
      categoryId: i.type || ''
    }))
  } catch (error) {
    console.error('Error fetching ingredients from JSON:', error)
    try {
      const { data } = await supabase.from('ingredients').select('*')
      return (data || []).map(i => ({
        id: i.id.toString(),
        name: i.name,
        categoryId: i.category_id
      }))
    } catch (dbError) {
      console.error('Error fetching ingredients from database:', dbError)
      return []
    }
  }
}

export async function saveRecipe(recipe: DrinkRecipe) {
  try {
    const recipeData = {
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      garnish: recipe.garnish,
      method: recipe.method,
      category: recipe.category,
      imageurl: recipe.imageUrl
    }

    if (recipe.id && recipe.id !== 'new') {
      // Update existing recipe
      const { data, error } = await supabase
        .from('recipes')
        .update(recipeData)
        .eq('id', recipe.id)

      if (error) {
        console.error('Error updating recipe:', error)
        return recipe
      }
      console.log('Recipe updated successfully:', recipe.title)
    } else {
      // Insert new recipe
      const { data, error } = await supabase
        .from('recipes')
        .insert([recipeData])
        .select()

      if (error) {
        console.error('Error saving recipe:', error)
        return recipe
      }
      console.log('Recipe saved successfully:', recipe.title, data)
    }

    return recipe
  } catch (error) {
    console.error('Error in saveRecipe:', error)
    return recipe
  }
}

export async function deleteRecipe(id: string) {
  try {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting recipe:', error)
      return false
    }
    console.log('Recipe deleted successfully')
    return true
  } catch (error) {
    console.error('Error in deleteRecipe:', error)
    return false
  }
}

export async function saveRecipesBulk(recipes: DrinkRecipe[]) {
  try {
    const recipesData = recipes.map(r => ({
      title: r.title,
      description: r.description,
      ingredients: r.ingredients,
      instructions: r.instructions,
      garnish: r.garnish,
      method: r.method,
      category: r.category,
      imageurl: r.imageUrl
    }))

    const { error } = await supabase
      .from('recipes')
      .upsert(recipesData, { onConflict: 'id' })

    if (error) {
      console.error('Error saving recipes bulk:', error)
      return recipes
    }
    console.log('Recipes saved successfully:', recipes.length)
    return recipes
  } catch (error) {
    console.error('Error in saveRecipesBulk:', error)
    return recipes
  }
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
