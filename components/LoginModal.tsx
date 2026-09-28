
import React, { useState } from 'react';
import { X, Lock, KeyRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LoginModalProps {
  onLogin: (success: boolean) => void;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onClose }) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // A senha permanece a mesma internamente para validação
    if (password === 'edson') {
      onLogin(true);
      onClose();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-brand-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Lock size={20} className="text-brand-500" />
            {t('auth.master_area')}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1">{t('auth.password_label')}</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                autoFocus
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-slate-50 border ${error ? 'border-red-500' : 'border-brand-200'} rounded-lg pl-10 pr-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all`}
                placeholder={t('auth.password_placeholder')}
              />
            </div>
            {error && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{t('auth.error_msg')}</p>}
          </div>

          <button 
            type="submit" 
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-500/20"
          >
            {t('auth.login_btn')}
          </button>
        </form>
      </div>
    </div>
  );
};
