
import React from 'react';
import { FlaskConical, Droplets, Clock, Timer, Archive } from 'lucide-react';
import { BasePreparation } from '../types.ts';
import { useTranslation } from 'react-i18next';

interface PreMadeCardProps {
  item: BasePreparation;
  type: 'liquor' | 'syrup';
  onClick: () => void;
}

export const PreMadeCard: React.FC<PreMadeCardProps> = ({ item, type, onClick }) => {
  const { t } = useTranslation();
  const Icon = type === 'liquor' ? FlaskConical : Droplets;
  const colorClass = type === 'liquor' ? 'bg-amber-500' : 'bg-blue-500';

  return (
    <div 
      className="group bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/50 hover:border-brand-300 transition-all duration-300 cursor-pointer flex flex-col h-full shadow-lg hover:shadow-2xl hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="relative aspect-[1/1] w-full overflow-hidden bg-slate-100">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <Icon size={48} />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${colorClass} text-white text-[10px] font-bold rounded-lg shadow-sm uppercase tracking-widest`}>
            <Icon size={12} />
            {type === 'liquor' ? t('premade.liquor_label') : t('premade.syrup_label')}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-brand-700 transition-colors uppercase tracking-tight">{item.title}</h3>
        <p className="text-slate-600 text-sm line-clamp-2 mb-4 font-medium italic">{item.description}</p>
        
        <div className="mt-auto grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
            <Timer size={12} className="text-brand-400" />
            <span>{item.yield_ml}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
            <Archive size={12} className="text-brand-400" />
            <span>{item.validity}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
