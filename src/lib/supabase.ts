import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vztlsfppfesdqhjzdfpj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dGxzZnBwZmVzZHFoanpkZnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2OTczNzksImV4cCI6MjEwODI3MzM3OX0.sBfk5bqZZ4DTY5eM_2bKdCw9ujDwD-58XYylrCXlLN0'

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
