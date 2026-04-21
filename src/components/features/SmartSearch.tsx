'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, Clock, Star, X, Sparkles, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import cloudinaryLoader from '@/lib/cloudinaryLoader';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchSuggestion {
  id: string;
  title: string;
  slug: string;
  images: string[];
  price: number;
  averageRating: number;
  reviewCount: number;
  salesCount: number;
}

interface Props {
  onSearch?: () => void;
  className?: string;
  searchBtnColor?: string;
  branchName?: string;
  onOpenChange?: (isOpen: boolean) => void;
}

export function SmartSearch({ onSearch, className, searchBtnColor, branchName, onOpenChange }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [topProducts, setTopProducts] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const recent = localStorage.getItem('recentSearches');
    if (recent) {
      setRecentSearches(JSON.parse(recent).slice(0, 5));
    }
  }, []);

  useEffect(() => {
    const value = searchParams.get('q') || '';
    if (value !== query) setQuery(value);
  }, [searchParams]);

  useEffect(() => {
    if (isOpen && topProducts.length === 0) {
      fetchTopProducts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node) && !isMobileFullscreen) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileFullscreen]);

  useEffect(() => {
    if (isMobileFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileFullscreen]);

  const fetchSuggestions = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTopProducts = async () => {
    try {
      const response = await fetch('/api/search/top-products');
      const data = await response.json();
      setTopProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching top products:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query.trim());
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      closeSearch();
    }
    if (onSearch) onSearch();
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    saveRecentSearch(suggestion.title);
    router.push(`/product/${suggestion.slug}`);
    closeSearch();
    if (onSearch) onSearch();
  };

  const handleRecentSearchClick = (search: string) => {
    setQuery(search);
    router.push(`/search?q=${encodeURIComponent(search)}`);
    closeSearch();
    if (onSearch) onSearch();
  };

  const saveRecentSearch = (search: string) => {
    const recent = [...new Set([search, ...recentSearches])].slice(0, 5);
    setRecentSearches(recent);
    localStorage.setItem('recentSearches', JSON.stringify(recent));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const openSearch = () => {
    setIsOpen(true);
    if (window.innerWidth < 768) {
      setIsMobileFullscreen(true);
    }
    if (onOpenChange) onOpenChange(true);
  };

  const closeSearch = () => {
    setIsOpen(false);
    setIsMobileFullscreen(false);
    if (onOpenChange) onOpenChange(false);
  };

  const showSuggestions = isOpen && (suggestions.length > 0 || topProducts.length > 0 || recentSearches.length > 0);
  const placeholderText = branchName ? `Buscar en ${branchName}` : 'Buscar...';

  return (
    <>
      {/* Overlay oscuro cuando está abierto */}
      {isOpen && !isMobileFullscreen && (
        <div 
          className="hidden md:block fixed inset-0 bg-black/60 z-[90] transition-opacity duration-300 animate-in fade-in"
          onClick={closeSearch}
        />
      )}

      {/* Input normal */}
      <div ref={wrapperRef} className={cn("relative w-full", isOpen && "z-[100]", className)}>
        <form onSubmit={handleSearch} className={cn("relative w-full group rounded-full shadow-sm transition-colors", isOpen ? "bg-white" : "bg-slate-100 hover:bg-slate-200/70")}>
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholderText}
            className="h-10 w-full pl-5 pr-12 border-0 rounded-full text-sm font-medium bg-transparent text-slate-800 shadow-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-200"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={openSearch}
          />
          {query && isOpen && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-12 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full transition-colors z-10"
            >
              <X className="w-3.5 h-3.5 text-slate-500" />
            </button>
          )}
          <button 
            type="submit" 
            className="absolute right-1 top-1 h-8 w-8 flex items-center justify-center rounded-full text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
            style={{ backgroundColor: searchBtnColor || '#fc4b65' }} 
          >
            <Search className="h-4 w-4" />
          </button>
        </form>

        {/* Dropdown desktop */}
        {showSuggestions && !isMobileFullscreen && (
          <div className="hidden md:block absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[100] max-h-[70vh] overflow-y-auto">
            <SearchContent
              query={query}
              suggestions={suggestions}
              topProducts={topProducts}
              recentSearches={recentSearches}
              isLoading={isLoading}
              onSuggestionClick={handleSuggestionClick}
              onRecentSearchClick={handleRecentSearchClick}
              onClearRecent={clearRecentSearches}
            />
          </div>
        )}
      </div>

      {/* Modal fullscreen móvil */}
      {isMobileFullscreen && (
        <div className="md:hidden fixed inset-0 bg-white z-[100] flex flex-col animate-in slide-in-from-bottom duration-300">
          {/* Header */}
          <div className="flex-shrink-0 border-b border-slate-200 bg-white">
            <div className="flex items-center gap-3 p-4">
              <button
                onClick={closeSearch}
                className="flex-shrink-0 p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-700" />
              </button>
              <form onSubmit={handleSearch} className="flex-1 relative">
                <Input
                  type="text"
                  placeholder={placeholderText}
                  className="h-11 w-full pl-4 pr-10 border border-slate-200 rounded-full text-sm font-medium bg-slate-50 text-slate-800 placeholder:text-slate-400"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-200 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto">
            <SearchContent
              query={query}
              suggestions={suggestions}
              topProducts={topProducts}
              recentSearches={recentSearches}
              isLoading={isLoading}
              onSuggestionClick={handleSuggestionClick}
              onRecentSearchClick={handleRecentSearchClick}
              onClearRecent={clearRecentSearches}
              isMobile
            />
          </div>
        </div>
      )}
    </>
  );
}

