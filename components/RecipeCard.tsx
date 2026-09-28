import React from 'react';
import { Heart, Wine, User } from 'lucide-react';
import { DrinkRecipe } from '../types.ts';
import { useTranslation } from 'react-i18next';

interface RecipeCardProps {
  recipe: DrinkRecipe;
  onToggleFavorite: (id: string) => void;
  onClick: (recipe: DrinkRecipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onToggleFavorite, onClick }) => {
  const { t } = useTranslation();
  // Pegamos apenas os 3 primeiros ingredientes para não poluir o card
  const displayIngredients = recipe.ingredients.slice(0, 3);
  const remainingCount = recipe.ingredients.length - 3;
  const authorDisplay = recipe.author || 'Internet';

  return (
    <div 
      className="group bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/50 hover:border-brand-300 transition-all duration-300 cursor-pointer flex flex-col h-full shadow-lg hover:shadow-2xl hover:shadow-brand-500/20 hover:-translate-y-1"
      onClick={() => onClick(recipe)}
    >
      {/* Image Section */}
      <div className="relative aspect-[1/1] w-full overflow-hidden">
        <img 
          src={recipe.imageUrl || 'https://picsum.photos/400/300'} 
          alt={recipe.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
        
        {/* Category & Method Badges - Top Left */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 backdrop-blur-md border border-white/20 text-white text-xs font-bold rounded-lg shadow-sm">
            <Wine size={12} className="text-brand-300" />
            {t(`recipe.categories.${recipe.category}`)}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 backdrop-blur-md border border-white/20 text-white text-xs font-bold rounded-lg shadow-sm">
            {t(`recipe.methods.${recipe.method}`)}
          </span>
        </div>

        {/* Actions - Top Right */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(recipe.id);
            }}
            className="p-2 bg-black/40 backdrop-blur-md rounded-lg text-white/70 hover:text-red-500 border border-white/20 hover:border-red-400 transition-all shadow-sm hover:scale-110 hover:bg-white"
            title={recipe.isFavorite ? t('recipe.remove_favorite') : t('recipe.add_favorite')}
          >
            <Heart 
              size={18} 
              className={recipe.isFavorite ? 'fill-red-500 text-red-500' : ''} 
            />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow relative">
        <div className="mb-2">
          <h3 className="text-xl font-bold text-slate-800 leading-tight group-hover:text-brand-700 transition-colors">{recipe.title}</h3>
          <div className="flex items-center gap-1 text-[10px] text-brand-400 font-medium italic mt-0.5">
            <User size={10} className="text-brand-300" />
            <span>{t('common.credit')}: {authorDisplay}</span>
          </div>
        </div>
        
        <p className="text-slate-600 text-sm line-clamp-2 mb-6 font-medium leading-relaxed">
          {recipe.description}
        </p>

        {/* Ingredients Pills */}
        <div className="mb-5">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">{t('recipe.card_ingredients')}</h4>
          <div className="flex flex-wrap gap-2">
            {displayIngredients.map((ing, idx) => (
              <span 
                key={idx} 
                className="px-3 py-1.5 bg-brand-50 border border-brand-100 rounded-lg text-xs text-brand-800 font-semibold whitespace-nowrap"
              >
                {ing.name}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="px-2 py-1.5 text-xs text-slate-400 font-bold self-center pl-1">
                +{remainingCount}
              </span>
            )}
          </div>
        </div>

        {/* Footer Section: Garnish */}
        {recipe.garnish && (
          <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0"></span>
              <p className="text-xs text-slate-500 font-medium truncate">
                {t('common.garnish')}: <span className="text-slate-700">{recipe.garnish}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
