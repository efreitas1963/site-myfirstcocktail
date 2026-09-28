
import React, { useState, useRef } from 'react';
import { X, Upload, FileJson, AlertCircle, CheckCircle2, Info, Martini, FlaskConical, Droplets } from 'lucide-react';
import { DrinkRecipe, BasePreparation } from '../types';
import { useTranslation } from 'react-i18next';

interface RecipeImportModalProps {
  type: 'recipes' | 'liqueurs' | 'syrups';
  onImport: (data: any[]) => void;
  onClose: () => void;
}

export const RecipeImportModal: React.FC<RecipeImportModalProps> = ({ type, onImport, onClose }) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getLabel = () => {
    switch(type) {
      case 'liqueurs': return { title: t('nav.liqueurs'), icon: <FlaskConical className="text-amber-500" size={28} /> };
      case 'syrups': return { title: t('nav.syrups'), icon: <Droplets className="text-blue-500" size={28} /> };
      default: return { title: t('nav.drinks'), icon: <Martini className="text-brand-500" size={28} /> };
    }
  };

  const processFile = (file: File) => {
    setError(null);
    setPreviewCount(null);
    
    if (!file.name.endsWith('.json')) {
      setError(t('import.error_json_only'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (!Array.isArray(json)) throw new Error(t('import.error_array_required'));

        let validatedItems: any[] = [];

        if (type === 'recipes') {
          validatedItems = json.map((item: any) => ({
            id: item.id || crypto.randomUUID(),
            title: item.title || t('import.no_title'),
            description: item.description || "",
            ingredients: Array.isArray(item.ingredients) ? item.ingredients : [],
            instructions: Array.isArray(item.instructions) ? item.instructions : [],
            garnish: item.garnish || "",
            method: item.method || "Montado",
            category: item.category || "Alcoólico",
            imageUrl: item.imageUrl || item.imageURL || "",
            author: item.author || "Internet",
            isFavorite: !!item.isFavorite,
            createdAt: item.createdAt || Date.now()
          }));
        } else {
          // Licores e Xaropes
          validatedItems = json.map((item: any) => ({
            id: item.id || '',
            title: item.title || t('import.no_title'),
            description: item.description || item.description_liqueurs || "",
            ingredients: Array.isArray(item.ingredients) ? item.ingredients : (Array.isArray(item.ingredients_liqueurs) ? item.ingredients_liqueurs : (Array.isArray(item.ingredients_syrups) ? item.ingredients_syrups : [])),
            instructions: Array.isArray(item.instructions) ? item.instructions : (Array.isArray(item.method_liqueurs) ? item.method_liqueurs : (Array.isArray(item.method_syrups) ? item.method_syrups : [])),
            yield_ml: item.yield_ml || item.yield_ml_liqueurs || "",
            storage: item.storage || item.proportion_liqueurs || item.proportion || "Refrigeração",
            validity: item.validity || "30 dias",
            imageUrl: item.imageUrl || item.imageURL || "",
            createdAt: item.createdAt || Date.now()
          }));
        }

        setParsedData(validatedItems);
        setPreviewCount(validatedItems.length);
      } catch (err: any) {
        setError(t('import.error_processing') + err.message);
      }
    };
    reader.readAsText(file);
  };

  const labels = getLabel();

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 border border-stone-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif font-bold text-slate-800 flex items-center gap-3">
            {labels.icon} {t('import.title', { type: labels.title })}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-50 rounded-full text-slate-400"><X size={24} /></button>
        </div>

        {!previewCount ? (
          <>
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-brand-200 rounded-3xl p-10 text-center cursor-pointer hover:bg-brand-50 transition-all group mb-4">
              <input ref={fileInputRef} type="file" className="hidden" accept=".json" onChange={(e) => e.target.files && processFile(e.target.files[0])} />
              <Upload size={40} className="mx-auto mb-4 text-brand-300 group-hover:text-brand-500 transition-colors" />
              <p className="font-bold text-slate-600">{t('import.select_file')}</p>
              <p className="text-sm text-slate-400 mt-2">{t('import.drag_drop')}</p>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex gap-3">
              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-bold flex items-center gap-2"><Info size={14} className="text-brand-500" /> {t('import.tip_title')}</p>
                <p>{t('import.tip_desc')}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-green-50 border border-green-100 p-8 rounded-3xl text-center">
            <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4" />
            <p className="text-xl font-bold text-slate-800">{t('import.items_found', { count: previewCount })}</p>
            <p className="text-slate-600 mt-2">{t('import.confirm_msg')}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 text-sm font-medium flex items-center gap-3">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 font-bold text-slate-500 hover:bg-stone-50 rounded-xl transition-all">{t('common.cancel')}</button>
          <button onClick={() => { onImport(parsedData); onClose(); }} disabled={!previewCount} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg transition-all active:scale-95">{t('import.confirm_btn')}</button>
        </div>
      </div>
    </div>
  );
};
