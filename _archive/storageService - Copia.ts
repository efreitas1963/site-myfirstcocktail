import { DrinkRecipe, IngredientItem, CategoryItem, GlassType, BasePreparation } from '../types.ts';

const API_URL = 'api.php';

async function apiRequest(action: string, table: string, data?: any) {
  try {
    const url = `${API_URL}?action=${action}&table=${table}`;
    const response = await fetch(url, {
      method: data ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
      cache: 'no-store'
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    if (result && result.error) throw new Error(result.error);
    return result || [];
  } catch (error: any) {
    console.error(`API Error (${action} @ ${table}):`, error);
    if (action === 'list') return [];
    throw error;
  }
}

export const initStorage = async () => {
  try {
    const response = await fetch(`${API_URL}?ping=1`);
    return response.ok;
  } catch {
    return false;
  }
};

const parseArraySafe = (value: any) => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  if (typeof value !== 'string') return [value];
  const s = value.trim();
  if (!s) return [];
  if ((s.startsWith('[') && s.endsWith(']')) || (s.startsWith('{') && s.endsWith('}'))) {
    try {
      const parsed = JSON.parse(s);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [value];
    }
  }
  return [value];
};

// --- MAPEAMENTO DE PREPAROS BASE (LICORES/XAROPES) ---

const mapDBToPreMade = (item: any, table: 'liqueurs' | 'syrups'): BasePreparation | null => {
  if (!item) return null;
  const img = item.imageURL || item.imageUrl || '';
  
  if (table === 'liqueurs') {
    return {
      id: item.id.toString(),
      title: item.title || '',
      description: item.description_liqueurs || '',
      ingredients: parseArraySafe(item.ingredients_liqueurs),
      instructions: parseArraySafe(item.method_liqueurs),
      yield_ml: item.yield_ml_liqueurs ? `${item.yield_ml_liqueurs}ml` : '',
      storage: item.proportion_liqueurs || '',
      validity: item.validity || '30 dias',
      imageUrl: img,
      createdAt: item.createdAt ? Number(item.createdAt) : Date.now()
    };
  }
  return {
    id: item.id.toString(),
    title: item.title || '',
    description: item.description || '',
    ingredients: parseArraySafe(item.ingredients_syrups),
    instructions: parseArraySafe(item.method_syrups),
    yield_ml: item.yield_ml ? `${item.yield_ml}ml` : '',
    storage: item.proportion || '',
    validity: item.validity || '30 dias',
    imageUrl: img,
    createdAt: item.createdAt ? Number(item.createdAt) : Date.now()
  };
};

const mapPreMadeToDB = (item: BasePreparation, table: 'liqueurs' | 'syrups') => {
  const rendNum = parseInt((item.yield_ml || '').replace(/\D/g, '')) || 0;
  const idToSave = item.id && item.id.length > 5 ? null : (parseInt(item.id) || null);

  if (table === 'liqueurs') {
    return {
      id: idToSave,
      title: item.title,
      ingredients_liqueurs: item.ingredients, 
      yield_ml_liqueurs: rendNum,
      proportion_liqueurs: item.storage,
      method_liqueurs: item.instructions,
      description_liqueurs: item.description,
      validity: item.validity,
      imageURL: item.imageUrl
    };
  } else {
    return {
      id: idToSave,
      title: item.title,
      ingredients_syrups: item.ingredients, 
      yield_ml: rendNum,
      proportion: item.storage,
      method_syrups: item.instructions,
      description: item.description,
      validity: item.validity,
      imageURL: item.imageUrl
    };
  }
};

// --- MAPEAMENTO DE RECEITAS DE DRINKS ---

const mapDBToRecipe = (r: any): DrinkRecipe => ({
  id: r.id.toString(),
  title: r.title || '',
  description: r.description || '',
  ingredients: parseArraySafe(r.ingredients),
  instructions: parseArraySafe(r.instructions),
  garnish: r.garnish || '',
  method: r.method || 'Montado',
  category: r.category || 'Alcoólico',
  imageUrl: r.imageURL || r.imageUrl || '',
  author: r.author || 'Internet',
  isFavorite: Boolean(Number(r.isFavorite)),
  createdAt: r.createdAt ? Number(r.createdAt) : Date.now()
});

const mapRecipeToDB = (r: DrinkRecipe) => {
  // Se o ID for uma string longa (UUID), enviamos null para o MySQL gerar um novo
  const idToSave = r.id && r.id.length > 5 ? null : (parseInt(r.id) || null);
  
  return {
    id: idToSave,
    title: r.title,
    description: r.description,
    ingredients: r.ingredients,
    instructions: r.instructions,
    garnish: r.garnish,
    method: r.method,
    category: r.category,
    imageURL: r.imageUrl, // Sincronizado com a coluna do banco
    author: r.author,
    isFavorite: r.isFavorite ? 1 : 0,
    createdAt: r.createdAt
  };
};

export const getLiqueurs = async () => {
  const data = await apiRequest('list', 'liqueurs');
  return Array.isArray(data) ? data.map(i => mapDBToPreMade(i, 'liqueurs')).filter(i => i !== null) : [];
};
export const saveLiquor = (item: BasePreparation) => apiRequest('save', 'liqueurs', mapPreMadeToDB(item, 'liqueurs'));
export const deleteLiquor = (id: string) => apiRequest('delete', 'liqueurs', { id });

export const getSyrups = async () => {
  const data = await apiRequest('list', 'syrups');
  return Array.isArray(data) ? data.map(i => mapDBToPreMade(i, 'syrups')).filter(i => i !== null) : [];
};
export const saveSyrup = (item: BasePreparation) => apiRequest('save', 'syrups', mapPreMadeToDB(item, 'syrups'));
export const deleteSyrup = (id: string) => apiRequest('delete', 'syrups', { id });

export const getRecipes = async () => {
  const data = await apiRequest('list', 'recipes');
  if (!Array.isArray(data)) return [];
  return data.map(mapDBToRecipe);
};

export const saveRecipe = (r: DrinkRecipe) => apiRequest('save', 'recipes', mapRecipeToDB(r));

export const saveRecipesBulk = (recipes: DrinkRecipe[]) => Promise.all(recipes.map(r => saveRecipe(r)));
export const deleteRecipe = (id: string) => apiRequest('delete', 'recipes', { id });

export const getIngredients = async () => {
  const data = await apiRequest('list', 'ingredients');
  return Array.isArray(data) ? data.map(i => ({ ...i, id: i.id.toString() })) : [];
};
export const saveIngredient = (i: any) => apiRequest('save', 'ingredients', i);
export const saveIngredientsBulk = (ingredients: any[]) => Promise.all(ingredients.map(i => saveIngredient(i)));
export const deleteIngredient = (id: string) => apiRequest('delete', 'ingredients', { id });

export const getIngredientCategories = () => apiRequest('list', 'categories');
export const saveIngredientCategories = (cats: any[]) => Promise.all(cats.map(c => apiRequest('save', 'categories', c)));
export const deleteIngredientCategory = (id: string) => apiRequest('delete', 'categories', { id });

export const getGlasses = () => apiRequest('list', 'glasses');
export const saveGlass = (g: any) => apiRequest('save', 'glasses', g);
export const deleteGlass = (id: string) => apiRequest('delete', 'glasses', { id });

export const uploadImage = async (file: File | Blob, sub: string, name?: string): Promise<string> => {
  const fd = new FormData();
  const fileNameToUse = name || (file instanceof File ? file.name : 'img.png');
  fd.append('file', file, fileNameToUse);
  
  const res = await fetch(`${API_URL}?action=upload&subfolder=${sub}`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error("Erro no upload");
  const data = await res.json();
  return data.path;
};