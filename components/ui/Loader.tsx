import React from 'react';
import { Loader2, RefreshCw, Download, Upload, Check } from 'lucide-react';

interface LoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
  type?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'ring';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  label?: string;
  description?: string;
  overlay?: boolean;
  blur?: boolean;
  className?: string;
}

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  count?: number;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'linear' | 'circular';
  color?: 'primary' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  label?: string;
  indeterminate?: boolean;
  striped?: boolean;
  animated?: boolean;
}

interface DotsLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
}

// Main Loader Component
export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  fullScreen = false,
  type = 'spinner',
  color = 'primary',
  label,
  description,
  overlay = false,
  blur = false,
  className = '',
}) => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colors = {
    primary: 'border-primary-600',
    secondary: 'border-gray-600',
    white: 'border-white',
    gray: 'border-gray-400',
  };

  const textColors = {
    primary: 'text-primary-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    gray: 'text-gray-600',
  };

  // Spinner Loader
  const SpinnerLoader = () => (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`animate-spin rounded-full border-2 border-transparent ${colors[color]} border-t-transparent ${sizes[size]}`}
        role="status"
        aria-label="Cargando"
      />
      {label && (
        <div className="text-center">
          <p className={`text-sm font-medium ${textColors[color]}`}>{label}</p>
          {description && (
            <p className={`text-xs ${textColors[color]} opacity-70 mt-1`}>{description}</p>
          )}
        </div>
      )}
    </div>
  );

  // Dots Loader
  const DotsLoader = () => (
    <div className="flex flex-col items-center gap-3">
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`rounded-full bg-current ${sizes[size]} ${textColors[color]} animate-bounce`}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: '0.6s',
            }}
          />
        ))}
      </div>
      {label && (
        <p className={`text-sm font-medium ${textColors[color]}`}>{label}</p>
      )}
    </div>
  );

  // Pulse Loader
  const PulseLoader = () => (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div
          className={`rounded-full bg-current ${sizes[size]} ${textColors[color]} animate-ping absolute`}
        />
        <div
          className={`rounded-full bg-current ${sizes[size]} ${textColors[color]} relative`}
        />
      </div>
      {label && (
        <p className={`text-sm font-medium ${textColors[color]}`}>{label}</p>
      )}
    </div>
  );

  // Bars Loader
  const BarsLoader = () => {
    const barHeights = ['h-8', 'h-12', 'h-6', 'h-10', 'h-7'];
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-end space-x-1 h-12">
          {barHeights.map((height, i) => (
            <div
              key={i}
              className={`w-1.5 bg-current ${height} ${textColors[color]} animate-pulse`}
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s',
              }}
            />
          ))}
        </div>
        {label && (
          <p className={`text-sm font-medium ${textColors[color]}`}>{label}</p>
        )}
      </div>
    );
  };

  // Ring Loader
  const RingLoader = () => (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative ${sizes[size]}`}>
        <div className={`absolute inset-0 rounded-full border-4 ${colors[color]} opacity-25`} />
        <div
          className={`absolute inset-0 rounded-full border-4 border-transparent ${colors[color]} border-t-transparent animate-spin`}
        />
      </div>
      {label && (
        <p className={`text-sm font-medium ${textColors[color]}`}>{label}</p>
      )}
    </div>
  );

  const loaderComponents = {
    spinner: SpinnerLoader,
    dots: DotsLoader,
    pulse: PulseLoader,
    bars: BarsLoader,
    ring: RingLoader,
  };

  const LoaderComponent = loaderComponents[type];

  const loader = <LoaderComponent />;

  if (fullScreen || overlay) {
    return (
      <div
        className={`fixed inset-0 flex items-center justify-center z-50 ${overlay ? 'bg-black/50' : 'bg-white/90'
          } ${blur ? 'backdrop-blur-sm' : ''} ${className}`}
      >
        {loader}
      </div>
    );
  }

  return <div className={className}>{loader}</div>;
};

// Skeleton Loader Component
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  count = 1,
  animation = 'pulse',
  className = '',
}) => {
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const variantStyles = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`bg-gray-200 ${variantStyles[variant]} ${animationClasses[animation]} ${className}`}
          style={style}
        />
      ))}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .animate-shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </>
  );
};

// Progress Component
export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'linear',
  color = 'primary',
  showLabel = false,
  label,
  indeterminate = false,
  striped = false,
  animated = false,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorClasses = {
    primary: 'bg-primary-600',
    success: 'bg-green-600',
    warning: 'bg-amber-600',
    danger: 'bg-red-600',
  };

  if (variant === 'circular') {
    const circleSize = size === 'sm' ? 40 : size === 'md' ? 60 : 80;
    const strokeWidth = size === 'sm' ? 4 : size === 'md' ? 6 : 8;
    const radius = (circleSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={circleSize} height={circleSize} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={indeterminate ? 0 : offset}
            className={`${colorClasses[color]} transition-all duration-300 ${indeterminate ? 'animate-spin' : ''
              }`}
            strokeLinecap="round"
          />
        </svg>
        {showLabel && (
          <div className="absolute text-sm font-semibold text-gray-700">
            {label || `${Math.round(percentage)}%`}
          </div>
        )}
      </div>
    );
  }

  // Linear Progress
  return (
    <div className="w-full">
      {(label || showLabel) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showLabel && (
            <span className="text-sm font-medium text-gray-700">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full transition-all duration-300 ${colorClasses[color]} ${striped ? 'bg-stripes' : ''
            } ${animated && striped ? 'animate-stripes' : ''} ${indeterminate ? 'animate-indeterminate' : ''
            }`}
          style={{ width: indeterminate ? '30%' : `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      <style jsx>{`
        .bg-stripes {
          background-image: linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.2) 25%,
            transparent 25%,
            transparent 50%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0.2) 75%,
            transparent 75%,
            transparent
          );
          background-size: 1rem 1rem;
        }
        @keyframes stripes {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 1rem 0;
          }
        }
        .animate-stripes {
          animation: stripes 1s linear infinite;
        }
        @keyframes indeterminate {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }
        .animate-indeterminate {
          animation: indeterminate 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Button Loader (Dots in button)
export const ButtonLoader: React.FC<DotsLoaderProps> = ({
  size = 'sm',
  color = 'white',
}) => {
  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2',
  };

  const dotColors = {
    primary: 'bg-primary-600',
    white: 'bg-white',
    gray: 'bg-gray-600',
  };

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`rounded-full ${dotSizes[size]} ${dotColors[color]} animate-bounce`}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '0.6s',
          }}
        />
      ))}
    </div>
  );
};

