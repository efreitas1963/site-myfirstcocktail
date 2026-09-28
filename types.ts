
export type DrinkCategory = 'Todos' | 'Alcoólico' | 'Sem Álcool' | 'Clássico' | 'Popular' | 'Shot';
export type PreparationMethod = 'Batido' | 'Mexido' | 'Montado';

export interface Ingredient {
  name: string;
  measure: string;
}

export interface IngredientItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  imageUrl?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
}

export interface GlassType {
  id: string;
  name: string;
  technicalName: string;
  capacityOz: string;
  capacityMl: string;
  imageUrl: string;
}

// Alteração em 22/05/2024 - Interface para Licores e Xaropes (Preparos Base)
export interface BasePreparation {
  id: string;
  title: string;
  description: string;
  ingredients: Array<{
    name: string;
    amount: string;
    unit: string;
    note?: string;
  }>;
  instructions: string[];
  yield_ml: string;
  storage: string;
  validity: string;
  imageUrl: string;
  createdAt: number;
}

export interface DrinkRecipe {
  id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  garnish: string;
  method: PreparationMethod;
  category: DrinkCategory;
  imageUrl: string;
  isFavorite: boolean;
  author?: string;
  createdAt: number;
}

// Alteração em 22/05/2024 - Adicionados estados de visualização para licores e xaropes
export type ViewState = 
  | 'LIST' 
  | 'DETAIL' 
  | 'FORM' 
  | 'INGREDIENTS' 
  | 'INGREDIENT_EXPLORER' 
  | 'INGREDIENT_DETAIL' 
  | 'GLASS_GUIDE'
  | 'LIQUORS_LIST'
  | 'LIQUOR_DETAIL'
  | 'SYRUPS_LIST'
  | 'SYRUP_DETAIL'
  | 'PREMADE_FORM'
  | 'MULTI_INGREDIENT_RECIPES';

export interface FilterState {
  search: string;
  category: DrinkCategory;
  onlyFavorites: boolean;
}
