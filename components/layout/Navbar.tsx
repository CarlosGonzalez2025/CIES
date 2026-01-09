import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  User,
  LogOut,
  Search,
  Settings,
  HelpCircle,
  ChevronRight,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  Moon,
  Sun,
  Maximize2,
  UserCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { useLocation, Link } from 'react-router-dom';

interface NavbarProps {
  onMenuClick: () => void;
  isSidebarCollapsed?: boolean;
}

// Mock notifications - reemplazar con datos reales
const mockNotifications = [
  {
    id: '1',
    type: 'success',
    title: 'Orden completada',
    message: 'La orden OS-2026-001 ha sido marcada como ejecutada',
    time: 'Hace 5 min',
    read: false,
    actionUrl: '/ordenes-servicio',
  },
  {
    id: '2',
    type: 'warning',
    title: 'Presupuesto bajo',
    message: 'El presupuesto PRE-2026-015 tiene menos del 20% disponible',
    time: 'Hace 1 hora',
    read: false,
    actionUrl: '/presupuesto',
  },
  {
    id: '3',
    type: 'info',
    title: 'Nueva comisión registrada',
    message: 'Se ha registrado una nueva comisión para el cliente ACME Corp',
    time: 'Hace 2 horas',
    read: true,
    actionUrl: '/comisiones',
  },
];

// Componente de Dropdown de Notificaciones
const NotificationsDropdown: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  notifications: typeof mockNotifications;
}> = ({ isOpen, onClose, notifications }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 animate-slide-down"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-white" />
          <h3 className="text-sm font-semibold text-white">Notificaciones</h3>
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white text-primary-700">
              {unreadCount} nuevas
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-primary-800 rounded transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Body */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No tienes notificaciones</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <Link
                key={notification.id}
                to={notification.actionUrl}
                onClick={onClose}
                className={`block px-4 py-3 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''
                  }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-semibold text-gray-900">
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 ml-2 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center mt-1.5 text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {notification.time}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <Link
            to="/notificaciones"
            onClick={onClose}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center justify-center"
          >
            Ver todas las notificaciones
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      )}
    </div>
  );
};

// Componente de Dropdown de Usuario
const UserDropdown: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  user: any;
  profile: any;
  logout: () => void;
  getRoleName: (rol?: string) => string;
}> = ({ isOpen, onClose, user, profile, logout, getRoleName }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const menuItems = [
    { icon: UserCircle, label: 'Mi Perfil', path: '/perfil' },
    { icon: Settings, label: 'Configuración', path: '/configuracion' },
    { icon: HelpCircle, label: 'Ayuda', path: '/ayuda' },
  ];

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 animate-slide-down"
    >
      {/* User Info */}
      <div className="px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-lg shadow-md">
            {profile?.nombre?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {profile?.nombre || user?.email}
            </p>
            <p className="text-xs text-white/80">{getRoleName(profile?.rol)}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Icon className="w-4 h-4 mr-3 text-gray-400" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <div className="border-t border-gray-100">
        <button
          onClick={() => {
            logout();
            onClose();
          }}
          className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

// Componente de Búsqueda Global
const GlobalSearch: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 animate-fade-in">
      <div className="w-full max-w-2xl mx-4 bg-white rounded-lg shadow-2xl animate-slide-down">
        <div className="relative">
          <Search className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar clientes, órdenes, presupuestos..."
            className="w-full pl-12 pr-12 py-4 text-lg border-0 focus:ring-0 rounded-t-lg"
          />
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {searchQuery && (
          <div className="border-t border-gray-200 max-h-96 overflow-y-auto">
            <div className="p-4">
              <p className="text-sm text-gray-500">
                Resultados para "<strong>{searchQuery}</strong>"
              </p>
              {/* Aquí irían los resultados de búsqueda */}
              <div className="mt-4 text-center py-8">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  Funcionalidad de búsqueda próximamente
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente de Breadcrumbs
const Breadcrumbs: React.FC = () => {
  const location = useLocation();

  const pathMap: Record<string, string> = {
    '/': 'Dashboard',
    '/clientes': 'Clientes',
    '/aliados': 'Aliados',
    '/comisiones': 'Comisiones',
    '/presupuesto': 'Presupuesto',
    '/ordenes-servicio': 'Órdenes de Servicio',
    '/reportes': 'Reportes',
    '/usuarios': 'Usuarios',
    '/ayuda': 'Ayuda',
    '/configuracion': 'Configuración',
    '/portal-cliente': 'Portal Cliente',
  };

  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length === 0 || location.pathname === '/') {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm">
      <Link
        to="/"
        className="text-gray-500 hover:text-gray-700 transition-colors"
      >
        Inicio
      </Link>
      {pathSegments.map((segment, index) => {
        const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
        const isLast = index === pathSegments.length - 1;
        const label = pathMap[path] || segment;

        return (
          <React.Fragment key={path}>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {isLast ? (
              <span className="font-medium text-gray-900">{label}</span>
            ) : (
              <Link
                to={path}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick, isSidebarCollapsed = false }) => {
  const { user, profile, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const unreadNotifications = mockNotifications.filter((n) => !n.read).length;

  const getRoleName = (rol?: string) => {
    switch (rol) {
      case 'ADMIN':
        return 'Administrador';
      case 'ANALISTA':
        return 'Analista';
      case 'CONSULTA':
        return 'Consulta';
      case 'CLIENTE':
        return 'Cliente';
      default:
        return 'Usuario';
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Ajustar el padding left según el estado del sidebar
  const navbarLeftPadding = isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64';

  return (
    <>
      <header
        className={`bg-white shadow-sm fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${navbarLeftPadding}`}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center flex-1">
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </button>

              <div className="flex-shrink-0 ml-4 lg:hidden">
                <h1 className="text-2xl font-bold text-primary-600">CIES</h1>
              </div>

              {/* Breadcrumbs (desktop only) */}
              <div className="hidden lg:block ml-4">
                <Breadcrumbs />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <button
                onClick={() => setShowSearch(true)}
                className="hidden md:flex items-center px-3 py-2 text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label="Buscar"
              >
                <Search className="h-4 w-4 mr-2" />
                <span className="hidden lg:inline">Buscar...</span>
                <kbd className="hidden lg:inline ml-2 px-2 py-0.5 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded">
                  Ctrl+K
                </kbd>
              </button>

              {/* Fullscreen Toggle (desktop only) */}
              <button
                onClick={toggleFullscreen}
                className="hidden md:block p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label="Toggle fullscreen"
              >
                <Maximize2 className="h-5 w-5" />
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 relative transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-red-500 text-white text-xs font-semibold">
                        {unreadNotifications}
                      </span>
                    </span>
                  )}
                </button>

                <NotificationsDropdown
                  isOpen={showNotifications}
                  onClose={() => setShowNotifications(false)}
                  notifications={mockNotifications}
                />
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                      {profile?.nombre || user?.email}
                    </p>
                    <p className="text-xs text-gray-500">{getRoleName(profile?.rol)}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold shadow-md">
                    {profile?.nombre?.charAt(0).toUpperCase() ||
                      user?.email?.charAt(0).toUpperCase() ||
                      'U'}
                  </div>
                </button>

                <UserDropdown
                  isOpen={showUserMenu}
                  onClose={() => setShowUserMenu(false)}
                  user={user}
                  profile={profile}
                  logout={logout}
                  getRoleName={getRoleName}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />

      {/* Keyboard shortcut for search */}
      {typeof window !== 'undefined' && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('keydown', function(e) {
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent('open-search'));
                }
              });
            `,
          }}
        />
      )}

      {/* Animations CSS */}
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

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
};
