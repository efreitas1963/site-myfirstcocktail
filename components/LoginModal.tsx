import React, { useState } from 'react';
import { X, Lock, KeyRound, Mail, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { entrar } from '../services/authService';

interface LoginModalProps {
  onLogin: (success: boolean) => void;
  onClose: () => void;
}

// Login do modo administrador.
//
// Antes a senha estava escrita em texto puro aqui no componente, o que a
// expunha no bundle que todo visitante baixa — e ela nao protegia o banco,
// apenas ocultava botoes. Agora a verificacao acontece no Supabase Auth e a
// sessao resultante e o que as policies de RLS usam para liberar escrita.
export const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onClose }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviando) return;
    setErro(null);
    setEnviando(true);
    try {
      await entrar(email, password);
      onLogin(true);
      onClose();
    } catch (err: any) {
      setErro(err?.message || 'Nao foi possivel entrar.');
    } finally {
      setEnviando(false);
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
            <label className="block text-slate-600 text-sm font-medium mb-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                autoFocus
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-slate-50 border ${erro ? 'border-red-500' : 'border-brand-200'} rounded-lg pl-10 pr-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all`}
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1">{t('auth.password_label')}</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-slate-50 border ${erro ? 'border-red-500' : 'border-brand-200'} rounded-lg pl-10 pr-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all`}
                placeholder={t('auth.password_placeholder')}
              />
            </div>
            {erro && <p className="text-red-500 text-xs mt-2 ml-1 font-medium">{erro}</p>}
          </div>

          <button
            type="submit"
            disabled={enviando || !email || !password}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-500/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {enviando && <Loader2 size={18} className="animate-spin" />}
            {enviando ? 'Entrando...' : t('auth.login_btn')}
          </button>
        </form>
      </div>
    </div>
  );
};
