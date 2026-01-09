import React, { useState } from 'react';
import {
  X,
  Check,
  AlertCircle,
  Info,
  AlertTriangle,
  Star,
  Zap,
  Crown,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  ChevronRight,
  Clock,
} from 'lucide-react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'pink';
  style?: 'solid' | 'subtle' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
  dot?: boolean;
  pulse?: boolean;
  count?: number;
  maxCount?: number;
  dismissible?: boolean;
  onDismiss?: () => void;
  onClick?: () => void;
  interactive?: boolean;
  rounded?: 'default' | 'full' | 'square';
  uppercase?: boolean;
  className?: string;
  tooltip?: string;
}

// Configuración de colores por variante y estilo
const VARIANT_STYLES = {
  solid: {
    default: 'bg-gray-600 text-white border-transparent',
    primary: 'bg-primary-600 text-white border-transparent',
    success: 'bg-green-600 text-white border-transparent',
    warning: 'bg-amber-600 text-white border-transparent',
    danger: 'bg-red-600 text-white border-transparent',
    info: 'bg-blue-600 text-white border-transparent',
    purple: 'bg-purple-600 text-white border-transparent',
    pink: 'bg-pink-600 text-white border-transparent',
  },
  subtle: {
    default: 'bg-gray-100 text-gray-800 border-transparent',
    primary: 'bg-primary-100 text-primary-800 border-transparent',
    success: 'bg-green-100 text-green-800 border-transparent',
    warning: 'bg-amber-100 text-amber-800 border-transparent',
    danger: 'bg-red-100 text-red-800 border-transparent',
    info: 'bg-blue-100 text-blue-800 border-transparent',
    purple: 'bg-purple-100 text-purple-800 border-transparent',
    pink: 'bg-pink-100 text-pink-800 border-transparent',
  },
  outline: {
    default: 'bg-transparent text-gray-700 border-gray-300',
    primary: 'bg-transparent text-primary-700 border-primary-300',
    success: 'bg-transparent text-green-700 border-green-300',
    warning: 'bg-transparent text-amber-700 border-amber-300',
    danger: 'bg-transparent text-red-700 border-red-300',
    info: 'bg-transparent text-blue-700 border-blue-300',
    purple: 'bg-transparent text-purple-700 border-purple-300',
    pink: 'bg-transparent text-pink-700 border-pink-300',
  },
};

