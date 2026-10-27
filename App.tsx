if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Plus, Wine, Filter, ShoppingBag, Edit, Trash2, Lock, LogOut, Upload, ChevronDown, FileText, Martini, Loader2, Sparkles, ArrowUp, AlertTriangle, X, Compass, Menu as MenuIcon, GlassWater, FlaskConical, Droplets, ExternalLink, Heart, ArrowLeft, Languages, ArrowDownAZ, Shuffle } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
import { DrinkRecipe, DrinkCategory, ViewState, IngredientItem, CategoryItem, GlassType, BasePreparation } from './types.ts';
import { CATEGORIES, INITIAL_RECIPES, INITIAL_INGREDIENTS } from './constants.ts';
import {
  getRecipes, saveRecipe, deleteRecipe, saveRecipesBulk,
  getIngredients, saveIngredientsBulk, saveIngredient, deleteIngredient,
  initStorage,
  getIngredientCategories, saveIngredientCategories, deleteIngredientCategory,
  getGlasses, saveGlass, deleteGlass,
  getLiqueurs, saveLiquor, deleteLiquor,
  getSyrups, saveSyrup, deleteSyrup
} from './services/supabaseService.ts';
import { RecipeCard } from './components/RecipeCard.tsx';
import { RecipeForm } from './components/RecipeForm.tsx';
import { RecipeDetail } from './components/RecipeDetail.tsx';
import { IngredientManager } from './components/IngredientManager.tsx';
import { IngredientExplorer } from './components/IngredientExplorer.tsx';
import { IngredientDetailView } from './components/IngredientDetailView.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { RecipeImportModal } from './components/RecipeImportModal.tsx';
import { GlassGuide } from './components/GlassGuide.tsx';
import { PreMadeCard } from './components/PreMadeCard.tsx';
import { PreMadeDetail } from './components/PreMadeDetail.tsx';
import { PreMadeForm } from './components/PreMadeForm.tsx';
import { MultiIngredientRecipes } from './components/MultiIngredientRecipes.tsx';
import { WebScraperModal } from './src/components/WebScraperModal.tsx';
import { parseIngredients, downloadAndStoreRecipeImage, translateGarnish } from './services/recipeProcessingService';
import { translatePortuguese } from './services/translationService';

/**
 * CONFIGURAÇÃO DE PATROCINADORES
 */
const SPONSORS = [
  { id: '1', name: 'Cocktail Channel', logo: '/uploads/apoio-parceiros/cocktail-channel.png', link: '#' },
  { id: '2', name: 'Easy Drinks', logo: '/uploads/apoio-parceiros/easydrinks.png', link: '#' },
  { id: '3', name: 'Drinkeros', logo: '/uploads/apoio-parceiros/logo-drinkeros.png', link: '#' },
  { id: '4', name: 'Patrocinador', logo: '/uploads/apoio-parceiros/patrocinador.png', link: '#' },
  { id: '5', name: 'Cocktail Channel', logo: '/uploads/apoio-parceiros/cocktail-channel.png', link: '#' },
  { id: '6', name: 'Easy Drinks', logo: '/uploads/apoio-parceiros/easydrinks.png', link: '#' },
];

const LOGO_URL = './img/logo.png'; 
const BACKGROUND_IMAGE_URL = './img/fundo1.png';

const getOptimizedImageUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('dropbox.com') && !url.includes('raw=1')) {
    return url.includes('?') ? `${url}&raw=1` : `${url}?raw=1`;
  }
  return url;
};

