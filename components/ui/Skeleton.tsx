import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded' | 'custom';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  count?: number;
  className?: string;
  spacing?: number;
  radius?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  count = 1,
  className = '',
  spacing = 8,
  radius,
}) => {
  // Default dimensions based on variant
  const getDefaultDimensions = () => {
    switch (variant) {
      case 'text':
        return { width: width || '100%', height: height || '1rem' };
      case 'circular':
        const size = width || height || '40px';
        return { width: size, height: size };
      case 'rectangular':
        return { width: width || '100%', height: height || '200px' };
      case 'rounded':
        return { width: width || '100%', height: height || '200px' };
      case 'custom':
        return { width: width || '100%', height: height || '1rem' };
      default:
        return { width: '100%', height: '1rem' };
    }
  };

  const dimensions = getDefaultDimensions();

  // Border radius based on variant
  const getBorderRadius = () => {
    if (radius !== undefined) {
      return typeof radius === 'number' ? `${radius}px` : radius;
    }

    switch (variant) {
      case 'text':
        return '4px';
      case 'circular':
        return '50%';
      case 'rectangular':
        return '0';
      case 'rounded':
        return '8px';
      default:
        return '4px';
    }
  };

  // Animation classes
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'skeleton-wave',
    none: '',
  };

  const style: React.CSSProperties = {
    width: typeof dimensions.width === 'number' ? `${dimensions.width}px` : dimensions.width,
    height: typeof dimensions.height === 'number' ? `${dimensions.height}px` : dimensions.height,
    borderRadius: getBorderRadius(),
  };

  // Single skeleton element
  const skeletonElement = (
    <div
      className={`bg-gray-200 ${animationClasses[animation]} ${className}`}
      style={style}
      aria-busy="true"
      aria-live="polite"
    />
  );

  // Multiple skeletons
  if (count > 1) {
    return (
      <div className="space-y-0" style={{ gap: `${spacing}px` }}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} style={{ marginBottom: index < count - 1 ? `${spacing}px` : 0 }}>
            {skeletonElement}
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {skeletonElement}
      {animation === 'wave' && (
        <style>{`
          @keyframes skeleton-wave {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
          .skeleton-wave {
            background: linear-gradient(
              90deg,
              #f0f0f0 0%,
              #e0e0e0 20%,
              #f0f0f0 40%,
              #f0f0f0 100%
            );
            background-size: 200% 100%;
            animation: skeleton-wave 1.5s ease-in-out infinite;
          }
        `}</style>
      )}
    </>
  );
};

// Avatar Skeleton
export const SkeletonAvatar: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animation?: SkeletonProps['animation'];
  withName?: boolean;
}> = ({ size = 'md', animation = 'pulse', withName = false }) => {
  const sizes = {
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  };

  const textWidths = {
    sm: '80px',
    md: '100px',
    lg: '120px',
    xl: '150px',
  };

  return (
    <div className="flex items-center gap-3">
      <Skeleton variant="circular" width={sizes[size]} height={sizes[size]} animation={animation} />
      {withName && (
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width={textWidths[size]} height={size === 'sm' ? 12 : 16} animation={animation} />
          <Skeleton variant="text" width="60%" height={size === 'sm' ? 10 : 12} animation={animation} />
        </div>
      )}
    </div>
  );
};

// Card Skeleton
export const SkeletonCard: React.FC<{
  animation?: SkeletonProps['animation'];
  hasImage?: boolean;
  lines?: number;
}> = ({ animation = 'pulse', hasImage = true, lines = 3 }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {hasImage && (
        <Skeleton variant="rectangular" height={200} animation={animation} radius={0} />
      )}
      <div className="p-6 space-y-3">
        <Skeleton variant="text" width="60%" height={20} animation={animation} />
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              variant="text"
              width={i === lines - 1 ? '40%' : '100%'}
              height={16}
              animation={animation}
            />
          ))}
        </div>
        <div className="flex gap-2 pt-2">
          <Skeleton variant="rounded" width={100} height={36} animation={animation} />
          <Skeleton variant="rounded" width={100} height={36} animation={animation} />
        </div>
      </div>
    </div>
  );
};

// Table Skeleton
export const SkeletonTable: React.FC<{
  rows?: number;
  columns?: number;
  animation?: SkeletonProps['animation'];
  hasHeader?: boolean;
}> = ({ rows = 5, columns = 4, animation = 'pulse', hasHeader = true }) => {
  return (
    <div className="w-full space-y-4">
      {/* Header */}
      {hasHeader && (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} variant="text" height={20} animation={animation} />
          ))}
        </div>
      )}

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" height={16} animation={animation} />
          ))}
        </div>
      ))}
    </div>
  );
};

