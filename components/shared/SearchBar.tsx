import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search,
  X,
  Clock,
  TrendingUp,
  Filter,
  Command,
  ChevronRight,
  Loader2,
  Mic,
  FileText,
  Users,
  Building2,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface SearchBarProps {
  onSearch: (query: string, filters?: SearchFilters) => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  onClearRecent?: () => void;
  isLoading?: boolean;
  showFilters?: boolean;
  filters?: SearchFilters;
  onFilterChange?: (filters: SearchFilters) => void;
  categories?: SearchCategory[];
  showKeyboardShortcut?: boolean;
  debounceMs?: number;
  minCharacters?: number;
  maxSuggestions?: number;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  autoFocus?: boolean;
  voiceSearch?: boolean;
}

interface SearchSuggestion {
  id: string;
  text: string;
  category?: string;
  icon?: React.ComponentType<{ className?: string }>;
  metadata?: string;
  highlight?: boolean;
}

interface SearchFilters {
  category?: string;
  dateRange?: string;
  status?: string;
  [key: string]: any;
}

interface SearchCategory {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

// Default categories
const DEFAULT_CATEGORIES: SearchCategory[] = [
  { id: 'all', label: 'Todo', icon: Search },
  { id: 'clientes', label: 'Clientes', icon: Building2 },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'presupuestos', label: 'Presupuestos', icon: DollarSign },
  { id: 'documentos', label: 'Documentos', icon: FileText },
];

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Buscar...',
  suggestions = [],
  recentSearches = [],
  onClearRecent,
  isLoading = false,
  showFilters = false,
  filters = {},
  onFilterChange,
  categories = DEFAULT_CATEGORIES,
  showKeyboardShortcut = true,
  debounceMs = 300,
  minCharacters = 2,
  maxSuggestions = 8,
  fullWidth = false,
  size = 'md',
  autoFocus = false,
  voiceSearch = false,
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState(filters.category || 'all');

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout>();

  // Size classes
  const sizeClasses = {
    sm: 'h-9 text-sm',
    md: 'h-11 text-base',
    lg: 'h-14 text-lg',
  };

  // Handle search with debounce
  const handleSearchDebounced = useCallback(
    (searchQuery: string) => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(() => {
        if (searchQuery.length >= minCharacters || searchQuery.length === 0) {
          onSearch(searchQuery, { ...filters, category: activeCategory });
        }
      }, debounceMs);
    },
    [onSearch, filters, activeCategory, debounceMs, minCharacters]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setSelectedIndex(-1);
    setShowSuggestions(true);
    handleSearchDebounced(newQuery);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    performSearch(query);
  };

  const performSearch = (searchQuery: string) => {
    onSearch(searchQuery, { ...filters, category: activeCategory });
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
    onSearch('', { ...filters, category: activeCategory });
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion | string) => {
    const searchText = typeof suggestion === 'string' ? suggestion : suggestion.text;
    setQuery(searchText);
    performSearch(searchText);
  };

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    if (onFilterChange) {
      onFilterChange({ ...filters, category: categoryId });
    }
    if (query) {
      onSearch(query, { ...filters, category: categoryId });
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allSuggestions = [...recentSearches, ...suggestions];
    const maxIndex = allSuggestions.length - 1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < maxIndex ? prev + 1 : prev));
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;

      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
          const selected = allSuggestions[selectedIndex];
          handleSuggestionClick(selected);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    if (!showKeyboardShortcut) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setShowSuggestions(true);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showKeyboardShortcut]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSuggestions = suggestions.slice(0, maxSuggestions);
  const hasResults = recentSearches.length > 0 || filteredSuggestions.length > 0;

  return (
    <div className={`relative ${fullWidth ? 'w-full' : 'w-full max-w-2xl'}`}>
      {/* Category Tabs */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => {
            const Icon = category.icon || Search;
            const isActive = activeCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${isActive
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{category.label}</span>
                {category.count !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-100'
                      }`}
                  >
                    {category.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          {/* Search Icon */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-gray-400" />
            )}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(true);
            }}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={`w-full ${sizeClasses[size]} pl-12 pr-32 rounded-xl border-2 transition-all focus:outline-none focus:ring-4 focus:ring-primary-100 ${isFocused
                ? 'border-primary-500 bg-white shadow-lg'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            aria-label={placeholder}
            autoFocus={autoFocus}
          />

          {/* Right Actions */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {/* Keyboard Shortcut (only when not focused) */}
            {showKeyboardShortcut && !isFocused && !query && (
              <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">
                <Command className="w-3 h-3" />K
              </kbd>
            )}

            {/* Voice Search */}
            {voiceSearch && !query && (
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                aria-label="Búsqueda por voz"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}

            {/* Clear Button */}
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Advanced Filters Button */}
            {showFilters && (
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`p-2 rounded-lg transition-colors ${showAdvancedFilters
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                aria-label="Filtros avanzados"
              >
                <Filter className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && showAdvancedFilters && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50 animate-slide-down">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Filtros Avanzados</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={filters.dateRange || ''}
                onChange={(e) =>
                  onFilterChange?.({ ...filters, dateRange: e.target.value })
                }
              >
                <option value="">Todas las fechas</option>
                <option value="today">Hoy</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="year">Este año</option>
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={filters.status || ''}
                onChange={(e) =>
                  onFilterChange?.({ ...filters, status: e.target.value })
                }
              >
                <option value="">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="pending">Pendiente</option>
                <option value="completed">Completado</option>
              </select>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onFilterChange?.({});
                  setShowAdvancedFilters(false);
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (isFocused || query) && hasResults && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-slide-down"
        >
          {/* Recent Searches */}
          {recentSearches.length > 0 && !query && (
            <div className="border-b border-gray-100">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Búsquedas recientes
                  </span>
                </div>
                {onClearRecent && (
                  <button
                    onClick={onClearRecent}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Limpiar
                  </button>
                )}
              </div>
              <div className="max-h-48 overflow-y-auto">
                {recentSearches.map((recent, index) => (
                  <button
                    key={`recent-${index}`}
                    onClick={() => handleSuggestionClick(recent)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${selectedIndex === index
                        ? 'bg-primary-50 text-primary-900'
                        : 'hover:bg-gray-50 text-gray-700'
                      }`}
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm truncate">{recent}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {filteredSuggestions.length > 0 && query && (
            <div>
              <div className="flex items-center space-x-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Sugerencias
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {filteredSuggestions.map((suggestion, index) => {
                  const SuggestionIcon = suggestion.icon || Search;
                  const adjustedIndex = recentSearches.length + index;

                  return (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      onMouseEnter={() => setSelectedIndex(adjustedIndex)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${selectedIndex === adjustedIndex
                          ? 'bg-primary-50 text-primary-900'
                          : 'hover:bg-gray-50 text-gray-700'
                        } ${suggestion.highlight ? 'bg-amber-50' : ''}`}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <SuggestionIcon
                          className={`w-4 h-4 flex-shrink-0 ${suggestion.highlight ? 'text-amber-600' : 'text-gray-400'
                            }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {highlightMatch(suggestion.text, query)}
                          </p>
                          {suggestion.metadata && (
                            <p className="text-xs text-gray-500 truncate">
                              {suggestion.metadata}
                            </p>
                          )}
                        </div>
                        {suggestion.category && (
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600 flex-shrink-0">
                            {suggestion.category}
                          </span>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Results */}
          {query && filteredSuggestions.length === 0 && (
            <div className="px-4 py-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900 mb-1">
                No se encontraron resultados
              </p>
              <p className="text-xs text-gray-500">
                Intenta con otros términos de búsqueda
              </p>
            </div>
          )}
        </div>
      )}

      {/* Animations CSS */}
      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

// Helper function para resaltar coincidencias
const highlightMatch = (text: string, query: string) => {
  if (!query) return text;

  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <strong key={index} className="font-bold text-primary-600">
            {part}
          </strong>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
};

// Export también versiones especializadas
export const CompactSearchBar: React.FC<Omit<SearchBarProps, 'size'>> = (props) => (
  <SearchBar {...props} size="sm" fullWidth={false} />
);

export const GlobalSearchBar: React.FC<Omit<SearchBarProps, 'size' | 'showKeyboardShortcut'>> = (
  props
) => <SearchBar {...props} size="lg" fullWidth showKeyboardShortcut />;
