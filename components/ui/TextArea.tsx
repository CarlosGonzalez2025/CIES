import React, { forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import {
  AlertCircle,
  Check,
  Info,
  Copy,
  Maximize2,
  Minimize2,
  Type,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';

interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;

  // Appearance
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'filled' | 'ghost';
  fullWidth?: boolean;

  // Features
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
  showCharCount?: boolean;
  showWordCount?: boolean;
  copyable?: boolean;
  clearable?: boolean;

  // Resize control
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';

  // Validation
  showValidationIcon?: boolean;
  validateOnBlur?: boolean;
  onValidate?: (value: string) => string | undefined;

  // Templates
  templates?: Array<{
    label: string;
    value: string;
  }>;

  // Advanced
  markdownPreview?: boolean;
  loading?: boolean;
  expandable?: boolean;

  // Styling
  rounded?: 'none' | 'sm' | 'md' | 'lg';
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  label,
  error,
  success,
  helperText,
  placeholder,
  rows: initialRows = 4,
  className = '',
  required = false,
  disabled = false,
  maxLength,
  value,
  onChange,
  onBlur,
  size = 'md',
  variant = 'outline',
  fullWidth = true,
  autoResize = false,
  minRows = 3,
  maxRows = 10,
  showCharCount = false,
  showWordCount = false,
  copyable = false,
  clearable = false,
  resize = 'vertical',
  showValidationIcon = true,
  validateOnBlur = false,
  onValidate,
  templates,
  markdownPreview = false,
  loading = false,
  expandable = false,
  rounded = 'lg',
  ...props
}, ref) => {
  const [internalValue, setInternalValue] = useState(value || '');
  const [internalError, setInternalError] = useState<string | undefined>(error);
  const [isFocused, setIsFocused] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const combinedRef = (ref as any) || textareaRef;

  const currentValue = value !== undefined ? value : internalValue;
  const characterCount = String(currentValue).length;
  const wordCount = String(currentValue).trim().split(/\s+/).filter(Boolean).length;
  const hasError = !!(error || internalError);
  const hasSuccess = !!success && !hasError;

  useEffect(() => {
    setInternalError(error);
  }, [error]);

  // Auto-resize functionality
  useEffect(() => {
    if (autoResize && combinedRef.current) {
      const textarea = combinedRef.current;
      textarea.style.height = 'auto';

      const scrollHeight = textarea.scrollHeight;
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
      const minHeight = minRows * lineHeight;
      const maxHeight = maxRows * lineHeight;

      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  }, [currentValue, autoResize, minRows, maxRows]);

  // Size classes
  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'text-base px-4 py-3',
    lg: 'text-lg px-5 py-4',
  };

  // Variant classes
  const variantClasses = {
    outline: `
      border-2 bg-white
      ${hasError ? 'border-red-500' : hasSuccess ? 'border-green-500' : 'border-gray-300'}
      ${isFocused && !hasError ? 'border-primary-500 ring-4 ring-primary-100' : ''}
      ${isFocused && hasError ? 'border-red-500 ring-4 ring-red-100' : ''}
    `,
    filled: `
      border-2 border-transparent
      ${hasError ? 'bg-red-50' : hasSuccess ? 'bg-green-50' : 'bg-gray-100'}
      ${isFocused ? 'bg-white border-primary-500 ring-4 ring-primary-100' : ''}
    `,
    ghost: `
      border-2 border-transparent bg-transparent
      hover:bg-gray-50
      ${isFocused ? 'bg-white border-gray-300 ring-4 ring-gray-100' : ''}
      ${hasError ? 'border-red-300 bg-red-50' : ''}
    `,
  };

  // Rounded classes
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
  };

  // Resize classes
  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize',
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    if (maxLength && newValue.length > maxLength) {
      return;
    }

    setInternalValue(newValue);
    onChange?.(e);

    if (internalError) {
      setInternalError(undefined);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);

    if (validateOnBlur && onValidate) {
      const validationError = onValidate(String(currentValue));
      setInternalError(validationError);
    }

    onBlur?.(e);
  };

  const handleClear = () => {
    setInternalValue('');
    setInternalError(undefined);
    if (onChange) {
      onChange({
        target: { value: '' },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(currentValue));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTemplateSelect = (template: string) => {
    setInternalValue(template);
    if (onChange) {
      onChange({
        target: { value: template },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {/* Label & Actions */}
      {(label || templates || markdownPreview) && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {label && (
              <label className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            {loading && (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Templates Dropdown */}
            {templates && templates.length > 0 && (
              <div className="relative group">
                <button
                  type="button"
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  <Type className="w-3 h-3" />
                  Plantillas
                </button>
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  {templates.map((template, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleTemplateSelect(template.value)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {template.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Markdown Preview Toggle */}
            {markdownPreview && (
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs text-gray-600 hover:text-gray-700 font-medium flex items-center gap-1"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="w-3 h-3" />
                    Editar
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" />
                    Vista previa
                  </>
                )}
              </button>
            )}

            {/* Expand Toggle */}
            {expandable && (
              <button
                type="button"
                onClick={toggleExpand}
                className="text-xs text-gray-600 hover:text-gray-700 font-medium"
                aria-label={isExpanded ? 'Contraer' : 'Expandir'}
              >
                {isExpanded ? (
                  <Minimize2 className="w-3 h-3" />
                ) : (
                  <Maximize2 className="w-3 h-3" />
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Textarea Container */}
      <div className="relative">
        {showPreview ? (
          // Markdown Preview
          <div
            className={`
              block w-full transition-all
              ${sizeClasses[size]}
              ${variantClasses[variant]}
              ${roundedClasses[rounded]}
              min-h-[100px]
              prose prose-sm max-w-none
            `}
            dangerouslySetInnerHTML={{ __html: String(currentValue).replace(/\n/g, '<br>') }}
          />
        ) : (
          // Textarea
          <textarea
            ref={combinedRef}
            value={currentValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled || loading}
            maxLength={maxLength}
            rows={autoResize ? minRows : initialRows}
            className={`
              block w-full transition-all
              focus:outline-none
              disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
              ${sizeClasses[size]}
              ${variantClasses[variant]}
              ${roundedClasses[rounded]}
              ${autoResize ? 'overflow-hidden' : resizeClasses[resize]}
              ${isExpanded ? 'min-h-[400px]' : ''}
              ${className}
            `}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${props.id}-error` :
                helperText ? `${props.id}-helper` :
                  undefined
            }
            {...props}
          />
        )}

        {/* Action Buttons (Top Right) */}
        {(copyable || clearable) && currentValue && !disabled && (
          <div className="absolute top-3 right-3 flex items-center gap-1">
            {copyable && (
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                aria-label="Copiar"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            )}

            {clearable && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                aria-label="Limpiar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer: Helper Text / Error / Counters */}
      <div className="mt-1.5 flex items-start justify-between gap-4">
        {/* Left: Helper/Error/Success */}
        <div className="flex-1 min-h-[20px]">
          {hasError && (
            <p id={`${props.id}-error`} className="text-sm text-red-600 flex items-start gap-1">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error || internalError}</span>
            </p>
          )}
          {!hasError && hasSuccess && (
            <p className="text-sm text-green-600 flex items-start gap-1">
              <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </p>
          )}
          {!hasError && !hasSuccess && helperText && (
            <p id={`${props.id}-helper`} className="text-sm text-gray-500 flex items-start gap-1">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{helperText}</span>
            </p>
          )}
        </div>

        {/* Right: Counters */}
        {(showCharCount || showWordCount) && (
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {showWordCount && (
              <span>
                {wordCount} palabra{wordCount !== 1 ? 's' : ''}
              </span>
            )}
            {showCharCount && (
              <span className={maxLength && characterCount > maxLength * 0.9 ? 'text-amber-600 font-medium' : ''}>
                {characterCount}
                {maxLength && ` / ${maxLength}`}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

TextArea.displayName = 'TextArea';

// Rich TextArea with Mentions
export const RichTextArea = forwardRef<HTMLTextAreaElement, TextAreaProps & {
  mentions?: Array<{ id: string; display: string }>;
  onMention?: (mention: string) => void;
}>((props, ref) => {
  // This would implement @mention functionality
  // For now, just render regular TextArea
  return <TextArea {...props} ref={ref} />;
});

RichTextArea.displayName = 'RichTextArea';

// Example Showcase
export const TextAreaShowcase = () => {
  const [value, setValue] = useState('');
  const [autoResizeValue, setAutoResizeValue] = useState('');
  const [markdownValue, setMarkdownValue] = useState('');

  const templates = [
    { label: 'Agradecimiento', value: 'Gracias por tu mensaje. Nos pondremos en contacto pronto.' },
    { label: 'Disculpa', value: 'Lamentamos los inconvenientes. Estamos trabajando en solucionarlo.' },
    { label: 'Bienvenida', value: '¡Bienvenido! Estamos encantados de tenerte aquí.' },
  ];

  const validateContent = (value: string) => {
    if (value.length < 10) {
      return 'El mensaje debe tener al menos 10 caracteres';
    }
    return undefined;
  };

  return (
    <div className="space-y-8 p-8 bg-gray-50 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">TextArea Component Examples</h2>

      {/* Basic */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Básico</h3>
        <div className="space-y-4">
          <TextArea
            label="Mensaje"
            placeholder="Escribe tu mensaje aquí..."
            helperText="Comparte tus comentarios o sugerencias"
          />
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Tamaños</h3>
        <div className="space-y-4">
          <TextArea label="Small" size="sm" placeholder="Small textarea" />
          <TextArea label="Medium (Default)" size="md" placeholder="Medium textarea" />
          <TextArea label="Large" size="lg" placeholder="Large textarea" />
        </div>
      </div>

      {/* Variants */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Variantes</h3>
        <div className="space-y-4">
          <TextArea label="Outline" variant="outline" placeholder="Outline variant" />
          <TextArea label="Filled" variant="filled" placeholder="Filled variant" />
          <TextArea label="Ghost" variant="ghost" placeholder="Ghost variant" />
        </div>
      </div>

      {/* Auto-resize */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Auto-resize</h3>
        <TextArea
          label="Descripción"
          value={autoResizeValue}
          onChange={(e) => setAutoResizeValue(e.target.value)}
          placeholder="Escribe y observa cómo crece automáticamente..."
          autoResize
          minRows={3}
          maxRows={10}
          helperText="Se expande automáticamente hasta 10 filas"
        />
      </div>

      {/* Character Counter */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Con Contadores</h3>
        <div className="space-y-4">
          <TextArea
            label="Mensaje"
            placeholder="Escribe tu mensaje..."
            showCharCount
            maxLength={200}
            helperText="Máximo 200 caracteres"
          />
          <TextArea
            label="Descripción"
            placeholder="Escribe tu descripción..."
            showWordCount
            showCharCount
            helperText="Contador de palabras y caracteres"
          />
        </div>
      </div>

      {/* With Templates */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Con Plantillas</h3>
        <TextArea
          label="Respuesta"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Escribe o selecciona una plantilla..."
          templates={templates}
          helperText="Usa las plantillas predefinidas"
        />
      </div>

      {/* Markdown Preview */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Vista Previa Markdown</h3>
        <TextArea
          label="Contenido"
          value={markdownValue}
          onChange={(e) => setMarkdownValue(e.target.value)}
          placeholder="Escribe en markdown..."
          markdownPreview
          autoResize
          minRows={5}
          helperText="Alterna entre edición y vista previa"
        />
      </div>

      {/* Features */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Características</h3>
        <div className="space-y-4">
          <TextArea
            label="Copiable"
            defaultValue="Este contenido se puede copiar al portapapeles"
            copyable
            helperText="Click en el icono para copiar"
          />

          <TextArea
            label="Clearable"
            placeholder="Escribe algo para ver el botón limpiar..."
            clearable
            helperText="Click en X para limpiar"
          />

          <TextArea
            label="Expandible"
            placeholder="Click en el icono para expandir..."
            expandable
            helperText="Se puede expandir a pantalla completa"
          />
        </div>
      </div>

      {/* States */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Estados</h3>
        <div className="space-y-4">
          <TextArea
            label="Con Error"
            error="Este campo es requerido"
            placeholder="Campo con error"
          />

          <TextArea
            label="Con Success"
            success="Mensaje guardado correctamente"
            defaultValue="Contenido guardado"
          />

          <TextArea
            label="Validación al Blur"
            placeholder="Escribe al menos 10 caracteres..."
            validateOnBlur
            onValidate={validateContent}
            helperText="La validación ocurre al perder el foco"
          />

          <TextArea
            label="Cargando"
            loading
            disabled
            placeholder="Cargando datos..."
          />

          <TextArea
            label="Deshabilitado"
            disabled
            value="Este textarea está deshabilitado"
          />
        </div>
      </div>

      {/* Resize Control */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Control de Resize</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <TextArea label="No Resize" resize="none" placeholder="No se puede redimensionar" />
          <TextArea label="Vertical" resize="vertical" placeholder="Solo vertical" />
          <TextArea label="Horizontal" resize="horizontal" placeholder="Solo horizontal" />
          <TextArea label="Both" resize="both" placeholder="Ambas direcciones" />
        </div>
      </div>
    </div>
  );
};
