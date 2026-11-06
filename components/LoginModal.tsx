import React, { useState } from 'react';
import { X, Lock, KeyRound, Mail, Loader2, MailCheck, ArrowLeft } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
import { entrar, cadastrar, pedirRedefinicaoSenha } from '../services/authService';

interface LoginModalProps {
  onLogin: (success: boolean) => void;
  onClose: () => void;
  /** Mensagem de contexto, ex.: ao clicar no coracao sem estar logado. */
  motivo?: string;
}

// Telas do modal. Separar em um estado so (em vez de varios booleanos) evita
// combinacoes impossiveis, como "confirme seu e-mail" e "esqueci a senha"
// aparecendo ao mesmo tempo.
type Tela = 'entrar' | 'criar' | 'esqueci' | 'confirme' | 'link_enviado';

// Entrada de conta do site.
//
// Serve tanto ao administrador quanto aos visitantes que criam conta para
// guardar favoritos — e o mesmo Supabase Auth nos dois casos. Quem manda nas
// permissoes e o e-mail: as policies de RLS liberam escrita de conteudo so
// para o endereco do admin (ver scripts/sql/restringir_escrita_ao_admin.sql).
//
// Antes a senha do admin estava escrita em texto puro neste componente, o que
// a expunha no bundle que todo visitante baixa.
export const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onClose, motivo }) => {
  const { t } = useTranslation();
  const [tela, setTela] = useState<Tela>('entrar');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const irPara = (nova: Tela) => {
    setTela(nova);
    setErro(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviando) return;
    setErro(null);
    setEnviando(true);
    try {
      if (tela === 'esqueci') {
        await pedirRedefinicaoSenha(email);
        setTela('link_enviado');
        return;
      }
      if (tela === 'criar') {
        const precisaConfirmar = await cadastrar(email, password);
        if (precisaConfirmar) {
          setTela('confirme');
          return;
        }
        // conta ja ativa (confirmacao desligada no painel): entra direto
      }
      await entrar(email, password);
      onLogin(true);
      onClose();
    } catch (err: any) {
      setErro(err?.message || t('auth.generic_error'));
    } finally {
      setEnviando(false);
    }
  };

  // Moldura comum das telas de aviso (sem formulario).
  const Aviso: React.FC<{
    icone: React.ReactNode;
    titulo: string;
    children: React.ReactNode;
    rodape: React.ReactNode;
  }> = ({ icone, titulo, children, rodape }) => (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-brand-100 p-6 text-center">
        {icone}
        <h2 className="text-xl font-bold text-slate-800 mb-2">{titulo}</h2>
        <div className="text-sm text-slate-600 leading-relaxed">{children}</div>
        {rodape}
      </div>
    </div>
  );

  // Pos-cadastro: a conta existe, mas falta clicar no link do e-mail.
  if (tela === 'confirme') {
    return (
      <Aviso
        icone={<MailCheck size={44} className="text-brand-500 mx-auto mb-3" />}
        titulo={t('auth.confirm_title')}
        rodape={
          <button
            onClick={onClose}
            className="mt-5 w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg font-medium transition-all"
          >
            {t('auth.confirm_ok')}
          </button>
        }
      >
        <p>
          {/* O <1> do texto traduzido vira o <strong>, para o e-mail sair em
              destaque sem precisar quebrar a frase em pedacos por idioma. */}
          <Trans
            i18nKey="auth.confirm_body"
            values={{ email }}
            components={{ 1: <strong className="text-slate-800" /> }}
          />
        </p>
        <p className="text-xs text-slate-400 mt-3">{t('auth.confirm_spam')}</p>
      </Aviso>
    );
  }

  // Pos-pedido de recuperacao. A mensagem e a mesma exista ou nao a conta —
  // confirmar quais e-mails estao cadastrados entregaria dados dos usuarios.
  if (tela === 'link_enviado') {
    return (
      <Aviso
        icone={<MailCheck size={44} className="text-brand-500 mx-auto mb-3" />}
        titulo={t('auth.forgot_sent_title')}
        rodape={
          <button
            onClick={() => irPara('entrar')}
            className="mt-5 w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg font-medium transition-all"
          >
            {t('auth.back_to_login')}
          </button>
        }
      >
        <p>
          <Trans
            i18nKey="auth.forgot_sent_body"
            values={{ email }}
            components={{ 1: <strong className="text-slate-800" /> }}
          />
        </p>
        <p className="text-xs text-slate-400 mt-3">{t('auth.confirm_spam')}</p>
      </Aviso>
    );
  }

  const ehEsqueci = tela === 'esqueci';
  const titulo = ehEsqueci
    ? t('auth.forgot_title')
    : tela === 'entrar'
      ? t('auth.tab_login')
      : t('auth.tab_signup');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-brand-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {ehEsqueci ? (
              <button
                onClick={() => irPara('entrar')}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                title={t('auth.back_to_login')}
              >
                <ArrowLeft size={20} />
              </button>
            ) : (
              <Lock size={20} className="text-brand-500" />
            )}
            {titulo}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {motivo && !ehEsqueci && (
          <p className="text-sm text-slate-600 bg-brand-50 border border-brand-100 rounded-lg px-3 py-2 mb-4">
            {motivo}
          </p>
        )}

        {ehEsqueci ? (
          <p className="text-sm text-slate-600 leading-relaxed mb-5">{t('auth.forgot_body')}</p>
        ) : (
          <div className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-5">
            {(['entrar', 'criar'] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => irPara(a)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  tela === a ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {a === 'entrar' ? t('auth.tab_login') : t('auth.tab_signup')}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1">{t('auth.email_label')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                autoFocus
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-slate-50 border ${erro ? 'border-red-500' : 'border-brand-200'} rounded-lg pl-10 pr-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all`}
                placeholder={t('auth.email_placeholder')}
              />
            </div>
            {ehEsqueci && erro && <p className="text-red-500 text-xs mt-2 ml-1 font-medium">{erro}</p>}
          </div>

          {/* A recuperacao pede so o e-mail: a senha e justamente o que falta. */}
          {!ehEsqueci && (
            <div>
              <label className="block text-slate-600 text-sm font-medium mb-1">{t('auth.password_label')}</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  autoComplete={tela === 'criar' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-slate-50 border ${erro ? 'border-red-500' : 'border-brand-200'} rounded-lg pl-10 pr-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all`}
                  placeholder={
                    tela === 'criar' ? t('auth.signup_password_placeholder') : t('auth.password_placeholder')
                  }
                />
              </div>
              {erro && <p className="text-red-500 text-xs mt-2 ml-1 font-medium">{erro}</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={enviando || !email || (!ehEsqueci && !password)}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-500/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {enviando && <Loader2 size={18} className="animate-spin" />}
            {enviando
              ? t('auth.waiting')
              : ehEsqueci
                ? t('auth.forgot_btn')
                : tela === 'entrar'
                  ? t('auth.login_btn')
                  : t('auth.signup_btn')}
          </button>
        </form>

        {tela === 'entrar' && (
          <button
            type="button"
            onClick={() => irPara('esqueci')}
            className="w-full text-center text-sm text-brand-600 hover:text-brand-700 hover:underline mt-4 transition-colors"
          >
            {t('auth.forgot_link')}
          </button>
        )}
      </div>
    </div>
  );
};