// Card Skeleton (Preset)
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <Skeleton variant="rectangular" height={200} />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="40%" />
        </div>
      ))}
    </>
  );
};

// Table Skeleton (Preset)
export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 4,
}) => {
  return (
    <div className="w-full space-y-3">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} variant="text" height={20} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" height={16} />
          ))}
        </div>
      ))}
    </div>
  );
};

// Loading States Example
export const LoaderShowcase = () => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 10));
    }, 500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-12 p-8 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Loader Components</h2>

      {/* Spinner Types */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Spinner Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 bg-white p-8 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Loader type="spinner" />
            <span className="text-xs text-gray-600">Spinner</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Loader type="dots" />
            <span className="text-xs text-gray-600">Dots</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Loader type="pulse" />
            <span className="text-xs text-gray-600">Pulse</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Loader type="bars" />
            <span className="text-xs text-gray-600">Bars</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Loader type="ring" />
            <span className="text-xs text-gray-600">Ring</span>
          </div>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Sizes</h3>
        <div className="flex items-end gap-8 bg-white p-8 rounded-lg">
          <Loader size="xs" label="XS" />
          <Loader size="sm" label="SM" />
          <Loader size="md" label="MD" />
          <Loader size="lg" label="LG" />
          <Loader size="xl" label="XL" />
        </div>
      </div>

      {/* With Labels */}
      <div>
        <h3 className="text-lg font-semibold mb-4">With Labels & Descriptions</h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-lg flex justify-center">
            <Loader label="Cargando datos..." />
          </div>
          <div className="bg-white p-8 rounded-lg flex justify-center">
            <Loader
              label="Procesando pago"
              description="Esto puede tomar unos segundos"
              type="pulse"
            />
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Progress Indicators</h3>
        <div className="space-y-6 bg-white p-8 rounded-lg">
          <Progress value={progress} showLabel label="Progreso lineal" />
          <Progress value={progress} color="success" striped animated showLabel />
          <Progress value={75} color="warning" size="lg" showLabel />
          <Progress value={0} indeterminate label="Procesando..." />

          <div className="flex gap-8 justify-center mt-8">
            <Progress value={progress} variant="circular" size="sm" showLabel />
            <Progress value={progress} variant="circular" size="md" showLabel color="success" />
            <Progress value={progress} variant="circular" size="lg" showLabel color="warning" />
          </div>
        </div>
      </div>

      {/* Skeleton Loaders */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Skeleton Loaders</h3>
        <div className="space-y-6 bg-white p-8 rounded-lg">
          <div className="space-y-3">
            <Skeleton variant="text" />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
          </div>

          <div className="flex gap-4 items-center">
            <Skeleton variant="circular" width={50} height={50} />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="60%" />
            </div>
          </div>

          <Skeleton variant="rectangular" height={200} animation="wave" />
        </div>
      </div>

      {/* Card Skeleton */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Card Skeleton</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <CardSkeleton count={3} />
        </div>
      </div>

      {/* Table Skeleton */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Table Skeleton</h3>
        <div className="bg-white p-8 rounded-lg">
          <TableSkeleton rows={5} cols={4} />
        </div>
      </div>

      {/* Button Loaders */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Button Loaders</h3>
        <div className="flex gap-4">
          <button className="px-6 py-2 bg-primary-600 text-white rounded-lg flex items-center gap-3">
            <ButtonLoader color="white" />
            <span>Cargando...</span>
          </button>
          <button className="px-6 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg flex items-center gap-3">
            <ButtonLoader color="primary" />
            <span>Procesando</span>
          </button>
        </div>
      </div>

      {/* Full Screen Examples (buttons to trigger) */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Full Screen & Overlay</h3>
        <div className="flex gap-4">
          <button
            onClick={() => {
              const container = document.createElement('div');
              document.body.appendChild(container);
              const root = (window as any).createRoot(container);
              root.render(<Loader fullScreen label="Cargando aplicación..." />);
              setTimeout(() => {
                root.unmount();
                document.body.removeChild(container);
              }, 2000);
            }}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg"
          >
            Full Screen Loader
          </button>
          <button
            onClick={() => {
              const container = document.createElement('div');
              document.body.appendChild(container);
              const root = (window as any).createRoot(container);
              root.render(
                <Loader
                  overlay
                  blur
                  type="pulse"
                  color="white"
                  label="Guardando cambios..."
                />
              );
              setTimeout(() => {
                root.unmount();
                document.body.removeChild(container);
              }, 2000);
            }}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg"
          >
            Overlay with Blur
          </button>
        </div>
      </div>
    </div>
  );
};
