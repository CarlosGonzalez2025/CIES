import React, { useState, useMemo } from 'react';
import { Table } from '../ui/Table';
import type { OrdenServicio } from '../../types';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import {
  Search,
  Filter,
  Download,
  FileText,
  Building2,
  Users,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Activity,
  TrendingUp,
  Briefcase,
  Target,
  Wallet,
  Eye,
  Hash,
  Info,
  BarChart3
} from 'lucide-react';
import { Button } from '../ui/Button';

interface OrdenesListProps {
  ordenes: OrdenServicio[];
  onEdit: (orden: OrdenServicio) => void;
  onDelete: (orden: OrdenServicio) => void;
  isLoading?: boolean;
}

// Configuración de estados con colores e iconos
const ESTADO_CONFIG = {
  PENDIENTE: {
    variant: 'warning' as const,
    color: 'amber',
    icon: Clock,
    label: 'Pendiente',
    description: 'En espera de ejecución',
  },
  EJECUTADO: {
    variant: 'primary' as const,
    color: 'blue',
    icon: CheckCircle2,
    label: 'Ejecutado',
    description: 'Servicio completado',
  },
  FACTURADO: {
    variant: 'success' as const,
    color: 'green',
    icon: FileText,
    label: 'Facturado',
    description: 'Proceso finalizado',
  },
  ANULADO: {
    variant: 'danger' as const,
    color: 'red',
    icon: XCircle,
    label: 'Anulado',
    description: 'Orden cancelada',
  },
};

// Badge mejorado con icono
const StatusBadgeWithIcon: React.FC<{ estado?: string }> = ({ estado }) => {
  const config = ESTADO_CONFIG[estado as keyof typeof ESTADO_CONFIG] || ESTADO_CONFIG.PENDIENTE;
  const Icon = config.icon;

  return (
    <div className="flex items-center space-x-2">
      <Badge variant={config.variant} className="inline-flex items-center space-x-1.5">
        <Icon className="w-3.5 h-3.5" />
        <span>{config.label}</span>
      </Badge>
    </div>
  );
};

