
import React, { useState, useRef } from 'react';
import { X, Plus, Trash2, Save, Upload, Link as LinkIcon, Image as ImageIcon, Loader2, FlaskConical, Droplets, Ruler, Archive, ShieldCheck } from 'lucide-react';
import { BasePreparation } from '../types';
import { uploadImage } from '../services/storageService';
import { useTranslation } from 'react-i18next';

interface PreMadeFormProps {
  initialData?: BasePreparation;
  type: 'liquor' | 'syrup';
  onSave: (item: BasePreparation) => void;
  onCancel: () => void;
}

export const PreMadeForm: React.FC<PreMadeFormProps> = ({ initialData, type, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<BasePreparation>>({
    title: '',
    description: '',
    ingredients: [{ name: '', amount: '', unit: 'ml', note: '' }],
    instructions: [''],
    yield_ml: '',
    storage: 'Refrigeração',
    validity: '30 dias',
    imageUrl: '',
    ...initialData
  });

  const [imageInputMode, setImageInputMode] = useState<'url' | 'upload'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof BasePreparation, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleIngredientChange = (index: number, field: string, value: string) => {
    const newIngredients = [...(formData.ingredients || [])];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), { name: '', amount: '', unit: 'ml', note: '' }]
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
    if (!formData.title || isUploading) return;
    
	// === INICIO ALTERACAO: NOVO ITEM SEM UUID (MYSQL AUTO_INCREMENT) ===
	onSave({
	  id: initialData?.id || '',
	  createdAt: initialData?.createdAt || Date.now(),
	  ...formData as Omit<BasePreparation, 'id' | 'createdAt'>,
	} as BasePreparation);
	// === FIM ALTERACAO: NOVO ITEM SEM UUID (MYSQL AUTO_INCREMENT) ===

  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const path = await uploadImage(file, type === 'liquor' ? 'liqueurs' : 'syrups', file.name);
      handleInputChange('imageUrl', path);
    } catch (err) {
      console.error(err);
      alert(t('common.error_upload_recipe'));
    } finally {
      setIsUploading(false);
    }
  };

  const Icon = type === 'liquor' ? FlaskConical : Droplets;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-brand-100">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${type === 'liquor' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
              <Icon size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              {initialData ? t('premade.form_edit') : t('premade.form_new')} {type === 'liquor' ? t('premade.form_liquor') : t('premade.form_syrup')}
            </h2>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-slate-50 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50">
          <form id="premade-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-slate-600 text-sm font-bold mb-2 uppercase tracking-tight">{t('premade.form_name')}</label>
                  <input required type="text" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} className="w-full bg-white border-brand-100 border-2 rounded-2xl px-4 py-3 text-slate-800 focus:ring-4 focus:ring-brand-500/20 outline-none transition-all" placeholder={type === 'liquor' ? t('premade.form_name_placeholder_liquor') : t('premade.form_name_placeholder_syrup')} />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-600 text-xs font-bold mb-2 flex items-center gap-2"><Ruler size={14} /> {t('common.yield')}</label>
                    <input type="text" value={formData.yield_ml} onChange={(e) => handleInputChange('yield_ml', e.target.value)} className="w-full bg-white border-brand-100 border-2 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-500" placeholder="500 ml" />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs font-bold mb-2 flex items-center gap-2"><Archive size={14} /> {t('common.storage')}</label>
                    <input type="text" value={formData.storage} onChange={(e) => handleInputChange('storage', e.target.value)} className="w-full bg-white border-brand-100 border-2 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-500" placeholder="Refrigeração" />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs font-bold mb-2 flex items-center gap-2"><ShieldCheck size={14} /> {t('common.validity')}</label>
                    <input type="text" value={formData.validity} onChange={(e) => handleInputChange('validity', e.target.value)} className="w-full bg-white border-brand-100 border-2 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-500" placeholder="30 dias" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 text-sm font-bold mb-2 uppercase tracking-tight">{t('premade.form_description')}</label>
                  <textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} rows={3} className="w-full bg-white border-brand-100 border-2 rounded-2xl px-4 py-3 text-slate-800 focus:ring-4 focus:ring-brand-500/20 outline-none resize-none transition-all" placeholder={t('premade.form_description_placeholder')} />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-slate-600 text-sm font-bold mb-2 uppercase tracking-tight">{t('premade.form_image')}</label>
                <div className="flex gap-2 mb-3">
                  <button type="button" onClick={() => setImageInputMode('upload')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${imageInputMode === 'upload' ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200'}`}>{t('common.upload')}</button>
                  <button type="button" onClick={() => setImageInputMode('url')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${imageInputMode === 'url' ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200'}`}>{t('common.url')}</button>
                </div>
                {imageInputMode === 'url' ? (
                  <input type="url" value={formData.imageUrl} onChange={(e) => handleInputChange('imageUrl', e.target.value)} className="w-full bg-white border-brand-100 border-2 rounded-xl px-4 py-2 text-sm outline-none" placeholder="https://..." />
                ) : (
                  <div onClick={() => !isUploading && fileInputRef.current?.click()} className={`w-full border-2 border-dashed border-brand-200 rounded-2xl p-6 text-center transition-colors bg-white ${isUploading ? 'cursor-wait opacity-50' : 'cursor-pointer hover:bg-brand-50'}`}>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      {isUploading ? <Loader2 size={32} className="animate-spin text-brand-600" /> : <ImageIcon size={32} className="text-brand-300" />}
                      <span className="text-xs font-bold uppercase">{isUploading ? t('recipe.form_image_uploading') : t('recipe.form_image_upload')}</span>
                    </div>
                  </div>
                )}
                {formData.imageUrl && (
                  <div className="mt-4 relative w-full h-32 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white p-2">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                    <button type="button" onClick={() => handleInputChange('imageUrl', '')} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <label className="text-slate-800 font-bold uppercase tracking-tight">{t('premade.form_ingredients')}</label>
                <button type="button" onClick={addIngredient} className="text-brand-600 hover:text-brand-700 text-xs font-bold flex items-center gap-1 bg-brand-50 px-3 py-1.5 rounded-lg"><Plus size={14} /> {t('premade.form_add_ingredient')}</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.ingredients?.map((ing, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3 relative group">
                    <div className="flex flex-wrap gap-2">
                      <input type="text" placeholder={t('premade.form_ingredient_item')} className="flex-[3] min-w-[120px] bg-slate-50 border-none rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" value={ing.name} onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)} />
                      <input type="text" placeholder={t('premade.form_ingredient_amount')} className="flex-1 min-w-[60px] bg-slate-50 border-none rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 text-center" value={ing.amount} onChange={(e) => handleIngredientChange(idx, 'amount', e.target.value)} />
                      <input type="text" placeholder={t('premade.form_ingredient_unit')} className="flex-[0.5] min-w-[50px] bg-slate-50 border-none rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 text-center" value={ing.unit} onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)} />
                    </div>
                    <input type="text" placeholder={t('premade.form_ingredient_note')} className="w-full bg-slate-50 border-none rounded-xl px-3 py-1.5 text-[10px] outline-none focus:ring-2 focus:ring-brand-500" value={ing.note} onChange={(e) => handleIngredientChange(idx, 'note', e.target.value)} />
                    <button type="button" onClick={() => removeIngredient(idx)} className="absolute -top-2 -right-2 bg-white text-slate-300 hover:text-red-500 p-1.5 rounded-full border border-slate-100 shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <label className="text-slate-800 font-bold uppercase tracking-tight">{t('premade.form_steps')}</label>
                <button type="button" onClick={addInstruction} className="text-brand-600 hover:text-brand-700 text-xs font-bold flex items-center gap-1 bg-brand-50 px-3 py-1.5 rounded-lg"><Plus size={14} /> {t('premade.form_add_step')}</button>
              </div>
              <div className="space-y-3">
                {formData.instructions?.map((inst, idx) => (
                  <div key={idx} className="flex gap-4 items-start bg-white p-3 rounded-2xl border border-slate-100 shadow-sm group">
                    <span className="bg-brand-50 text-brand-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">{idx + 1}</span>
                    <textarea rows={2} className="flex-1 bg-transparent border-none rounded-xl px-2 py-1 text-slate-700 text-sm outline-none resize-none" value={inst} onChange={(e) => handleInstructionChange(idx, e.target.value)} placeholder={t('premade.form_step_placeholder')} />
                    <button type="button" onClick={() => removeInstruction(idx)} className="text-slate-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
          <button onClick={onCancel} className="px-6 py-3 rounded-2xl text-slate-500 hover:bg-slate-50 font-bold transition-all">{t('common.cancel')}</button>
          <button type="submit" disabled={isUploading} form="premade-form" className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-brand-500/30 disabled:opacity-50 transition-all hover:scale-105 active:scale-95">
            {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {t('premade.form_save_btn')}
          </button>
        </div>
      </div>
    </div>
  );
};
