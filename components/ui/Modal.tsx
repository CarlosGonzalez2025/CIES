import React, { useEffect, useRef, useCallback, useState } from 'react';
import { X, AlertTriangle, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;

  // Appearance
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  variant?: 'default' | 'centered' | 'drawer' | 'bottom-sheet';
  position?: 'center' | 'top' | 'right' | 'left' | 'bottom';

  // Features
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  preventScroll?: boolean;

  // Styling
  backdropBlur?: boolean;
  backdropOpacity?: 'light' | 'medium' | 'dark';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl';

  // Accessibility
  ariaLabel?: string;
  ariaDescribedBy?: string;
  initialFocus?: React.RefObject<HTMLElement>;

  // Animation
  animation?: 'fade' | 'slide' | 'scale' | 'none';

  // Type-specific
  type?: 'default' | 'alert' | 'confirm' | 'info';
  icon?: React.ComponentType<{ className?: string }>;

  // Callbacks
  onAfterOpen?: () => void;
  onAfterClose?: () => void;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  variant = 'default',
  position = 'center',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  preventScroll = true,
  backdropBlur = false,
  backdropOpacity = 'medium',
  padding = 'md',
  rounded = 'lg',
  ariaLabel,
  ariaDescribedBy,
  initialFocus,
  animation = 'fade',
  type = 'default',
  icon: Icon,
  onAfterOpen,
  onAfterClose,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Size classes
  const sizes = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full m-0',
  };

  // Backdrop opacity
  const backdropOpacities = {
    light: 'bg-black/30',
    medium: 'bg-black/50',
    dark: 'bg-black/70',
  };

  // Padding
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  // Rounded
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
  };

  // Type configurations
  const typeConfigs = {
    default: { bg: 'bg-white', iconColor: 'text-gray-600' },
    alert: { bg: 'bg-red-50', iconColor: 'text-red-600', icon: AlertTriangle },
    confirm: { bg: 'bg-amber-50', iconColor: 'text-amber-600', icon: AlertCircle },
    info: { bg: 'bg-blue-50', iconColor: 'text-blue-600', icon: Info },
  };

  const config = typeConfigs[type];
  const TypeIcon = Icon || config.icon;

  // Animation classes
  const getAnimationClasses = () => {
    if (animation === 'none') return '';

    const base = isVisible ? 'animate-in' : 'animate-out';

    switch (animation) {
      case 'fade':
        return `${base} fade-in-0 fade-out-0`;
      case 'slide':
        if (variant === 'drawer' && position === 'right') {
          return `${base} slide-in-from-right slide-out-to-right`;
        }
        if (variant === 'drawer' && position === 'left') {
          return `${base} slide-in-from-left slide-out-to-left`;
        }
        if (variant === 'bottom-sheet' || position === 'bottom') {
          return `${base} slide-in-from-bottom slide-out-to-bottom`;
        }
        return `${base} slide-in-from-top-4 slide-out-to-top-4`;
      case 'scale':
        return `${base} zoom-in-95 zoom-out-95`;
      default:
        return '';
    }
  };

  // Position classes for drawer variants
  const getPositionClasses = () => {
    if (variant === 'drawer') {
      switch (position) {
        case 'right':
          return 'fixed inset-y-0 right-0 h-full';
        case 'left':
          return 'fixed inset-y-0 left-0 h-full';
        case 'top':
          return 'fixed inset-x-0 top-0 w-full';
        case 'bottom':
          return 'fixed inset-x-0 bottom-0 w-full';
        default:
          return 'fixed inset-y-0 right-0 h-full';
      }
    }

    if (variant === 'bottom-sheet') {
      return 'fixed inset-x-0 bottom-0 w-full max-h-[90vh]';
    }

    return '';
  };

  // Focus trap
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }

      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [isOpen, closeOnEscape, onClose]
  );

  // Handle open/close
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setIsVisible(true);

      // Save current focus
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Prevent scroll
      if (preventScroll) {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      // Set initial focus
      setTimeout(() => {
        if (initialFocus?.current) {
          initialFocus.current.focus();
        } else {
          modalRef.current?.focus();
        }
        onAfterOpen?.();
      }, 100);
    } else {
      setIsVisible(false);

      setTimeout(() => {
        setIsAnimating(false);

        // Restore scroll
        if (preventScroll) {
          document.body.style.overflow = '';
          document.body.style.paddingRight = '';
        }

        // Restore focus
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }

        onAfterClose?.();
      }, 200);
    }

    // Keyboard listeners
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, preventScroll, handleKeyDown, initialFocus, onAfterOpen, onAfterClose]);

  // Don't render if not open and not animating
  if (!isOpen && !isAnimating) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className={`fixed inset-0 z-50 flex ${variant === 'drawer' || variant === 'bottom-sheet'
          ? ''
          : position === 'top'
            ? 'items-start pt-20'
            : position === 'bottom'
              ? 'items-end pb-20'
              : 'items-center justify-center'
        } ${variant === 'centered' ? 'p-4' : ''}`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 transition-opacity duration-200 ${backdropOpacities[backdropOpacity]} ${backdropBlur ? 'backdrop-blur-sm' : ''
          } ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || title}
        aria-describedby={ariaDescribedBy}
        tabIndex={-1}
        className={`
          relative bg-white shadow-2xl
          ${variant === 'drawer' || variant === 'bottom-sheet' ? getPositionClasses() : sizes[size]}
          ${roundedClasses[rounded]}
          ${variant === 'drawer' ? 'max-w-md' : ''}
          ${variant === 'bottom-sheet' ? roundedClasses.xl + ' rounded-b-none' : ''}
          flex flex-col
          transform transition-all duration-200
          ${getAnimationClasses()}
          ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'opacity-0'}
        `}
        style={{
          maxHeight: variant === 'bottom-sheet' ? '90vh' : 'calc(100vh - 80px)',
        }}
      >
        {/* Header */}
        {(title || showCloseButton || TypeIcon) && (
          <div className={`flex items-start justify-between border-b border-gray-200 ${paddings[padding]}`}>
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {TypeIcon && (
                <div className={`flex-shrink-0 w-10 h-10 ${config.bg} rounded-lg flex items-center justify-center mt-1`}>
                  <TypeIcon className={`w-5 h-5 ${config.iconColor}`} />
                </div>
              )}
              {title && (
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-gray-900 truncate">{title}</h2>
                  {type !== 'default' && (
                    <p className="text-sm text-gray-600 mt-1">
                      {type === 'alert' && 'Esta acción requiere tu atención'}
                      {type === 'confirm' && 'Por favor, confirma esta acción'}
                      {type === 'info' && 'Información importante'}
                    </p>
                  )}
                </div>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors -mr-2"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Handle for bottom sheet */}
        {variant === 'bottom-sheet' && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>
        )}

        {/* Body */}
        <div className={`flex-1 overflow-y-auto ${paddings[padding]}`}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={`flex items-center justify-end gap-3 border-t border-gray-200 ${paddings[padding]} bg-gray-50`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// Drawer Component (Alias for side modals)
export const Drawer: React.FC<Omit<ModalProps, 'variant'> & { side?: 'left' | 'right' }> = ({
  side = 'right',
  ...props
}) => {
  return <Modal {...props} variant="drawer" position={side} animation="slide" />;
};

// Bottom Sheet Component
export const BottomSheet: React.FC<Omit<ModalProps, 'variant' | 'position'>> = (props) => {
  return <Modal {...props} variant="bottom-sheet" animation="slide" rounded="xl" />;
};

// Alert Dialog
export const AlertDialog: React.FC<
  Omit<ModalProps, 'type'> & {
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
  }
> = ({
  onConfirm,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  onClose,
  children,
  ...props
}) => {
    const typeMap = {
      danger: 'alert' as const,
      warning: 'confirm' as const,
      info: 'info' as const,
    };

    return (
      <Modal
        {...props}
        type={typeMap[variant]}
        size="sm"
        onClose={onClose}
        footer={
          <>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm?.();
                onClose();
              }}
              className={`px-4 py-2 text-white rounded-lg font-medium transition-colors ${variant === 'danger'
                  ? 'bg-red-600 hover:bg-red-700'
                  : variant === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
            >
              {confirmText}
            </button>
          </>
        }
      >
        {children}
      </Modal>
    );
  };

// Lightbox Component (for images/media)
export const Lightbox: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt?: string;
  caption?: string;
}> = ({ isOpen, onClose, src, alt, caption }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      padding="none"
      backdropOpacity="dark"
      backdropBlur
      showCloseButton
      rounded="none"
    >
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <img
          src={src}
          alt={alt || 'Lightbox image'}
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
        />
        {caption && (
          <p className="mt-4 text-white text-center text-lg">{caption}</p>
        )}
      </div>
    </Modal>
  );
};

// Example Showcase
export const ModalShowcase = () => {
  const [modalStates, setModalStates] = useState({
    basic: false,
    centered: false,
    drawer: false,
    bottomSheet: false,
    alert: false,
    confirm: false,
    info: false,
    lightbox: false,
  });

  const openModal = (key: keyof typeof modalStates) => {
    setModalStates((prev) => ({ ...prev, [key]: true }));
  };

  const closeModal = (key: keyof typeof modalStates) => {
    setModalStates((prev) => ({ ...prev, [key]: false }));
  };

  return (
    <div className="space-y-8 p-8 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Modal Components</h2>

      {/* Triggers */}
      <div className="grid md:grid-cols-3 gap-4">
        <button
          onClick={() => openModal('basic')}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Basic Modal
        </button>
        <button
          onClick={() => openModal('centered')}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Centered Modal
        </button>
        <button
          onClick={() => openModal('drawer')}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Drawer (Right)
        </button>
        <button
          onClick={() => openModal('bottomSheet')}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Bottom Sheet
        </button>
        <button
          onClick={() => openModal('alert')}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Alert Dialog
        </button>
        <button
          onClick={() => openModal('confirm')}
          className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
        >
          Confirm Dialog
        </button>
        <button
          onClick={() => openModal('info')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Info Dialog
        </button>
        <button
          onClick={() => openModal('lightbox')}
          className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
        >
          Lightbox
        </button>
      </div>

      {/* Modals */}
      <Modal
        isOpen={modalStates.basic}
        onClose={() => closeModal('basic')}
        title="Basic Modal"
        footer={
          <>
            <button
              onClick={() => closeModal('basic')}
              className="px-4 py-2 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={() => closeModal('basic')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Guardar
            </button>
          </>
        }
      >
        <p className="text-gray-600">
          Este es un modal básico con título, contenido y footer con botones de acción.
        </p>
      </Modal>

      <Modal
        isOpen={modalStates.centered}
        onClose={() => closeModal('centered')}
        title="Centered Modal"
        variant="centered"
        size="lg"
      >
        <p className="text-gray-600">
          Modal centrado con tamaño grande. Perfecto para formularios o contenido extenso.
        </p>
      </Modal>

      <Drawer
        isOpen={modalStates.drawer}
        onClose={() => closeModal('drawer')}
        title="Drawer Panel"
        side="right"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Panel lateral deslizante. Ideal para menús de navegación, filtros o formularios.
          </p>
        </div>
      </Drawer>

      <BottomSheet
        isOpen={modalStates.bottomSheet}
        onClose={() => closeModal('bottomSheet')}
        title="Bottom Sheet"
      >
        <p className="text-gray-600">
          Hoja inferior deslizante. Común en diseños móviles para opciones y menús.
        </p>
      </BottomSheet>

      <AlertDialog
        isOpen={modalStates.alert}
        onClose={() => closeModal('alert')}
        title="Eliminar cuenta"
        variant="danger"
        confirmText="Sí, eliminar"
        onConfirm={() => console.log('Deleted')}
      >
        <p className="text-gray-700">
          ¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.
        </p>
      </AlertDialog>

      <AlertDialog
        isOpen={modalStates.confirm}
        onClose={() => closeModal('confirm')}
        title="Confirmar cambios"
        variant="warning"
        confirmText="Confirmar"
        onConfirm={() => console.log('Confirmed')}
      >
        <p className="text-gray-700">
          Tienes cambios sin guardar. ¿Deseas continuar sin guardar?
        </p>
      </AlertDialog>

      <AlertDialog
        isOpen={modalStates.info}
        onClose={() => closeModal('info')}
        title="Nueva actualización disponible"
        variant="info"
        confirmText="Actualizar ahora"
        cancelText="Más tarde"
        onConfirm={() => console.log('Update')}
      >
        <p className="text-gray-700">
          Hay una nueva versión disponible con mejoras de rendimiento y nuevas características.
        </p>
      </AlertDialog>

      <Lightbox
        isOpen={modalStates.lightbox}
        onClose={() => closeModal('lightbox')}
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
        alt="Mountain landscape"
        caption="Beautiful mountain landscape"
      />

      {/* Animations CSS */}
      <style jsx>{`
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes slideOutToRight {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(100%);
          }
        }
        @keyframes slideInFromLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes slideOutToLeft {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-100%);
          }
        }
        @keyframes slideInFromBottom {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        @keyframes slideOutToBottom {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(100%);
          }
        }
      `}</style>
    </div>
  );
};