function SearchContent({
  query,
  suggestions,
  topProducts,
  recentSearches,
  isLoading,
  onSuggestionClick,
  onRecentSearchClick,
  onClearRecent,
  isMobile = false,
}: {
  query: string;
  suggestions: SearchSuggestion[];
  topProducts: SearchSuggestion[];
  recentSearches: string[];
  isLoading: boolean;
  onSuggestionClick: (suggestion: SearchSuggestion) => void;
  onRecentSearchClick: (search: string) => void;
  onClearRecent: () => void;
  isMobile?: boolean;
}) {
  return (
    <>
      {recentSearches.length > 0 && !query && (
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase">
              <Clock className="w-4 h-4" />
              Búsquedas recientes
            </div>
            <button onClick={onClearRecent} className="text-xs text-slate-400 hover:text-slate-600">
              Limpiar
            </button>
          </div>
          <div className="space-y-1">
            {recentSearches.map((search, idx) => (
              <button
                key={idx}
                onClick={() => onRecentSearchClick(search)}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-sm text-slate-700 flex items-center gap-2"
              >
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="truncate">{search}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase mb-3">
            <Sparkles className="w-4 h-4" />
            Sugerencias
          </div>
          <div className="space-y-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => onSuggestionClick(suggestion)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <div className="w-14 h-14 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                  {suggestion.images[0] ? (
                    <Image
                      loader={cloudinaryLoader}
                      src={suggestion.images[0]}
                      alt={suggestion.title}
                      width={56}
                      height={56}
                      className="w-full h-full object-contain p-1.5"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Search className="w-6 h-6 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium text-slate-900 line-clamp-2 group-hover:text-primary transition-colors">
                    {suggestion.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-slate-700">
                      S/ {suggestion.price.toFixed(2)}
                    </span>
                    {suggestion.averageRating > 0 && (
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {suggestion.averageRating.toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {!query && topProducts.length > 0 && (
        <div className="p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase mb-3">
            <TrendingUp className="w-4 h-4" />
            Productos destacados
          </div>
          <div className="space-y-2">
            {topProducts.slice(0, 7).map((product) => (
              <button
                key={product.id}
                onClick={() => onSuggestionClick(product)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <div className="w-14 h-14 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                  {product.images[0] ? (
                    <Image
                      loader={cloudinaryLoader}
                      src={product.images[0]}
                      alt={product.title}
                      width={56}
                      height={56}
                      className="w-full h-full object-contain p-1.5"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Search className="w-6 h-6 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium text-slate-900 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                    {product.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-sm font-bold text-slate-700">
                      S/ {product.price.toFixed(2)}
                    </span>
                    {product.averageRating > 0 && (
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {product.averageRating.toFixed(1)}
                      </div>
                    )}
                    {product.salesCount > 0 && (
                      <span className="text-xs text-slate-500">
                        {product.salesCount} vendidos
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-primary"></div>
          <p className="text-sm text-slate-500 mt-3">Buscando...</p>
        </div>
      )}

      {query && !isLoading && suggestions.length === 0 && (
        <div className="p-8 text-center">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-600">No se encontraron resultados</p>
          <p className="text-xs text-slate-400 mt-1">Intenta con otras palabras clave</p>
        </div>
      )}
    </>
  );
}
