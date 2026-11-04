import React, { useEffect, useState } from 'react';
import { X, Loader2, Download } from 'lucide-react';
import { DrinkRecipe } from '../types.ts';
import {
  CARD_MODELS,
  CardModel,
  renderRecipeCardPreviews,
  generateRecipeCard,
} from '../services/generateRecipeCard.ts';

interface Props {
  recipe: DrinkRecipe;
  onClose: () => void;
}

// Seletor de modelo do card: mostra as três miniaturas lado a lado e baixa a
// escolhida em resolução de publicação. As miniaturas são geradas na abertura,
// uma por vez, pelo mesmo código que produz o arquivo final — então o que se
// vê aqui é exatamente o que será baixado.
export const CardModelPicker: React.FC<Props> = ({ recipe, onClose }) => {
  const [previews, setPreviews] = useState<Record<CardModel, string> | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [baixando, setBaixando] = useState<CardModel | null>(null);

  useEffect(() => {
    let vivo = true;
    let gerados: Record<CardModel, string> | null = null;

    renderRecipeCardPreviews(recipe)
      .then((res) => {
        gerados = res;
        if (vivo) setPreviews(res);
        // componente já desmontado: libera na hora, ninguém vai usar
        else Object.values(res).forEach((url) => URL.revokeObjectURL(url));
      })
      .catch((err) => {
        console.error('Erro ao gerar as prévias do card:', err);
        if (vivo) setErro('Não foi possível gerar as prévias.');
      });

    return () => {
      vivo = false;
      if (gerados) Object.values(gerados).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [recipe]);

  const baixar = async (model: CardModel) => {
    if (baixando) return;
    setBaixando(model);
    try {
      await generateRecipeCard(recipe, model);
      onClose();
    } catch (err) {
      console.error('Erro ao gerar o card:', err);
      alert('Ocorreu um erro ao gerar o card da receita.');
    } finally {
      setBaixando(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-stone-900">Escolha o modelo do card</h2>
            <p className="text-sm text-stone-500">
              {recipe.title} &middot; 1080&times;1350, pronto para o feed do Instagram
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
            aria-label="Fechar"
          >
            <X size={22} />
          </button>
        </div>

        {erro && (
          <div className="rounded-xl bg-red-50 p-6 text-center text-sm text-red-700">{erro}</div>
        )}

        {!erro && !previews && (
          <div className="flex flex-col items-center gap-3 py-16 text-stone-500">
            <Loader2 className="animate-spin" size={32} />
            <span className="text-sm">Gerando as prévias dos três modelos...</span>
          </div>
        )}

        {previews && (
          <div className="grid gap-5 sm:grid-cols-3">
            {CARD_MODELS.map(({ id, label, hint }) => (
              <div key={id} className="flex flex-col">
                <button
                  onClick={() => baixar(id)}
                  disabled={!!baixando}
                  className="group relative overflow-hidden rounded-xl border-2 border-stone-200 transition hover:border-purple-500 focus:border-purple-500 focus:outline-none disabled:opacity-60"
                >
                  <img src={previews[id]} alt={`Modelo ${label}`} className="block w-full" />
                  <div className="absolute inset-0 flex items-center justify-center bg-purple-900/0 transition group-hover:bg-purple-900/40">
                    {baixando === id ? (
                      <Loader2 className="animate-spin text-white" size={30} />
                    ) : (
                      <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-purple-700 opacity-0 shadow transition group-hover:opacity-100">
                        <Download size={16} /> Baixar
                      </span>
                    )}
                  </div>
                </button>
                <div className="mt-2 px-1">
                  <div className="text-sm font-bold text-stone-800">{label}</div>
                  <div className="text-xs text-stone-500">{hint}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
