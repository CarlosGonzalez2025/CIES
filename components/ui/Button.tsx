import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost' | 'link' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
  rounded?: 'default' | 'full' | 'square';
  shadow?: boolean;
  gradient?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Variant styles configuration
const VARIANT_STYLES = {
  primary: 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white border-transparent focus:ring-primary-500',
  secondary: 'bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white border-transparent focus:ring-gray-500',
  success: 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white border-transparent focus:ring-green-500',
  danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white border-transparent focus:ring-red-500',
  warning: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white border-transparent focus:ring-amber-500',
  ghost: 'bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-700 border-transparent focus:ring-gray-500',
  link: 'bg-transparent hover:underline text-primary-600 hover:text-primary-700 border-transparent focus:ring-0 shadow-none',
  outline: 'bg-transparent hover:bg-primary-50 active:bg-primary-100 text-primary-600 border-primary-600 hover:border-primary-700 focus:ring-primary-500',
};

// Gradient styles (optional enhancement)
const GRADIENT_STYLES = {
  primary: 'bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700',
  secondary: 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800',
  success: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700',
  danger: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700',
  warning: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700',
  ghost: '',
  link: '',
  outline: '',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled = false,
      icon: Icon,
      iconPosition = 'left',
      rounded = 'default',
      shadow = true,
      gradient = false,
      className = '',
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Size classes
    const sizeClasses = {
      xs: 'px-2.5 py-1.5 text-xs gap-1.5',
      sm: 'px-3 py-2 text-sm gap-2',
      md: 'px-4 py-2.5 text-sm gap-2',
      lg: 'px-5 py-3 text-base gap-2.5',
      xl: 'px-6 py-3.5 text-lg gap-3',
    };

    const iconSizes = {
      xs: 'w-3 h-3',
      sm: 'w-3.5 h-3.5',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
      xl: 'w-6 h-6',
    };

    // Rounded classes
    const roundedClasses = {
      default: 'rounded-lg',
      full: 'rounded-full',
      square: 'rounded-none',
    };

    // Base classes
    const baseClasses = `
      inline-flex items-center justify-center font-medium
      border transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      ${sizeClasses[size]}
      ${roundedClasses[rounded]}
      ${gradient && variant !== 'ghost' && variant !== 'link' && variant !== 'outline'
        ? GRADIENT_STYLES[variant]
        : VARIANT_STYLES[variant]
      }
      ${shadow && variant !== 'ghost' && variant !== 'link' ? 'shadow-md hover:shadow-lg' : ''}
      ${fullWidth ? 'w-full' : ''}
      ${!disabled && !loading ? 'active:scale-95' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={baseClasses}
        {...props}
      >
        {/* Loading spinner (left) */}
        {loading && iconPosition === 'left' && (
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
        )}

        {/* Left icon */}
        {!loading && Icon && iconPosition === 'left' && (
          <Icon className={`${iconSizes[size]} flex-shrink-0`} />
        )}

        {/* Button content */}
        {children && <span className="truncate">{children}</span>}

        {/* Right icon */}
        {!loading && Icon && iconPosition === 'right' && (
          <Icon className={`${iconSizes[size]} flex-shrink-0`} />
        )}

        {/* Loading spinner (right) */}
        {loading && iconPosition === 'right' && (
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Icon-only Button variant
export const IconButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'children'> & { icon: React.ComponentType<{ className?: string }>; 'aria-label': string }
>(({ icon: Icon, size = 'md', rounded = 'default', ...props }, ref) => {
  const iconSizes = {
    xs: 'p-1.5',
    sm: 'p-2',
    md: 'p-2.5',
    lg: 'p-3',
    xl: 'p-3.5',
  };

  const iconOnlySizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };

  return (
    <Button
      ref={ref}
      size={size}
      rounded={rounded}
      className={`${iconSizes[size]} ${props.className || ''}`}
      {...props}
    >
      <Icon className={iconOnlySizes[size]} />
    </Button>
  );
});

IconButton.displayName = 'IconButton';

// Button Group component
export const ButtonGroup: React.FC<{
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'sm' | 'md';
  fullWidth?: boolean;
  className?: string;
}> = ({ children, orientation = 'horizontal', spacing = 'none', fullWidth = false, className = '' }) => {
  const spacingClasses = {
    none: '',
    sm: orientation === 'horizontal' ? 'gap-2' : 'gap-2',
    md: orientation === 'horizontal' ? 'gap-3' : 'gap-3',
  };

  // Apply rounded corners only to first and last buttons when spacing is 'none'
  const childArray = React.Children.toArray(children);
  const enhancedChildren = spacing === 'none'
    ? childArray.map((child, index) => {
      if (!React.isValidElement(child)) return child;

      let roundedClass = '';
      if (orientation === 'horizontal') {
        if (index === 0) roundedClass = 'rounded-r-none';
        else if (index === childArray.length - 1) roundedClass = 'rounded-l-none';
        else roundedClass = 'rounded-none';
      } else {
        if (index === 0) roundedClass = 'rounded-b-none';
        else if (index === childArray.length - 1) roundedClass = 'rounded-t-none';
        else roundedClass = 'rounded-none';
      }

      return React.cloneElement(child as React.ReactElement<any>, {
        className: `${(child.props as any).className || ''} ${roundedClass}`,
      });
    })
    : children;

  return (
    <div
      className={`
        inline-flex ${orientation === 'horizontal' ? 'flex-row' : 'flex-col'}
        ${spacingClasses[spacing]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {enhancedChildren}
    </div>
  );
};

