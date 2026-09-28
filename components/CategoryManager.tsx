import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, Tag, Printer } from 'lucide-react';
import { CategoryItem } from '../types';
import { useTranslation } from 'react-i18next';

interface CategoryManagerProps {
  categories: CategoryItem[];
  onSave: (categories: CategoryItem[]) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ categories = [], onSave, onDelete, onBack }) => {
  const { t } = useTranslation();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Função auxiliar para ID (mais compatível que crypto.randomUUID em http local)
  const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const newCategory: CategoryItem = {
      id: generateId(),
      name: newCategoryName.trim()
    };

    onSave([...categories, newCategory]);
    setNewCategoryName('');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm(t('categories.delete_confirm'))) {
      onDelete(id);
    }
  };

  const startEditing = (item: CategoryItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(item.id);
    setEditName(item.name);
  };

  const cancelEditing = (e?: React.MouseEvent) => {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    setEditingId(null);
    setEditName('');
  };

  const saveEditing = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!editName.trim() || !editingId) return;

    const updatedCategories = categories.map(cat => 
      cat.id === editingId 
        ? { ...cat, name: editName.trim() }
        : cat
    );

    onSave(updatedCategories);
    cancelEditing();
  };

  const handlePrintCategories = () => {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      alert(t('common.error_popup'));
      return;
    }

    const sortedCategories = [...categories].sort((a, b) => 
      (a.name || '').localeCompare(b.name || '')
    );

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${t('categories.print_title')} - MyFirstCocktail</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; padding: 30px; color: #333; }
          h1 { color: #581c87; border-bottom: 3px solid #9333ea; padding-bottom: 15px; margin-bottom: 20px; }
          .meta { margin-bottom: 30px; color: #666; font-size: 0.9em; }
          .list-container { display: block; column-count: 2; column-gap: 40px; }
          .category-item { padding: 8px 0; border-bottom: 1px dashed #ddd; color: #444; font-weight: 500; break-inside: avoid; }
          .footer { margin-top: 50px; text-align: center; font-size: 0.8em; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
          @media print {
            .no-print { display: none; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" style="padding: 10px 20px; cursor: pointer; background: #9333ea; color: white; border: none; border-radius: 5px;">🖨️ ${t('common.print_now')}</button>
        </div>
        <h1>${t('categories.print_header')}</h1>
        <div class="meta">
          <strong>MyFirstCocktail</strong> • ${t('ingredients.report_meta', { date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString(), total: categories.length })}
        </div>
        
        <div class="list-container">
          ${sortedCategories.map(cat => `
            <div class="category-item">• ${cat.name}</div>
          `).join('')}
        </div>
        <div class="footer">${t('ingredients.report_footer')}</div>
      </body>
      </html>
    `;
    
    reportWindow.document.write(htmlContent);
    reportWindow.document.close();
  };

  return (
    <div className="animate-fadeIn w-full">
      {/* Header interno do componente */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
           <Tag size={20} className="text-brand-500" />
           {t('categories.manage_title')}
         </h3>
         
         <div className="flex items-center gap-3">
           <button 
             type="button"
             onClick={handlePrintCategories}
             className="flex items-center gap-2 px-3 py-1.5 bg-white text-slate-600 border border-brand-200 rounded-lg hover:bg-brand-50 hover:text-brand-700 transition-colors text-sm font-medium shadow-sm"
           >
             <Printer size={16} />
             {t('categories.print_btn')}
           </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Adicionar Nova */}
        <div className="bg-white p-5 rounded-xl border border-brand-100 shadow-sm md:sticky md:top-24">
          <h4 className="text-sm font-semibold text-slate-600 mb-3">{t('categories.new_title')}</h4>
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder={t('categories.placeholder')}
              className="flex-1 bg-slate-50 border border-brand-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            />
            <button 
              type="submit"
              disabled={!newCategoryName.trim()}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white p-2 rounded-lg transition-colors flex-shrink-0"
            >
              <Plus size={20} />
            </button>
          </form>
          <p className="text-xs text-slate-400 mt-2">
            {t('categories.tip')}
          </p>
        </div>

        {/* Lista */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm min-h-[200px]">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium border-b border-slate-100">
              <tr>
                <th className="px-5 py-3 w-full">{t('categories.table_name')}</th>
                <th className="px-5 py-3 text-right min-w-[100px]">{t('categories.table_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.length === 0 ? (
                 <tr>
                  <td colSpan={2} className="px-5 py-12 text-center text-slate-400 text-sm">
                    <Tag size={32} className="mx-auto mb-2 opacity-20" />
                    {t('categories.empty_msg')}
                  </td>
                </tr>
              ) : (
                categories.map(cat => (
                  <tr key={cat.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 align-middle">
                      {editingId === cat.id ? (
                        <input 
                          type="text" 
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-white border border-brand-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="text-slate-700 font-medium text-sm block">{cat.name}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right align-middle">
                      {editingId === cat.id ? (
                        <div className="flex items-center justify-end gap-1 relative z-10">
                          <button 
                            type="button" 
                            onClick={(e) => saveEditing(e)} 
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                            title={t('common.save')}
                          >
                            <Save size={18} />
                          </button>
                          <button 
                            type="button" 
                            onClick={(e) => cancelEditing(e)} 
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded"
                            title={t('common.cancel')}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1 relative z-10">
                          <button 
                            type="button" 
                            onClick={(e) => startEditing(cat, e)} 
                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors"
                            title={t('common.edit')}
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            type="button" 
                            onClick={(e) => handleDelete(cat.id, e)} 
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title={t('common.delete')}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
