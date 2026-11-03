import React, { useState, useRef } from 'react';
import { ArrowLeft, Plus, Trash2, Save, Image as ImageIcon, Loader2, Handshake, ChevronUp, ChevronDown, AlertCircle } from 'lucide-react';
import { Sponsor } from '../types';
import { uploadSponsorLogo } from '../services/supabaseService';
import { useTranslation } from 'react-i18next';

interface SponsorManagerProps {
  sponsors: Sponsor[];
  onSave: (sponsors: Sponsor[]) => Promise<void>;
  onBack: () => void;
}

const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2);

export const SponsorManager: React.FC<SponsorManagerProps> = ({ sponsors, onSave, onBack }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<Sponsor[]>(sponsors);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const isDirty = JSON.stringify(items) !== JSON.stringify(sponsors);

  const updateItem = (id: string, field: keyof Sponsor, value: string) => {
    setItems(prev => prev.map(it => (it.id === id ? { ...it, [field]: value } : it)));
  };

  const handleFileUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(id);
    setError(null);
    try {
      const url = await uploadSponsorLogo(file, file.name);
      updateItem(id, 'logo', url);
    } catch (err: any) {
      console.error(err);
      setError(t('sponsors.error_upload'));
    } finally {
      setUploadingId(null);
      // Allow picking the same file again
      if (fileInputs.current[id]) fileInputs.current[id]!.value = '';
    }
  };

  const handleAdd = () => {
    setItems(prev => [
      ...prev,
      { id: generateId(), name: '', logo: '', link: '#', sortOrder: prev.length + 1 },
    ]);
  };

  const handleRemove = (id: string) => {
    const item = items.find(it => it.id === id);
    const label = item?.name?.trim() || t('sponsors.unnamed');
    if (!window.confirm(t('sponsors.delete_confirm', { name: label }))) return;
    setItems(prev => prev.filter(it => it.id !== id));
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    setItems(prev => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await onSave(items.map((it, i) => ({ ...it, sortOrder: i + 1 })));
      onBack();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || t('sponsors.error_save'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 bg-white rounded-lg text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition-colors shadow-md border border-slate-200"
            title={t('common.back')}
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-100 text-brand-600">
              <Handshake size={24} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-2xl font-black text-slate-800 leading-tight">{t('sponsors.manage_title')}</h2>
              <span className="text-xs text-slate-500 font-medium">{t('sponsors.manage_subtitle')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAdd}
            className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-all text-sm"
          >
            <Plus size={16} /> {t('sponsors.add')}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className="bg-brand-600 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-all text-sm disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? t('sponsors.saving') : t('common.save')}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm font-bold">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Handshake size={48} className="mx-auto mb-4 text-slate-200" />
          <p className="font-bold">{t('sponsors.empty')}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 md:items-center"
            >
              <div className="flex md:flex-col items-center gap-1 text-slate-300">
                <button
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="p-1 text-slate-400 hover:text-brand-600 disabled:opacity-20 disabled:hover:text-slate-400"
                  title={t('sponsors.move_up')}
                >
                  <ChevronUp size={18} />
                </button>
                <span className="text-[10px] font-black text-slate-400">{index + 1}</span>
                <button
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  className="p-1 text-slate-400 hover:text-brand-600 disabled:opacity-20 disabled:hover:text-slate-400"
                  title={t('sponsors.move_down')}
                >
                  <ChevronDown size={18} />
                </button>
              </div>

              <div
                onClick={() => uploadingId !== item.id && fileInputs.current[item.id]?.click()}
                className={`relative w-full md:w-40 h-24 flex-shrink-0 rounded-xl border-2 border-dashed border-brand-200 bg-slate-50 flex items-center justify-center overflow-hidden transition-colors ${
                  uploadingId === item.id ? 'cursor-wait opacity-50' : 'cursor-pointer hover:bg-brand-50'
                }`}
                title={t('sponsors.change_image')}
              >
                <input
                  type="file"
                  ref={el => { fileInputs.current[item.id] = el; }}
                  onChange={e => handleFileUpload(item.id, e)}
                  accept="image/*"
                  className="hidden"
                />
                {uploadingId === item.id ? (
                  <Loader2 size={24} className="animate-spin text-brand-600" />
                ) : item.logo ? (
                  <img src={item.logo} alt={item.name} className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-400">
                    <ImageIcon size={24} className="text-brand-300" />
                    <span className="text-[10px] font-bold uppercase">{t('common.upload')}</span>
                  </div>
                )}
              </div>

              <div className="flex-1 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-slate-500 text-[10px] font-bold mb-1 uppercase tracking-tight">
                    {t('sponsors.field_name')}
                  </label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={e => updateItem(item.id, 'name', e.target.value)}
                    className="w-full bg-white border-2 border-slate-200 focus:border-brand-400 rounded-xl px-3 py-2 text-sm outline-none transition-colors"
                    placeholder={t('sponsors.field_name_placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] font-bold mb-1 uppercase tracking-tight">
                    {t('sponsors.field_link')}
                  </label>
                  <input
                    type="url"
                    value={item.link}
                    onChange={e => updateItem(item.id, 'link', e.target.value)}
                    className="w-full bg-white border-2 border-slate-200 focus:border-brand-400 rounded-xl px-3 py-2 text-sm outline-none transition-colors"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <button
                onClick={() => handleRemove(item.id)}
                className="self-end md:self-center p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0"
                title={t('sponsors.remove')}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400 text-center pb-4">{t('sponsors.hint_upload')}</p>
    </div>
  );
};
