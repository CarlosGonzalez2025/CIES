import React, { useState, useMemo } from 'react';
import { Table } from '../ui/Table';
import type { Presupuesto } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import {
  Search,
  Filter,
  Download,
  Building2,
  DollarSign,
  TrendingUp,
  Target,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  Activity,
  Users,
  PieChart,
  Percent,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Info,
  Briefcase,
  Zap
} from 'lucide-react';
import { Button } from '../ui/Button';

interface PresupuestoListProps {
  presupuestos: Presupuesto[];
  onEdit: (presupuesto: Presupuesto) => void;
  onDelete: (presupuesto: Presupuesto) => void;
  isLoading?: boolean;
}

// Configuración de estados
const ESTADO_CONFIG = {
  PENDIENTE: {
    variant: 'warning' as const,
    color: 'amber',
    icon: Clock,
    label: 'Pendiente',
  },
  ACTIVO: {
    variant: 'primary' as const,
    color: 'blue',
    icon: Activity,
    label: 'Activo',
  },
  'EN EJECUCIÓN': {
    variant: 'success' as const,
    color: 'green',
    icon: TrendingUp,
    label: 'En Ejecución',
  },
  COMPLETADO: {
    variant: 'default' as const,
    color: 'gray',
    icon: CheckCircle2,
    label: 'Completado',
  },
};

// Badge de estado mejorado
const StatusBadgeWithIcon: React.FC<{ estado: string }> = ({ estado }) => {
  const config = ESTADO_CONFIG[estado as keyof typeof ESTADO_CONFIG] || ESTADO_CONFIG.PENDIENTE;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="inline-flex items-center space-x-1.5">
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </Badge>
  );
};

