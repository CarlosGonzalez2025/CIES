import React, { useState, useMemo } from 'react';
import { Table } from '../ui/Table';
import type { Cliente } from '../../types';
import { formatDate, formatCurrency } from '../../utils/formatters';
import {
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  Building2,
  Shield,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Percent,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  MapPin,
  Activity
} from 'lucide-react';
import { Button } from '../ui/Button';

interface ClientesListProps {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (cliente: Cliente) => void;
  isLoading?: boolean;
}

// Badge para ARL con colores
const ARLBadge: React.FC<{ arl?: { nombre: string; id: string } }> = ({ arl }) => {
  if (!arl) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
        <AlertCircle className="w-3 h-3 mr-1" />
        Sin ARL
      </span>
    );
  }

  // Colores por ARL (puedes personalizar según ARLs específicas)
  const arlColors: Record<string, string> = {
    'sura': 'bg-blue-100 text-blue-700 border-blue-200',
    'positiva': 'bg-green-100 text-green-700 border-green-200',
    'colmena': 'bg-amber-100 text-amber-700 border-amber-200',
    'axa': 'bg-purple-100 text-purple-700 border-purple-200',
    'bolivar': 'bg-red-100 text-red-700 border-red-200',
  };

  const normalizedName = arl.nombre.toLowerCase();
  const colorClass = Object.entries(arlColors).find(([key]) =>
    normalizedName.includes(key)
  )?.[1] || 'bg-indigo-100 text-indigo-700 border-indigo-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
      <Shield className="w-3 h-3 mr-1" />
      {arl.nombre}
    </span>
  );
};

// Componente de información de contacto
const ContactInfo: React.FC<{
  nombre?: string;
  telefono?: string;
  email?: string;
}> = ({ nombre, telefono, email }) => {
  return (
    <div className="space-y-1.5">
      {nombre && (
        <p className="text-sm font-medium text-gray-900">{nombre}</p>
      )}
      {telefono && (
        <div className="flex items-center text-xs text-gray-600">
          <Phone className="w-3 h-3 mr-1.5 text-gray-400" />
          <a
            href={`tel:${telefono}`}
            className="hover:text-primary-600 transition-colors"
          >
            {telefono}
          </a>
        </div>
      )}
      {email && (
        <div className="flex items-center text-xs text-gray-600">
          <Mail className="w-3 h-3 mr-1.5 text-gray-400" />
          <a
            href={`mailto:${email}`}
            className="hover:text-primary-600 transition-colors truncate max-w-[200px]"
            title={email}
          >
            {email}
          </a>
        </div>
      )}
      {!nombre && !telefono && !email && (
        <span className="text-xs text-gray-400">Sin contacto</span>
      )}
    </div>
  );
};

// Componente para mostrar tarifas con comisión
const TarifaComisionDisplay: React.FC<{
  valorHora?: number;
  porcentajeComision?: number;
}> = ({ valorHora, porcentajeComision }) => {
  if (!valorHora) {
    return <span className="text-xs text-gray-400">Sin tarifa</span>;
  }

  const comisionMensual = valorHora && porcentajeComision
    ? valorHora * 160 * porcentajeComision
    : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-semibold text-gray-900">
          {formatCurrency(valorHora)}
        </span>
        <span className="text-xs text-gray-500">/hora</span>
      </div>

      {porcentajeComision && (
        <>
          <div className="flex items-center space-x-1">
            <Percent className="w-3 h-3 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">
              {(porcentajeComision * 100).toFixed(2)}% comisión
            </span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <TrendingUp className="w-3 h-3 text-gray-400" />
            <span>
              <strong className="text-emerald-600">
                {formatCurrency(comisionMensual)}
              </strong>
              /mes
            </span>
          </div>
        </>
      )}
    </div>
  );
};

