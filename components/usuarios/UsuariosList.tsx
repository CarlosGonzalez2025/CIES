import React, { useState, useMemo } from 'react';
import { Table } from '../ui/Table';
import type { PerfilUsuario } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatDate } from '../../utils/formatters';
import {
  Search,
  Filter,
  Download,
  UserPlus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  UserCog,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Mail,
  Building2,
  Globe,
  Activity,
  Eye,
  Edit,
  Trash2,
  X,
  Info,
  Calendar,
  Lock,
  Unlock,
  Users as UsersIcon,
  TrendingUp,
  UserCheck,
  UserX,
  MoreVertical,
  Key,
  RefreshCw
} from 'lucide-react';

interface UsuariosListProps {
  usuarios: PerfilUsuario[];
  onEdit: (usuario: PerfilUsuario) => void;
  onDelete: (usuario: PerfilUsuario) => void;
  isLoading?: boolean;
  onToggleStatus?: (usuario: PerfilUsuario) => void;
  onResetPassword?: (usuario: PerfilUsuario) => void;
}

// Configuración de roles
const ROLES_CONFIG = {
  ADMIN: {
    label: 'Administrador',
    icon: ShieldCheck,
    variant: 'primary' as const,
    color: 'purple',
    description: 'Acceso total',
  },
  ANALISTA: {
    label: 'Analista',
    icon: UserCog,
    variant: 'info' as const,
    color: 'blue',
    description: 'Gestión completa',
  },
  CONSULTA: {
    label: 'Consulta',
    icon: ShieldQuestion,
    variant: 'success' as const,
    color: 'green',
    description: 'Solo lectura',
  },
  CLIENTE: {
    label: 'Cliente',
    icon: ShieldAlert,
    variant: 'warning' as const,
    color: 'amber',
    description: 'Portal limitado',
  },
};

// Avatar de usuario
const UserAvatar: React.FC<{
  nombre: string;
  email: string;
  activo: boolean;
}> = ({ nombre, email, activo }) => {
  const initials = nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join('');

  const colors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-green-500 to-green-600',
    'from-pink-500 to-pink-600',
    'from-indigo-500 to-indigo-600',
    'from-amber-500 to-amber-600',
  ];

  const colorIndex = email.charCodeAt(0) % colors.length;
  const gradient = colors[colorIndex];

  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        <div
          className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-semibold shadow-md ${!activo ? 'opacity-50' : ''
            }`}
        >
          {initials}
        </div>
        {!activo && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
            <Lock className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${activo ? 'text-gray-900' : 'text-gray-500'}`}>
          {nombre}
        </p>
        <p className="text-xs text-gray-500 flex items-center truncate">
          <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
          {email}
        </p>
      </div>
    </div>
  );
};

// Badge de rol mejorado
const RolBadge: React.FC<{ rol: string }> = ({ rol }) => {
  const config = ROLES_CONFIG[rol as keyof typeof ROLES_CONFIG] || ROLES_CONFIG.CONSULTA;
  const Icon = config.icon;

  return (
    <div className="space-y-1">
      <Badge variant={config.variant} className="inline-flex items-center space-x-1.5">
        <Icon className="w-3.5 h-3.5" />
        <span>{config.label}</span>
      </Badge>
      <p className="text-xs text-gray-500">{config.description}</p>
    </div>
  );
};

// Vista de módulos autorizados
const ModulosView: React.FC<{
  rol: string;
  modulos: string[];
}> = ({ rol, modulos }) => {
  const [showAll, setShowAll] = useState(false);

  if (rol === 'ADMIN') {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-200">
        <Globe className="w-4 h-4 text-purple-600" />
        <span className="text-sm font-medium text-purple-900">Acceso Total</span>
      </div>
    );
  }

  if (rol === 'CLIENTE') {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200">
        <Building2 className="w-4 h-4 text-amber-600" />
        <span className="text-sm font-medium text-amber-900">Portal Cliente</span>
      </div>
    );
  }

  const modulosToShow = showAll ? modulos : modulos.slice(0, 2);

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Shield className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-semibold text-gray-900">{modulos.length} módulos</span>
      </div>
      <div className="space-y-1">
        {modulosToShow.map((modulo, index) => (
          <div
            key={index}
            className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-200 truncate"
          >
            {modulo.replace('/', '').replace('-', ' ')}
          </div>
        ))}
      </div>
      {modulos.length > 2 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
        >
          {showAll ? 'Ver menos' : `+${modulos.length - 2} más`}
        </button>
      )}
    </div>
  );
};

