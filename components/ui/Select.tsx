import React, { forwardRef, useState, useRef, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  X,
  Check,
  Search,
  Loader2,
  AlertCircle,
  Tag as TagIcon,
} from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  group?: string;
  metadata?: any;
}

interface BaseSelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;

  // Appearance
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'filled' | 'ghost';
  fullWidth?: boolean;

  // Validation
  showValidationIcon?: boolean;

  // Callbacks
  onSearch?: (query: string) => void;
}

interface NativeSelectProps extends BaseSelectProps, Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[];
  native?: true;
}

interface CustomSelectProps extends BaseSelectProps {
  options: SelectOption[];
  value?: string | number | (string | number)[];
  onChange?: (value: any) => void;
  native?: false;

  // Custom features
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  maxSelected?: number;
  closeOnSelect?: boolean;

  // Rendering
  renderOption?: (option: SelectOption) => React.ReactNode;
  renderSelected?: (option: SelectOption) => React.ReactNode;

  // Virtual scrolling
  virtualScroll?: boolean;
  maxHeight?: number;

  // Async
  async?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

type SelectProps = NativeSelectProps | CustomSelectProps;

// Native Select Component
export const Select = forwardRef<HTMLSelectElement, SelectProps>((props, ref) => {
  const {
    label,
    error,
    helperText,
    options = [],
    placeholder = 'Seleccionar...',
    required = false,
    disabled = false,
    loading = false,
    size = 'md',
    variant = 'outline',
    fullWidth = true,
    showValidationIcon = true,
    className = '',
  } = props;

  // Size classes
  const sizeClasses = {
    sm: 'h-9 text-sm px-3',
    md: 'h-11 text-base px-4',
    lg: 'h-14 text-lg px-5',
  };

  // Variant classes
  const variantClasses = {
    outline: `border-2 bg-white ${error ? 'border-red-500' : 'border-gray-300'} focus:border-primary-500 focus:ring-4 focus:ring-primary-100`,
    filled: `border-2 border-transparent ${error ? 'bg-red-50' : 'bg-gray-100'} focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-100`,
    ghost: `border-2 border-transparent bg-transparent hover:bg-gray-50 focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100`,
  };

  if (props.native !== false) {
    // Group options by group property
    const groupedOptions = options.reduce((acc, option) => {
      const group = option.group || '__default__';
      if (!acc[group]) acc[group] = [];
      acc[group].push(option);
      return acc;
    }, {} as Record<string, SelectOption[]>);

    const hasGroups = Object.keys(groupedOptions).length > 1 || !groupedOptions.__default__;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            disabled={disabled || loading}
            className={`
              block w-full rounded-lg transition-all appearance-none
              focus:outline-none pr-10
              disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
              ${sizeClasses[size]}
              ${variantClasses[variant]}
              ${className}
            `}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
            {...(props as NativeSelectProps)}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {hasGroups ? (
              Object.entries(groupedOptions).map(([group, groupOptions]) => {
                if (group === '__default__') {
                  return groupOptions.map((option) => (
                    <option key={option.value} value={option.value} disabled={option.disabled}>
                      {option.label}
                    </option>
                  ));
                }
                return (
                  <optgroup key={group} label={group}>
                    {groupOptions.map((option) => (
                      <option key={option.value} value={option.value} disabled={option.disabled}>
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                );
              })
            ) : (
              options.map((option) => (
                <option key={option.value} value={option.value} disabled={option.disabled}>
                  {option.label}
                </option>
              ))
            )}
          </select>

          {/* Icons */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none gap-2">
            {loading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
            {!loading && showValidationIcon && error && (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Helper/Error Text */}
        <div className="mt-1.5 min-h-[20px]">
          {error && (
            <p id={`${props.id}-error`} className="text-sm text-red-600 flex items-start gap-1">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </p>
          )}
          {!error && helperText && (
            <p id={`${props.id}-helper`} className="text-sm text-gray-500">
              {helperText}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Render Custom Select
  return <CustomSelect {...(props as CustomSelectProps)} />;
});

Select.displayName = 'Select';

// Custom Select Component
const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  error,
  helperText,
  options = [],
  value,
  onChange,
  placeholder = 'Seleccionar...',
  required = false,
  disabled = false,
  loading = false,
  size = 'md',
  variant = 'outline',
  fullWidth = true,
  showValidationIcon = true,
  searchable = false,
  clearable = false,
  multiple = false,
  maxSelected,
  closeOnSelect = true,
  renderOption,
  renderSelected,
  onSearch,
  async: isAsync = false,
  onLoadMore,
  hasMore = false,
  maxHeight = 300,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Normalize value to array for easier handling
  const selectedValues = Array.isArray(value) ? value : value !== undefined ? [value] : [];
  const selectedOptions = options.filter((opt) => selectedValues.includes(opt.value));

  // Filter options based on search
  const filteredOptions = searchQuery
    ? options.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : options;

  // Group filtered options
  const groupedOptions = filteredOptions.reduce((acc, option) => {
    const group = option.group || '__default__';
    if (!acc[group]) acc[group] = [];
    acc[group].push(option);
    return acc;
  }, {} as Record<string, SelectOption[]>);

  const hasGroups = Object.keys(groupedOptions).length > 1 || !groupedOptions.__default__;

  // Size classes
  const sizeClasses = {
    sm: 'min-h-[36px] text-sm px-3 py-1',
    md: 'min-h-[44px] text-base px-4 py-2',
    lg: 'min-h-[56px] text-lg px-5 py-3',
  };

  const variantClasses = {
    outline: `border-2 bg-white ${error ? 'border-red-500' : 'border-gray-300'} ${isOpen ? 'border-primary-500 ring-4 ring-primary-100' : ''}`,
    filled: `border-2 border-transparent ${error ? 'bg-red-50' : 'bg-gray-100'} ${isOpen ? 'bg-white border-primary-500 ring-4 ring-primary-100' : ''}`,
    ghost: `border-2 border-transparent bg-transparent hover:bg-gray-50 ${isOpen ? 'bg-white border-gray-300 ring-4 ring-gray-100' : ''}`,
  };

  // Handle option selection
  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;

    if (multiple) {
      const isSelected = selectedValues.includes(option.value);
      let newValue: (string | number)[];

      if (isSelected) {
        newValue = selectedValues.filter((v) => v !== option.value);
      } else {
        if (maxSelected && selectedValues.length >= maxSelected) {
          return;
        }
        newValue = [...selectedValues, option.value];
      }

      onChange?.(newValue);

      if (!closeOnSelect) {
        return;
      }
    } else {
      onChange?.(option.value);
    }

    if (closeOnSelect) {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(multiple ? [] : '');
    setSearchQuery('');
  };

  // Handle remove tag
  const handleRemoveTag = (optionValue: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!multiple) return;
    const newValue = selectedValues.filter((v) => v !== optionValue);
    onChange?.(newValue);
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Handle search
  useEffect(() => {
    if (searchQuery && onSearch) {
      const timer = setTimeout(() => {
        onSearch(searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, onSearch]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        if (!isOpen) {
          e.preventDefault();
          setIsOpen(true);
        } else if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          e.preventDefault();
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        break;

      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.querySelector(
        `[data-index="${highlightedIndex}"]`
      );
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const showClearButton = clearable && selectedValues.length > 0 && !disabled;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} relative`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Select Button */}
      <div
        className={`
          relative rounded-lg cursor-pointer transition-all
          focus:outline-none
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${disabled ? 'opacity-50' : ''}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-disabled={disabled}
      >
        {/* Selected Values / Placeholder */}
        <div className="flex items-center flex-wrap gap-1 pr-10">
          {selectedOptions.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : multiple ? (
            selectedOptions.map((option) => (
              <span
                key={option.value}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 text-primary-800 rounded text-sm font-medium"
              >
                {renderSelected ? renderSelected(option) : option.label}
                <button
                  onClick={(e) => handleRemoveTag(option.value, e)}
                  className="hover:bg-primary-200 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${option.label}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="truncate">
              {renderSelected ? renderSelected(selectedOptions[0]) : selectedOptions[0].label}
            </span>
          )}
        </div>

        {/* Icons */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2 pointer-events-none">
          {loading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
          {!loading && showValidationIcon && error && (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
          {showClearButton && (
            <button
              onClick={handleClear}
              className="pointer-events-auto hover:bg-gray-200 rounded-full p-1 transition-colors"
              aria-label="Clear selection"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''
              }`}
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl overflow-hidden animate-slide-down"
          role="listbox"
          aria-multiselectable={multiple}
        >
          {/* Search */}
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div
            ref={listRef}
            className="overflow-y-auto"
            style={{ maxHeight: `${maxHeight}px` }}
          >
            {filteredOptions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">No se encontraron resultados</p>
              </div>
            ) : hasGroups ? (
              Object.entries(groupedOptions).map(([group, groupOptions]) => (
                <div key={group}>
                  {group !== '__default__' && (
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                      {group}
                    </div>
                  )}
                  {groupOptions.map((option, index) => {
                    const isSelected = selectedValues.includes(option.value);
                    const globalIndex = filteredOptions.indexOf(option);
                    const isHighlighted = globalIndex === highlightedIndex;
                    const Icon = option.icon;

                    return (
                      <div
                        key={option.value}
                        data-index={globalIndex}
                        className={`
                          flex items-center justify-between px-3 py-2 cursor-pointer transition-colors
                          ${isSelected ? 'bg-primary-50 text-primary-900' : 'text-gray-900'}
                          ${isHighlighted ? 'bg-gray-100' : ''}
                          ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
                        `}
                        onClick={() => handleSelect(option)}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={option.disabled}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {Icon && <Icon className="w-4 h-4 flex-shrink-0 text-gray-400" />}
                          <div className="flex-1 min-w-0">
                            {renderOption ? (
                              renderOption(option)
                            ) : (
                              <>
                                <p className="text-sm font-medium truncate">{option.label}</p>
                                {option.description && (
                                  <p className="text-xs text-gray-500 truncate">{option.description}</p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-primary-600 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = selectedValues.includes(option.value);
                const isHighlighted = index === highlightedIndex;
                const Icon = option.icon;

                return (
                  <div
                    key={option.value}
                    data-index={index}
                    className={`
                      flex items-center justify-between px-3 py-2 cursor-pointer transition-colors
                      ${isSelected ? 'bg-primary-50 text-primary-900' : 'text-gray-900'}
                      ${isHighlighted ? 'bg-gray-100' : ''}
                      ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
                    `}
                    onClick={() => handleSelect(option)}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {Icon && <Icon className="w-4 h-4 flex-shrink-0 text-gray-400" />}
                      <div className="flex-1 min-w-0">
                        {renderOption ? (
                          renderOption(option)
                        ) : (
                          <>
                            <p className="text-sm font-medium truncate">{option.label}</p>
                            {option.description && (
                              <p className="text-xs text-gray-500 truncate">{option.description}</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-primary-600 flex-shrink-0" />
                    )}
                  </div>
                );
              })
            )}

            {/* Load More */}
            {isAsync && hasMore && (
              <button
                onClick={onLoadMore}
                className="w-full px-3 py-2 text-sm text-primary-600 hover:bg-gray-50 transition-colors"
              >
                Cargar más...
              </button>
            )}
          </div>
        </div>
      )}

      {/* Helper/Error Text */}
      <div className="mt-1.5 min-h-[20px]">
        {error && (
          <p className="text-sm text-red-600 flex items-start gap-1">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </p>
        )}
        {!error && helperText && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>

      {/* Animation CSS */}
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
      `}</style>
    </div>
  );
};

// Example Showcase
export const SelectShowcase = () => {
  const [singleValue, setSingleValue] = useState('');
  const [multiValue, setMultiValue] = useState<(string | number)[]>([]);
  const [searchableValue, setSearchableValue] = useState('');

  const basicOptions: SelectOption[] = [
    { value: '1', label: 'Opción 1' },
    { value: '2', label: 'Opción 2' },
    { value: '3', label: 'Opción 3' },
    { value: '4', label: 'Opción 4', disabled: true },
  ];

  const groupedOptions: SelectOption[] = [
    { value: 'co', label: 'Colombia', group: 'Latinoamérica' },
    { value: 'mx', label: 'México', group: 'Latinoamérica' },
    { value: 'ar', label: 'Argentina', group: 'Latinoamérica' },
    { value: 'us', label: 'Estados Unidos', group: 'Norteamérica' },
    { value: 'ca', label: 'Canadá', group: 'Norteamérica' },
    { value: 'es', label: 'España', group: 'Europa' },
    { value: 'fr', label: 'Francia', group: 'Europa' },
  ];

  const iconOptions: SelectOption[] = [
    { value: 'all', label: 'Todos', icon: TagIcon, description: 'Ver todos los elementos' },
    { value: 'active', label: 'Activos', icon: Check, description: 'Solo elementos activos' },
    { value: 'inactive', label: 'Inactivos', icon: X, description: 'Solo elementos inactivos' },
  ];

  return (
    <div className="space-y-8 p-8 bg-gray-50 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Select Component Examples</h2>

      {/* Native Select */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Native Select</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Select
            label="Select Básico"
            options={basicOptions}
            placeholder="Selecciona una opción"
            native
          />
          <Select
            label="Con Grupos"
            options={groupedOptions}
            placeholder="Selecciona un país"
            native
          />
        </div>
      </div>

      {/* Custom Select */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Custom Select</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Select
            label="Custom Select"
            options={basicOptions}
            value={singleValue}
            onChange={setSingleValue}
            placeholder="Selecciona una opción"
            clearable
          />
          <Select
            label="Con Búsqueda"
            options={groupedOptions}
            value={searchableValue}
            onChange={setSearchableValue}
            placeholder="Buscar país..."
            searchable
            clearable
          />
        </div>
      </div>

      {/* Multi-Select */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Multi-Select</h3>
        <Select
          label="Selección Múltiple"
          options={groupedOptions}
          value={multiValue}
          onChange={setMultiValue}
          placeholder="Selecciona países..."
          multiple
          searchable
          closeOnSelect={false}
          helperText="Puedes seleccionar múltiples opciones"
        />
      </div>

      {/* With Icons */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Con Iconos y Descripciones</h3>
        <Select
          label="Estado del Filtro"
          options={iconOptions}
          placeholder="Seleccionar filtro..."
        />
      </div>

      {/* States */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Estados</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Select
            label="Con Error"
            options={basicOptions}
            error="Este campo es requerido"
          />
          <Select
            label="Cargando"
            options={basicOptions}
            loading
          />
          <Select
            label="Deshabilitado"
            options={basicOptions}
            disabled
            value="1"
          />
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Tamaños</h3>
        <div className="space-y-4">
          <Select label="Small" options={basicOptions} size="sm" />
          <Select label="Medium (Default)" options={basicOptions} size="md" />
          <Select label="Large" options={basicOptions} size="lg" />
        </div>
      </div>
    </div>
  );
};
