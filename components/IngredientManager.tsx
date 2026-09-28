
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Search, ArrowLeft, Tag, ArrowUpDown, ArrowUp, ArrowDown, Edit2, Save, X, Settings2, Printer, FileText, Image as ImageIcon, Wine, Upload, Loader2, AlertCircle } from 'lucide-react';
import { IngredientItem, CategoryItem } from '../types';
import { CategoryManager } from './CategoryManager';
import { uploadImage } from '../services/storageService';
import { useTranslation } from 'react-i18next';

interface IngredientManagerProps {
  ingredients: IngredientItem[];
  categories: CategoryItem[];
  onSave: (ingredients: IngredientItem[], singleItem?: IngredientItem) => void;
  onDelete: (id: string) => void;
  onUpdateCategories: (categories: CategoryItem[]) => void;
  onDeleteCategory: (id: string) => void;
  onBack: () => void;
  initialEditingId?: string | null;
}

type SortKey = 'name' | 'category';
type SortDirection = 'asc' | 'desc';

export const IngredientManager: React.FC<IngredientManagerProps> = ({ 
  ingredients = [], 
  categories = [],
  onSave,
  onDelete, 
  onUpdateCategories,
  onDeleteCategory,
  onBack,
  initialEditingId
}) => {
  const { t } = useTranslation();
  const [viewMode, setViewState] = useState<'INGREDIENTS' | 'CATEGORIES'>('INGREDIENTS');
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientCategory, setNewIngredientCategory] = useState<string>('');
  const [newIngredientDescription, setNewIngredientDescription] = useState('');
  const [newIngredientImageUrl, setNewIngredientImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [search, setSearch] = useState('');
  
  const nameInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<string>('');
  const [editDescription, setEditDescription] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');

  useEffect(() => {
    if (initialEditingId) {
      const item = ingredients.find(i => i.id === initialEditingId);
      if (item) {
        startEditing(item);
        setTimeout(() => {
          const element = document.getElementById(`ing-row-${initialEditingId}`);
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [initialEditingId, ingredients]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Captura o nome original aqui
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
            if (ctx) {
              ctx.fillStyle = "white";
              ctx.fillRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);
            }
            
            canvas.toBlob(async (blob) => {
              if (blob) {
                try {
                  // PASSAMOS O originalName AQUI TAMBÉM
                  const path = await uploadImage(blob, 'ingredients', originalName);
                  if (isEdit) setEditImageUrl(path);
                  else setNewIngredientImageUrl(path);
                } catch (uploadError: any) {
                  console.error("Erro no upload:", uploadError);
                  alert(uploadError.message || t('common.error_upload_recipe'));
                } finally {
                  setIsUploading(false);
                }
              } else {
                setIsUploading(false);
              }
            }, 'image/jpeg', 0.8);
          } catch (canvasError) {
            console.error(canvasError);
            setIsUploading(false);
            alert(t('common.error_process_image'));
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Erro geral no file upload:", error);
      setIsUploading(false);
      alert(t('common.error'));
    }
  };

  const handlePrintIngredients = () => {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      alert(t('common.error_popup'));
      return;
    }

    const grouped: Record<string, IngredientItem[]> = {};
    ingredients.forEach(ing => {
      const cat = ing.category || 'Outros';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(ing);
    });

    const sortedCategories = Object.keys(grouped).sort();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${t('ingredients.report_filename')}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #292524; line-height: 1.5; }
          h1 { color: #581c87; border-bottom: 4px solid #a855f7; padding-bottom: 10px; margin-bottom: 5px; font-size: 28px; }
          .meta { color: #78716c; font-size: 14px; margin-bottom: 30px; border-bottom: 1px solid #e7e5e4; padding-bottom: 15px; }
          .category-section { margin-bottom: 25px; page-break-inside: avoid; }
          .category-title { background: #faf5ff; color: #7e22ce; padding: 6px 12px; border-radius: 6px; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid #e9d5ff; margin-bottom: 10px; display: inline-block; }
          .items-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .item { display: flex; align-items: center; border-bottom: 1px solid #f5f5f4; padding: 6px 0; gap: 10px; break-inside: avoid; }
          .checkbox { width: 16px; height: 16px; border: 1px solid #d6d3d1; border-radius: 3px; flex-shrink: 0; }
          .item-img { width: 36px; height: 36px; object-fit: contain; border-radius: 6px; background: #fff; border: 1px solid #eee; flex-shrink: 0; }
          .item-info { flex: 1; display: flex; flex-direction: column; }
          .item-info { flex: 1; display: flex; flex-direction: column; }
          .item-name { font-weight: 600; font-size: 13px; color: #1c1917; }
          .item-desc { color: #78716c; font-size: 10px; font-style: italic; }
          .footer { margin-top: 50px; text-align: center; color: #d6d3d1; font-size: 12px; border-top: 1px solid #f5f5f4; padding-top: 20px; }
          @media print {
            .no-print { display: none; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="position: fixed; top: 20px; right: 20px; z-index: 100;">
          <button onclick="window.print()" style="background: #9333ea; color: white; border: none; padding: 12px 24px; border-radius: 10px; cursor: pointer; font-weight: bold; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">${t('ingredients.print_report')}</button>
        </div>
        <h1>${t('ingredients.report_title')}</h1>
        <div class="meta">
          MyFirstCocktail • ${t('ingredients.report_meta', { date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString(), total: ingredients.length })}
        </div>
        
        ${sortedCategories.map(cat => `
          <div class="category-section">
            <div class="category-title">${cat}</div>
            <div class="items-grid">
              ${grouped[cat].sort((a,b) => a.name.localeCompare(b.name)).map(ing => `
                <div class="item">
                  <div class="checkbox"></div>
                  ${ing.imageUrl ? `<img src="${ing.imageUrl}" class="item-img" />` : '<div class="item-img" style="display:flex;align-items:center;justify-content:center;font-size:8px;color:#ccc">S/F</div>'}
                  <div class="item-info">
                    <span class="item-name">${ing.name}</span>
                    ${ing.description ? `<span class="item-desc">${ing.description}</span>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
        
        <div class="footer">
          ${t('ingredients.report_footer')}
        </div>
      </body>
      </html>
    `;

    reportWindow.document.write(htmlContent);
    reportWindow.document.close();
  };

  if (viewMode === 'CATEGORIES') {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center gap-4 mb-2 border-b border-slate-200 pb-4">
          <button onClick={() => setViewState('INGREDIENTS')} className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm hover:text-brand-600 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-slate-800">{t('ingredients.manager_categories')}</h2>
        </div>
        <CategoryManager categories={categories} onSave={onUpdateCategories} onDelete={onDeleteCategory} onBack={() => setViewState('INGREDIENTS')} />
      </div>
    );
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngredientName.trim() || isUploading) return;
    const safeId = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `ing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newItem: IngredientItem = {
      id: safeId,
      name: newIngredientName.trim(),
      category: newIngredientCategory.trim() || 'Outros',
      description: newIngredientDescription.trim(),
      imageUrl: newIngredientImageUrl
    };
    onSave([...ingredients, newItem], newItem);
    setNewIngredientName('');
    setNewIngredientCategory('');
    setNewIngredientDescription('');
    setNewIngredientImageUrl('');
    nameInputRef.current?.focus();
  };

  const startEditing = (item: IngredientItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditCategory(item.category);
    setEditDescription(item.description || '');
    setEditImageUrl(item.imageUrl || '');
  };

  const saveEditing = () => {
    if (!editName.trim() || !editingId || isUploading) return;
    const updatedItem: IngredientItem = { 
      id: editingId, 
      name: editName.trim(), 
      category: editCategory.trim(), 
      description: editDescription.trim(), 
      imageUrl: editImageUrl 
    };
    const updatedIngredients = ingredients.map(ing => 
      ing.id === editingId ? updatedItem : ing
    );
    onSave(updatedIngredients, updatedItem);
    setEditingId(null);
  };

  const filteredAndSortedIngredients = ingredients
    .filter(i => {
      const s = search.toLowerCase();
      return i.name.toLowerCase().includes(s) || (i.description || '').toLowerCase().includes(s);
    })
    .sort((a, b) => {
      const valA = (a[sortKey] || '').toString().toLowerCase();
      const valB = (b[sortKey] || '').toString().toLowerCase();
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm hover:text-brand-600 transition-colors"><ArrowLeft size={20} /></button>
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-slate-800">{t('ingredients.manager_title')}</h2>
            <p className="text-xs text-brand-600 font-bold uppercase tracking-widest">
              {t('ingredients.manager_stats', { visible: filteredAndSortedIngredients.length, total: ingredients.length })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handlePrintIngredients}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-brand-700 transition-colors border border-slate-200 shadow-sm"
          >
            <Printer size={16} /> {t('ingredients.print_report')}
          </button>
          <button onClick={() => setViewState('CATEGORIES')} className="flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 rounded-lg text-sm font-medium hover:bg-brand-100 transition-colors border border-brand-200"><Settings2 size={16} /> {t('ingredients.categories_btn')}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-brand-100 shadow-xl sticky top-24">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-brand-600"><Plus size={20} /> {t('ingredients.new_ingredient')}</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div 
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`relative group w-full aspect-square max-w-[150px] mx-auto rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden ${
                  newIngredientImageUrl ? 'border-brand-500 bg-white' : 'border-slate-200 hover:border-brand-400 bg-slate-50'
                } ${isUploading ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}
              >
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, false)} />
                {newIngredientImageUrl ? (
                  <>
                    <img src={newIngredientImageUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload size={24} className="text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-slate-400 group-hover:text-brand-500 transition-colors">
                    {isUploading ? <Loader2 size={32} className="animate-spin" /> : <ImageIcon size={32} />}
                    <span className="text-[10px] font-bold mt-2 uppercase">{isUploading ? t('recipe.form_image_uploading') : t('ingredients.form_image')}</span>
                  </div>
                )}
              </div>

              <input ref={nameInputRef} type="text" value={newIngredientName} onChange={(e) => setNewIngredientName(e.target.value)} placeholder={t('ingredients.form_name')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 text-sm" />
              <input list="cat-options" value={newIngredientCategory} onChange={(e) => setNewIngredientCategory(e.target.value)} placeholder={t('ingredients.form_category')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 text-sm" />
              <datalist id="cat-options">{categories.map(c => <option key={c.id} value={c.name} />)}</datalist>
              <textarea value={newIngredientDescription} onChange={(e) => setNewIngredientDescription(e.target.value)} placeholder={t('ingredients.form_description')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-brand-500 resize-none text-sm" rows={3} />
              
              <button type="submit" disabled={!newIngredientName.trim() || isUploading} className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-brand-700 disabled:opacity-50 transition-all active:scale-95">{t('ingredients.save_btn')}</button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder={t('ingredients.search_manager')} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-brand-500 shadow-md" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
            <table className="w-full text-left">
              <thead className="bg-brand-50 text-brand-800 text-[10px] uppercase tracking-widest font-bold">
                <tr>
                  <th className="px-6 py-4 cursor-pointer hover:bg-brand-100 transition-colors" onClick={() => setSortKey('name')}>{t('ingredients.table_name')}</th>
                  <th className="px-6 py-4 cursor-pointer hover:bg-brand-100 transition-colors" onClick={() => setSortKey('category')}>{t('ingredients.table_category')}</th>
                  <th className="px-6 py-4 text-right">{t('ingredients.table_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSortedIngredients.map(item => (
                  <tr key={item.id} id={`ing-row-${item.id}`} className="hover:bg-slate-50 group">
                    {editingId === item.id ? (
                      <>
                        <td className="px-6 py-4 space-y-2">
                          <div className="flex gap-3">
                            <div 
                              onClick={() => !isUploading && editFileInputRef.current?.click()}
                              className={`w-12 h-12 rounded-lg bg-slate-100 border border-brand-200 flex-shrink-0 flex items-center justify-center overflow-hidden group/edit ${isUploading ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}
                            >
                              <input ref={editFileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, true)} />
                              {isUploading ? <Loader2 size={16} className="animate-spin text-brand-400" /> : editImageUrl ? (
                                <img src={editImageUrl} className="w-full h-full object-contain" />
                              ) : (
                                <Upload size={16} className="text-brand-400" />
                              )}
                            </div>
                            <div className="flex-1 space-y-2">
                              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full border border-brand-200 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
                              <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full border border-brand-200 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-brand-500" rows={2} />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <input list="cat-options" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full border border-brand-200 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={saveEditing} disabled={isUploading} className="text-green-600 p-2 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"><Save size={18} /></button>
                            <button onClick={() => setEditingId(null)} className="text-slate-400 p-2 hover:bg-red-50 rounded-lg transition-colors"><X size={18} /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden shadow-inner">
                              {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-full h-full object-contain p-1" /> : <Wine size={20} className="text-slate-200" />}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-800 text-sm truncate">{item.name}</div>
                              {item.description && <div className="text-[10px] text-slate-400 line-clamp-1 italic">{item.description}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200 shadow-sm">{item.category}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                            <button onClick={() => startEditing(item)} className="text-slate-400 hover:text-brand-600 p-2 hover:bg-brand-50 rounded-lg transition-colors"><Edit2 size={18} /></button>
                            <button onClick={() => onDelete(item.id)} className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
