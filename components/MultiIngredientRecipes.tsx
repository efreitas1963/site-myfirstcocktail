import React from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { DrinkRecipe } from '../types';
import { RecipeCard } from './RecipeCard';
import { useTranslation } from 'react-i18next';

interface MultiIngredientRecipesProps {
  recipes: DrinkRecipe[];
  selectedIngredients: string[];
  onBack: () => void;
  onRecipeClick: (recipe: DrinkRecipe) => void;
  onToggleFavorite: (id: string) => void;
  isMaster?: boolean;
}

export const MultiIngredientRecipes: React.FC<MultiIngredientRecipesProps> = ({
  recipes,
  selectedIngredients,
  onBack,
  onRecipeClick,
  onToggleFavorite,
  isMaster
}) => {
  const { t } = useTranslation();

  // Filter recipes that contain AT LEAST ONE selected ingredient
  const matchingRecipes = recipes.filter(recipe => {
    const recipeIngredients = recipe.ingredients.map(i => i.name.toLowerCase());
    return selectedIngredients.some(selected => 
      recipeIngredients.some(ri => ri === selected.toLowerCase())
    );
  }).sort((a, b) => {
    // Sort by number of matching ingredients (descending)
    const aIngredients = a.ingredients.map(i => i.name.toLowerCase());
    const bIngredients = b.ingredients.map(i => i.name.toLowerCase());
    
    const aMatches = selectedIngredients.filter(selected => 
      aIngredients.some(ri => ri === selected.toLowerCase())
    ).length;
    
    const bMatches = selectedIngredients.filter(selected => 
      bIngredients.some(ri => ri === selected.toLowerCase())
    ).length;
    
    // If matches are equal, sort by total ingredients (ascending - simpler recipes first)
    if (aMatches === bMatches) {
      return a.ingredients.length - b.ingredients.length;
    }
    
    return bMatches - aMatches;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
		<button onClick={onBack} className="p-2 bg-white rounded-lg text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition-colors shadow-md border border-slate-200"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg></button>
          <div>
            <h2 className="text-3xl font-serif font-bold text-slate-800">{t('multi_ingredients.title')}</h2>
            <p className="text-slate-500 text-sm mt-1">
              {matchingRecipes.length === 1 
                ? t('multi_ingredients.subtitle_one', { count: matchingRecipes.length })
                : t('multi_ingredients.subtitle_other', { count: matchingRecipes.length })}
            </p>
          </div>
        </div>
      </div>

      {/* Selected Ingredients Tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        {selectedIngredients.map(ing => (
          <span key={ing} className="bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-sm font-medium border border-brand-200">
            {ing}
          </span>
        ))}
      </div>

      {/* Grid */}
      {matchingRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {matchingRecipes.map((recipe) => (
            <RecipeCard 
              key={recipe.id} 
              recipe={recipe} 
              onClick={() => onRecipeClick(recipe)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">{t('multi_ingredients.empty_title')}</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            {t('multi_ingredients.empty_desc')}
          </p>
          <button 
            onClick={onBack}
            className="mt-6 bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-brand-500/30"
          >
            {t('multi_ingredients.back_edit')}
          </button>
        </div>
      )}
    </div>
  );
};
