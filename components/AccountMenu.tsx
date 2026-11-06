import React, { useEffect, useRef, useState } from 'react';
import { LogOut, Lock, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AccountMenuProps {
  /** E-mail de quem esta logado, ou null para visitante sem conta. */
  email: string | null;
  isMaster: boolean;
  onEntrar: () => void;
  onSair: () => void;
}

// Identificacao da conta no cabecalho.
//
// Antes o header so mostrava um icone solto de sair, sem dizer com qual conta
// a pessoa estava logada — e com varias contas no mesmo navegador (a do admin
// e a de teste, por exemplo) nao dava para saber qual sessao estava ativa.
export const AccountMenu: React.FC<AccountMenuProps> = ({ email, isMaster, onEntrar, onSair }) => {
  const { t } = useTranslation();
  const [aberto, setAberto] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora. Sem isso o menu ficaria aberto sobre o conteudo ate
  // alguem acertar o proprio botao de novo.
  useEffect(() => {
    if (!aberto) return;
    const aoClicar = (e: MouseEvent) => {
      if (!container.current?.contains(e.target as Node)) setAberto(false);
    };
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAberto(false);
    };
    document.addEventListener('mousedown', aoClicar);
    document.addEventListener('keydown', aoTeclar);
    return () => {
      document.removeEventListener('mousedown', aoClicar);
      document.removeEventListener('keydown', aoTeclar);
    };
  }, [aberto]);

  if (!email) {
    return (
      <button onClick={onEntrar} title={t('auth.open_login')} className="text-slate-500 hover:text-brand-600 p-2 ml-1 transition-colors">
        <Lock size={20} />
      </button>
    );
  }

  const inicial = email.trim().charAt(0).toUpperCase();

  return (
    <div className="relative ml-1" ref={container}>
      <button
        onClick={() => setAberto(!aberto)}
        title={t('auth.my_account')}
        aria-haspopup="menu"
        aria-expanded={aberto}
        className="w-9 h-9 rounded-full bg-brand-600 text-white font-bold text-sm flex items-center justify-center shadow-sm hover:bg-brand-700 transition-colors"
      >
        {inicial}
      </button>

      {aberto && (
        <div
          role="menu"
          className="absolute top-full right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-fadeIn"
        >
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-xs text-slate-400 font-medium">{t('auth.my_account')}</p>
            {/* break-all: e-mails longos quebram em vez de alargar o menu. */}
            <p className="text-sm text-slate-700 font-semibold break-all">{email}</p>
            {isMaster && (
              <span className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-brand-700 bg-brand-50 border border-brand-100 rounded-full px-2 py-0.5">
                <ShieldCheck size={12} /> {t('auth.admin_badge')}
              </span>
            )}
          </div>
          <button
            role="menuitem"
            onClick={() => { setAberto(false); onSair(); }}
            className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-brand-50 flex items-center gap-3 transition-colors"
          >
            <LogOut size={16} className="text-slate-400" /> {t('auth.logout')}
          </button>
        </div>
      )}
    </div>
  );
};