// Barra de estadísticas
const StatsBar: React.FC<{ clientes: Cliente[] }> = ({ clientes }) => {
  const stats = useMemo(() => {
    const total = clientes.length;
    const conARL = clientes.filter(c => c.arl_id).length;
    const valorHoraPromedio =
      clientes.reduce((acc, c) => acc + (c.valor_hora || 0), 0) / (total || 1);
    const comisionPromedioMensual =
      clientes.reduce((acc, c) => {
        const valor = (c.valor_hora || 0) * 160 * (c.porcentaje_comision || 0);
        return acc + valor;
      }, 0) / (total || 1);

    return { total, conARL, valorHoraPromedio, comisionPromedioMensual };
  }, [clientes]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-blue-600 mb-1">Total Clientes</p>
            <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
          </div>
          <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-purple-600 mb-1">Con ARL</p>
            <p className="text-2xl font-bold text-purple-900">{stats.conARL}</p>
          </div>
          <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-600 mb-1">Tarifa Prom.</p>
            <p className="text-lg font-bold text-emerald-900">
              {formatCurrency(stats.valorHoraPromedio)}
            </p>
          </div>
          <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-amber-600 mb-1">Comisión Prom.</p>
            <p className="text-lg font-bold text-amber-900">
              {formatCurrency(stats.comisionPromedioMensual)}
            </p>
          </div>
          <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ClientesList: React.FC<ClientesListProps> = ({
  clientes,
  onEdit,
  onDelete,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterARL, setFilterARL] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filtrado y búsqueda
  const filteredClientes = useMemo(() => {
    let filtered = [...clientes];

    // Búsqueda global
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (cliente) =>
          cliente.nombre_cliente?.toLowerCase().includes(search) ||
          cliente.nit_documento?.toLowerCase().includes(search) ||
          cliente.nombre_contacto?.toLowerCase().includes(search) ||
          cliente.email_contacto?.toLowerCase().includes(search) ||
          cliente.numero_contacto?.includes(search) ||
          cliente.arl?.nombre?.toLowerCase().includes(search)
      );
    }

    // Filtro por ARL
    if (filterARL !== 'all') {
      filtered = filtered.filter((cliente) => cliente.arl_id === filterARL);
    }

    return filtered;
  }, [clientes, searchTerm, filterARL]);

  // Obtener ARLs únicas para filtro
  const arlOptions = useMemo(() => {
    const uniqueArls = new Map();
    clientes.forEach((c) => {
      if (c.arl_id && c.arl) {
        uniqueArls.set(c.arl_id, c.arl.nombre);
      }
    });
    return Array.from(uniqueArls.entries()).map(([id, nombre]) => ({
      id,
      nombre,
    }));
  }, [clientes]);

  // Exportar a CSV
  const handleExport = () => {
    const headers = [
      'Cliente',
      'NIT',
      'ARL',
      'Contacto',
      'Teléfono',
      'Email',
      'Valor Hora',
      '% Comisión',
      'Fecha Registro',
    ];
    const csvData = filteredClientes.map((c) => [
      c.nombre_cliente || '',
      c.nit_documento || '',
      c.arl?.nombre || '',
      c.nombre_contacto || '',
      c.numero_contacto || '',
      c.email_contacto || '',
      c.valor_hora || '',
      c.porcentaje_comision || '',
      c.fecha ? formatDate(c.fecha) : '',
    ]);

    const csv = [headers, ...csvData].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const columns = [
    {
      key: 'nombre_cliente',
      label: 'Cliente',
      render: (cliente: Cliente) => (
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
            {cliente.nombre_cliente?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {cliente.nombre_cliente || 'Sin nombre'}
            </p>
            {cliente.nit_documento && (
              <p className="text-xs text-gray-500 flex items-center mt-1">
                <FileText className="w-3 h-3 mr-1" />
                NIT: {cliente.nit_documento}
              </p>
            )}
            {cliente.fecha && (
              <p className="text-xs text-gray-500 flex items-center mt-0.5">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(cliente.fecha)}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'arl',
      label: 'ARL Asignada',
      render: (cliente: Cliente) => <ARLBadge arl={cliente.arl} />,
    },
    {
      key: 'contacto',
      label: 'Información de Contacto',
      render: (cliente: Cliente) => (
        <ContactInfo
          nombre={cliente.nombre_contacto}
          telefono={cliente.numero_contacto}
          email={cliente.email_contacto}
        />
      ),
    },
    {
      key: 'direccion',
      label: 'Ubicación',
      render: (cliente: Cliente) => (
        <div className="flex items-start space-x-2 max-w-xs">
          {cliente.direccion ? (
            <>
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 line-clamp-2">{cliente.direccion}</p>
            </>
          ) : (
            <span className="text-xs text-gray-400">Sin dirección</span>
          )}
        </div>
      ),
    },
    {
      key: 'tarifa',
      label: 'Tarifas y Comisión',
      render: (cliente: Cliente) => (
        <TarifaComisionDisplay
          valorHora={cliente.valor_hora}
          porcentajeComision={cliente.porcentaje_comision}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Barra de estadísticas */}
      <StatsBar clientes={clientes} />

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, NIT, contacto, email, ARL..."
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
              className={`${showFilters ? 'bg-primary-50 border-primary-300' : ''}`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
              {filterARL !== 'all' && (
                <span className="ml-2 w-2 h-2 bg-primary-600 rounded-full" />
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleExport}
              disabled={filteredClientes.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Panel de filtros expandible */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 animate-slide-down">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Shield className="w-4 h-4 inline mr-1" />
                  ARL
                </label>
                <select
                  value={filterARL}
                  onChange={(e) => setFilterARL(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">Todas las ARL</option>
                  {arlOptions.map((arl) => (
                    <option key={arl.id} value={arl.id}>
                      {arl.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botón para limpiar filtros */}
              {filterARL !== 'all' && (
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => setFilterARL('all')}
                    className="w-full"
                  >
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Contador de resultados */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          {searchTerm || filterARL !== 'all' ? (
            <>
              <Activity className="w-4 h-4 text-primary-600" />
              <span>
                Mostrando <strong className="text-gray-900">{filteredClientes.length}</strong> de{' '}
                <strong className="text-gray-900">{clientes.length}</strong> clientes
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>
                Total: <strong className="text-gray-900">{clientes.length}</strong> clientes
              </span>
            </>
          )}
        </div>

        {filteredClientes.length === 0 && !isLoading && (
          <span className="text-amber-600 font-medium">No se encontraron resultados</span>
        )}
      </div>

      {/* Tabla */}
      <Table<Cliente>
        columns={columns}
        data={filteredClientes}
        onEdit={onEdit}
        onDelete={onDelete}
        isLoading={isLoading}
        getRowKey={(cliente) => cliente.id}
        emptyMessage={
          searchTerm || filterARL !== 'all'
            ? 'No se encontraron clientes con los criterios de búsqueda'
            : 'No hay clientes registrados. Crea el primero para comenzar.'
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
