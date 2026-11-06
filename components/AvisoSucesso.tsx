import React, { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AvisoSucessoProps {
  titulo: string;
  descricao?: string;
  /** Chamado ao fechar, seja pelo botao ou pelo tempo. */
  onFechar: () => void;
  /** Milissegundos ate fechar sozinho. 0 desliga o fechamento automatico. */
  fecharEm?: number;
}

// Confirmacao de uma acao que deu certo.
//
// Substitui o alert() do navegador, que mostra uma caixa cinza do sistema
// operacional — sem relacao com o visual do site, sem icone, e que some ao
// primeiro clique em qualquer lugar.
//
// Fecha sozinho depois de alguns segundos: a pessoa ja fez o que queria, e o
// aviso confirma em vez de pedir uma decisao. O botao continua ali para quem
// quiser seguir antes.
export const AvisoSucesso: React.FC<AvisoSucessoProps> = ({
  titulo,
  descricao,
  onFechar,
  fecharEm = 4000,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (!fecharEm) return;
    const id = window.setTimeout(onFechar, fecharEm);
    return () => clearTimeout(id);
  }, [fecharEm, onFechar]);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      role="alertdialog"
      aria-labelledby="aviso-sucesso-titulo"
    >
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-brand-100 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={34} className="text-green-600" />
        </div>
        <h2 id="aviso-sucesso-titulo" className="text-xl font-bold text-slate-800 mb-2">
          {titulo}
        </h2>
        {descricao && <p className="text-sm text-slate-600 leading-relaxed">{descricao}</p>}
        <button
          autoFocus
          onClick={onFechar}
          className="mt-6 w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg font-medium transition-all"
        >
          {t('auth.confirm_ok')}
        </button>
      </div>
    </div>
  );
};