export default function App() {
  const { t, i18n } = useTranslation();
  const [recipes, setRecipes] = useState<DrinkRecipe[]>([]);
  const [liqueurs, setLiqueurs] = useState<BasePreparation[]>([]);
  const [syrups, setSyrups] = useState<BasePreparation[]>([]);  
  const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [glasses, setGlasses] = useState<GlassType[]>([]);
  const [viewState, setViewState] = useState<ViewState>('LIST');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [importModalType, setImportModalType] = useState<'recipes' | 'liqueurs' | 'syrups' | null>(null);
  const [showWebScraper, setShowWebScraper] = useState(false);
  const [recipeSortOrder, setRecipeSortOrder] = useState<'alpha' | 'random'>(localStorage.getItem('mixology_recipe_sort') as 'alpha' | 'random' || 'random');

  const [viewHistory, setViewHistory] = useState<{ view: ViewState; scrollPos: number }[]>([]);

  const pushView = (nextView: ViewState) => {
    // Salva a posição de rolagem atual antes de mudar de tela (MEXI AQUI)
    const currentScroll = window.scrollY;
    setViewHistory(prev => [...prev, { view: viewState, scrollPos: currentScroll }]);
    setViewState(nextView);
    // Rola para o topo apenas ao entrar em uma nova tela (MEXI AQUI)
    window.scrollTo({ top: 0, behavior: 'instant' });
    setIsMobileMenuOpen(false);
  };

  const popView = () => {
    if (viewHistory.length > 0) {
      const lastEntry = viewHistory[viewHistory.length - 1];
      setViewHistory(prev => prev.slice(0, -1));
      setViewState(lastEntry.view);
      
      // Restaura a posição de rolagem anterior após um pequeno delay para o React renderizar (MEXI AQUI)
      setTimeout(() => {
        window.scrollTo({ top: lastEntry.scrollPos, behavior: 'instant' });
      }, 0);
    } else {
      setViewState('LIST');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const [selectedRecipe, setSelectedRecipe] = useState<DrinkRecipe | null>(null);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientItem | null>(null);
  const [selectedMultiIngredients, setSelectedMultiIngredients] = useState<string[]>([]);
  const [editingIngredientId, setEditingIngredientId] = useState<string | null>(null);
  const [selectedPreMade, setSelectedPreMade] = useState<BasePreparation | null>(null);
  const [preMadeType, setPreMadeType] = useState<'liquor' | 'syrup'>('syrup');
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [isMaster, setIsMaster] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<DrinkCategory>('Todos');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [visibleItems, setVisibleItems] = useState(6);
  const [visibleLiqueurs, setVisibleLiqueurs] = useState(6);
  const [visibleSyrups, setVisibleSyrups] = useState(6);

  useEffect(() => {
    loadData();
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await initStorage();
      const [r, l, s, i, c, g] = await Promise.all([
        getRecipes().catch(() => []),
        getLiqueurs().catch(() => []),
        getSyrups().catch(() => []),
        getIngredients().catch(() => []),
        getIngredientCategories().catch(() => []),
        getGlasses().catch(() => [])
      ]);

      let sortedRecipes = r;
      if (localStorage.getItem('mixology_recipe_sort') === 'random') {
        sortedRecipes = r.sort(() => Math.random() - 0.5);
      } else {
        sortedRecipes = r.sort((a, b) => a.title.localeCompare(b.title));
      }
      setRecipes(sortedRecipes);

      setLiqueurs(l.sort((a, b) => a.title.localeCompare(b.title)));
      setSyrups(s.sort((a, b) => a.title.localeCompare(b.title)));
      // Ordenação alfabética aplicada aqui (MEXI NESTA LINHA)
      setIngredients(i.sort((a, b) => a.name.localeCompare(b.name)));
      setCategories((c as CategoryItem[]).sort((a, b) => a.name.localeCompare(b.name)));
      setGlasses(g);

      if (localStorage.getItem('mixology_is_master') === 'true') setIsMaster(true);

      return sortedRecipes;
    } catch (error) {
      console.error("Erro no carregamento:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleRecipeSort = () => {
    const newOrder = recipeSortOrder === 'alpha' ? 'random' : 'alpha';
    setRecipeSortOrder(newOrder);
    localStorage.setItem('mixology_recipe_sort', newOrder);
    
    setRecipes(prev => {
      const copy = [...prev];
      if (newOrder === 'random') {
        return copy.sort(() => Math.random() - 0.5);
      } else {
        return copy.sort((a, b) => a.title.localeCompare(b.title));
      }
    });
  };

  const handleImportData = async (data: any[]) => {
    if (!importModalType) return;
    setIsLoading(true);
    try {
      if (importModalType === 'recipes') {
        await saveRecipesBulk(data);
      } else if (importModalType === 'liqueurs') {
        await Promise.all(data.map(l => saveLiquor(l)));
      } else if (importModalType === 'syrups') {
        await Promise.all(data.map(s => saveSyrup(s)));
      }
      await loadData();
      alert("Importação concluída com sucesso!");
    } catch (e) {
      alert("Erro na importação: " + (e instanceof Error ? e.message : "Desconhecido"));
    } finally {
      setIsLoading(false);
      setImportModalType(null);
    }
  };

  const handleRecipeScraped = async (recipe: Partial<DrinkRecipe>) => {
    try {
      console.log('Recipe scraped received:', recipe);

      // Parse ingredients: separate name from measure with oz→ml conversion
      const ingredientList = (recipe.ingredients || []).map(ing =>
        typeof ing === 'string' ? ing : ing.name
      );
      const parsedIngredients = parseIngredients(ingredientList);

      // Extract garnish (items with "garnish", "slice", "fatia" in name)
      let garnish = '';
      const remainingIngredients = parsedIngredients.filter(ing => {
        const isGarnish = ing.name.toLowerCase().includes('garnish') ||
                         ing.name.toLowerCase().includes('slice') ||
                         ing.name.toLowerCase().includes('fatia') ||
                         ing.name.toLowerCase().includes('rim') ||
                         ing.name.toLowerCase().includes('wheel') ||
                         ing.name.toLowerCase().includes('wedge');
        if (isGarnish && !garnish) {
          // Translate garnish to Portuguese
          garnish = translateGarnish(ing.name);
        }
        return !isGarnish;
      });

      // Download and store recipe image
      const storedImagePath = recipe.imageUrl
        ? await downloadAndStoreRecipeImage(recipe.imageUrl, recipe.title || 'recipe')
        : '';

      const preparation = (recipe as any).preparation || '';
      const notes = (recipe as any).notes || '';

      // Translate preparation to Portuguese and make it one sentence
      let translatedPreparation = translatePortuguese(preparation)
        .replace(/[\n\r]+/g, ' ')  // Replace line breaks with space
        .replace(/\s+/g, ' ')      // Collapse multiple spaces
        .trim();

      // Remove lingering English words/articles
      translatedPreparation = translatedPreparation
        .replace(/\bthe\b/gi, '')  // Remove "the"
        .replace(/\bis\b/gi, '')   // Remove "is"
        .replace(/\ban\b/gi, '')   // Remove "an"
        .replace(/\ba\b(?!\w)/gi, '')  // Remove standalone "a"
        .replace(/\s+/g, ' ')      // Clean up spaces again
        .trim()
        .replace(/\.$/, '') + '.'; // Ensure single period at end

      const fullRecipe: DrinkRecipe = {
        id: crypto.randomUUID(),
        title: recipe.title || 'Sem nome',
        ingredients: remainingIngredients,
        instructions: (translatedPreparation ? [translatedPreparation] : []) as string[],
        description: notes || 'Importado via web scraping',
        garnish: garnish,
        method: 'Batido',
        category: 'Alcoólico' as any,
        imageUrl: storedImagePath,
        isFavorite: false,
        createdAt: Date.now(),
      };

      console.log('Full recipe to save:', fullRecipe);

      // Check if recipe already exists by title
      const existingRecipe = recipes.find(r => r.title.toLowerCase() === fullRecipe.title.toLowerCase());
      if (existingRecipe) {
        console.log('Recipe already exists:', existingRecipe.id);
        alert('⚠️ Esta receita já existe no banco de dados!');
        setShowWebScraper(false);
        return;
      }

      const result = await saveRecipe(fullRecipe);
      console.log('Save result:', result);

      console.log('Loading data...');
      const loadedRecipes = await loadData();
      console.log('Data loaded, recipes count:', loadedRecipes?.length || 0);

      setShowWebScraper(false);
    } catch (e) {
      console.error('Error saving recipe:', e);
      alert('❌ Erro ao salvar receita: ' + (e instanceof Error ? e.message : 'Desconhecido'));
    }
  };

  const openPreMadeDetail = (item: BasePreparation, type: 'liquor' | 'syrup') => {
    setSelectedPreMade(item);
    setPreMadeType(type);
    pushView(type === 'liquor' ? 'LIQUOR_DETAIL' : 'SYRUP_DETAIL');
  };
  
  const openCreatePreMade = (type: 'liquor' | 'syrup') => {
    setSelectedPreMade(null);
    setPreMadeType(type);
    pushView('PREMADE_FORM');
  };

  const handleSavePreMade = async (item: BasePreparation) => {
    setIsLoading(true);
    try {
      const saveFn = preMadeType === 'liquor' ? saveLiquor : saveSyrup;
      const result = await saveFn(item);
      if (result.success || !result.error) {
        const updatedId = result.id ? String(result.id) : item.id;
        const updatedItem = { ...item, id: updatedId };
        setSelectedPreMade(updatedItem); 
        await loadData();
        popView();
      }
    } catch (e) {
      alert("Erro ao salvar preparo base.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePreMade = async (id: string, type: 'liquor' | 'syrup') => {
    if (window.confirm("Deseja realmente excluir este preparo?")) {
      setIsLoading(true);
      try {
        const deleteFn = type === 'liquor' ? deleteLiquor : deleteSyrup;
        await deleteFn(id);
        await loadData();
        popView();
      } catch (e) {
        alert("Erro ao excluir preparo.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEditPreMade = (item: BasePreparation, type: 'liquor' | 'syrup') => {
    setSelectedPreMade(item);
    setPreMadeType(type);
    pushView('PREMADE_FORM');
  };

  const handleSaveRecipe = async (recipe: DrinkRecipe) => {
    try {
      // If editing existing recipe, preserve the original UUID
      const recipeToSave = selectedRecipe?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedRecipe.id)
        ? { ...recipe, id: selectedRecipe.id }
        : recipe;

      console.log('[App] handleSaveRecipe called:', {
        originalId: selectedRecipe?.id,
        formId: recipe.id,
        finalId: recipeToSave.id,
        title: recipeToSave.title,
        isUpdate: !!selectedRecipe?.id
      });

      const result = await saveRecipe(recipeToSave);
      if (result) {
        setSelectedRecipe(result);
        await loadData();
        popView();
      }
    } catch (error) {
      console.error('[App] Error saving recipe:', error);
      alert('❌ Erro ao salvar receita: ' + (error instanceof Error ? error.message : 'Desconhecido'));
    }
  };

  const handleIngredientClick = (name: string) => {
    const ing = ingredients.find(i => i.name === name);
    if (ing) {
      setSelectedIngredient(ing);
      pushView('INGREDIENT_DETAIL');
    } else {
      setSearchQuery(name);
      setViewState('LIST');
      setViewHistory([]);
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    const previousRecipes = [...recipes];
    setRecipes(prev => prev.filter(r => r.id !== id));
    popView();
    setSelectedRecipe(null);
    await deleteRecipe(id).catch(() => setRecipes(previousRecipes));
  };

  const handleToggleFavorite = async (id: string) => {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;
    const updatedRecipe = { ...recipe, isFavorite: !recipe.isFavorite };
    setRecipes(prev => prev.map(r => r.id === id ? updatedRecipe : r));
    if (selectedRecipe?.id === id) setSelectedRecipe(updatedRecipe);
    await saveRecipe(updatedRecipe);
  };

  const openDetail = (recipe: DrinkRecipe) => { setSelectedRecipe(recipe); pushView('DETAIL'); };
  const openEdit = (recipe: DrinkRecipe) => { setSelectedRecipe(recipe); pushView('FORM'); };
  const openCreate = () => { setSelectedRecipe(null); pushView('FORM'); };

  const handleLogout = () => { setIsMaster(false); localStorage.removeItem('mixology_is_master'); setViewState('LIST'); setViewHistory([]); setIsMobileMenuOpen(false); };
  
  const handleLogoClick = () => {
    setViewState('LIST');
    setViewHistory([]);
    setSearchQuery('');
    setActiveCategory('Todos');
    setShowFavoritesOnly(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const query = searchQuery.toLowerCase();
      const title = recipe.title?.toLowerCase() || '';
      const matchesSearch = title.includes(query) || (recipe.ingredients && recipe.ingredients.some(ing => ing.name.toLowerCase().includes(query)));
      const matchesCategory = activeCategory === 'Todos' || recipe.category === activeCategory;
      const matchesFavorite = !showFavoritesOnly || recipe.isFavorite;
      return matchesSearch && matchesCategory && matchesFavorite;
    });
  }, [recipes, searchQuery, activeCategory, showFavoritesOnly]);

  const filteredLiqueurs = useMemo(() => {
    return liqueurs.filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.description.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [liqueurs, searchQuery]);

  const filteredSyrups = useMemo(() => {
    return syrups.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [syrups, searchQuery]);

  const logoSrc = getOptimizedImageUrl(LOGO_URL);
  const backgroundSrc = getOptimizedImageUrl(BACKGROUND_IMAGE_URL);

  const NavContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <button onClick={() => { setViewState('LIST'); setViewHistory([]); setSearchQuery(''); setVisibleItems(6); if(mobile) setIsMobileMenuOpen(false); }} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewState === 'LIST' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-brand-50'} ${mobile ? 'w-full text-left' : ''}`}>{t('common.drinks')}</button>
      <button onClick={() => { setViewState('LIQUORS_LIST'); setViewHistory([]); setSearchQuery(''); setVisibleLiqueurs(6); if(mobile) setIsMobileMenuOpen(false); }} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewState === 'LIQUORS_LIST' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-brand-50'} ${mobile ? 'w-full text-left' : ''}`}>{t('common.liqueurs')}</button>
      <button onClick={() => { setViewState('SYRUPS_LIST'); setViewHistory([]); setSearchQuery(''); setVisibleSyrups(6); if(mobile) setIsMobileMenuOpen(false); }} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewState === 'SYRUPS_LIST' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-brand-50'} ${mobile ? 'w-full text-left' : ''}`}>{t('common.syrups')}</button>
      <button onClick={() => { setViewState('INGREDIENT_EXPLORER'); setViewHistory([]); setSearchQuery(''); if(mobile) setIsMobileMenuOpen(false); }} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewState === 'INGREDIENT_EXPLORER' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-brand-50'} ${mobile ? 'w-full text-left' : ''}`}>{t('common.ingredients')}</button>
      <button onClick={() => { setViewState('GLASS_GUIDE'); setViewHistory([]); setSearchQuery(''); if(mobile) setIsMobileMenuOpen(false); }} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewState === 'GLASS_GUIDE' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-brand-50'} ${mobile ? 'w-full text-left' : ''}`}>{t('common.glasses')}</button>
    </>
  );

  const LanguageSwitcher = () => (
    <div className="relative">
      {/* Mobile: Dropdown */}
      <div className="md:hidden">
        <button 
          onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} 
          className="flex items-center gap-1 bg-slate-100 px-2 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-200 transition-colors"
        >
          <Languages size={14} />
          <span className="uppercase">{i18n.language.substring(0, 2)}</span>
          <ChevronDown size={12} className={`transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
        </button>
        {isLangMenuOpen && (
          <div className="absolute top-full right-0 mt-2 bg-white border border-slate-200 shadow-xl rounded-xl flex flex-col overflow-hidden z-50 min-w-[80px]">
            {['pt', 'en', 'es', 'fr', 'de'].map(lang => (
              <button 
                key={lang}
                onClick={() => { i18n.changeLanguage(lang); setIsLangMenuOpen(false); }}
                className={`px-3 py-2 text-xs font-bold text-left transition-colors ${i18n.language.startsWith(lang) ? 'text-brand-700 bg-brand-50' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Desktop: Inline */}
      <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
        {['pt', 'en', 'es', 'fr', 'de'].map(lang => (
          <button 
            key={lang}
            onClick={() => i18n.changeLanguage(lang)}
            className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${i18n.language.startsWith(lang) ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 relative bg-[#fafaf9]">
      {backgroundSrc && (
        <div className="fixed inset-0 z-0" style={{ backgroundImage: `url(${backgroundSrc})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
          <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px]"></div>
        </div>
      )}

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="md:hidden p-2 text-slate-600 hover:bg-brand-50 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>

            <div className="flex items-center gap-3 cursor-pointer group" onClick={handleLogoClick}>
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden">
                {!logoError ? (
                  <img 
                    src={logoSrc} 
                    alt="Logo MyFirstCocktail" 
                    className="w-full h-full object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-brand-600 flex items-center justify-center">
                    <Martini className="text-white" size={24} />
                  </div>
                )}
              </div>
              <div className="flex flex-col -space-y-0">
                <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-none">MyFirstCocktail</h1>
                <span className="text-[9px] sm:text-[10px] text-brand-500 font-medium">{t('common.logo_subtitle')}</span>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-2">
              <NavContent />
            </nav>

            <div className="flex items-center gap-2">
			  {/* INÍCIO DA ALTERAÇÃO: Botão de ordenar receitas movido para fora do painel administrativo */}
              <button 
                onClick={toggleRecipeSort} 
                className="hidden sm:flex bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-xl font-bold items-center gap-2 shadow-sm hover:bg-slate-50 transition-all text-sm"
                title={recipeSortOrder === 'alpha' ? "Ordenar Aleatoriamente" : "Ordenar Alfabeticamente"}
              >
                {recipeSortOrder === 'alpha' ? <Shuffle size={16} /> : <ArrowDownAZ size={16} />}
              </button>
              {/* FIM DA ALTERAÇÃO */}
              <LanguageSwitcher />
              {isMaster && (
                <div className="flex items-center gap-2">
                  {/* Dropdown de Importação */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsImportMenuOpen(!isImportMenuOpen)}
                      className="hidden sm:flex bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold items-center gap-2 shadow-sm hover:bg-slate-50 transition-all text-sm"
                    >
                      <FileText size={16} /> {t('common.import')} <ChevronDown size={14} className={`transition-transform ${isImportMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isImportMenuOpen && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden py-2 animate-fadeIn">
                        <button onClick={() => { setShowWebScraper(true); setIsImportMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-brand-50 flex items-center gap-3"><Compass size={14} className="text-green-500" /> 🌐 Web Scraping</button>
                        <button onClick={() => { setImportModalType('recipes'); setIsImportMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-brand-50 flex items-center gap-3"><Martini size={14} className="text-brand-500" /> {t('common.drinks')} (.json)</button>
                        <button onClick={() => { setImportModalType('liqueurs'); setIsImportMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-brand-50 flex items-center gap-3"><FlaskConical size={14} className="text-amber-500" /> {t('common.liqueurs')} (.json)</button>
                        <button onClick={() => { setImportModalType('syrups'); setIsImportMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-brand-50 flex items-center gap-3"><Droplets size={14} className="text-blue-500" /> {t('common.syrups')} (.json)</button>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={toggleRecipeSort} 
                    className="hidden sm:flex bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-xl font-bold items-center gap-2 shadow-sm hover:bg-slate-50 transition-all text-sm"
                    title={recipeSortOrder === 'alpha' ? "Ordenar Aleatoriamente" : "Ordenar Alfabeticamente"}
                  >
                    {recipeSortOrder === 'alpha' ? <Shuffle size={16} /> : <ArrowDownAZ size={16} />}
                  </button>

                  <button onClick={openCreate} className="hidden sm:flex bg-brand-600 text-white px-4 py-2 rounded-xl font-bold items-center gap-2 shadow-lg hover:scale-105 transition-all text-sm"><Plus size={16} /> {t('common.new')}</button>
                </div>
              )}
              {isMaster ? <button onClick={handleLogout} className="text-slate-400 p-2 ml-1"><LogOut size={20} /></button> : <button onClick={() => setShowLoginModal(true)} className="text-slate-500 p-2 ml-1"><Lock size={20} /></button>}
            </div>
          </div>
        </header>

        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-30 bg-white pt-20 px-4 animate-fadeIn">
            <nav className="flex flex-col gap-2">
              <NavContent mobile={true} />
			  
			  {/* INÍCIO DA ALTERAÇÃO: Botão de ordenar receitas no mobile destacado com cores da marca e fonte maior */}
              <button 
                onClick={() => { toggleRecipeSort(); setIsMobileMenuOpen(false); }} 
                className="mt-6 bg-brand-100 border-2 border-brand-500 text-brand-700 px-4 py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-95 transition-all"
              >
                {recipeSortOrder === 'alpha' ? <Shuffle size={24} /> : <ArrowDownAZ size={24} />}
                {recipeSortOrder === 'alpha' ? "ORDEM ALEATÓRIA" : "ORDEM ALFABÉTICA"}
              </button>
              {/* FIM DA ALTERAÇÃO */}
			  
              {isMaster && (
                <>
                  <button 
                    onClick={() => { toggleRecipeSort(); setIsMobileMenuOpen(false); }} 
                    className="mt-4 bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    {recipeSortOrder === 'alpha' ? <Shuffle size={18} /> : <ArrowDownAZ size={18} />}
                    {recipeSortOrder === 'alpha' ? "Ordem Aleatória" : "Ordem Alfabética"}
                  </button>
                  <button 
                    onClick={() => { setImportModalType('recipes'); setIsMobileMenuOpen(false); }} 
                    className="mt-2 bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    <FileText size={18} /> {t('common.import')} {t('common.drinks')}
                  </button>
                  <button 
                    onClick={() => { openCreate(); setIsMobileMenuOpen(false); }} 
                    className="mt-2 bg-brand-600 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Plus size={18} /> {t('common.new')} {t('common.drinks')}
                  </button>
                </>
              )}
            </nav>
          </div>
        )}

        <main className="container mx-auto px-4 pt-8 flex-grow pb-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24"><Loader2 className="animate-spin text-brand-600 mb-4" size={48} /><p className="text-slate-500 font-medium">{t('common.loading')}</p></div>
          ) : (
            <div className="animate-fadeIn">
              {viewState === 'LIST' && (
                <div className="space-y-8">
                  <div className="relative overflow-hidden text-center py-10 px-8 bg-white/70 backdrop-blur-2xl rounded-3xl border border-white shadow-2xl max-w-4xl mx-auto mb-6 group">
                      <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-800 mb-6 drop-shadow-sm leading-tight">
                          <Trans i18nKey="common.welcome_title">
                            Descubra, Misture e <span className="text-brand-700 italic">Surpreenda</span>
                          </Trans>
                        </h2>
                        <p className="text-slate-700 text-lg md:text-xl leading-relaxed font-light max-w-3xl mx-auto">
                          <Trans i18nKey="common.welcome_subtitle">
                            As melhores receitas para transformar qualquer <span className="font-semibold text-brand-800">bartender caseiro</span> em um verdadeiro <span className="font-serif italic text-2xl text-brand-600">mestre dos drinks</span>.
                          </Trans>
                        </p>
                      </div>
                  </div>
                  <div className="relative max-w-2xl mx-auto w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-700/60" size={20} />
                    <input type="text" placeholder={t('common.search_placeholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border-2 border-brand-100 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-4 focus:ring-brand-500/10 transition-all shadow-sm" />
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setActiveCategory(cat);
                          setVisibleItems(6);
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm border ${
                          activeCategory === cat
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:bg-brand-50'
                        }`}
                      >
                        {t(`recipe.categories.${cat}`)}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setShowFavoritesOnly(!showFavoritesOnly);
                        setVisibleItems(6);
                      }}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm border flex items-center gap-2 ${
                        showFavoritesOnly
                          ? 'bg-red-500 text-white border-red-500'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-red-300 hover:bg-red-50'
                      }`}
                    >
                      <Heart size={14} className={showFavoritesOnly ? 'fill-white' : ''} />
                      {t('common.favorites')}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRecipes.slice(0, visibleItems).map(r => <RecipeCard key={r.id} recipe={r} onToggleFavorite={handleToggleFavorite} onClick={openDetail} />)}
                  </div>
                  {visibleItems < filteredRecipes.length && (
                    <div className="flex justify-center mt-4">
                      <button onClick={() => setVisibleItems(prev => prev + 12)} className="px-8 py-3 bg-white border border-slate-200 text-brand-700 rounded-full font-bold shadow-lg hover:bg-brand-50 transition-all">{t('common.see_more')}</button>
                    </div>
                  )}

                  <div className="mt-16 py-10 border-y border-brand-100/30 overflow-hidden">
                    <div className="flex flex-col items-center mb-6">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">{t('common.sponsors_title')}</span>
                    </div>
                    <div className="relative flex overflow-x-auto no-scrollbar gap-12 items-center justify-start px-12 py-4">
                       {SPONSORS.map(sponsor => (
                         <a 
                           key={sponsor.id} 
                           href={sponsor.link} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="flex-shrink-0 grayscale hover:grayscale-0 opacity-40 hover:opacity-100 transition-all duration-500 transform hover:scale-110"
                           title={sponsor.name}
                         >
                           <img 
                             src={sponsor.logo} 
                             alt={sponsor.name} 
                             className="h-10 md:h-12 w-auto object-contain"
                           />
                         </a>
                       ))}
                    </div>
                  </div>
                </div>
              )}

              {viewState === 'LIQUORS_LIST' && (
                <div className="space-y-12">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={popView}
                        className="p-2 bg-white rounded-lg text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition-colors shadow-md border border-slate-200"
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <div className="space-y-2">
                        <h2 className="text-3xl font-serif font-bold text-slate-800">{t('premade.liqueurs_title')}</h2>
                        <p className="text-slate-500 text-sm font-medium">{t('premade.liqueurs_subtitle')}</p>
                      </div>
                    </div>
                    {isMaster && (
                      <button 
                        onClick={() => openCreatePreMade('liquor')}
                        className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
                      >
                        <Plus size={18} /> {t('premade.new_liquor')}
                      </button>
                    )}
                  </div>
                  
                  <div className="relative max-w-2xl mx-auto w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-700/60" size={20} />
                    <input type="text" placeholder={t('premade.search_liqueurs')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border-2 border-brand-100 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-4 focus:ring-brand-500/10 transition-all shadow-sm" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLiqueurs.slice(0, visibleLiqueurs).map(l => <PreMadeCard key={l.id} item={l} type="liquor" onClick={() => openPreMadeDetail(l, 'liquor')} />)}
                  </div>
                  {visibleLiqueurs < filteredLiqueurs.length && (
                    <div className="flex justify-center mt-4">
                      <button onClick={() => setVisibleLiqueurs(prev => prev + 12)} className="px-8 py-3 bg-white border border-amber-200 text-amber-600 rounded-full font-bold shadow-lg hover:bg-amber-50 transition-all">{t('premade.see_more_liqueurs')}</button>
                    </div>
                  )}
                </div>
              )}

              {viewState === 'SYRUPS_LIST' && (
                <div className="space-y-12">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={popView}
                        className="p-2 bg-white rounded-lg text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition-colors shadow-md border border-slate-200"
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <div className="space-y-2">
                        <h2 className="text-3xl font-serif font-bold text-slate-800">{t('premade.syrups_title')}</h2>
                        <p className="text-slate-500 text-sm font-medium">{t('premade.syrups_subtitle')}</p>
                      </div>
                    </div>
                    {isMaster && (
                      <button 
                        onClick={() => openCreatePreMade('syrup')}
                        className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
                      >
                        <Plus size={18} /> {t('premade.new_syrup')}
                      </button>
                    )}
                  </div>

                  <div className="relative max-w-2xl mx-auto w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-700/60" size={20} />
                    <input type="text" placeholder={t('premade.search_syrups')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border-2 border-brand-100 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-4 focus:ring-brand-500/10 transition-all shadow-sm" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSyrups.slice(0, visibleSyrups).map(s => <PreMadeCard key={s.id} item={s} type="syrup" onClick={() => openPreMadeDetail(s, 'syrup')} />)}
                  </div>
                  {visibleSyrups < filteredSyrups.length && (
                    <div className="flex justify-center mt-4">
                      <button onClick={() => setVisibleSyrups(prev => prev + 12)} className="px-8 py-3 bg-white border border-blue-200 text-blue-600 rounded-full font-bold shadow-lg hover:bg-blue-50 transition-all">{t('premade.see_more_syrups')}</button>
                    </div>
                  )}
                </div>
              )}

              {viewState === 'INGREDIENT_EXPLORER' && (
                <IngredientExplorer 
                  ingredients={ingredients} 
                  onIngredientClick={handleIngredientClick} 
                  onBack={popView} 
                  isMaster={isMaster}
                  onAddNew={() => pushView('INGREDIENTS')}
                  initialSelectedIngredients={selectedMultiIngredients}
                  onShowMultiIngredientRecipes={(selected) => {
                    setSelectedMultiIngredients(selected);
                    pushView('MULTI_INGREDIENT_RECIPES');
                  }}
                />
              )}
              {viewState === 'MULTI_INGREDIENT_RECIPES' && (
                <MultiIngredientRecipes
                  recipes={recipes}
                  selectedIngredients={selectedMultiIngredients}
                  onBack={popView}
                  onRecipeClick={openDetail}
                  onToggleFavorite={handleToggleFavorite}
                  isMaster={isMaster}
                />
              )}
              {viewState === 'INGREDIENT_DETAIL' && selectedIngredient && <IngredientDetailView ingredient={selectedIngredient} relatedRecipes={recipes.filter(r => r.ingredients.some(i => i.name === selectedIngredient.name))} onBack={popView} onEdit={(id) => { setEditingIngredientId(id); pushView('INGREDIENTS'); }} onRecipeClick={openDetail} onToggleFavorite={handleToggleFavorite} isMaster={isMaster} />}
              {viewState === 'DETAIL' && selectedRecipe && <RecipeDetail recipe={selectedRecipe} onBack={popView} onEdit={openEdit} onDelete={handleDeleteRecipe} isMaster={isMaster} />}
              {viewState === 'LIQUOR_DETAIL' && selectedPreMade && <PreMadeDetail item={selectedPreMade} type="liquor" onBack={popView} isMaster={isMaster} onEdit={() => handleEditPreMade(selectedPreMade, 'liquor')} onDelete={() => handleDeletePreMade(selectedPreMade.id, 'liquor')} />}
              {viewState === 'SYRUP_DETAIL' && selectedPreMade && <PreMadeDetail item={selectedPreMade} type="syrup" onBack={popView} isMaster={isMaster} onEdit={() => handleEditPreMade(selectedPreMade, 'syrup')} onDelete={() => handleDeletePreMade(selectedPreMade.id, 'syrup')} />}
              {viewState === 'GLASS_GUIDE' && <GlassGuide glasses={glasses} onBack={popView} onSave={async (g) => { await saveGlass(g); loadData(); }} onDelete={async (id) => { await deleteGlass(id); loadData(); }} isMaster={isMaster} />}
              {viewState === 'FORM' && <RecipeForm initialData={selectedRecipe || undefined} onSave={handleSaveRecipe} onCancel={popView} availableIngredients={ingredients} />}
              {viewState === 'PREMADE_FORM' && <PreMadeForm initialData={selectedPreMade || undefined} type={preMadeType} onSave={handleSavePreMade} onCancel={popView} />}
              {viewState === 'INGREDIENTS' && <IngredientManager ingredients={ingredients} categories={categories} onSave={async (list, item) => { if(item) await saveIngredient(item); else await saveIngredientsBulk(list); await loadData(); popView(); }} onDelete={async (id) => { await deleteIngredient(id); loadData(); }} onUpdateCategories={async (cats) => { await saveIngredientCategories(cats); loadData(); }} onDeleteCategory={async (id) => { await deleteIngredientCategory(id); loadData(); }} onBack={popView} initialEditingId={editingIngredientId} />}

              {importModalType && (
                <RecipeImportModal
                  type={importModalType}
                  onImport={handleImportData}
                  onClose={() => setImportModalType(null)}
                />
              )}

              <WebScraperModal
                isOpen={showWebScraper}
                onClose={() => setShowWebScraper(false)}
                onRecipeScraped={handleRecipeScraped}
              />

              <div className="mt-20 mb-8 text-center border-t border-brand-100/50 pt-16 relative">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-transparent text-brand-500"><Sparkles size={40} /></div>
                 <h3 className="text-3xl md:text-5xl font-serif font-bold text-slate-800 leading-tight">{t('common.modern_mixology')}</h3>
                 <p className="mt-3 text-lg md:text-2xl text-slate-600 font-light">
                   <Trans i18nKey="common.modern_mixology_subtitle">
                     para <span className="text-brand-700 font-medium italic">criar</span>, <span className="text-brand-700 font-medium italic">experimentar</span> e <span className="text-brand-700 font-medium italic">impressionar</span> em casa.
                   </Trans>
                 </p>
              </div>
            </div>
          )}
        </main>

        <footer className="border-t border-brand-100 bg-white py-8 mt-auto text-slate-600">
          <div className="container mx-auto px-4 text-center">
            <p className="font-bold mb-1 text-brand-700 text-lg">MyFirstCocktail</p>
            <p className="text-slate-400 text-sm">© 2025 - {t('common.footer_made_with')}</p>
          </div>
        </footer>

        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={`fixed bottom-8 right-8 z-50 p-3 rounded-full bg-brand-600 text-white shadow-lg transition-all ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}><ArrowUp size={24} /></button>
      </div>
      {showLoginModal && <LoginModal onLogin={(s) => { if(s) { setIsMaster(true); localStorage.setItem('mixology_is_master', 'true'); } setShowLoginModal(false); }} onClose={() => setShowLoginModal(false)} />}
    </div>
  );
}
