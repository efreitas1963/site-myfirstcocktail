
import React, { useState, useRef } from 'react';
import { X, Plus, Trash2, Save, Upload, Link as LinkIcon, Image as ImageIcon, User, Loader2 } from 'lucide-react';
import { DrinkRecipe, Ingredient, IngredientItem } from '../types';
import { CATEGORIES, METHODS } from '../constants';
import { uploadImage } from '../services/storageService';
import { useTranslation } from 'react-i18next';

interface RecipeFormProps {
  initialData?: DrinkRecipe;
  onSave: (recipe: DrinkRecipe) => void;
  onCancel: () => void;
  availableIngredients?: IngredientItem[];
}

export const RecipeForm: React.FC<RecipeFormProps> = ({ initialData, onSave, onCancel, availableIngredients = [] }) => {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<DrinkRecipe>>({
    title: '',
    description: '',
    ingredients: [{ name: '', measure: '' }],
    instructions: [''],
    garnish: '',
    method: 'Batido',
    category: 'Alcoólico',
    imageUrl: '',
    author: 'Internet',
    isFavorite: false,
    ...initialData
  });

  const [imageInputMode, setImageInputMode] = useState<'url' | 'upload'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof DrinkRecipe, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string) => {
    const newIngredients = [...(formData.ingredients || [])];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), { name: '', measure: '' }]
    }));
  };

  const removeIngredient = (index: number) => {
    const newIngredients = [...(formData.ingredients || [])];
    newIngredients.splice(index, 1);
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...(formData.instructions || [])];
    newInstructions[index] = value;
    setFormData(prev => ({ ...prev, instructions: newInstructions }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...(prev.instructions || []), '']
    }));
  };

  const removeInstruction = (index: number) => {
    const newInstructions = [...(formData.instructions || [])];
    newInstructions.splice(index, 1);
    setFormData(prev => ({ ...prev, instructions: newInstructions }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.ingredients?.length || isUploading) return;
    
    onSave({
      id: initialData?.id || crypto.randomUUID(),
      createdAt: initialData?.createdAt || Date.now(),
      ...formData as Omit<DrinkRecipe, 'id' | 'createdAt'>,
      imageUrl: formData.imageUrl || `https://picsum.photos/800/600?random=${Date.now()}`,
      author: formData.author || 'Internet'
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Captura o nome original para evitar o nome 'blob' no banco
    const originalName = file.name;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      
      reader.onerror = () => {
        setIsUploading(false);
        alert(t('common.error_read_file'));
      };

      reader.onload = (event) => {
        const img = new Image();
        
        img.onerror = () => {
          setIsUploading(false);
          alert(t('common.error_invalid_image'));
        };

        img.onload = async () => {
          try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const MAX_SIZE = 800;
            if (width > height) {
              if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
            } else {
              if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
            }
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob(async (blob) => {
              if (blob) {
                try {
                  // PASSAMOS O originalName AQUI
                  const path = await uploadImage(blob, 'recipes', originalName);
                  handleInputChange('imageUrl', path);
                } catch (err: any) {
                  console.error("Erro no upload de receita:", err);
                  alert(err.message || t('common.error_upload_recipe'));
                } finally {
                  setIsUploading(false);
                }
              } else {
                setIsUploading(false);
              }
            }, 'image/jpeg', 0.8);
          } catch (procErr) {
            console.error(procErr);
            setIsUploading(false);
            alert(t('common.error_process_image'));
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Erro geral no upload da receita:", error);
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-brand-100">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <h2 className="text-2xl font-bold text-slate-800">{initialData ? t('recipe.form_edit') : t('recipe.form_new')}</h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-red-500 transition-colors"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50">
          <form id="recipe-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-600 text-sm font-medium mb-1">{t('recipe.form_name')}</label>
                  <input required type="text" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} className="w-full bg-white border-brand-200 border rounded-lg px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-brand-500 outline-none" placeholder={t('recipe.form_name_placeholder')} />
                </div>
                
                <div>
                  <label className="block text-slate-600 text-sm font-medium mb-1">{t('common.author')}</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300" />
                    <input type="text" value={formData.author} onChange={(e) => handleInputChange('author', e.target.value)} className="w-full bg-white border-brand-200 border rounded-lg pl-10 pr-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-brand-500 outline-none" placeholder={t('recipe.form_author_placeholder')} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 text-sm font-medium mb-1">{t('common.category')}</label>
                    <select value={formData.category} onChange={(e) => handleInputChange('category', e.target.value)} className="w-full bg-white border-brand-200 border rounded-lg px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-brand-500 outline-none">
                      {CATEGORIES.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{t(`recipe.categories.${c}`)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 text-sm font-medium mb-1">{t('common.method')}</label>
                    <select value={formData.method} onChange={(e) => handleInputChange('method', e.target.value)} className="w-full bg-white border-brand-200 border rounded-lg px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-brand-500 outline-none">
                      {METHODS.map(m => <option key={m} value={m}>{t(`recipe.methods.${m}`)}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-slate-600 text-sm font-medium mb-1">{t('common.garnish')}</label>
                  <input type="text" value={formData.garnish} onChange={(e) => handleInputChange('garnish', e.target.value)} className="w-full bg-white border-brand-200 border rounded-lg px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-brand-500 outline-none" placeholder={t('recipe.form_garnish_placeholder')} />
                </div>

                <div>
                  <label className="block text-slate-600 text-sm font-medium mb-2">{t('recipe.form_image_label')}</label>
                  <div className="flex gap-2 mb-3">
                    <button type="button" onClick={() => setImageInputMode('upload')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${imageInputMode === 'upload' ? 'bg-brand-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}><Upload size={16} /> {t('common.upload')}</button>
                    <button type="button" onClick={() => setImageInputMode('url')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${imageInputMode === 'url' ? 'bg-brand-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}><LinkIcon size={16} /> {t('common.url')}</button>
                  </div>
                  {imageInputMode === 'url' ? (
                    <input type="url" value={formData.imageUrl} onChange={(e) => handleInputChange('imageUrl', e.target.value)} className="w-full bg-white border-brand-200 border rounded-lg px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="https://..." />
                  ) : (
                    <div onClick={() => !isUploading && fileInputRef.current?.click()} className={`w-full border-2 border-dashed border-brand-200 rounded-lg p-4 text-center transition-colors bg-white ${isUploading ? 'cursor-wait opacity-50' : 'cursor-pointer hover:bg-brand-50'}`}>
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                      <div className="flex flex-col items-center gap-2 text-slate-500">
                        {isUploading ? <Loader2 size={24} className="animate-spin text-brand-600" /> : <ImageIcon size={24} className="text-brand-400" />}
                        <span className="text-sm">{isUploading ? t('recipe.form_image_uploading') : t('recipe.form_image_upload')}</span>
                      </div>
                    </div>
                  )}
                  {formData.imageUrl && (
                    <div className="mt-3 relative w-full h-32 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => handleInputChange('imageUrl', '')} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-sm"><Trash2 size={16} /></button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 text-sm font-medium mb-1">{t('common.description')}</label>
              <textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} rows={3} className="w-full bg-white border-brand-200 border rounded-lg px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-brand-500 outline-none resize-none" placeholder={t('recipe.form_description_placeholder')} />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-slate-600 text-sm font-medium">{t('common.ingredients')}</label>
                <button type="button" onClick={addIngredient} className="text-brand-600 hover:text-brand-700 text-sm font-medium flex items-center gap-1"><Plus size={16} /> {t('recipe.form_add_ingredient')}</button>
              </div>
              <div className="space-y-2">
                {formData.ingredients?.map((ing, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input list="available-ingredients" type="text" placeholder={t('recipe.form_ingredients_placeholder')} className="flex-[2] bg-white border-brand-200 border rounded-lg px-3 py-2 text-slate-800 text-sm focus:ring-2 focus:ring-brand-500 outline-none" value={ing.name} onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)} />
                    <input type="text" placeholder={t('recipe.form_measure_placeholder')} className="flex-1 bg-white border-brand-200 border rounded-lg px-3 py-2 text-slate-800 text-sm focus:ring-2 focus:ring-brand-500 outline-none" value={ing.measure} onChange={(e) => handleIngredientChange(idx, 'measure', e.target.value)} />
                    <button type="button" onClick={() => removeIngredient(idx)} className="text-slate-400 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
              <datalist id="available-ingredients">{availableIngredients.sort((a,b) => a.name.localeCompare(b.name)).map(item => <option key={item.id} value={item.name} />)}</datalist>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-slate-600 text-sm font-medium">{t('common.instructions')}</label>
                <button type="button" onClick={addInstruction} className="text-brand-600 hover:text-brand-700 text-sm font-medium flex items-center gap-1"><Plus size={16} /> {t('recipe.form_add_step')}</button>
              </div>
              <div className="space-y-2">
                {formData.instructions?.map((inst, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <span className="text-brand-400 py-2 text-sm font-mono w-6 text-center font-bold">{idx + 1}.</span>
                    <textarea rows={2} className="flex-1 bg-white border-brand-200 border rounded-lg px-3 py-2 text-slate-800 text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none" value={inst} onChange={(e) => handleInstructionChange(idx, e.target.value)} />
                    <button type="button" onClick={() => removeInstruction(idx)} className="text-slate-400 hover:text-red-500 p-2 mt-1"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
          <button onClick={onCancel} className="px-6 py-2.5 rounded-lg text-slate-500 hover:text-slate-700 font-medium">{t('common.cancel')}</button>
          <button type="submit" disabled={isUploading} form="recipe-form" className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-brand-500/30 disabled:opacity-50">
            {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
};
