import React, { useState } from 'react';
import { X, KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { trocarSenha } from '../services/authService';
import { AvisoSucesso } from './AvisoSucesso.tsx';

interface TrocarSenhaModalProps {
  onPronto: () => void;
  onClose: () => void;
}

// Troca de senha para quem ja esta logado.
//
// Diferente do NovaSenhaModal, que atende quem chegou pelo link do e-mail sem
// lembrar a senha: aqui a pessoa sabe a senha atual e precisa informa-la. Sem
// essa conferencia, quem sentasse no computador alheio com a sessao aberta
// trocaria a senha e tomaria a conta.
export const TrocarSenhaModal: React.FC<TrocarSenhaModalProps> = ({ onPronto, onClose }) => {
  const { t } = useTranslation();
  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [repetir, setRepetir] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  // Tela de confirmacao, no lugar do alert() do navegador: aquela caixa cinza
  // do sistema nao combina com o resto do site e some ao primeiro clique.
  const [pronto, setPronto] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviando) return;
    setErro(null);

    if (nova !== repetir) {
      setErro(t('auth.new_password_mismatch'));
      return;
    }
    // O Supabase recusa senha igual a anterior, mas avisar aqui evita a ida ao
    // servidor e devolve a mensagem no idioma da pessoa.
    if (nova === atual) {
      setErro(t('auth.change_password_same'));
      return;
    }

    setEnviando(true);
    try {
      await trocarSenha(atual, nova);
      setPronto(true);
    } catch (err: any) {
      setErro(err?.message || t('auth.generic_error'));
    } finally {
      setEnviando(false);
    }
  };

  const campo = (
    rotulo: string,
    valor: string,
    aoMudar: (v: string) => void,
    autoComplete: string,
    foco = false,
  ) => (
    <div>
      <label className="block text-slate-600 text-sm font-medium mb-1">{rotulo}</label>
      <div className="relative">
        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          autoFocus={foco}
          type="password"
          autoComplete={autoComplete}
          value={valor}
          onChange={(e) => aoMudar(e.target.value)}
          className={`w-full bg-slate-50 border ${erro ? 'border-red-500' : 'border-brand-200'} rounded-lg pl-10 pr-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all`}
          placeholder={t('auth.signup_password_placeholder')}
        />
      </div>
    </div>
  );

  if (pronto) {
    return (
      <AvisoSucesso
        titulo={t('auth.change_password_done')}
        descricao={t('auth.change_password_done_hint')}
        onFechar={onPronto}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-brand-100 p-6">
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-brand-500" />
            <h2 className="text-xl font-bold text-slate-800">{t('auth.change_password_title')}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={enviando}
            className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {campo(t('auth.current_password_label'), atual, setAtual, 'current-password', true)}

          <div className="pt-1 border-t border-slate-100" />

          {campo(t('auth.new_password_label'), nova, setNova, 'new-password')}
          {campo(t('auth.new_password_confirm_label'), repetir, setRepetir, 'new-password')}

          {erro && <p className="text-red-500 text-xs ml-1 font-medium">{erro}</p>}

          <button
            type="submit"
            disabled={enviando || !atual || !nova || !repetir}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-500/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {enviando && <Loader2 size={18} className="animate-spin" />}
            {enviando ? t('auth.waiting') : t('auth.change_password_btn')}
          </button>
        </form>
      </div>
    </div>
  );
};
