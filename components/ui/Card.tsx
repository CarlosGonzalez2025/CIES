import React, { useState } from 'react';
import {
  MoreVertical,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Maximize2,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Star,
  Users,
  DollarSign,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle2,
  Info,
  Image as ImageIcon,
} from 'lucide-react';
import { Badge } from './Badge';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  description?: string;
  footer?: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;

  // Appearance
  variant?: 'elevated' | 'outlined' | 'ghost' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl';

  // Interactivity
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;

  // Media
  image?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;

  // States
  loading?: boolean;
  disabled?: boolean;
  selected?: boolean;

  // Layout
  horizontal?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;

  // Additional
  badge?: React.ReactNode;
  menu?: React.ReactNode;
  fullHeight?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  description,
  footer,
  className = '',
  headerAction,
  variant = 'elevated',
  padding = 'md',
  rounded = 'lg',
  hoverable = false,
  clickable = false,
  onClick,
  image,
  icon: Icon,
  iconColor = 'text-primary-600',
  loading = false,
  disabled = false,
  selected = false,
  horizontal = false,
  collapsible = false,
  defaultCollapsed = false,
  badge,
  menu,
  fullHeight = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // Variant styles
  const variants = {
    elevated: 'bg-white shadow-md hover:shadow-lg',
    outlined: 'bg-white border-2 border-gray-200',
    ghost: 'bg-transparent border border-gray-100',
    gradient: 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg',
  };

  // Padding styles
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  // Rounded styles
  const roundedStyles = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
  };

  // Interactive styles
  const interactiveClasses = `
    ${hoverable || clickable ? 'transition-all duration-200' : ''}
    ${clickable ? 'cursor-pointer active:scale-[0.98]' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${selected ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
  `;

  const handleClick = () => {
    if (clickable && onClick && !disabled) {
      onClick();
    }
  };

  const handleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCollapsed(!isCollapsed);
  };

  const hasHeader = title || subtitle || headerAction || badge || menu || collapsible;

  return (
    <div
      className={`
        ${variants[variant]}
        ${roundedStyles[rounded]}
        ${interactiveClasses}
        ${horizontal ? 'flex flex-row' : 'flex flex-col'}
        ${fullHeight ? 'h-full' : ''}
        overflow-hidden
        ${className}
      `}
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {/* Image */}
      {image && (
        <div className={`${horizontal ? 'w-48 flex-shrink-0' : 'w-full h-48'} overflow-hidden`}>
          {loading ? (
            <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
          ) : (
            <img
              src={image}
              alt={title || 'Card image'}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          )}
        </div>
      )}

      {/* Content Container */}
      <div className={`flex-1 flex flex-col ${horizontal ? '' : 'h-full'}`}>
        {/* Header */}
        {hasHeader && (
          <div className={`${paddings[padding]} ${footer ? 'border-b border-gray-200' : ''}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  {Icon && !loading && (
                    <div className={`flex-shrink-0 w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                  )}

                  {/* Title & Subtitle */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {loading ? (
                        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                      ) : (
                        <>
                          <h3 className={`text-lg font-semibold ${variant === 'gradient' ? 'text-white' : 'text-gray-900'} truncate`}>
                            {title}
                          </h3>
                          {badge && <div>{badge}</div>}
                        </>
                      )}
                    </div>

                    {subtitle && (
                      loading ? (
                        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mt-2" />
                      ) : (
                        <p className={`text-sm ${variant === 'gradient' ? 'text-white/80' : 'text-gray-500'} truncate`}>
                          {subtitle}
                        </p>
                      )
                    )}

                    {description && !loading && (
                      <p className={`text-sm ${variant === 'gradient' ? 'text-white/70' : 'text-gray-600'} mt-2 line-clamp-2`}>
                        {description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {headerAction && !loading && <div>{headerAction}</div>}
                {menu && !loading && <div>{menu}</div>}
                {collapsible && !loading && (
                  <button
                    onClick={handleCollapse}
                    className={`p-1 rounded hover:bg-gray-100 transition-colors ${variant === 'gradient' ? 'text-white hover:bg-white/10' : ''}`}
                    aria-label={isCollapsed ? 'Expandir' : 'Colapsar'}
                  >
                    {isCollapsed ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronUp className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Body */}
        {!isCollapsed && (
          <div className={`${paddings[padding]} ${hasHeader && padding !== 'none' ? 'pt-4' : ''} flex-1`}>
            {loading ? (
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6" />
              </div>
            ) : (
              children
            )}
          </div>
        )}

        {/* Footer */}
        {footer && !isCollapsed && (
          <div className={`${paddings[padding]} ${variant === 'gradient' ? 'bg-black/10' : 'bg-gray-50'} border-t ${variant === 'gradient' ? 'border-white/10' : 'border-gray-200'}`}>
            {loading ? (
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
            ) : (
              footer
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
export const StatCard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}> = ({ title, value, change, icon: Icon, trend, loading }) => {
  const trendConfig = {
    up: { color: 'text-green-600', bg: 'bg-green-50', icon: TrendingUp },
    down: { color: 'text-red-600', bg: 'bg-red-50', icon: TrendingDown },
    neutral: { color: 'text-gray-600', bg: 'bg-gray-50', icon: Activity },
  };

  const currentTrend = trend || (change && change > 0 ? 'up' : change && change < 0 ? 'down' : 'neutral');
  const config = trendConfig[currentTrend];
  const TrendIcon = config.icon;

  return (
    <Card variant="elevated" hoverable loading={loading}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${config.bg}`}>
                <TrendIcon className={`w-3 h-3 ${config.color}`} />
                <span className={`text-xs font-semibold ${config.color}`}>
                  {Math.abs(change)}%
                </span>
              </div>
              <span className="text-xs text-gray-500">vs último período</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-primary-600" />
          </div>
        )}
      </div>
    </Card>
  );
};

// Product Card
export const ProductCard: React.FC<{
  title: string;
  description?: string;
  price: string;
  image: string;
  rating?: number;
  reviews?: number;
  onAddToCart?: () => void;
  badge?: string;
}> = ({ title, description, price, image, rating, reviews, onAddToCart, badge: badgeText }) => {
  return (
    <Card
      image={image}
      padding="md"
      variant="outlined"
      hoverable
      badge={badgeText && <Badge variant="danger" size="sm">{badgeText}</Badge>}
      footer={
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">{price}</span>
          <button
            onClick={onAddToCart}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            Agregar
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      }
    >
      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">{description}</p>
      )}
      {rating && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
          {reviews && (
            <span className="text-xs text-gray-500">({reviews})</span>
          )}
        </div>
      )}
    </Card>
  );
};

// User Card
export const UserCard: React.FC<{
  name: string;
  role: string;
  avatar: string;
  email?: string;
  status?: 'online' | 'offline' | 'away';
  onClick?: () => void;
}> = ({ name, role, avatar, email, status = 'offline', onClick }) => {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-amber-500',
  };

  return (
    <Card variant="outlined" hoverable clickable onClick={onClick} horizontal padding="md">
      <div className="flex items-center gap-4 w-full">
        <div className="relative">
          <img
            src={avatar}
            alt={name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className={`absolute bottom-0 right-0 w-4 h-4 ${statusColors[status]} border-2 border-white rounded-full`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
          <p className="text-sm text-gray-600 truncate">{role}</p>
          {email && (
            <p className="text-xs text-gray-500 truncate">{email}</p>
          )}
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </div>
    </Card>
  );
};

// Alert Card
export const AlertCard: React.FC<{
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}> = ({ title, message, type = 'info', onDismiss, action }) => {
  const [isVisible, setIsVisible] = useState(true);

  const typeConfig = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: Info,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: CheckCircle2,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: AlertCircle,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: AlertCircle,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div className={`${config.bg} border-2 ${config.border} rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 ${config.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-700">{message}</p>
          {action && (
            <button
              onClick={action.onClick}
              className={`mt-3 text-sm font-medium ${config.iconColor} hover:underline`}
            >
              {action.label}
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

// Card Grid Container
export const CardGrid: React.FC<{
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}> = ({ children, cols = 3, gap = 'md' }) => {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  return (
    <div className={`grid ${colsClasses[cols]} ${gapClasses[gap]}`}>
      {children}
    </div>
  );
};

// Example Showcase
export const CardShowcase = () => {
  return (
    <div className="space-y-8 p-8 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Card Component Examples</h2>

      {/* Stat Cards Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Stat Cards</h3>
        <CardGrid cols={4}>
          <StatCard title="Total Usuarios" value="2,543" change={12.5} icon={Users} />
          <StatCard title="Ingresos" value="$45,231" change={-8.2} icon={DollarSign} trend="down" />
          <StatCard title="Tasa de Conversión" value="3.2%" change={2.1} icon={TrendingUp} />
          <StatCard title="Tiempo Promedio" value="4m 32s" icon={Clock} />
        </CardGrid>
      </div>

      {/* Basic Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Variantes Básicas</h3>
        <CardGrid cols={3}>
          <Card title="Elevated Card" subtitle="Default style" variant="elevated">
            <p className="text-gray-600">Card con sombra elevada para destacar contenido.</p>
          </Card>

          <Card title="Outlined Card" subtitle="Border style" variant="outlined">
            <p className="text-gray-600">Card con borde definido para separación clara.</p>
          </Card>

          <Card title="Gradient Card" subtitle="Premium style" variant="gradient">
            <p className="text-white/90">Card con gradiente para llamar la atención.</p>
          </Card>
        </CardGrid>
      </div>

      {/* Interactive Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Cards Interactivas</h3>
        <CardGrid cols={2}>
          <Card
            title="Hoverable Card"
            hoverable
            footer={<button className="text-primary-600 font-medium">Ver más →</button>}
          >
            <p className="text-gray-600">Pasa el mouse sobre esta card para ver el efecto.</p>
          </Card>

          <Card
            title="Clickable Card"
            clickable
            onClick={() => alert('Card clicked!')}
            icon={ExternalLink}
          >
            <p className="text-gray-600">Haz clic en cualquier parte de esta card.</p>
          </Card>
        </CardGrid>
      </div>

      {/* Alert Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Alert Cards</h3>
        <div className="space-y-4">
          <AlertCard
            title="Información"
            message="Esta es una notificación informativa importante."
            type="info"
          />
          <AlertCard
            title="Éxito"
            message="La operación se completó correctamente."
            type="success"
            action={{ label: 'Ver detalles', onClick: () => console.log('Action') }}
          />
          <AlertCard
            title="Advertencia"
            message="Revisa esta acción antes de continuar."
            type="warning"
            onDismiss={() => console.log('Dismissed')}
          />
        </div>
      </div>

      {/* Loading State */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Loading States</h3>
        <CardGrid cols={2}>
          <Card title="Loading..." loading />
          <StatCard title="Loading Stat" value="..." loading />
        </CardGrid>
      </div>
    </div>
  );
};
