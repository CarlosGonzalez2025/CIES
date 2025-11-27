
import React from 'react';
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
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// Menu for admin users (ADMIN, ANALISTA, CONSULTA)
const adminMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Clientes', path: '/clientes' },
  { icon: Handshake, label: 'Aliados', path: '/aliados' },
  { icon: DollarSign, label: 'Comisiones', path: '/comisiones' },
  { icon: FileText, label: 'Presupuesto', path: '/presupuesto' },
  { icon: ClipboardList, label: 'Órdenes de Servicio', path: '/ordenes-servicio' },
  { icon: BarChart3, label: 'Reportes', path: '/reportes' },
  { icon: Shield, label: 'Usuarios', path: '/usuarios' },
  { icon: Settings, label: 'Configuración', path: '/configuracion' },
];

// Menu for client users (CLIENTE)
const clienteMenuItems = [
  { icon: Briefcase, label: 'Mi Portal', path: '/portal-cliente' },
  { icon: Settings, label: 'Configuración', path: '/configuracion' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { hasPermission, profile } = useAuth();

  // Select menu based on user role
  const menuItems = profile?.rol === 'CLIENTE' ? clienteMenuItems : adminMenuItems;

  // Filter items based on permissions
  const authorizedItems = menuItems.filter(item => {
      if (item.path === '/portal-cliente') return true; // Client portal always visible for clients
      if (item.path === '/') return true; // Dashboard always visible
      if (item.path === '/configuracion') return true; // Config always visible
      return hasPermission(item.path);
  });

  const sidebarContent = (
    <aside className='h-full w-64 bg-white shadow-lg overflow-y-auto flex flex-col'>
        <div className="flex items-center justify-between p-4 h-16 border-b shrink-0">
            <h1 className="text-2xl font-bold text-primary-600">CIES</h1>
            <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                aria-label="Close menu"
            >
                <X className="h-6 w-6" />
            </button>
        </div>
      <nav className="p-4 space-y-1 flex-1">
        {authorizedItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary-700' : 'text-gray-400'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed top-0 left-0 bottom-0 z-50 transform transition-transform duration-300 lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed top-0 left-0 bottom-0">
        {sidebarContent}
      </div>
    </>
  );
};
