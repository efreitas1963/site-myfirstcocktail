import React, { useState } from 'react';
import { X, Loader2, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  scrapeRecipeWebsite,
  searchRecipes,
  parseScrapedRecipe,
  isFirecrawlConfigured,
} from '../services/firecrawlService';
import { DrinkRecipe } from '../types';

interface WebScraperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecipeScraped: (recipe: Partial<DrinkRecipe>) => void;
}

type TabType = 'search' | 'url';

export function WebScraperModal({ isOpen, onClose, onRecipeScraped }: WebScraperModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [status, setStatus] = useState('');

  const configured = isFirecrawlConfigured();

  // Debug log
  React.useEffect(() => {
    if (isOpen) {
      console.log('WebScraperModal aberto. Firecrawl configurado:', configured);
    }
  }, [isOpen, configured]);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError('');
    setResults([]);
    setStatus('🔍 Buscando receitas na web...');

    try {
      const searchResults = await searchRecipes(searchQuery, 5);
      if (!searchResults || searchResults.length === 0) {
        setStatus('Nenhuma receita encontrada. Tente outro termo.');
        setResults([]);
      } else {
        setStatus('');
        setResults(searchResults);
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError(`Erro: ${err.message || 'Erro desconhecido ao buscar receitas'}`);
      setStatus('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScrapeUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const content = await scrapeRecipeWebsite(urlInput);
      const recipe = parseScrapedRecipe(content);
      onRecipeScraped(recipe);
      setSuccess('Receita importada com sucesso!');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer scrape da URL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectResult = async (result: any) => {
    setIsLoading(true);
    setError('');

    try {
      const content = await scrapeRecipeWebsite(result.url);
      const recipe = parseScrapedRecipe(content);
      onRecipeScraped(recipe);
      setSuccess('Receita importada com sucesso!');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao importar receita');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            🌐 Importar Receitas da Web
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            <X size={24} />
          </button>
        </div>

        {/* Status */}
        {configured ? (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded flex gap-2 items-center">
            <CheckCircle className="text-green-600 dark:text-green-300 flex-shrink-0" size={20} />
            <span className="text-green-800 dark:text-green-200 font-semibold">✅ Firecrawl conectado e pronto</span>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded flex gap-2">
            <AlertTriangle className="text-yellow-600 dark:text-yellow-300 flex-shrink-0" />
            <div>
              <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                ⚠️ Firecrawl não configurado
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                API key não encontrada no servidor. Contacte o administrador do site.
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
                Ou registre em <a href="https://firecrawl.dev" target="_blank" rel="noopener noreferrer" className="font-bold hover:underline">firecrawl.dev</a> para usar seu próprio ambiente.
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'search'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400'
            }`}
            disabled={!configured}
          >
            🔍 Buscar
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'url'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400'
            }`}
            disabled={!configured}
          >
            🔗 URL Direta
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded flex gap-2 items-center text-green-800 dark:text-green-200">
            <CheckCircle size={20} />
            {success}
          </div>
        )}

        {status && (
          <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded flex gap-2 items-center text-blue-800 dark:text-blue-200">
            <Loader2 size={20} className="animate-spin" />
            {status}
          </div>
        )}

        {/* Content */}
        {configured ? (
          <>
            {activeTab === 'search' && (
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Buscar receita por nome
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ex: Margarita, Mojito, Old Fashioned..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !searchQuery.trim()}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-semibold disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Buscar'}
                    </button>
                  </div>
                </div>

                {/* Results */}
                {results.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Resultados encontrados:
                    </h3>
                    {results.map((result, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectResult(result)}
                        disabled={isLoading}
                        className="w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded hover:bg-blue-50 dark:hover:bg-gray-700 transition"
                      >
                        <p className="font-semibold text-blue-600 dark:text-blue-400 truncate">
                          {result.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {result.url}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </form>
            )}

            {activeTab === 'url' && (
              <form onSubmit={handleScrapeUrl} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Cole a URL da receita
                  </label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/receita/..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !urlInput.trim()}
                  className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-semibold disabled:opacity-50 flex justify-center gap-2 items-center"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : null}
                  {isLoading ? 'Carregando...' : 'Importar Receita'}
                </button>
              </form>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Para usar web scraping, configure sua chave Firecrawl
            </p>
            <ol className="text-left text-gray-700 dark:text-gray-300 space-y-2 text-sm mb-4">
              <li>1. Registre-se em <a href="https://firecrawl.dev" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">firecrawl.dev</a></li>
              <li>2. Copie sua API key</li>
              <li>3. Adicione ao .env: <code className="bg-gray-200 dark:bg-gray-700 px-1">VITE_FIRECRAWL_API_KEY=fc-...</code></li>
              <li>4. Reinicie o servidor</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
