
import React from 'react';
import { ArrowLeft, FlaskConical, Droplets, CheckCircle2, Clock, Archive, Ruler, ShieldCheck, Edit3, Trash2, Printer } from 'lucide-react';
import { BasePreparation } from '../types.ts';
import { useTranslation } from 'react-i18next';

interface PreMadeDetailProps {
  item: BasePreparation;
  type: 'liquor' | 'syrup';
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isMaster?: boolean;
}

export const PreMadeDetail: React.FC<PreMadeDetailProps> = ({ item, type, onBack, onEdit, onDelete, isMaster }) => {
  const { t } = useTranslation();
  const Icon = type === 'liquor' ? FlaskConical : Droplets;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert(t('common.error_popup'));
      return;
    }

    const ingredientsHtml = item.ingredients.map(ing => `
      <div class="ingredient-item">
        <div class="ing-info">
          <span class="ing-name">${ing.name}</span>
          ${ing.note ? `<span class="ing-note">${ing.note}</span>` : ''}
        </div>
        <span class="ing-measure">${ing.amount} ${ing.unit}</span>
      </div>
    `).join('');

    const stepsHtml = item.instructions.map((step, idx) => `
      <div class="step">
        <div class="step-num">${idx + 1}</div>
        <div class="step-text">${step}</div>
      </div>
    `).join('');

    const typeLabel = type === 'liquor' ? t('premade.liquor_label') : t('premade.syrup_label');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${t('common.print')} - ${item.title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700&family=Inter:wght@400;600;700&display=swap');
          body { 
            font-family: 'Inter', sans-serif; 
            color: #1c1917; 
            line-height: 1.6; 
            padding: 40px; 
            max-width: 800px; 
            margin: 0 auto; 
          }
          .header { text-align: center; border-bottom: 2px solid #f3e8ff; padding-bottom: 30px; margin-bottom: 40px; }
          .title { font-family: 'Fraunces', serif; font-size: 32px; margin: 0 0 10px 0; color: #7e22ce; text-transform: uppercase; }
          .meta { font-size: 12px; color: #9333ea; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; }
          .description { font-style: italic; color: #57534e; margin-bottom: 30px; font-size: 16px; text-align: center; }
          
          .info-bar { 
            display: grid; 
            grid-template-columns: repeat(3, 1fr); 
            gap: 20px; 
            background: #faf5ff; 
            padding: 20px; 
            border-radius: 15px; 
            margin-bottom: 40px;
            border: 1px solid #e9d5ff;
          }
          .info-item { text-align: center; }
          .info-label { font-size: 10px; font-weight: 800; color: #a855f7; text-transform: uppercase; margin-bottom: 4px; }
          .info-val { font-weight: 700; color: #444; }

          .main-content { display: grid; grid-template-columns: 1fr 1.5fr; gap: 40px; }
          
          .section-title { 
            font-size: 16px; 
            font-weight: 800; 
            color: #9333ea; 
            border-bottom: 2px solid #f3e8ff; 
            padding-bottom: 8px; 
            margin-bottom: 20px; 
            text-transform: uppercase;
          }

          .ingredient-item { 
            display: flex; 
            justify-content: space-between; 
            padding: 10px 0; 
            border-bottom: 1px solid #faf5ff;
            font-size: 14px;
          }
          .ing-name { font-weight: 700; display: block; }
          .ing-note { font-size: 11px; color: #78716c; font-style: italic; }
          .ing-measure { color: #9333ea; font-weight: 800; font-family: monospace; }

          .step { display: flex; gap: 15px; margin-bottom: 20px; }
          .step-num { 
            background: #9333ea; 
            color: white; 
            width: 26px; 
            height: 26px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-weight: 800; 
            font-size: 13px;
            flex-shrink: 0;
          }
          .step-text { font-size: 14px; padding-top: 2px; color: #444; }
          
          .footer { margin-top: 60px; text-align: center; font-size: 11px; color: #a8a29e; border-top: 1px solid #f5f5f4; padding-top: 20px; }
          
          @media print {
            .no-print { display: none; }
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="position: fixed; top: 20px; right: 20px;">
          <button onclick="window.print()" style="background: #9333ea; color: white; border: none; padding: 12px 24px; border-radius: 10px; cursor: pointer; font-weight: bold; font-family: sans-serif;">🖨️ ${t('common.print_now')}</button>
        </div>

        <div class="header">
          <div class="meta">${typeLabel}</div>
          <h1 class="title">${item.title}</h1>
        </div>

        <div class="description">${item.description}</div>

        <div class="info-bar">
          <div class="info-item">
            <div class="info-label">${t('common.yield')}</div>
            <div class="info-val">${item.yield_ml}</div>
          </div>
          <div class="info-item">
            <div class="info-label">${t('common.storage')}</div>
            <div class="info-val">${item.storage}</div>
          </div>
          <div class="info-item">
            <div class="info-label">${t('common.validity')}</div>
            <div class="info-val">${item.validity}</div>
          </div>
        </div>

        <div class="main-content">
          <div>
            <div class="section-title">${t('common.ingredients')}</div>
            <div class="ingredients-list">
              ${ingredientsHtml}
            </div>
          </div>
          
          <div>
            <div class="section-title">${t('common.instructions')}</div>
            <div class="steps-list">
              ${stepsHtml}
            </div>
          </div>
        </div>

        <div class="footer">
          ${t('premade.print_footer')}
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-brand-100 animate-fadeIn">
      {/* Hero */}
      <div className="relative h-80 w-full">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-200"><Icon size={120} /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
        
        <div className="absolute top-6 left-6 flex gap-2">
          <button onClick={onBack} className="p-3 bg-white hover:bg-slate-50 rounded-full text-brand-600 transition-all shadow-xl" title={t('common.back')}><ArrowLeft size={24} /></button>
          <button onClick={handlePrint} className="p-3 bg-white hover:bg-slate-50 rounded-full text-brand-600 transition-all shadow-xl" title={t('common.print')}><Printer size={24} /></button>
        </div>

        {isMaster && (
          <div className="absolute top-6 right-6 flex gap-2">
            <button 
              onClick={onEdit} 
              className="p-3 bg-brand-600/90 backdrop-blur-md text-white rounded-full hover:bg-brand-700 transition-all border border-brand-400/30 shadow-xl" 
              title={t('common.edit')}
            >
              <Edit3 size={20} />
            </button>
            <button 
              onClick={onDelete} 
              className="p-3 bg-red-600/90 backdrop-blur-md text-white rounded-full hover:bg-red-700 transition-all border border-red-400/30 shadow-xl" 
              title={t('common.delete')}
            >
              <Trash2 size={20} />
            </button>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className={`inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full text-xs font-bold uppercase tracking-widest bg-brand-500 text-white`}>
            <Icon size={14} /> {type === 'liquor' ? t('premade.liquor_label') : t('premade.syrup_label')}
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2 shadow-sm uppercase">{item.title}</h1>
          <p className="text-slate-100 text-lg italic max-w-2xl">{item.description}</p>
        </div>
      </div>

      {/* Info Bar */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
        <div className="p-6 text-center">
          <div className="flex justify-center mb-1 text-brand-500"><Ruler size={20} /></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase">{t('common.yield')}</p>
          <p className="font-bold text-slate-700">{item.yield_ml}</p>
        </div>
        <div className="p-6 text-center">
          <div className="flex justify-center mb-1 text-brand-500"><Archive size={20} /></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase">{t('common.storage')}</p>
          <p className="font-bold text-slate-700">{item.storage}</p>
        </div>
        <div className="p-6 text-center">
          <div className="flex justify-center mb-1 text-brand-500"><ShieldCheck size={20} /></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase">{t('common.validity')}</p>
          <p className="font-bold text-slate-700">{item.validity}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x divide-slate-100">
        <div className="p-8 bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-tight">{t('common.ingredients')}</h3>
          <ul className="space-y-4">
            {item.ingredients.map((ing, idx) => (
              <li key={idx} className="flex items-start justify-between pb-3 border-b border-slate-200/50 last:border-0">
                <div className="flex flex-col">
                  <span className="text-slate-700 font-bold">{ing.name}</span>
                  {ing.note && <span className="text-[10px] text-slate-400 italic font-medium">{ing.note}</span>}
                </div>
                <span className="text-brand-600 font-mono text-sm font-bold bg-white px-2 py-0.5 rounded border border-brand-100">{ing.amount} {ing.unit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-1 md:col-span-2 p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-tight">{t('common.instructions')}</h3>
          <div className="space-y-6">
            {item.instructions.map((step, idx) => (
              <div key={idx} className="flex gap-4 group">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold border border-brand-100 group-hover:bg-brand-600 group-hover:text-white transition-all">
                  {idx + 1}
                </div>
                <p className="text-slate-600 leading-relaxed pt-1 font-medium">{step}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-4 text-green-800 font-medium">
            <CheckCircle2 className="text-green-500 flex-shrink-0" />
            <span>{t('premade.ready_msg')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
