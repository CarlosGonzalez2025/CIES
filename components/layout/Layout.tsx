import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { ChevronUp, Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  pageActions?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  isLoading?: boolean;
}

// Componente de Scroll to Top
const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-50 p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 group"
      aria-label="Scroll to top"
    >
      <ChevronUp className="w-6 h-6 group-hover:animate-bounce" />
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
        Volver arriba
      </span>
    </button>
  );
};

// Componente de Page Header
const PageHeader: React.FC<{
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}> = ({ title, description, actions }) => {
  if (!title && !description && !actions) return null;

  return (
    <div className="mb-6 md:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          {title && (
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              {title}
            </h1>
          )}
          {description && (
            <p className="mt-2 text-sm text-gray-600 max-w-3xl">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex-shrink-0 flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
      <div className="mt-6 border-b border-gray-200" />
    </div>
  );
};

// Componente de Loading Overlay
const LoadingOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
        <p className="text-sm font-medium text-gray-600">Cargando...</p>
      </div>
    </div>
  );
};

// Componente de Skip to Content (accesibilidad)
const SkipToContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:shadow-lg"
    >
      Saltar al contenido principal
    </a>
  );
};

export const Layout: React.FC<LayoutProps> = ({
  children,
  pageTitle,
  pageDescription,
  pageActions,
  maxWidth = '7xl',
  isLoading = false,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Recuperar estado del localStorage
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const location = useLocation();

  // Cerrar sidebar en móvil al cambiar de ruta
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Guardar estado del sidebar en localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Prevenir scroll cuando el sidebar móvil está abierto
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  const mainMarginClass = sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64';
  const footerMarginClass = sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Skip to content link para accesibilidad */}
      <SkipToContent />

      {/* Navbar */}
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        isSidebarCollapsed={sidebarCollapsed}
      />

      {/* Main container */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main content */}
        <main
          id="main-content"
          className={`flex-1 transition-all duration-300 ${mainMarginClass}`}
          role="main"
        >
          <div className="min-h-[calc(100vh-4rem-3.5rem)]">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className={`mx-auto ${maxWidthClasses[maxWidth]}`}>
                {/* Page Header */}
                <PageHeader
                  title={pageTitle}
                  description={pageDescription}
                  actions={pageActions}
                />

                {/* Page Content */}
                <div className="animate-fade-in">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <div className={`transition-all duration-300 ${footerMarginClass}`}>
        <Footer />
      </div>

      {/* Scroll to top button */}
      <ScrollToTop />

      {/* Loading overlay */}
      {isLoading && <LoadingOverlay />}

      {/* Global styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 12px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 6px;
          border: 3px solid #f1f5f9;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Firefox scrollbar */
        * {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }

        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }

        /* Focus visible for accessibility */
        *:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

// Export también un wrapper para páginas específicas
export const PageLayout: React.FC<
  LayoutProps & {
    containerClassName?: string;
  }
> = ({ children, containerClassName, ...props }) => {
  return (
    <Layout {...props}>
      <div className={containerClassName}>{children}</div>
    </Layout>
  );
};
