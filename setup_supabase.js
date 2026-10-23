import { createClient } from '@supabase/supabase-js'

// Using service role key (you'll need to provide this)
// Get it from Supabase dashboard > Settings > API
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not set in environment variables')
  console.error('Get it from: https://supabase.com/dashboard/project/vztlsfppfesdqhjzdfpj/settings/api')
  process.exit(1)
}

const supabase = createClient(
  'https://vztlsfppfesdqhjzdfpj.supabase.co',
  SERVICE_ROLE_KEY
)

const recipesData = [
  {
    id: 1,
    name_pt: 'Caipirinha',
    name_en: 'Caipirinha',
    glass_id: 15,
    description: 'Drink clássico brasileiro feito com destilado branco, açúcar e limão',
    preparation: 'Coloque gelo crushed no copo, adicione metades de limão cortadas. Despeje açúcar e destilado. Mexa bem com o muddler.',
    image_url: '/uploads/recipes/caipirinha.jpg',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name_pt: 'Whisky Sour',
    name_en: 'Whisky Sour',
    glass_id: 14,
    description: 'A combinação perfeita de destilado, cítrico e doçura, com uma textura sedosa.',
    preparation: 'Adicione bourbon, suco de limão, xarope simples e gelo na coqueteleira. Bata vigorosamente até gelar.',
    image_url: '/uploads/recipes/whisky-sour.jpg',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    name_pt: 'Daiquiri',
    name_en: 'Daiquiri',
    glass_id: 17,
    description: 'Um clássico cubano injustiçado. Quando bem feito, é fresco, complexo e revigorante.',
    preparation: 'Coloque rum branco, suco de limão e xarope na coqueteleira com gelo. Bata vigorosamente. Coe para taça gelada.',
    image_url: '/uploads/recipes/daiquiri.jpg',
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    name_pt: 'Margarita',
    name_en: 'Margarita',
    glass_id: 20,
    description: 'O drink de Tequila mais famoso do mundo. Ácido, salgado e vibrante.',
    preparation: 'Passe limão na borda e cruste com sal. Bata tequila, cointreau e suco de limão. Coe para a taça.',
    image_url: '/uploads/recipes/margarita.jpg',
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    name_pt: 'Mojito',
    name_en: 'Mojito',
    glass_id: 11,
    description: 'Drink refrescante com hortelã e rum branco',
    preparation: 'Coloque folhas de hortelã no copo. Adicione açúcar e rum. Complete com água com gelo. Mexa bem.',
    image_url: '/uploads/recipes/mojito.jpg',
    created_at: new Date().toISOString()
  }
]

async function setupSupabase() {
  try {
    console.log('Inserting recipes...')
    const { data, error } = await supabase
      .from('recipes')
      .upsert(recipesData)
      .select()

    if (error) {
      console.error('Error inserting recipes:', error.message)
      return false
    }

    console.log('✓ Recipes inserted successfully!')
    console.log('  Inserted count:', data?.length)
    return true
  } catch (e) {
    console.error('Exception:', e)
    return false
  }
}

setupSupabase()