// Barra de estadísticas
const StatsBar: React.FC<{ usuarios: PerfilUsuario[] }> = ({ usuarios }) => {
  const stats = useMemo(() => {
    const total = usuarios.length;
    const activos = usuarios.filter((u) => u.activo).length;
    const inactivos = total - activos;
    const admins = usuarios.filter((u) => u.rol === 'ADMIN').length;
    const analistas = usuarios.filter((u) => u.rol === 'ANALISTA').length;
    const clientes = usuarios.filter((u) => u.rol === 'CLIENTE').length;

    return { total, activos, inactivos, admins, analistas, clientes };
  }, [usuarios]);

  const statCards = [
    {
      label: 'Total Usuarios',
      value: stats.total.toString(),
      icon: UsersIcon,
      gradient: 'blue',
      description: 'En el sistema',
    },
    {
      label: 'Usuarios Activos',
      value: stats.activos.toString(),
      icon: UserCheck,
      gradient: 'green',
      description: `${stats.inactivos} inactivos`,
    },
    {
      label: 'Administradores',
      value: stats.admins.toString(),
      icon: ShieldCheck,
      gradient: 'purple',
      description: `${stats.analistas} analistas`,
    },
    {
      label: 'Clientes',
      value: stats.clientes.toString(),
      icon: Building2,
      gradient: 'amber',
      description: 'Portal externo',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statCards.map((card, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br from-${card.gradient}-50 to-${card.gradient}-50 rounded-lg p-4 border border-${card.gradient}-100`}
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className={`w-10 h-10 bg-${card.gradient}-500/10 rounded-full flex items-center justify-center`}
            >
              <card.icon className={`w-5 h-5 text-${card.gradient}-600`} />
            </div>
          </div>
          <p className={`text-xs font-medium text-${card.gradient}-600 mb-1`}>{card.label}</p>
          <p className={`text-2xl font-bold text-${card.gradient}-900`}>{card.value}</p>
          <p className={`text-xs text-${card.gradient}-600 mt-1`}>{card.description}</p>
        </div>
      ))}
    </div>
  );
};

// Menú de acciones rápidas
const QuickActionsMenu: React.FC<{
  usuario: PerfilUsuario;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus?: () => void;
  onResetPassword?: () => void;
}> = ({ usuario, onEdit, onDelete, onToggleStatus, onResetPassword }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical className="w-4 h-4 text-gray-600" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
            <div className="py-1">
              <button
                onClick={() => {
                  onEdit();
                  setShowMenu(false);
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4 mr-3 text-blue-600" />
                Editar usuario
              </button>

              {onToggleStatus && (
                <button
                  onClick={() => {
                    onToggleStatus();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {usuario.activo ? (
                    <>
                      <Lock className="w-4 h-4 mr-3 text-amber-600" />
                      Desactivar usuario
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4 mr-3 text-green-600" />
                      Activar usuario
                    </>
                  )}
                </button>
              )}

              {onResetPassword && (
                <button
                  onClick={() => {
                    onResetPassword();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Key className="w-4 h-4 mr-3 text-purple-600" />
                  Restablecer contraseña
                </button>
              )}

              <div className="border-t border-gray-100 my-1" />

              <button
                onClick={() => {
                  if (confirm(`¿Estás seguro de eliminar a ${usuario.nombre}?`)) {
                    onDelete();
                  }
                  setShowMenu(false);
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-3" />
                Eliminar usuario
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const UsuariosList: React.FC<UsuariosListProps> = ({
  usuarios,
  onEdit,
  onDelete,
  isLoading,
  onToggleStatus,
  onResetPassword,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState<string>('all');
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filtrado y búsqueda
  const filteredUsuarios = useMemo(() => {
    let filtered = [...usuarios];

    // Búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.nombre?.toLowerCase().includes(search) ||
          u.email?.toLowerCase().includes(search) ||
          u.rol?.toLowerCase().includes(search)
      );
    }

    // Filtro por rol
    if (filterRol !== 'all') {
      filtered = filtered.filter((u) => u.rol === filterRol);
    }

    // Filtro por estado
    if (filterEstado === 'activos') {
      filtered = filtered.filter((u) => u.activo);
    } else if (filterEstado === 'inactivos') {
      filtered = filtered.filter((u) => !u.activo);
    }

    return filtered;
  }, [usuarios, searchTerm, filterRol, filterEstado]);

  // Exportar a CSV
  const handleExport = () => {
    const headers = ['Nombre', 'Email', 'Rol', 'Módulos', 'Estado', 'Fecha Registro'];

    const csvData = filteredUsuarios.map((u) => [
      u.nombre,
      u.email,
      u.rol,
      u.rol === 'ADMIN' ? 'Todos' : u.modulos_autorizados?.length || 0,
      u.activo ? 'Activo' : 'Inactivo',
      formatDate(u.created_at),
    ]);

    const csv = [headers, ...csvData].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const hasActiveFilters = filterRol !== 'all' || filterEstado !== 'all';

  const clearFilters = () => {
    setFilterRol('all');
    setFilterEstado('all');
  };

  const columns = [
    {
      key: 'usuario',
      label: 'Usuario',
      render: (u: PerfilUsuario) => (
        <UserAvatar nombre={u.nombre} email={u.email} activo={u.activo} />
      ),
    },
    {
      key: 'rol',
      label: 'Rol y Permisos',
      render: (u: PerfilUsuario) => <RolBadge rol={u.rol} />,
    },
    {
      key: 'modulos',
      label: 'Acceso a Módulos',
      render: (u: PerfilUsuario) => (
        <ModulosView rol={u.rol} modulos={u.modulos_autorizados || []} />
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (u: PerfilUsuario) => (
        <div className="space-y-2">
          <Badge variant={u.activo ? 'success' : 'danger'} className="inline-flex items-center space-x-1.5">
            {u.activo ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Activo</span>
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5" />
                <span>Inactivo</span>
              </>
            )}
          </Badge>
          {u.cliente && (
            <div className="flex items-center space-x-1.5 text-xs text-gray-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
              <Building2 className="w-3 h-3 text-amber-600" />
              <span className="truncate">{u.cliente.nombre_cliente}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'registro',
      label: 'Información',
      render: (u: PerfilUsuario) => (
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>{formatDate(u.created_at)}</span>
          </div>
          {u.last_sign_in_at && (
            <div className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>Último acceso: {formatDate(u.last_sign_in_at)}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (u: PerfilUsuario) => (
        <QuickActionsMenu
          usuario={u}
          onEdit={() => onEdit(u)}
          onDelete={() => onDelete(u)}
          onToggleStatus={onToggleStatus ? () => onToggleStatus(u) : undefined}
          onResetPassword={onResetPassword ? () => onResetPassword(u) : undefined}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Barra de estadísticas */}
      <StatsBar usuarios={usuarios} />

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o rol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`${showFilters || hasActiveFilters ? 'bg-primary-50 border-primary-300' : ''
                }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
              {hasActiveFilters && <span className="ml-2 w-2 h-2 bg-primary-600 rounded-full" />}
            </Button>

            <Button
              variant="outline"
              onClick={handleExport}
              disabled={filteredUsuarios.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Panel de filtros expandible */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 animate-slide-down">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Rol
                </label>
                <select
                  value={filterRol}
                  onChange={(e) => setFilterRol(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">Todos los roles</option>
                  {Object.entries(ROLES_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Activity className="w-4 h-4 inline mr-1" />
                  Estado
                </label>
                <select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">Todos los estados</option>
                  <option value="activos">Solo activos</option>
                  <option value="inactivos">Solo inactivos</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={clearFilters} className="text-sm">
                  <X className="w-4 h-4 mr-2" />
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contador de resultados */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          {searchTerm || hasActiveFilters ? (
            <>
              <Activity className="w-4 h-4 text-primary-600" />
              <span>
                Mostrando <strong className="text-gray-900">{filteredUsuarios.length}</strong> de{' '}
                <strong className="text-gray-900">{usuarios.length}</strong> usuarios
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>
                Total: <strong className="text-gray-900">{usuarios.length}</strong> usuarios
              </span>
            </>
          )}
        </div>

        {filteredUsuarios.length === 0 && !isLoading && (
          <span className="text-amber-600 font-medium">No se encontraron resultados</span>
        )}
      </div>

      {/* Tabla */}
      <Table<PerfilUsuario>
        columns={columns}
        data={filteredUsuarios}
        onEdit={onEdit}
        onDelete={onDelete}
        isLoading={isLoading}
        getRowKey={(u) => u.id}
        emptyMessage={
          searchTerm || hasActiveFilters
            ? 'No se encontraron usuarios con los criterios de búsqueda'
            : 'No hay usuarios registrados. Crea el primero para comenzar.'
        }
      />

      {/* Animación CSS */}
      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
