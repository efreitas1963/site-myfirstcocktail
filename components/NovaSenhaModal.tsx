import React, { useState } from 'react';
import { KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { definirNovaSenha } from '../services/authService';

interface NovaSenhaModalProps {
  /** Chamado depois que a senha foi trocada com sucesso. */
  onPronto: () => void;
}

// Tela de "criar nova senha", mostrada quando a pessoa volta ao site pelo link
// do e-mail de recuperacao.
//
// Nao tem botao de fechar de proposito: nesse momento o Supabase ja abriu uma
// sessao temporaria a partir do token do link. Se a pessoa saisse daqui sem
// trocar a senha, ficaria logada sem nunca resolver o que a trouxe ate aqui —
// e o link, que e de uso unico, estaria gasto.
export const NovaSenhaModal: React.FC<NovaSenhaModalProps> = ({ onPronto }) => {
  const { t } = useTranslation();
  const [senha, setSenha] = useState('');
  const [repetir, setRepetir] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviando) return;
    setErro(null);

    // Conferir as duas aqui evita gravar um erro de digitacao como senha nova:
    // a pessoa so descobriria na proxima vez que tentasse entrar.
    if (senha !== repetir) {
      setErro(t('auth.new_password_mismatch'));
      return;
    }

    setEnviando(true);
    try {
      await definirNovaSenha(senha);
      onPronto();
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
  ) => (
    <div>
      <label className="block text-slate-600 text-sm font-medium mb-1">{rotulo}</label>
      <div className="relative">
        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-brand-100 p-6">
        <div className="text-center mb-5">
          <ShieldCheck size={44} className="text-brand-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">{t('auth.new_password_title')}</h2>
          <p className="text-sm text-slate-600 leading-relaxed">{t('auth.new_password_body')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {campo(t('auth.new_password_label'), senha, setSenha, 'new-password')}
          {campo(t('auth.new_password_confirm_label'), repetir, setRepetir, 'new-password')}

          {erro && <p className="text-red-500 text-xs ml-1 font-medium">{erro}</p>}

          <button
            type="submit"
            disabled={enviando || !senha || !repetir}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-500/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {enviando && <Loader2 size={18} className="animate-spin" />}
            {enviando ? t('auth.waiting') : t('auth.new_password_btn')}
          </button>
        </form>
      </div>
    </div>
  );
};