// Barra de progreso con indicadores
const ProgressBar: React.FC<{
  percentage: number;
  ejecutado: number;
  total: number;
}> = ({ percentage, ejecutado, total }) => {
  const percentValue = Math.min(percentage * 100, 100);
  const isComplete = percentValue >= 100;
  const isHigh = percentValue >= 80;
  const isMedium = percentValue >= 50;

  const getColorClasses = () => {
    if (isComplete) return 'bg-gray-500';
    if (isHigh) return 'bg-amber-500';
    if (isMedium) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStatusIcon = () => {
    if (isComplete) return <CheckCircle2 className="w-3 h-3 text-gray-600" />;
    if (isHigh) return <AlertCircle className="w-3 h-3 text-amber-600" />;
    return <TrendingUp className="w-3 h-3 text-green-600" />;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1">
          {getStatusIcon()}
          <span className="font-medium text-gray-700">{percentValue.toFixed(1)}%</span>
        </div>
        <span className="text-gray-500">
          {formatCurrency(ejecutado)} / {formatCurrency(total)}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full ${getColorClasses()} transition-all duration-500 rounded-full relative`}
          style={{ width: `${percentValue}%` }}
        >
          {percentValue > 0 && (
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
};

// Componente de información financiera
const FinancialInfo: React.FC<{
  presupuesto: Presupuesto;
}> = ({ presupuesto }) => {
  const saldoDisponible = presupuesto.saldo_pendiente_ejecutar || 0;
  const porcentajeDisponible =
    presupuesto.inversion_ejecutar > 0
      ? (saldoDisponible / presupuesto.inversion_ejecutar) * 100
      : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">Presupuesto:</span>
        <span className="text-sm font-bold text-blue-900">
          {formatCurrency(presupuesto.inversion_ejecutar)}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-1.5">
        <span className="text-xs text-gray-600 flex items-center">
          <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
          Ejecutado:
        </span>
        <span className="text-sm font-semibold text-green-700">
          {formatCurrency(presupuesto.valor_ejecutado || 0)}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-1.5">
        <span className="text-xs text-gray-600 flex items-center">
          <Target className="w-3 h-3 mr-1 text-amber-600" />
          Disponible:
        </span>
        <div className="text-right">
          <span className="text-sm font-semibold text-amber-700">
            {formatCurrency(saldoDisponible)}
          </span>
          <div className="flex items-center justify-end space-x-1 mt-0.5">
            <Percent className="w-2.5 h-2.5 text-gray-400" />
            <span className="text-xs text-gray-600">{porcentajeDisponible.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de cliente e información
const ClienteInfo: React.FC<{
  cliente?: { nombre_cliente: string };
  aliado?: { aliado: string };
}> = ({ cliente, aliado }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
          {cliente?.nombre_cliente?.charAt(0).toUpperCase() || 'C'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {cliente?.nombre_cliente || 'Sin cliente'}
          </p>
          {aliado && (
            <p className="text-xs text-gray-500 flex items-center mt-1 truncate">
              <Users className="w-3 h-3 mr-1" />
              {aliado.aliado}
            </p>
          )}
          {!aliado && (
            <p className="text-xs text-gray-400 mt-1">Sin aliado asignado</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Barra de estadísticas
const StatsBar: React.FC<{ presupuestos: Presupuesto[] }> = ({ presupuestos }) => {
  const stats = useMemo(() => {
    const total = presupuestos.length;
    const activos = presupuestos.filter(
      (p) => p.estado_actividad === 'ACTIVO' || p.estado_actividad === 'EN EJECUCIÓN'
    ).length;
    const completados = presupuestos.filter((p) => p.estado_actividad === 'COMPLETADO').length;

    const totalPresupuesto = presupuestos.reduce(
      (acc, p) => acc + (p.inversion_ejecutar || 0),
      0
    );
    const totalEjecutado = presupuestos.reduce((acc, p) => acc + (p.valor_ejecutado || 0), 0);
    const totalDisponible = presupuestos.reduce(
      (acc, p) => acc + (p.saldo_pendiente_ejecutar || 0),
      0
    );
    const promedioEjecucion =
      total > 0
        ? presupuestos.reduce((acc, p) => acc + (p.porcentaje_ejecucion || 0), 0) / total
        : 0;

    return {
      total,
      activos,
      completados,
      totalPresupuesto,
      totalEjecutado,
      totalDisponible,
      promedioEjecucion,
    };
  }, [presupuestos]);

  const statCards = [
    {
      label: 'Total Presupuestos',
      value: stats.total.toString(),
      icon: PieChart,
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-500/10',
      description: `${stats.activos} activos`,
    },
    {
      label: 'Presupuesto Total',
      value: formatCurrency(stats.totalPresupuesto),
      icon: DollarSign,
      gradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-500/10',
      description: 'Inversión total',
    },
    {
      label: 'Total Ejecutado',
      value: formatCurrency(stats.totalEjecutado),
      icon: TrendingUp,
      gradient: 'from-green-500 to-green-600',
      iconBg: 'bg-green-500/10',
      description: `${(stats.promedioEjecucion * 100).toFixed(1)}% promedio`,
    },
    {
      label: 'Disponible',
      value: formatCurrency(stats.totalDisponible),
      icon: Target,
      gradient: 'from-amber-500 to-amber-600',
      iconBg: 'bg-amber-500/10',
      description: 'Saldo pendiente',
      highlighted: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statCards.map((card, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br from-${card.gradient.split('-')[1]}-50 to-${card.gradient.split('-')[1]
            }-50 rounded-lg p-4 border border-${card.gradient.split('-')[1]}-100 ${card.highlighted ? 'ring-2 ring-amber-300' : ''
            }`}
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

export const PresupuestoList: React.FC<PresupuestoListProps> = ({
  presupuestos,
  onEdit,
  onDelete,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [filterCliente, setFilterCliente] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filtrado y búsqueda
  const filteredPresupuestos = useMemo(() => {
    let filtered = [...presupuestos];

    // Búsqueda global
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.cliente?.nombre_cliente?.toLowerCase().includes(search) ||
          p.aliado?.aliado?.toLowerCase().includes(search) ||
          p.estado_actividad?.toLowerCase().includes(search)
      );
    }

    // Filtro por estado
    if (filterEstado !== 'all') {
      filtered = filtered.filter((p) => p.estado_actividad === filterEstado);
    }

    // Filtro por cliente
    if (filterCliente !== 'all') {
      filtered = filtered.filter((p) => p.cliente_id === filterCliente);
    }

    return filtered;
  }, [presupuestos, searchTerm, filterEstado, filterCliente]);

  // Obtener opciones únicas para filtros
  const clienteOptions = useMemo(() => {
    const clientes = new Map();
    presupuestos.forEach((p) => {
      if (p.cliente_id && p.cliente) {
        clientes.set(p.cliente_id, p.cliente.nombre_cliente);
      }
    });
    return Array.from(clientes.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [presupuestos]);

  // Exportar a CSV
  const handleExport = () => {
    const headers = [
      'Cliente',
      'Inversión a Ejecutar',
      'Valor Ejecutado',
      'Saldo Pendiente',
      '% Ejecución',
      'Estado',
      'Aliado',
      'Comisión',
      '% Inversión Año',
    ];

    const csvData = filteredPresupuestos.map((p) => [
      p.cliente?.nombre_cliente || '',
      p.inversion_ejecutar || '',
      p.valor_ejecutado || '',
      p.saldo_pendiente_ejecutar || '',
      ((p.porcentaje_ejecucion || 0) * 100).toFixed(2),
      p.estado_actividad || '',
      p.aliado?.aliado || '',
      p.comision || '',
      ((p.porcentaje_inversion_anio || 0) * 100).toFixed(2),
    ]);

    const csv = [headers, ...csvData].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `presupuestos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const hasActiveFilters = filterEstado !== 'all' || filterCliente !== 'all';

  const clearFilters = () => {
    setFilterEstado('all');
    setFilterCliente('all');
  };

  const columns = [
    {
      key: 'cliente',
      label: 'Cliente y Aliado',
      render: (p: Presupuesto) => <ClienteInfo cliente={p.cliente} aliado={p.aliado} />,
    },
    {
      key: 'financiero',
      label: 'Información Financiera',
      render: (p: Presupuesto) => <FinancialInfo presupuesto={p} />,
    },
    {
      key: 'progreso',
      label: 'Progreso de Ejecución',
      render: (p: Presupuesto) => (
        <ProgressBar
          percentage={p.porcentaje_ejecucion || 0}
          ejecutado={p.valor_ejecutado || 0}
          total={p.inversion_ejecutar || 0}
        />
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (p: Presupuesto) => (
        <div className="space-y-2">
          <StatusBadgeWithIcon estado={p.estado_actividad || 'PENDIENTE'} />
          {p.porcentaje_inversion_anio && (
            <div className="flex items-center space-x-1.5 text-xs text-gray-600 bg-gray-50 rounded-lg px-2 py-1">
              <Percent className="w-3 h-3" />
              <span>
                Inversión: {(p.porcentaje_inversion_anio * 100).toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Barra de estadísticas */}
      <StatsBar presupuestos={presupuestos} />

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por cliente, aliado o estado..."
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
              disabled={filteredPresupuestos.length === 0}
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
                Mostrando <strong className="text-gray-900">{filteredPresupuestos.length}</strong>{' '}
                de <strong className="text-gray-900">{presupuestos.length}</strong> presupuestos
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>
                Total: <strong className="text-gray-900">{presupuestos.length}</strong> presupuestos
              </span>
            </>
          )}
        </div>

        {filteredPresupuestos.length === 0 && !isLoading && (
          <span className="text-amber-600 font-medium">No se encontraron resultados</span>
        )}
      </div>

      {/* Tabla */}
      <Table<Presupuesto>
        columns={columns}
        data={filteredPresupuestos}
        onEdit={onEdit}
        onDelete={onDelete}
        isLoading={isLoading}
        getRowKey={(p) => p.id}
        emptyMessage={
          searchTerm || hasActiveFilters
            ? 'No se encontraron presupuestos con los criterios de búsqueda'
            : 'No hay presupuestos registrados. Crea el primero para comenzar.'
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