// Componente de información de orden
const OrdenInfo: React.FC<{ orden: OrdenServicio }> = ({ orden }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
          {orden.os_numero?.charAt(0).toUpperCase() || 'OS'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 flex items-center">
            <Hash className="w-3 h-3 mr-1 text-gray-400" />
            {orden.os_numero || 'Sin número'}
          </p>
          {orden.fecha_envio && (
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <Calendar className="w-3 h-3 mr-1" />
              {formatDate(orden.fecha_envio)}
            </p>
          )}
          {orden.presupuesto && (
            <p className="text-xs text-blue-600 flex items-center mt-0.5">
              <Wallet className="w-3 h-3 mr-1" />
              Vinculada a presupuesto
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente de cliente y aliado
const ClienteAliadoInfo: React.FC<{
  cliente?: { nombre_cliente: string };
  aliado?: { aliado: string };
}> = ({ cliente, aliado }) => {
  return (
    <div className="space-y-2">
      {cliente && (
        <div className="flex items-center text-sm">
          <Building2 className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
          <span className="font-medium text-gray-900 truncate">{cliente.nombre_cliente}</span>
        </div>
      )}
      {aliado && (
        <div className="flex items-center text-xs text-gray-600">
          <Users className="w-3 h-3 mr-1.5 text-gray-400" />
          <span className="truncate">{aliado.aliado}</span>
        </div>
      )}
      {!cliente && !aliado && (
        <span className="text-xs text-gray-400">Sin asignación</span>
      )}
    </div>
  );
};

// Componente de servicio
const ServicioInfo: React.FC<{ orden: OrdenServicio }> = ({ orden }) => {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-gray-900 line-clamp-2">
        {orden.servicio_contratado || 'Sin descripción'}
      </p>
      {orden.especialidad && (
        <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
          <Target className="w-3 h-3 mr-1" />
          {orden.especialidad}
        </div>
      )}
      {orden.categoria_servicio && (
        <p className="text-xs text-gray-500 flex items-center mt-1">
          <Briefcase className="w-3 h-3 mr-1" />
          {orden.categoria_servicio}
        </p>
      )}
    </div>
  );
};

// Componente de detalles financieros
const FinancialDetails: React.FC<{
  unidad?: number;
  costoHora?: number;
  total?: number;
}> = ({ unidad, costoHora, total }) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Total:</span>
        <span className="text-sm font-bold text-gray-900">
          {formatCurrency(total || 0)}
        </span>
      </div>
      {unidad && costoHora && (
        <>
          <div className="flex items-center justify-between text-xs text-gray-600 border-t border-gray-100 pt-1.5">
            <span>Unidades:</span>
            <span className="font-medium">{unidad.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Costo unit:</span>
            <span className="font-medium">{formatCurrency(costoHora)}</span>
          </div>
        </>
      )}
    </div>
  );
};

// Barra de estadísticas
const StatsBar: React.FC<{ ordenes: OrdenServicio[] }> = ({ ordenes }) => {
  const stats = useMemo(() => {
    const total = ordenes.length;
    const pendientes = ordenes.filter((o) => o.estado_actividad === 'PENDIENTE').length;
    const ejecutadas = ordenes.filter((o) => o.estado_actividad === 'EJECUTADO').length;
    const facturadas = ordenes.filter((o) => o.estado_actividad === 'FACTURADO').length;
    const anuladas = ordenes.filter((o) => o.estado_actividad === 'ANULADO').length;
    const totalValor = ordenes
      .filter((o) => o.estado_actividad !== 'ANULADO')
      .reduce((acc, o) => acc + (o.total || 0), 0);
    const valorFacturado = ordenes
      .filter((o) => o.estado_actividad === 'FACTURADO')
      .reduce((acc, o) => acc + (o.total || 0), 0);

    return {
      total,
      pendientes,
      ejecutadas,
      facturadas,
      anuladas,
      totalValor,
      valorFacturado,
    };
  }, [ordenes]);

  const statCards = [
    {
      label: 'Total Órdenes',
      value: stats.total.toString(),
      icon: FileText,
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-500/10',
      description: 'Todas las órdenes',
    },
    {
      label: 'Pendientes',
      value: stats.pendientes.toString(),
      icon: Clock,
      gradient: 'from-amber-500 to-amber-600',
      iconBg: 'bg-amber-500/10',
      description: 'En espera',
    },
    {
      label: 'Ejecutadas',
      value: stats.ejecutadas.toString(),
      icon: CheckCircle2,
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-500/10',
      description: 'Completadas',
    },
    {
      label: 'Facturadas',
      value: stats.facturadas.toString(),
      icon: FileText,
      gradient: 'from-green-500 to-green-600',
      iconBg: 'bg-green-500/10',
      description: formatCurrency(stats.valorFacturado),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statCards.map((card, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br from-${card.gradient.split('-')[1]}-50 to-${card.gradient.split('-')[1]
            }-50 rounded-lg p-4 border border-${card.gradient.split('-')[1]}-100`}
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className={`w-10 h-10 ${card.iconBg} rounded-full flex items-center justify-center`}
            >
              <card.icon className={`w-5 h-5 text-${card.gradient.split('-')[1]}-600`} />
            </div>
          </div>
          <p className={`text-xs font-medium text-${card.gradient.split('-')[1]}-600 mb-1`}>
            {card.label}
          </p>
          <p className={`text-2xl font-bold text-${card.gradient.split('-')[1]}-900`}>
            {card.value}
          </p>
          <p className={`text-xs text-${card.gradient.split('-')[1]}-600 mt-1`}>
            {card.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export const OrdenesList: React.FC<OrdenesListProps> = ({
  ordenes,
  onEdit,
  onDelete,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [filterCliente, setFilterCliente] = useState<string>('all');
  const [filterFechaInicio, setFilterFechaInicio] = useState('');
  const [filterFechaFin, setFilterFechaFin] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filtrado y búsqueda
  const filteredOrdenes = useMemo(() => {
    let filtered = [...ordenes];

    // Búsqueda global
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (orden) =>
          orden.os_numero?.toLowerCase().includes(search) ||
          orden.cliente?.nombre_cliente?.toLowerCase().includes(search) ||
          orden.aliado?.aliado?.toLowerCase().includes(search) ||
          orden.servicio_contratado?.toLowerCase().includes(search)
      );
    }

    // Filtro por estado
    if (filterEstado !== 'all') {
      filtered = filtered.filter((orden) => orden.estado_actividad === filterEstado);
    }

    // Filtro por cliente
    if (filterCliente !== 'all') {
      filtered = filtered.filter((orden) => orden.empresa_id === filterCliente);
    }

    // Filtro por rango de fechas
    if (filterFechaInicio) {
      filtered = filtered.filter(
        (orden) => new Date(orden.fecha_envio) >= new Date(filterFechaInicio)
      );
    }
    if (filterFechaFin) {
      filtered = filtered.filter(
        (orden) => new Date(orden.fecha_envio) <= new Date(filterFechaFin)
      );
    }

    return filtered.sort(
      (a, b) => new Date(b.fecha_envio).getTime() - new Date(a.fecha_envio).getTime()
    );
  }, [ordenes, searchTerm, filterEstado, filterCliente, filterFechaInicio, filterFechaFin]);

  // Obtener opciones únicas para filtros
  const clienteOptions = useMemo(() => {
    const clientes = new Map();
    ordenes.forEach((o) => {
      if (o.empresa_id && o.cliente) {
        clientes.set(o.empresa_id, o.cliente.nombre_cliente);
      }
    });
    return Array.from(clientes.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [ordenes]);

  // Exportar a CSV
  const handleExport = () => {
    const headers = [
      'Número OS',
      'Fecha Envío',
      'Cliente',
      'Aliado',
      'Servicio',
      'Especialidad',
      'Unidades',
      'Costo Unitario',
      'Total',
      'Estado',
      'Número Factura',
      'Fecha Radicación',
    ];

    const csvData = filteredOrdenes.map((o) => [
      o.os_numero || '',
      formatDate(o.fecha_envio),
      o.cliente?.nombre_cliente || '',
      o.aliado?.aliado || '',
      o.servicio_contratado || '',
      o.especialidad || '',
      o.unidad || '',
      o.costo_hora || '',
      o.total || '',
      o.estado_actividad || '',
      o.numero_factura || '',
      o.fecha_radicacion ? formatDate(o.fecha_radicacion) : '',
    ]);

    const csv = [headers, ...csvData].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ordenes_servicio_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const hasActiveFilters =
    filterEstado !== 'all' || filterCliente !== 'all' || filterFechaInicio || filterFechaFin;

  const clearFilters = () => {
    setFilterEstado('all');
    setFilterCliente('all');
    setFilterFechaInicio('');
    setFilterFechaFin('');
  };

  const columns = [
    {
      key: 'orden',
      label: 'Orden de Servicio',
      render: (o: OrdenServicio) => <OrdenInfo orden={o} />,
    },
    {
      key: 'cliente_aliado',
      label: 'Cliente y Aliado',
      render: (o: OrdenServicio) => <ClienteAliadoInfo cliente={o.cliente} aliado={o.aliado} />,
    },
    {
      key: 'servicio',
      label: 'Servicio Contratado',
      render: (o: OrdenServicio) => <ServicioInfo orden={o} />,
    },
    {
      key: 'financiero',
      label: 'Detalles Financieros',
      render: (o: OrdenServicio) => (
        <FinancialDetails unidad={o.unidad} costoHora={o.costo_hora} total={o.total} />
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (o: OrdenServicio) => (
        <div className="space-y-2">
          <StatusBadgeWithIcon estado={o.estado_actividad} />
          {o.numero_factura && (
            <p className="text-xs text-gray-600 flex items-center">
              <FileText className="w-3 h-3 mr-1" />
              {o.numero_factura}
            </p>
          )}
          {o.fecha_radicacion && (
            <p className="text-xs text-gray-500 flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {formatDate(o.fecha_radicacion)}
            </p>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Barra de estadísticas */}
      <StatsBar ordenes={ordenes} />

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por número OS, cliente, aliado o servicio..."
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
              disabled={filteredOrdenes.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Panel de filtros expandible */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 animate-slide-down">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  {Object.entries(ESTADO_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  Cliente
                </label>
                <select
                  value={filterCliente}
                  onChange={(e) => setFilterCliente(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">Todos los clientes</option>
                  {clienteOptions.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Fecha Desde
                </label>
                <input
                  type="date"
                  value={filterFechaInicio}
                  onChange={(e) => setFilterFechaInicio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Fecha Hasta
                </label>
                <input
                  type="date"
                  value={filterFechaFin}
                  onChange={(e) => setFilterFechaFin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={clearFilters} className="text-sm">
                  <X className="w-4 h-4 mr-2" />
                  Limpiar todos los filtros
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
                Mostrando <strong className="text-gray-900">{filteredOrdenes.length}</strong> de{' '}
                <strong className="text-gray-900">{ordenes.length}</strong> órdenes
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>
                Total: <strong className="text-gray-900">{ordenes.length}</strong> órdenes de
                servicio
              </span>
            </>
          )}
        </div>

        {filteredOrdenes.length === 0 && !isLoading && (
          <span className="text-amber-600 font-medium">No se encontraron resultados</span>
        )}
      </div>

      {/* Tabla */}
      <Table<OrdenServicio>
        columns={columns}
        data={filteredOrdenes}
        onEdit={onEdit}
        onDelete={onDelete}
        isLoading={isLoading}
        getRowKey={(o) => o.id}
        emptyMessage={
          searchTerm || hasActiveFilters
            ? 'No se encontraron órdenes con los criterios de búsqueda'
            : 'No hay órdenes de servicio registradas. Crea la primera para comenzar.'
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