// Example showcase component (can be removed in production)
export const ButtonShowcase = () => {
  return (
    <div className="space-y-8 p-8 bg-gray-50">
      {/* Variants */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Variantes</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="success">Success</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Tamaños</h3>
        <div className="flex items-center flex-wrap gap-3">
          <Button size="xs">Extra Small</Button>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="xl">Extra Large</Button>
        </div>
      </div>

      {/* States */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Estados</h3>
        <div className="flex flex-wrap gap-3">
          <Button>Normal</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </div>
      </div>

      {/* With Icons */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Con Iconos</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" icon={Loader2}>Left Icon</Button>
          <Button variant="success" icon={Loader2} iconPosition="right">Right Icon</Button>
          <IconButton variant="primary" icon={Loader2} aria-label="Icon only" />
        </div>
      </div>

      {/* Rounded */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Bordes Redondeados</h3>
        <div className="flex flex-wrap gap-3">
          <Button rounded="default">Default</Button>
          <Button rounded="full">Full</Button>
          <Button rounded="square">Square</Button>
        </div>
      </div>

      {/* Gradient */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Con Gradiente</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" gradient>Primary</Button>
          <Button variant="success" gradient>Success</Button>
          <Button variant="danger" gradient>Danger</Button>
        </div>
      </div>

      {/* Full Width */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Ancho Completo</h3>
        <Button variant="primary" fullWidth>Full Width Button</Button>
      </div>

      {/* Button Group */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Grupo de Botones</h3>
        <ButtonGroup>
          <Button variant="outline">Primero</Button>
          <Button variant="outline">Segundo</Button>
          <Button variant="outline">Tercero</Button>
        </ButtonGroup>
      </div>

      {/* Button Group with Spacing */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Grupo con Espaciado</h3>
        <ButtonGroup spacing="md">
          <Button variant="primary">Primero</Button>
          <Button variant="secondary">Segundo</Button>
          <Button variant="success">Tercero</Button>
        </ButtonGroup>
      </div>

      {/* Vertical Button Group */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Grupo Vertical</h3>
        <ButtonGroup orientation="vertical" className="w-64">
          <Button variant="outline" fullWidth>Opción 1</Button>
          <Button variant="outline" fullWidth>Opción 2</Button>
          <Button variant="outline" fullWidth>Opción 3</Button>
        </ButtonGroup>
      </div>
    </div>
  );
};