// List Skeleton
export const SkeletonList: React.FC<{
  items?: number;
  animation?: SkeletonProps['animation'];
  variant?: 'simple' | 'detailed' | 'avatar';
}> = ({ items = 5, animation = 'pulse', variant = 'simple' }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-start gap-3">
          {variant === 'avatar' && (
            <Skeleton variant="circular" width={40} height={40} animation={animation} />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="80%" height={16} animation={animation} />
            {variant === 'detailed' && (
              <>
                <Skeleton variant="text" width="100%" height={14} animation={animation} />
                <Skeleton variant="text" width="60%" height={14} animation={animation} />
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Text Block Skeleton (Paragraph)
export const SkeletonText: React.FC<{
  lines?: number;
  animation?: SkeletonProps['animation'];
  lastLineWidth?: string;
}> = ({ lines = 3, animation = 'pulse', lastLineWidth = '60%' }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? lastLineWidth : '100%'}
          height={16}
          animation={animation}
        />
      ))}
    </div>
  );
};

// Image Skeleton
export const SkeletonImage: React.FC<{
  aspectRatio?: '1:1' | '16:9' | '4:3' | '3:2';
  animation?: SkeletonProps['animation'];
  width?: string | number;
}> = ({ aspectRatio = '16:9', animation = 'pulse', width = '100%' }) => {
  const ratios = {
    '1:1': '100%',
    '16:9': '56.25%',
    '4:3': '75%',
    '3:2': '66.67%',
  };

  return (
    <div style={{ width, position: 'relative', paddingBottom: ratios[aspectRatio] }}>
      <Skeleton
        variant="rectangular"
        className="absolute inset-0"
        width="100%"
        height="100%"
        animation={animation}
      />
    </div>
  );
};

// Form Skeleton
export const SkeletonForm: React.FC<{
  fields?: number;
  animation?: SkeletonProps['animation'];
  hasSubmitButton?: boolean;
}> = ({ fields = 4, animation = 'pulse', hasSubmitButton = true }) => {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton variant="text" width="30%" height={14} animation={animation} />
          <Skeleton variant="rounded" width="100%" height={44} animation={animation} />
        </div>
      ))}
      {hasSubmitButton && (
        <div className="flex justify-end gap-3 pt-4">
          <Skeleton variant="rounded" width={100} height={40} animation={animation} />
          <Skeleton variant="rounded" width={120} height={40} animation={animation} />
        </div>
      )}
    </div>
  );
};

// Profile Skeleton
export const SkeletonProfile: React.FC<{
  animation?: SkeletonProps['animation'];
}> = ({ animation = 'pulse' }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Cover Image */}
      <Skeleton variant="rectangular" height={200} animation={animation} radius={0} />

      {/* Profile Content */}
      <div className="p-6 -mt-16 relative">
        {/* Avatar */}
        <div className="flex items-end gap-4 mb-4">
          <div className="border-4 border-white rounded-full">
            <Skeleton variant="circular" width={120} height={120} animation={animation} />
          </div>
          <div className="flex-1 pb-2">
            <Skeleton variant="rounded" width={120} height={36} animation={animation} />
          </div>
        </div>

        {/* Name and Info */}
        <div className="space-y-3">
          <Skeleton variant="text" width="40%" height={24} animation={animation} />
          <Skeleton variant="text" width="60%" height={16} animation={animation} />
          <SkeletonText lines={3} animation={animation} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center space-y-2">
              <Skeleton variant="text" width="60%" height={24} animation={animation} className="mx-auto" />
              <Skeleton variant="text" width="80%" height={14} animation={animation} className="mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Dashboard Skeleton
export const SkeletonDashboard: React.FC<{
  animation?: SkeletonProps['animation'];
}> = ({ animation = 'pulse' }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width={200} height={32} animation={animation} />
        <Skeleton variant="rounded" width={120} height={40} animation={animation} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton variant="text" width="60%" height={14} animation={animation} />
              <Skeleton variant="circular" width={40} height={40} animation={animation} />
            </div>
            <Skeleton variant="text" width="80%" height={32} animation={animation} />
            <Skeleton variant="text" width="50%" height={12} animation={animation} />
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <Skeleton variant="text" width={200} height={20} animation={animation} className="mb-6" />
        <Skeleton variant="rectangular" height={300} animation={animation} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <Skeleton variant="text" width={200} height={20} animation={animation} className="mb-6" />
        <SkeletonTable rows={5} columns={4} animation={animation} />
      </div>
    </div>
  );
};