// Colores para dots
const DOT_COLORS = {
  default: 'bg-gray-500',
  primary: 'bg-primary-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  style = 'subtle',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  dot = false,
  pulse = false,
  count,
  maxCount = 99,
  dismissible = false,
  onDismiss,
  onClick,
  interactive = false,
  rounded = 'default',
  uppercase = false,
  className = '',
  tooltip,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  if (!isVisible) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    onDismiss?.();
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  // Size classes
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs gap-1',
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  };

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const dotSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  // Rounded classes
  const roundedClasses = {
    default: 'rounded-md',
    full: 'rounded-full',
    square: 'rounded-none',
  };

  // Base classes
  const baseClasses = `
    inline-flex items-center justify-center font-medium border
    transition-all duration-200
    ${sizeClasses[size]}
    ${roundedClasses[rounded]}
    ${VARIANT_STYLES[style][variant]}
    ${uppercase ? 'uppercase tracking-wide' : ''}
    ${interactive || onClick ? 'cursor-pointer hover:opacity-80 active:scale-95' : ''}
    ${className}
  `;

  // Display count
  const displayCount = count !== undefined
    ? count > maxCount
      ? `${maxCount}+`
      : count.toString()
    : null;

  return (
    <div className="relative inline-flex">
      <span
        className={baseClasses}
        onClick={onClick ? handleClick : undefined}
        onMouseEnter={() => tooltip && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        {/* Dot indicator */}
        {dot && (
          <span className="relative flex">
            <span
              className={`inline-flex ${dotSizes[size]} rounded-full ${DOT_COLORS[variant]} ${pulse ? 'animate-pulse' : ''
                }`}
            />
            {pulse && (
              <span
                className={`absolute inline-flex h-full w-full rounded-full ${DOT_COLORS[variant]} opacity-75 animate-ping`}
              />
            )}
          </span>
        )}

        {/* Left icon */}
        {Icon && iconPosition === 'left' && (
          <Icon className={`${iconSizes[size]} flex-shrink-0`} />
        )}

        {/* Content */}
        <span className="truncate max-w-xs">
          {displayCount !== null ? displayCount : children}
        </span>

        {/* Right icon */}
        {Icon && iconPosition === 'right' && (
          <Icon className={`${iconSizes[size]} flex-shrink-0`} />
        )}

        {/* Dismiss button */}
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="ml-1 -mr-1 flex-shrink-0 hover:opacity-70 transition-opacity focus:outline-none"
            aria-label="Dismiss"
          >
            <X className={iconSizes[size]} />
          </button>
        )}

        {/* Pulse effect overlay */}
        {pulse && !dot && (
          <span className="absolute inset-0 rounded-full opacity-75 animate-ping" />
        )}
      </span>

      {/* Tooltip */}
      {tooltip && showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 animate-fade-in">
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
            {tooltip}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900" />
            </div>
          </div>
        </div>
      )}

      {/* Animations CSS */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translate(-50%, -4px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

// Status Badge presets
export const StatusBadge: React.FC<{
  status: 'online' | 'offline' | 'away' | 'busy';
  showLabel?: boolean;
  size?: BadgeProps['size'];
}> = ({ status, showLabel = true, size = 'sm' }) => {
  const statusConfig = {
    online: { variant: 'success' as const, label: 'En línea', icon: Check },
    offline: { variant: 'default' as const, label: 'Desconectado', icon: Minus },
    away: { variant: 'warning' as const, label: 'Ausente', icon: Clock },
    busy: { variant: 'danger' as const, label: 'Ocupado', icon: AlertCircle },
  };

  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      size={size}
      dot={!showLabel}
      pulse={status === 'online'}
      icon={showLabel ? config.icon : undefined}
    >
      {showLabel ? config.label : ''}
    </Badge>
  );
};

// Notification Badge
export const NotificationBadge: React.FC<{
  count: number;
  maxCount?: number;
  size?: BadgeProps['size'];
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}> = ({ count, maxCount = 99, size = 'xs', position = 'top-right' }) => {
  if (count === 0) return null;

  const positionClasses = {
    'top-right': '-top-1 -right-1',
    'top-left': '-top-1 -left-1',
    'bottom-right': '-bottom-1 -right-1',
    'bottom-left': '-bottom-1 -left-1',
  };

  return (
    <Badge
      variant="danger"
      style="solid"
      size={size}
      count={count}
      maxCount={maxCount}
      rounded="full"
      pulse
      className={`absolute ${positionClasses[position]} shadow-lg`}
    >
      {count}
    </Badge>
  );
};

// Trend Badge
export const TrendBadge: React.FC<{
  value: number;
  showValue?: boolean;
  size?: BadgeProps['size'];
}> = ({ value, showValue = true, size = 'sm' }) => {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;

  return (
    <Badge
      variant={isPositive ? 'success' : isNegative ? 'danger' : 'default'}
      style="subtle"
      size={size}
      icon={isPositive ? TrendingUp : isNegative ? TrendingDown : Minus}
    >
      {showValue && (
        <>
          {isPositive && '+'}
          {value}%
        </>
      )}
    </Badge>
  );
};

// Achievement Badge
export const AchievementBadge: React.FC<{
  label: string;
  tier?: 'bronze' | 'silver' | 'gold';
  size?: BadgeProps['size'];
}> = ({ label, tier = 'gold', size = 'md' }) => {
  const tierConfig = {
    bronze: { variant: 'warning' as const, icon: Star },
    silver: { variant: 'default' as const, icon: Star },
    gold: { variant: 'warning' as const, icon: Crown },
  };

  const config = tierConfig[tier];

  return (
    <Badge
      variant={config.variant}
      style="solid"
      size={size}
      icon={config.icon}
      iconPosition="left"
      className="shadow-md"
    >
      {label}
    </Badge>
  );
};

// Badge Group
export const BadgeGroup: React.FC<{
  children: React.ReactNode;
  max?: number;
  spacing?: 'tight' | 'normal' | 'relaxed';
  wrap?: boolean;
}> = ({ children, max, spacing = 'normal', wrap = true }) => {
  const childArray = React.Children.toArray(children);
  const displayChildren = max ? childArray.slice(0, max) : childArray;
  const remainingCount = max ? childArray.length - max : 0;

  const spacingClasses = {
    tight: 'gap-1',
    normal: 'gap-2',
    relaxed: 'gap-3',
  };

  return (
    <div className={`flex items-center ${spacingClasses[spacing]} ${wrap ? 'flex-wrap' : ''}`}>
      {displayChildren}
      {remainingCount > 0 && (
        <Badge variant="default" style="outline" size="sm">
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
};

// Interactive Tag Badge
export const TagBadge: React.FC<{
  label: string;
  onRemove?: () => void;
  selected?: boolean;
  onClick?: () => void;
  variant?: BadgeProps['variant'];
}> = ({ label, onRemove, selected = false, onClick, variant = 'primary' }) => {
  return (
    <Badge
      variant={selected ? variant : 'default'}
      style={selected ? 'solid' : 'outline'}
      size="md"
      dismissible={!!onRemove}
      onDismiss={onRemove}
      onClick={onClick}
      interactive={!!onClick}
      className={onClick ? 'hover:shadow-md' : ''}
    >
      {label}
    </Badge>
  );
};

// Example Usage Component
export const BadgeShowcase = () => {
  return (
    <div className="space-y-8 p-8 bg-gray-50">
      {/* Basic Badges */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Variantes Básicas</h3>
        <BadgeGroup>
          <Badge variant="default">Default</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="info">Info</Badge>
        </BadgeGroup>
      </div>

      {/* Styles */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Estilos</h3>
        <BadgeGroup>
          <Badge variant="primary" style="solid">Solid</Badge>
          <Badge variant="primary" style="subtle">Subtle</Badge>
          <Badge variant="primary" style="outline">Outline</Badge>
        </BadgeGroup>
      </div>

      {/* Sizes */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Tamaños</h3>
        <BadgeGroup>
          <Badge size="xs">Extra Small</Badge>
          <Badge size="sm">Small</Badge>
          <Badge size="md">Medium</Badge>
          <Badge size="lg">Large</Badge>
        </BadgeGroup>
      </div>

      {/* With Icons */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Con Iconos</h3>
        <BadgeGroup>
          <Badge variant="success" icon={Check}>Verificado</Badge>
          <Badge variant="danger" icon={AlertCircle}>Error</Badge>
          <Badge variant="info" icon={Info}>Información</Badge>
          <Badge variant="warning" icon={AlertTriangle}>Advertencia</Badge>
        </BadgeGroup>
      </div>

      {/* With Dots */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Con Indicadores</h3>
        <BadgeGroup>
          <Badge variant="success" dot>Activo</Badge>
          <Badge variant="danger" dot pulse>En vivo</Badge>
          <Badge variant="warning" dot>Pendiente</Badge>
        </BadgeGroup>
      </div>

      {/* Dismissible */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Descartables</h3>
        <BadgeGroup>
          <Badge variant="primary" dismissible>Filtro 1</Badge>
          <Badge variant="primary" dismissible>Filtro 2</Badge>
          <Badge variant="primary" dismissible>Filtro 3</Badge>
        </BadgeGroup>
      </div>

      {/* Status Badges */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Estados</h3>
        <BadgeGroup>
          <StatusBadge status="online" />
          <StatusBadge status="offline" />
          <StatusBadge status="away" />
          <StatusBadge status="busy" />
        </BadgeGroup>
      </div>

      {/* Trend Badges */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Tendencias</h3>
        <BadgeGroup>
          <TrendBadge value={12.5} />
          <TrendBadge value={-8.3} />
          <TrendBadge value={0} />
        </BadgeGroup>
      </div>

      {/* Achievement Badges */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Logros</h3>
        <BadgeGroup>
          <AchievementBadge label="Experto" tier="gold" />
          <AchievementBadge label="Avanzado" tier="silver" />
          <AchievementBadge label="Principiante" tier="bronze" />
        </BadgeGroup>
      </div>

      {/* Count Badges */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Con Contadores</h3>
        <BadgeGroup>
          <Badge variant="danger" count={5} rounded="full" style="solid" />
          <Badge variant="danger" count={99} rounded="full" style="solid" />
          <Badge variant="danger" count={150} maxCount={99} rounded="full" style="solid" />
        </BadgeGroup>
      </div>

      {/* Interactive Tags */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Tags Interactivos</h3>
        <BadgeGroup>
          <TagBadge label="React" selected />
          <TagBadge label="TypeScript" />
          <TagBadge label="Tailwind" onRemove={() => console.log('Removed')} />
        </BadgeGroup>
      </div>
    </div>
  );
};
