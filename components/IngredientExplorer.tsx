
import React, { useState } from 'react';
import { Search, ArrowLeft, Cherry, GlassWater, Leaf, Wine, Plus, CheckSquare, Square, Check, X } from 'lucide-react';
import { IngredientItem } from '../types';
import { useTranslation } from 'react-i18next';

interface IngredientExplorerProps {
  ingredients: IngredientItem[];
  onIngredientClick: (ingredientName: string) => void;
  onBack: () => void;
  isMaster?: boolean;
  onAddNew?: () => void;
  onShowMultiIngredientRecipes?: (ingredients: string[]) => void;
  initialSelectedIngredients?: string[];
}

export const IngredientExplorer: React.FC<IngredientExplorerProps> = ({ 
  ingredients, 
  onIngredientClick,
  onBack,
  isMaster,
  onAddNew,
  onShowMultiIngredientRecipes,
  initialSelectedIngredients = []
}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(initialSelectedIngredients);

  const toggleIngredient = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    setSelectedIngredients(prev => 
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    );
  };

  const filteredIngredients = ingredients.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    (i.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('destilado') || cat.includes('strong')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (cat.includes('licor') || cat.includes('soft')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (cat.includes('fruta') || cat.includes('fruit')) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (cat.includes('mixer') || cat.includes('beverage')) return 'bg-teal-100 text-teal-700 border-teal-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getPlaceholderIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('destilado')) return <Wine size={40} className="text-slate-300" />;
    if (cat.includes('fruta')) return <Cherry size={40} className="text-slate-300" />;
    if (cat.includes('mixer')) return <GlassWater size={40} className="text-slate-300" />;
    return <Leaf size={40} className="text-slate-300" />;
  };

  return (
    <div className="animate-fadeIn pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 bg-white rounded-lg text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition-colors shadow-md border border-slate-200"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-serif font-bold text-slate-800">{t('ingredients.explorer_title')}</h2>
            <p className="text-slate-500 text-sm font-medium">{t('ingredients.explorer_subtitle')}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {isMaster && (
            <button 
              onClick={onAddNew}
              className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <Plus size={18} /> {t('ingredients.new_ingredient')}
            </button>
          )}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={t('ingredients.search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredIngredients.map((item) => {
          const isSelected = selectedIngredients.includes(item.name);
          return (
          <div 
            key={item.id}
            onClick={() => onIngredientClick(item.name)}
            className={`group rounded-2xl p-5 border shadow-sm hover:shadow-xl hover:shadow-brand-500/10 transition-all cursor-pointer flex flex-col items-center text-center relative overflow-hidden active:scale-95 ${isSelected ? 'bg-brand-50 border-brand-300' : 'bg-white border-slate-100'}`}
          >
            {/* Checkbox for selection */}
            <div 
              onClick={(e) => toggleIngredient(e, item.name)}
              className={`absolute top-3 right-3 z-10 p-1.5 rounded-lg transition-colors ${isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
            >
              {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
            </div>

            {/* Image/Icon Container */}
            <div className={`w-24 h-24 mb-4 flex items-center justify-center rounded-full border group-hover:scale-110 transition-transform duration-500 overflow-hidden shadow-inner ${isSelected ? 'bg-white border-brand-200' : 'bg-slate-50 border-slate-100'}`}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-2" />
              ) : (
                getPlaceholderIcon(item.category)
              )}
            </div>

            {/* Content */}
            <h3 className="text-lg font-bold text-slate-800 mb-1 leading-tight group-hover:text-brand-600 transition-colors">
              {item.name}
            </h3>
            
            <p className="text-xs text-slate-400 font-medium mb-3 line-clamp-2 min-h-[2.5rem]">
              {item.description || t('ingredients.no_description')}
            </p>

            {/* Category Badge */}
            <div className={`mt-auto px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getCategoryColor(item.category)}`}>
              {item.category}
            </div>

            {/* Visual Checkmark */}
            <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="bg-brand-600 text-white p-1 rounded-md shadow-sm">
                  <Search size={12} />
               </div>
            </div>
          </div>
        )})}
      </div>

      {filteredIngredients.length === 0 && (
        <div className="text-center py-20 opacity-50">
          <p className="text-xl font-medium text-slate-500">{t('ingredients.no_results')}</p>
        </div>
      )}

      {/* Floating Action Bar for Selected Ingredients */}
      {selectedIngredients.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50 animate-slideUp whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className="bg-brand-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
              {selectedIngredients.length}
            </div>
            <span className="font-medium hidden sm:inline">
              {selectedIngredients.length === 1 ? t('multi_ingredients.selected_one') : t('multi_ingredients.selected_other')}
            </span>
          </div>
          <div className="w-px h-8 bg-slate-700 mx-2"></div>
          <button 
            onClick={() => setSelectedIngredients([])}
            className="text-slate-400 hover:text-white transition-colors p-2"
            title={t('multi_ingredients.clear_selection')}
          >
            <X size={20} />
          </button>
          <button 
            onClick={() => onShowMultiIngredientRecipes?.(selectedIngredients)}
            className="bg-brand-500 hover:bg-brand-400 text-white px-5 py-2 rounded-xl font-bold transition-colors"
          >
            {t('multi_ingredients.view_drinks')}
          </button>
        </div>
      )}
    </div>
  );
};
