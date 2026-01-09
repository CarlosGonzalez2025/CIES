import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Handshake,
  DollarSign,
  FileText,
  ClipboardList,
  BarChart3,
  Settings,
  Shield,
  X,
  Briefcase,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Bell,
  ChevronDown,
  ChevronUp,
  Circle,
  Menu
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// Menu sections for admin users
const adminMenuSections = [
  {
    title: 'Principal',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/', badge: null },
    ],
  },
  {
    title: 'Gestión',
    items: [
      { icon: Users, label: 'Clientes', path: '/clientes', badge: null },
      { icon: Handshake, label: 'Aliados', path: '/aliados', badge: null },
      { icon: Shield, label: 'Usuarios', path: '/usuarios', badge: null },
    ],
  },
  {
    title: 'Operaciones',
    items: [
      { icon: DollarSign, label: 'Comisiones', path: '/comisiones', badge: null },
      { icon: FileText, label: 'Presupuesto', path: '/presupuesto', badge: null },
      { icon: ClipboardList, label: 'Órdenes de Servicio', path: '/ordenes-servicio', badge: null },
    ],
  },
  {
    title: 'Análisis',
    items: [
      { icon: BarChart3, label: 'Reportes', path: '/reportes', badge: null },
    ],
  },
  {
    title: 'Configuración',
    items: [
      { icon: BookOpen, label: 'Guía de Usuario', path: '/ayuda', badge: null },
      { icon: Settings, label: 'Configuración', path: '/configuracion', badge: null },
    ],
  },
];

// Menu for client users
const clienteMenuSections = [
  {
    title: 'Mi Portal',
    items: [
      { icon: Briefcase, label: 'Mi Portal', path: '/portal-cliente', badge: null },
    ],
  },
  {
    title: 'Soporte',
    items: [
      { icon: BookOpen, label: 'Ayuda', path: '/ayuda', badge: null },
      { icon: Settings, label: 'Configuración', path: '/configuracion', badge: null },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Componente de item de menú
const MenuItem: React.FC<{
  item: any;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}> = ({ item, isActive, isCollapsed, onClick }) => {
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`group relative flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
          ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }`}
      title={isCollapsed ? item.label : ''}
    >
      <Icon
        className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
          }`}
      />
      {!isCollapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              {item.badge}
            </span>
          )}
        </>
      )}

      {/* Tooltip para modo colapsado */}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
          {item.label}
          {item.badge && (
            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-primary-600 text-white">
              {item.badge}
            </span>
          )}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
        </div>
      )}
    </Link>
  );
};

// Componente de sección de menú
const MenuSection: React.FC<{
  section: any;
  isCollapsed: boolean;
  hasPermission: (path: string) => boolean;
  location: any;
  onItemClick: () => void;
}> = ({ section, isCollapsed, hasPermission, location, onItemClick }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const authorizedItems = section.items.filter((item: any) => {
    if (item.path === '/' || item.path === '/configuracion' || item.path === '/ayuda') return true;
    return hasPermission(item.path);
  });

  if (authorizedItems.length === 0) return null;

  return (
    <div className="mb-6">
      {!isCollapsed && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
        >
          <span>{section.title}</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      )}

      {isCollapsed && (
        <div className="flex justify-center mb-3">
          <div className="w-8 h-px bg-gray-300" />
        </div>
      )}

      <div
        className={`space-y-1 transition-all duration-300 ${!isCollapsed && !isExpanded ? 'max-h-0 overflow-hidden opacity-0' : 'max-h-screen opacity-100'
          }`}
      >
        {authorizedItems.map((item: any) => (
          <MenuItem
            key={item.path}
            item={item}
            isActive={location.pathname === item.path}
            isCollapsed={isCollapsed}
            onClick={onItemClick}
          />
        ))}
      </div>
    </div>
  );
};

// Componente de perfil de usuario
const UserProfile: React.FC<{
  profile: any;
  isCollapsed: boolean;
  onLogout: () => void;
}> = ({ profile, isCollapsed, onLogout }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getRoleBadge = (rol: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      ADMIN: { color: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Admin' },
      ANALISTA: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Analista' },
      CONSULTA: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Consulta' },
      CLIENTE: { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Cliente' },
    };
    return badges[rol] || badges.CONSULTA;
  };

  const roleBadge = getRoleBadge(profile?.rol || 'CONSULTA');

  if (isCollapsed) {
    return (
      <div className="relative group">
        <button
          className="w-full p-3 flex items-center justify-center hover:bg-gray-100 transition-colors rounded-lg"
          title={profile?.email || 'Usuario'}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold text-sm shadow-md">
            {profile?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
        </button>

        {/* Tooltip con menú */}
        <div className="absolute left-full bottom-0 ml-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="p-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">{profile?.email}</p>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mt-1 ${roleBadge.color}`}
            >
              {roleBadge.label}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-full p-3 flex items-center space-x-3 hover:bg-gray-100 transition-colors rounded-lg"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold shadow-md">
          {profile?.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{profile?.email}</p>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${roleBadge.color}`}
          >
            {roleBadge.label}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${showMenu ? 'rotate-180' : ''
            }`}
        />
      </button>

      {showMenu && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          <button
            onClick={onLogout}
            className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { hasPermission, profile, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuSections = profile?.rol === 'CLIENTE' ? clienteMenuSections : adminMenuSections;

  const handleLogout = () => {
    logout();
    onClose();
  };

  const sidebarContent = (
    <aside
      className={`h-full bg-white shadow-xl overflow-hidden flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'
        }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 shrink-0 bg-gradient-to-r from-primary-600 to-primary-700">
        {!isCollapsed && <h1 className="text-2xl font-bold text-white">CIES</h1>}
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-md text-white hover:bg-primary-800 transition-colors"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        {isCollapsed && (
          <div className="w-full flex justify-center">
            <span className="text-2xl font-bold text-white">C</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {menuSections.map((section, index) => (
          <MenuSection
            key={index}
            section={section}
            isCollapsed={isCollapsed}
            hasPermission={hasPermission}
            location={location}
            onItemClick={onClose}
          />
        ))}
      </nav>

      {/* Footer con perfil de usuario */}
      <div className="border-t border-gray-200 shrink-0">
        <UserProfile profile={profile} isCollapsed={isCollapsed} onLogout={handleLogout} />

        {/* Toggle collapse button (desktop only) */}
        <div className="hidden lg:block border-t border-gray-200">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full p-3 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
            aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <div className="flex items-center space-x-2">
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Colapsar</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      />

      {/* Mobile sidebar */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 transform transition-transform duration-300 lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {sidebarContent}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed top-0 left-0 bottom-0 z-30">{sidebarContent}</div>

      {/* Styles para scrollbar personalizada */}
      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </>
  );
};