// Article Skeleton
export const SkeletonArticle: React.FC<{
  animation?: SkeletonProps['animation'];
}> = ({ animation = 'pulse' }) => {
  return (
    <article className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="space-y-3">
        <Skeleton variant="text" width="90%" height={36} animation={animation} />
        <Skeleton variant="text" width="70%" height={36} animation={animation} />
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4">
        <SkeletonAvatar size="sm" animation={animation} withName />
        <Skeleton variant="text" width={100} height={14} animation={animation} />
      </div>

      {/* Featured Image */}
      <SkeletonImage aspectRatio="16:9" animation={animation} />

      {/* Content */}
      <div className="space-y-4">
        <SkeletonText lines={4} animation={animation} />
        <SkeletonText lines={5} animation={animation} lastLineWidth="80%" />
        <SkeletonText lines={3} animation={animation} lastLineWidth="50%" />
      </div>
    </article>
  );
};

// Example Showcase
export const SkeletonShowcase = () => {
  return (
    <div className="space-y-12 p-8 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Skeleton Components</h2>

      {/* Basic Variants */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Variants</h3>
        <div className="bg-white p-6 rounded-lg space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Text</p>
            <Skeleton variant="text" />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Circular</p>
            <Skeleton variant="circular" width={60} height={60} />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Rectangular</p>
            <Skeleton variant="rectangular" height={100} />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Rounded</p>
            <Skeleton variant="rounded" height={100} />
          </div>
        </div>
      </div>

      {/* Animations */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Animation Types</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg space-y-3">
            <h4 className="font-medium mb-3">Pulse (Default)</h4>
            <Skeleton variant="text" animation="pulse" count={3} />
          </div>
          <div className="bg-white p-6 rounded-lg space-y-3">
            <h4 className="font-medium mb-3">Wave (Shimmer)</h4>
            <Skeleton variant="text" animation="wave" count={3} />
          </div>
          <div className="bg-white p-6 rounded-lg space-y-3">
            <h4 className="font-medium mb-3">None (Static)</h4>
            <Skeleton variant="text" animation="none" count={3} />
          </div>
        </div>
      </div>

      {/* Avatar Skeletons */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Avatar Skeletons</h3>
        <div className="bg-white p-6 rounded-lg space-y-4">
          <SkeletonAvatar size="sm" />
          <SkeletonAvatar size="md" withName />
          <SkeletonAvatar size="lg" withName />
          <SkeletonAvatar size="xl" withName />
        </div>
      </div>

      {/* Card Skeletons */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Card Skeletons</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard hasImage={false} />
          <SkeletonCard lines={5} />
        </div>
      </div>

      {/* List Skeletons */}
      <div>
        <h3 className="text-lg font-semibold mb-4">List Skeletons</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg">
            <h4 className="font-medium mb-4">Simple</h4>
            <SkeletonList variant="simple" items={3} />
          </div>
          <div className="bg-white p-6 rounded-lg">
            <h4 className="font-medium mb-4">Detailed</h4>
            <SkeletonList variant="detailed" items={3} />
          </div>
          <div className="bg-white p-6 rounded-lg">
            <h4 className="font-medium mb-4">With Avatar</h4>
            <SkeletonList variant="avatar" items={3} />
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Table Skeleton</h3>
        <div className="bg-white p-6 rounded-lg">
          <SkeletonTable rows={5} columns={5} />
        </div>
      </div>

      {/* Form Skeleton */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Form Skeleton</h3>
        <div className="bg-white p-6 rounded-lg max-w-2xl">
          <SkeletonForm fields={5} />
        </div>
      </div>

      {/* Profile Skeleton */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Profile Skeleton</h3>
        <div className="max-w-2xl">
          <SkeletonProfile />
        </div>
      </div>

      {/* Article Skeleton */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Article Skeleton</h3>
        <div className="bg-white p-8 rounded-lg">
          <SkeletonArticle />
        </div>
      </div>

      {/* Dashboard Skeleton */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Dashboard Skeleton</h3>
        <SkeletonDashboard />
      </div>
    </div>
  );
};
