
import React from 'react';
// INCLUSÃO: Importando o ícone Share2 para o botão de compartilhar
import { ArrowLeft, Clock, GlassWater, CheckCircle2, Edit3, User, Trash2, Printer, Share2 } from 'lucide-react';
import { DrinkRecipe } from '../types.ts';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';
import { formatAuthorDisplay } from '../services/recipeProcessingService';

interface RecipeDetailProps {
  recipe: DrinkRecipe;
  onBack: () => void;
  onEdit?: (recipe: DrinkRecipe) => void;
  onDelete?: (id: string) => void;
  isMaster?: boolean;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onBack, onEdit, onDelete, isMaster }) => {
  const { t } = useTranslation();
  if (!recipe) return null;

  const authorDisplay = formatAuthorDisplay(recipe.author) || 'Internet';

  const handleDelete = () => {
    if (window.confirm(t('recipe.delete_confirm', { title: recipe.title }))) {
      onDelete?.(recipe.id);
    }
  };

  // INCLUSÃO: Função para lidar com o compartilhamento da receita como imagem
  const handleShare = async () => {
    try {
      // Cria um container temporário invisível para renderizar a receita
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '800px';
      container.style.backgroundColor = '#ffffff';
      container.style.padding = '40px';
      container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      container.style.color = '#1c1917';
      
      const ingredientsHtml = recipe.ingredients.map(ing => `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #faf5ff; font-size: 14px;">
          <span style="font-weight: 600;">${ing.name}</span>
          <span style="color: #9333ea; font-weight: 700;">${ing.measure}</span>
        </div>
      `).join('');

      const stepsHtml = recipe.instructions.map((step, idx) => `
        <div style="display: flex; gap: 15px; margin-bottom: 20px;">
          <div style="background: #f3e8ff; color: #7e22ce; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; flex-shrink: 0;">${idx + 1}</div>
          <div style="font-size: 15px; padding-top: 3px;">${step}</div>
        </div>
      `).join('');

      container.innerHTML = `
        <div style="text-align: center; border-bottom: 2px solid #f3e8ff; padding-bottom: 30px; margin-bottom: 40px;">
          <h1 style="font-size: 36px; margin: 0 0 10px 0; color: #7e22ce;">${recipe.title}</h1>
          <div style="font-size: 14px; color: #78716c; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">
            ${t(`recipe.categories.${recipe.category}`)} • ${t(`recipe.methods.${recipe.method}`)} • ${t('common.by')} ${authorDisplay}
          </div>
        </div>
        ${recipe.description ? `<div style="font-style: italic; color: #444; margin-bottom: 30px; font-size: 16px;">${recipe.description}</div>` : ''}
        <div style="display: flex; gap: 40px;">
          <div style="flex: 1;">
            <div style="font-size: 18px; font-weight: 800; color: #9333ea; border-bottom: 1px solid #f3e8ff; padding-bottom: 8px; margin-bottom: 20px; text-transform: uppercase;">
              ${t('common.ingredients')}
            </div>
            ${ingredientsHtml}
            ${recipe.garnish ? `
              <div style="background: #faf5ff; padding: 15px; border-radius: 10px; border: 1px solid #e9d5ff; margin-top: 20px;">
                <div style="font-size: 12px; font-weight: 800; color: #a855f7; text-transform: uppercase;">${t('common.garnish')}</div>
                <div style="font-size: 14px;">${recipe.garnish}</div>
              </div>
            ` : ''}
          </div>
          <div style="flex: 1.5;">
            <div style="font-size: 18px; font-weight: 800; color: #9333ea; border-bottom: 1px solid #f3e8ff; padding-bottom: 8px; margin-bottom: 20px; text-transform: uppercase;">
              ${t('common.instructions')}
            </div>
            ${stepsHtml}
          </div>
        </div>
        <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #a8a29e; border-top: 1px solid #f5f5f4; padding-top: 20px;">
          ${window.location.href}
        </div>
      `;

      document.body.appendChild(container);

      // Gera a imagem com html2canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });

      document.body.removeChild(container);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert('Erro ao gerar imagem.');
          return;
        }
        
        const file = new File([blob], `${recipe.title.replace(/\s+/g, '_')}.png`, { type: 'image/png' });
        
        // Verifica se o navegador suporta compartilhamento de arquivos
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: recipe.title,
            text: `Confira a receita: ${recipe.title}\n\nLink: ${window.location.href}`,
            files: [file]
          });
        } else {
          // Fallback: faz o download da imagem se não puder compartilhar diretamente
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${recipe.title}.png`;
          a.click();
          URL.revokeObjectURL(url);
          alert('Imagem baixada! Você pode compartilhá-la manualmente.');
        }
      }, 'image/png');

    } catch (err) {
      console.error('Erro ao compartilhar imagem:', err);
      alert('Ocorreu um erro ao tentar compartilhar a imagem.');
    }
  };
  // FIM DA INCLUSÃO

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert(t('common.error_popup'));
      return;
    }

    const ingredientsHtml = recipe.ingredients.map(ing => `
      <div class="ingredient-item">
        <span class="ing-name">${ing.name}</span>
        <span class="ing-measure">${ing.measure}</span>
      </div>
    `).join('');

    const stepsHtml = recipe.instructions.map((step, idx) => `
      <div class="step">
        <div class="step-num">${idx + 1}</div>
        <div class="step-text">${step}</div>
      </div>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${t('recipe.print_title')} - ${recipe.title}</title>
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
          .title { font-family: 'Fraunces', serif; font-size: 36px; margin: 0 0 10px 0; color: #7e22ce; }
          .meta { font-size: 14px; color: #78716c; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; }
          .description { font-style: italic; color: #444; margin-bottom: 30px; font-size: 16px; }
          
          .main-content { display: grid; grid-template-columns: 1fr 1.5fr; gap: 40px; }
          
          .section-title { 
            font-size: 18px; 
            font-weight: 800; 
            color: #9333ea; 
            border-bottom: 1px solid #f3e8ff; 
            padding-bottom: 8px; 
            margin-bottom: 20px; 
            text-transform: uppercase;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .ingredient-item { 
            display: flex; 
            justify-content: space-between; 
            padding: 8px 0; 
            border-bottom: 1px solid #faf5ff;
            font-size: 14px;
          }
          .ing-name { font-weight: 600; }
          .ing-measure { color: #9333ea; font-weight: 700; }

          .step { display: flex; gap: 15px; margin-bottom: 20px; }
          .step-num { 
            background: #f3e8ff; 
            color: #7e22ce; 
            width: 28px; 
            height: 28px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-weight: 800; 
            font-size: 14px;
            flex-shrink: 0;
          }
          .step-text { font-size: 15px; padding-top: 3px; }
          
          .garnish-box { background: #faf5ff; padding: 15px; border-radius: 10px; border: 1px solid #e9d5ff; margin-top: 20px; }
          .garnish-label { font-size: 12px; font-weight: 800; color: #a855f7; text-transform: uppercase; }
          
          .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #a8a29e; border-top: 1px solid #f5f5f4; padding-top: 20px; }
          
          @media print {
            .no-print { display: none; }
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="position: fixed; top: 20px; right: 20px;">
          <button onclick="window.print()" style="background: #9333ea; color: white; border: none; padding: 12px 24px; border-radius: 10px; cursor: pointer; font-weight: bold; font-family: sans-serif; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">🖨️ ${t('common.print_now')}</button>
        </div>

        <div class="header">
          <h1 class="title">${recipe.title}</h1>
          <div class="meta">${t(`recipe.categories.${recipe.category}`)} • ${t(`recipe.methods.${recipe.method}`)} • ${t('common.by')} ${authorDisplay}</div>
        </div>

        <div class="description">${recipe.description}</div>

        <div class="main-content">
          <div>
            <div class="section-title">${t('common.ingredients')}</div>
            <div class="ingredients-list">
              ${ingredientsHtml}
            </div>
            ${recipe.garnish ? `
              <div class="garnish-box">
                <div class="garnish-label">${t('common.garnish')}</div>
                <div style="font-size: 14px;">${recipe.garnish}</div>
              </div>
            ` : ''}
          </div>
          
          <div>
            <div class="section-title">${t('common.instructions')}</div>
            <div class="steps-list">
              ${stepsHtml}
            </div>
          </div>
        </div>

        <div class="footer">
          ${t('recipe.print_footer')}
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-xl shadow-brand-100/50 border border-brand-100 animate-fadeIn">
      <div className="relative h-96 w-full">
        <img 
          src={recipe.imageUrl || 'https://images.unsplash.com/photo-1514362545857-3bc16549766b?q=80&w=800'} 
          alt={recipe.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
        
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start">
          <div className="flex gap-2">
            <button 
              onClick={onBack}
              className="p-3 bg-white hover:bg-accent-50 rounded-full text-accent-600 transition-all border border-white/20 shadow-xl transform active:scale-95"
              title={t('common.back')}
            >
              <ArrowLeft size={24} />
            </button>
            <button 
              onClick={handlePrint}
              className="p-3 bg-white hover:bg-accent-50 rounded-full text-accent-600 transition-all border border-white/20 shadow-xl transform active:scale-95"
              title={t('recipe.print_title')}
            >
              <Printer size={24} />
            </button>
            {/* INCLUSÃO: Botão de compartilhar na interface */}
            <button 
              onClick={handleShare}
              className="p-3 bg-white hover:bg-accent-50 rounded-full text-accent-600 transition-all border border-white/20 shadow-xl transform active:scale-95"
              title="Compartilhar"
            >
              <Share2 size={24} />
            </button>
            {/* FIM DA INCLUSÃO */}
          </div>
          {isMaster && (
            <div className="flex gap-2">
              {onEdit && (
                <button 
                  onClick={() => onEdit(recipe)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-600/90 backdrop-blur-md text-white rounded-full hover:bg-brand-700 transition-all border border-brand-400/30 shadow-lg font-bold"
                  title={t('common.edit')}
                >
                 <Edit3 size={20} />
                </button>
              )}
              {onDelete && (
                <button 
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600/90 backdrop-blur-md text-white rounded-full hover:bg-red-700 transition-all border border-red-400/30 shadow-lg font-bold"
                  title={t('common.delete')}
                >
                <Trash2 size={20} />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex gap-2 mb-3">
             <span className="px-3 py-1 text-sm font-semibold bg-brand-500 text-white rounded-full">
              {t(`recipe.categories.${recipe.category}`)}
            </span>
             <span className="px-3 py-1 text-sm font-semibold bg-brand-500 backdrop-blur text-white rounded-full border border-white/30">
              {t(`recipe.methods.${recipe.method}`)}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 text-sm font-semibold bg-brand-500 backdrop-blur text-white rounded-full border border-white/10">
              <User size={12} />
              {authorDisplay}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 shadow-sm drop-shadow-md">{recipe.title}</h1>
          <p className="text-slate-100 text-lg max-w-2xl leading-relaxed drop-shadow-sm">{recipe.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:divide-x divide-slate-100">
        <div className="p-8 bg-brand-50/30">
          <h3 className="text-xl font-bold text-brand-900 mb-6 flex items-center gap-2">
            <GlassWater className="text-brand-500" />
            {t('common.ingredients')}
          </h3>
          <ul className="space-y-4">
            {Array.isArray(recipe.ingredients) && recipe.ingredients.map((ing, idx) => (
              <li key={idx} className="flex items-center justify-between pb-3 border-b border-brand-100 last:border-0">
                <span className="text-slate-700 font-medium">{ing.name}</span>
                <span className="text-brand-600 font-mono text-sm font-bold">{ing.measure}</span>
              </li>
            ))}
          </ul>
          {recipe.garnish && (
            <div className="mt-8 p-4 bg-white rounded-lg border border-brand-100 shadow-sm">
               <h4 className="text-sm font-semibold text-brand-400 mb-1">{t('common.garnish')}</h4>
               <p className="text-slate-700">{recipe.garnish}</p>
            </div>
          )}
        </div>

        <div className="col-span-1 md:col-span-2 p-8 bg-white">
          <h3 className="text-xl font-bold text-brand-900 mb-6 flex items-center gap-2">
            <Clock className="text-brand-500" />
            {t('common.instructions')}
          </h3>
          <div className="space-y-6">
            {Array.isArray(recipe.instructions) && recipe.instructions.map((step, idx) => (
              <div key={idx} className="flex gap-4 group">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold border border-brand-100 group-hover:bg-brand-100 transition-colors">
                  {idx + 1}
                </div>
                <p className="text-slate-600 leading-relaxed pt-1 font-medium">
                  {step}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex items-center gap-3 text-brand-800 bg-brand-50 p-4 rounded-xl border border-brand-100 max-w-md">
            <CheckCircle2 size={24} className="text-brand-500" />
            <span className="font-medium">{t('recipe.detail_ready')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
