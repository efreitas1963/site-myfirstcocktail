
import React from 'react';
import { ArrowLeft, Wine, Edit2, ShoppingCart, Archive, Check } from 'lucide-react';
import { IngredientItem, DrinkRecipe } from '../types';
import { RecipeCard } from './RecipeCard';
import { useTranslation } from 'react-i18next';

interface IngredientDetailViewProps {
  ingredient: IngredientItem;
  relatedRecipes: DrinkRecipe[];
  onBack: () => void;
  onEdit: (id: string) => void;
  onRecipeClick: (recipe: DrinkRecipe) => void;
  onToggleFavorite: (id: string) => void;
  isMaster?: boolean;
}

export const IngredientDetailView: React.FC<IngredientDetailViewProps> = ({ 
  ingredient, 
  relatedRecipes, 
  onBack, 
  onEdit,
  onRecipeClick,
  onToggleFavorite,
  isMaster 
}) => {
  const { t } = useTranslation();
  return (
    <div className="animate-fadeIn space-y-12 pb-20">
      {/* Header / Info Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-8 md:p-12 flex flex-col md:flex-row gap-8 items-start">
          
          {/* Image Container */}
          <div className="w-full md:w-64 aspect-square bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden shadow-inner flex-shrink-0">
            {ingredient.imageUrl ? (
              <img src={ingredient.imageUrl} alt={ingredient.name} className="w-full h-full object-contain p-4" />
            ) : (
              <Wine size={80} className="text-slate-200" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-serif font-bold text-slate-800">{ingredient.name}</h1>
                  <span className="px-3 py-1 bg-brand-100 text-brand-700 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-brand-200">
                    {ingredient.category}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={onBack}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm font-bold shadow-sm"
                >
                  <ArrowLeft size={18} /> {t('common.back')}
                </button>
                {isMaster && (
                  <button 
                    onClick={() => onEdit(ingredient.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors text-sm font-bold shadow-md"
                  >
                    <Edit2 size={18} /> {t('ingredients.edit_btn')}
                  </button>
                )}
              </div>
            </div>

            <p className="text-slate-600 text-lg leading-relaxed max-w-3xl italic">
              {ingredient.description || t('ingredients.default_description')}
            </p>

            <div className="flex flex-wrap gap-3 pt-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors border border-slate-200">
                <ShoppingCart size={14} /> {t('ingredients.add_to_list')}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 rounded-lg text-xs font-bold hover:bg-brand-100 transition-colors border border-brand-200">
                <Archive size={14} /> {t('ingredients.mark_available')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Recipes Section */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-serif font-bold text-slate-800">{t('ingredients.related_recipes', { name: ingredient.name })}</h2>
          <div className="h-px flex-1 bg-slate-200"></div>
          <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">{relatedRecipes.length} {t('ingredients.recipes_count')}</span>
        </div>

        {relatedRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedRecipes.map(recipe => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                onToggleFavorite={onToggleFavorite} 
                onClick={onRecipeClick} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-slate-300">
            <Wine size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium italic">{t('ingredients.no_recipes')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
