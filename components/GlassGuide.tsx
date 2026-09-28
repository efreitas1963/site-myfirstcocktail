
import React, { useState, useRef } from 'react';
import { ArrowLeft, GlassWater, Plus, Edit2, Trash2, X, Save, Image as ImageIcon, Link as LinkIcon, Upload, Loader2 } from 'lucide-react';
import { GlassType } from '../types';
import { uploadImage } from '../services/storageService';
import { useTranslation } from 'react-i18next';

interface GlassGuideProps {
  glasses: GlassType[];
  onBack: () => void;
  onSave: (glass: GlassType) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isMaster?: boolean;
}

export const GlassGuide: React.FC<GlassGuideProps> = ({ glasses, onBack, onSave, onDelete, isMaster }) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGlass, setEditingGlass] = useState<Partial<GlassType> | null>(null);
  const [imageInputMode, setImageInputMode] = useState<'url' | 'upload'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenForm = (glass?: GlassType) => {
    setEditingGlass(glass || { name: '', technicalName: '', capacityOz: '', capacityMl: '', imageUrl: '' });
    setImageInputMode(glass?.imageUrl?.startsWith('data:image') ? 'upload' : 'url');
    setIsModalOpen(true);
  };

  const handleCloseForm = () => {
    setEditingGlass(null);
    setIsModalOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
            const MAX_SIZE = 400;

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
                  const path = await uploadImage(blob, 'glasses', originalName);
                  setEditingGlass(prev => prev ? { ...prev, imageUrl: path } : null);
                } catch (err: any) {
                  console.error("Erro no upload do copo:", err);
                  alert(err.message || t('common.error_upload_recipe'));
                } finally {
                  setIsUploading(false);
                }
              } else {
                setIsUploading(false);
              }
            }, 'image/png');
          } catch (procErr) {
            console.error(procErr);
            setIsUploading(false);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Erro geral no upload de copo:", error);
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGlass && !isUploading) {
      const glassToSave = {
        ...editingGlass,
        id: editingGlass.id || crypto.randomUUID()
      } as GlassType;
      await onSave(glassToSave);
      handleCloseForm();
    }
  };

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 bg-white rounded-xl text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition-colors shadow-md border border-slate-200"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-serif font-bold text-slate-800">{t('glasses.title')}</h2>
            <p className="text-slate-500 text-sm font-medium">{t('glasses.subtitle')}</p>
          </div>
        </div>

        {isMaster && (
          <button 
            onClick={() => handleOpenForm()}
            className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all hover:scale-105"
          >
            <Plus size={18} /> {t('glasses.new_btn')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        {glasses.map((glass) => (
          <div key={glass.id} className="flex gap-6 group items-center relative">
            <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 rounded-2xl overflow-hidden shadow-md border border-white group-hover:scale-105 transition-transform duration-500 bg-transparent flex items-center justify-center p-2">
              {glass.imageUrl ? (
                <img 
                  src={glass.imageUrl} 
                  alt={glass.name} 
                  className="w-full h-full object-contain grayscale-[20%] group-hover:grayscale-0 transition-all"
                />
              ) : (
                <GlassWater size={32} className="text-slate-300" />
              )}
            </div>
            
            <div className="flex-1 space-y-1">
              <h3 className="text-brand-600 font-bold text-base md:text-lg leading-tight uppercase tracking-tight">
                {glass.name}
              </h3>
              <p className="text-slate-700 text-xs md:text-sm font-medium">
                "{glass.technicalName}". 
                <span className="block mt-0.5 text-slate-500 font-normal">
                  {t('glasses.capacity_range', { oz: glass.capacityOz, ml: glass.capacityMl })}
                </span>
              </p>
              
              {isMaster && (
                <div className="flex gap-2 pt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenForm(glass)} className="text-slate-400 hover:text-brand-600 transition-colors p-1 bg-slate-50 rounded-lg"><Edit2 size={14} /></button>
                  <button onClick={() => onDelete(glass.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1 bg-slate-50 rounded-lg"><Trash2 size={14} /></button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && editingGlass && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif font-bold text-slate-800">
                {editingGlass.id ? t('glasses.edit_title') : t('glasses.new_title')}
              </h3>
              <button onClick={handleCloseForm} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-600 text-sm font-bold mb-1">{t('glasses.form_name')}</label>
                <input required type="text" value={editingGlass.name} onChange={e => setEditingGlass({...editingGlass, name: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 text-sm" placeholder={t('glasses.form_name_placeholder')} />
              </div>
              <div>
                <label className="block text-slate-600 text-sm font-bold mb-1">{t('glasses.form_tech_name')}</label>
                <input required type="text" value={editingGlass.technicalName} onChange={e => setEditingGlass({...editingGlass, technicalName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 text-sm" placeholder={t('glasses.form_tech_name_placeholder')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-sm font-bold mb-1">{t('glasses.form_capacity_oz')}</label>
                  <input required type="text" value={editingGlass.capacityOz} onChange={e => setEditingGlass({...editingGlass, capacityOz: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 text-sm" placeholder={t('glasses.form_capacity_oz_placeholder')} />
                </div>
                <div>
                  <label className="block text-slate-600 text-sm font-bold mb-1">{t('glasses.form_capacity_ml')}</label>
                  <input required type="text" value={editingGlass.capacityMl} onChange={e => setEditingGlass({...editingGlass, capacityMl: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 text-sm" placeholder={t('glasses.form_capacity_ml_placeholder')} />
                </div>
              </div>
              
              <div>
                <label className="block text-slate-600 text-sm font-bold mb-2">{t('glasses.form_image')}</label>
                <div className="flex gap-2 mb-3">
                  <button type="button" onClick={() => setImageInputMode('upload')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${imageInputMode === 'upload' ? 'bg-brand-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}><Upload size={16} /> {t('common.upload')}</button>
                  <button type="button" onClick={() => setImageInputMode('url')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${imageInputMode === 'url' ? 'bg-brand-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}><LinkIcon size={16} /> {t('common.url')}</button>
                </div>
                
                {imageInputMode === 'url' ? (
                  <div className="relative">
                    <ImageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="url" value={editingGlass.imageUrl} onChange={e => setEditingGlass({...editingGlass, imageUrl: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 text-sm" placeholder="https://..." />
                  </div>
                ) : (
                  <div 
                    onClick={() => !isUploading && fileInputRef.current?.click()} 
                    className={`w-full border-2 border-dashed border-brand-200 rounded-xl p-6 text-center transition-colors bg-slate-50 ${isUploading ? 'cursor-wait opacity-50' : 'cursor-pointer hover:bg-brand-50'}`}
                  >
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      {isUploading ? <Loader2 size={28} className="animate-spin text-brand-600" /> : <ImageIcon size={28} className="text-brand-400" />}
                      <span className="text-xs font-bold uppercase">{isUploading ? t('recipe.form_image_uploading') : t('recipe.form_image_upload')}</span>
                    </div>
                  </div>
                )}

                {editingGlass.imageUrl && (
                  <div className="mt-4 relative w-32 h-32 mx-auto rounded-xl overflow-hidden border border-slate-200 shadow-md bg-transparent">
                    <img src={editingGlass.imageUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                    <button 
                      type="button" 
                      onClick={() => setEditingGlass({...editingGlass, imageUrl: ''})} 
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={handleCloseForm} className="flex-1 px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all">{t('common.cancel')}</button>
                <button type="submit" disabled={isUploading} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                  {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
