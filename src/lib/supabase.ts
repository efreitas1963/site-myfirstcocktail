import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vztlsfppfesdqhjzdfpj.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_EzW-ynXhs_1XWBTiL0osCw_n2Zs4nm_'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function getRecipes() {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')

  if (error) console.error('Error fetching recipes:', error)
  return data || []
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')

  if (error) console.error('Error fetching categories:', error)
  return data || []
}

export async function getGlasses() {
  const { data, error } = await supabase
    .from('glasses')
    .select('*')

  if (error) console.error('Error fetching glasses:', error)
  return data || []
}

export async function getIngredients() {
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')

  if (error) console.error('Error fetching ingredients:', error)
  return data || []
}
