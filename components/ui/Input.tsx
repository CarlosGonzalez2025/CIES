import React, { forwardRef, useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  X,
  Check,
  AlertCircle,
  Info,
  Search,
  Loader2,
  Calendar,
  Mail,
  Lock,
  User,
  Phone,
  CreditCard,
} from 'lucide-react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  icon?: React.ElementType;
  iconPosition?: 'left' | 'right';
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;

  // Appearance
  variant?: 'outline' | 'filled' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;

  // States
  loading?: boolean;

  // Features
  clearable?: boolean;
  onClear?: () => void;
  showPasswordToggle?: boolean;
  maxLength?: number;
  showCounter?: boolean;

  // Textarea
  multiline?: boolean;
  rows?: number;
  autoResize?: boolean;

  // Validation
  showValidationIcon?: boolean;
  validateOnBlur?: boolean;
  onValidate?: (value: string) => string | undefined;

  // Styling
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(({
  label,
  error,
  success,
  helperText,
  type = 'text',
  placeholder,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  suffix,
  prefix,
  required = false,
  disabled = false,
  variant = 'outline',
  size = 'md',
  fullWidth = true,
  loading = false,
  clearable = false,
  onClear,
  showPasswordToggle = false,
  maxLength,
  showCounter = false,
  multiline = false,
  rows = 3,
  autoResize = false,
  showValidationIcon = true,
  validateOnBlur = false,
  onValidate,
  rounded = 'lg',
  value,
  onChange,
  onBlur,
  ...props
}, ref) => {
  const [internalValue, setInternalValue] = useState(value || '');
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [internalError, setInternalError] = useState<string | undefined>(error);

  const currentValue = value !== undefined ? value : internalValue;
  const characterCount = String(currentValue).length;
  const hasError = !!(error || internalError);
  const hasSuccess = !!success && !hasError;

  useEffect(() => {
    setInternalError(error);
  }, [error]);

  // Size classes
  const sizeClasses = {
    sm: 'h-9 text-sm px-3',
    md: 'h-11 text-base px-4',
    lg: 'h-14 text-lg px-5',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
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
    full: 'rounded-full',
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    if (maxLength && newValue.length > maxLength) {
      return;
    }

    setInternalValue(newValue);
    onChange?.(e as any);

    // Clear error on change
    if (internalError) {
      setInternalError(undefined);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setIsFocused(false);

    if (validateOnBlur && onValidate) {
      const validationError = onValidate(String(currentValue));
      setInternalError(validationError);
    }

    onBlur?.(e as any);
  };

  const handleClear = () => {
    setInternalValue('');
    setInternalError(undefined);
    onClear?.();
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  // Calculate paddings based on icons/prefix/suffix
  const hasLeftIcon = Icon && iconPosition === 'left';
  const hasRightIcon = Icon && iconPosition === 'right';
  const hasLeftContent = hasLeftIcon || prefix;
  const hasRightContent = hasRightIcon || suffix || clearable || showPasswordToggle || loading || (showValidationIcon && (hasError || hasSuccess));

  const paddingClasses = `
    ${hasLeftContent ? (size === 'sm' ? 'pl-10' : size === 'md' ? 'pl-12' : 'pl-14') : ''}
    ${hasRightContent ? (size === 'sm' ? 'pr-10' : size === 'md' ? 'pr-12' : 'pr-14') : ''}
  `;

  const baseInputClasses = `
    block w-full transition-all duration-200
    placeholder:text-gray-400
    disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
    focus:outline-none
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${roundedClasses[rounded]}
    ${paddingClasses}
    ${className}
  `;

  const inputElement = multiline ? (
    <textarea
      ref={ref as any}
      placeholder={placeholder}
      className={`${baseInputClasses} resize-${autoResize ? 'none' : 'vertical'} min-h-[${rows * 24}px]`}
      rows={rows}
      value={currentValue}
      onChange={handleChange}
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
      disabled={disabled}
      maxLength={maxLength}
      aria-invalid={hasError}
      aria-describedby={
        hasError ? `${props.id}-error` :
          helperText ? `${props.id}-helper` :
            undefined
      }
      {...(props as any)}
    />
  ) : (
    <input
      ref={ref as any}
      type={inputType}
      placeholder={placeholder}
      className={baseInputClasses}
      value={currentValue}
      onChange={handleChange}
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
      disabled={disabled}
      maxLength={maxLength}
      aria-invalid={hasError}
      aria-describedby={
        hasError ? `${props.id}-error` :
          helperText ? `${props.id}-helper` :
            undefined
      }
      {...props}
    />
  );

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          {loading && (
            <span className="ml-2 text-xs text-gray-500 italic">(Cargando...)</span>
          )}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon/Prefix */}
        {hasLeftContent && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {prefix || (Icon && <Icon className={`${iconSizes[size]} text-gray-400`} />)}
          </div>
        )}

        {/* Input Element */}
        {inputElement}

        {/* Right Icons/Suffix */}
        {hasRightContent && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-1">
            {/* Loading Spinner */}
            {loading && (
              <Loader2 className={`${iconSizes[size]} text-gray-400 animate-spin`} />
            )}

            {/* Validation Icons */}
            {!loading && showValidationIcon && hasError && (
              <AlertCircle className={`${iconSizes[size]} text-red-500 flex-shrink-0`} />
            )}
            {!loading && showValidationIcon && hasSuccess && (
              <Check className={`${iconSizes[size]} text-green-500 flex-shrink-0`} />
            )}

            {/* Clear Button */}
            {!loading && clearable && currentValue && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Limpiar campo"
              >
                <X className={iconSizes[size]} />
              </button>
            )}

            {/* Password Toggle */}
            {!loading && showPasswordToggle && type === 'password' && (
              <button
                type="button"
                onClick={handleTogglePassword}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <EyeOff className={iconSizes[size]} />
                ) : (
                  <Eye className={iconSizes[size]} />
                )}
              </button>
            )}

            {/* Right Icon/Suffix */}
            {suffix || (Icon && iconPosition === 'right' && !loading && (
              <Icon className={`${iconSizes[size]} text-gray-400 flex-shrink-0`} />
            ))}
          </div>
        )}
      </div>

      {/* Helper/Error/Success Text */}
      <div className="mt-1.5 min-h-[20px]">
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

      {/* Character Counter */}
      {showCounter && maxLength && (
        <div className="mt-1 text-right">
          <span className={`text-xs ${characterCount > maxLength * 0.9 ? 'text-amber-600' : 'text-gray-500'}`}>
            {characterCount} / {maxLength}
          </span>
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Specialized Input Components
export const SearchInput = forwardRef<HTMLInputElement, Omit<InputProps, 'icon' | 'type'>>(
  (props, ref) => (
    <Input
      ref={ref}
      type="search"
      icon={Search}
      placeholder="Buscar..."
      clearable
      {...props}
    />
  )
);
SearchInput.displayName = 'SearchInput';

export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'showPasswordToggle'>>(
  (props, ref) => (
    <Input
      ref={ref}
      type="password"
      icon={Lock}
      showPasswordToggle
      {...props}
    />
  )
);
PasswordInput.displayName = 'PasswordInput';

export const EmailInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'icon'>>(
  (props, ref) => (
    <Input
      ref={ref}
      type="email"
      icon={Mail}
      placeholder="ejemplo@correo.com"
      {...props}
    />
  )
);
EmailInput.displayName = 'EmailInput';

export const PhoneInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'icon'>>(
  (props, ref) => (
    <Input
      ref={ref}
      type="tel"
      icon={Phone}
      placeholder="+57 300 123 4567"
      {...props}
    />
  )
);
PhoneInput.displayName = 'PhoneInput';

export const DateInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'icon'>>(
  (props, ref) => (
    <Input
      ref={ref}
      type="date"
      icon={Calendar}
      {...props}
    />
  )
);
DateInput.displayName = 'DateInput';

// Input Group Component
export const InputGroup: React.FC<{
  children: React.ReactNode;
  label?: string;
  helperText?: string;
  error?: string;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'sm' | 'md' | 'lg';
}> = ({ children, label, helperText, error, orientation = 'vertical', spacing = 'md' }) => {
  const spacingClasses = {
    sm: orientation === 'horizontal' ? 'gap-2' : 'gap-2',
    md: orientation === 'horizontal' ? 'gap-4' : 'gap-4',
    lg: orientation === 'horizontal' ? 'gap-6' : 'gap-6',
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className={`flex ${orientation === 'horizontal' ? 'flex-row' : 'flex-col'} ${spacingClasses[spacing]}`}>
        {children}
      </div>
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Example Showcase
export const InputShowcase = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [search, setSearch] = useState('');

  const validateEmail = (value: string) => {
    if (!value) return 'Email es requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Email inválido';
    }
    return undefined;
  };

  return (
    <div className="space-y-8 p-8 bg-gray-50 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Input Component Examples</h2>

      {/* Sizes */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Tamaños</h3>
        <div className="space-y-4">
          <Input label="Small Input" size="sm" placeholder="Small size" />
          <Input label="Medium Input" size="md" placeholder="Medium size (default)" />
          <Input label="Large Input" size="lg" placeholder="Large size" />
        </div>
      </div>

      {/* Variants */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Variantes</h3>
        <div className="space-y-4">
          <Input label="Outline" variant="outline" placeholder="Outline variant" />
          <Input label="Filled" variant="filled" placeholder="Filled variant" />
          <Input label="Ghost" variant="ghost" placeholder="Ghost variant" />
        </div>
      </div>

      {/* With Icons */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Con Iconos</h3>
        <div className="space-y-4">
          <Input label="User" icon={User} placeholder="Nombre de usuario" />
          <Input label="Email" icon={Mail} iconPosition="left" placeholder="email@ejemplo.com" />
          <Input label="Phone" icon={Phone} iconPosition="right" placeholder="+57 300 123 4567" />
        </div>
      </div>

      {/* States */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Estados</h3>
        <div className="space-y-4">
          <Input
            label="Error State"
            error="Este campo es requerido"
            placeholder="Input con error"
          />
          <Input
            label="Success State"
            success="Email disponible"
            placeholder="Input exitoso"
          />
          <Input
            label="With Helper Text"
            helperText="Este es un texto de ayuda"
            placeholder="Input con ayuda"
          />
          <Input
            label="Loading State"
            loading
            placeholder="Cargando..."
          />
          <Input
            label="Disabled State"
            disabled
            value="Campo deshabilitado"
          />
        </div>
      </div>

      {/* Features */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Características</h3>
        <div className="space-y-4">
          <SearchInput
            label="Search Input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <PasswordInput
            label="Password Input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <EmailInput
            label="Email with Validation"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            validateOnBlur
            onValidate={validateEmail}
          />

          <Input
            label="With Character Counter"
            maxLength={100}
            showCounter
            placeholder="Máximo 100 caracteres"
          />

          <Input
            label="Textarea"
            multiline
            rows={4}
            placeholder="Escribe tu mensaje aquí..."
            helperText="Máximo 500 caracteres"
          />
        </div>
      </div>

      {/* Prefix & Suffix */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Prefix & Suffix</h3>
        <div className="space-y-4">
          <Input
            label="Price"
            prefix={<span className="text-gray-500">$</span>}
            placeholder="0.00"
            type="number"
          />

          <Input
            label="Website"
            prefix={<span className="text-gray-500">https://</span>}
            placeholder="ejemplo.com"
          />

          <Input
            label="Weight"
            suffix={<span className="text-gray-500">kg</span>}
            placeholder="0"
            type="number"
          />
        </div>
      </div>

      {/* Input Group */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Input Group</h3>
        <InputGroup label="Nombre Completo" orientation="horizontal">
          <Input placeholder="Nombre" />
          <Input placeholder="Apellido" />
        </InputGroup>
      </div>

      {/* Specialized Inputs */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Inputs Especializados</h3>
        <div className="space-y-4">
          <EmailInput label="Email Address" required />
          <PhoneInput label="Phone Number" />
          <DateInput label="Birth Date" />
          <PasswordInput label="Password" required helperText="Mínimo 8 caracteres" />
        </div>
      </div>
    </div>
  );
};
