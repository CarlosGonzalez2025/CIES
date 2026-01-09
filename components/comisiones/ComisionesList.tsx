import React, { useState, useMemo } from 'react';
import { Table } from '../ui/Table';
import type { Comision } from '../../types';
import { formatDate, formatCurrency } from '../../utils/formatters';
import {
  Search,
  Filter,
  Download,
  TrendingUp,
  DollarSign,
  PieChart,
  Calendar,
  Building2,
  Shield,
  Target,
  Activity,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Percent,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { Button } from '../ui/Button';

interface ComisionesListProps {
  comisiones: Comision[];
  onEdit: (comision: Comision) => void;
  onDelete: (comision: Comision) => void;
  isLoading?: boolean;
}

// Badge para ARL
const ARLBadge: React.FC<{ arl?: { nombre: string; id: string } }> = ({ arl }) => {
  if (!arl) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
        <AlertCircle className="w-3 h-3 mr-1" />
        Sin ARL
      </span>
    );
  }

  const arlColors: Record<string, string> = {
    sura: 'bg-blue-100 text-blue-700 border-blue-200',
    positiva: 'bg-green-100 text-green-700 border-green-200',
    colmena: 'bg-amber-100 text-amber-700 border-amber-200',
    axa: 'bg-purple-100 text-purple-700 border-purple-200',
    bolivar: 'bg-red-100 text-red-700 border-red-200',
  };

  const normalizedName = arl.nombre.toLowerCase();
  const colorClass =
    Object.entries(arlColors).find(([key]) => normalizedName.includes(key))?.[1] ||
    'bg-indigo-100 text-indigo-700 border-indigo-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}
    >
      <Shield className="w-3 h-3 mr-1" />
      {arl.nombre}
    </span>
  );
};

// Componente para mostrar métricas financieras
const FinancialMetrics: React.FC<{
  prima: number;
  comisionNeta: number;
  inversion: number;
}> = ({ prima, comisionNeta, inversion }) => {
  const porcentajeComision = prima > 0 ? (comisionNeta / prima) * 100 : 0;
  const porcentajeInversion = comisionNeta > 0 ? (inversion / comisionNeta) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Prima:</span>
        <span className="text-sm font-semibold text-gray-900">{formatCurrency(prima)}</span>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-1.5">
        <span className="text-xs text-gray-500 flex items-center">
          <TrendingUp className="w-3 h-3 mr-1 text-emerald-600" />
          Comisión:
        </span>
        <div className="text-right">
          <span className="text-sm font-semibold text-emerald-700">
            {formatCurrency(comisionNeta)}
          </span>
          <div className="flex items-center justify-end space-x-1 mt-0.5">
            <Percent className="w-2.5 h-2.5 text-gray-400" />
            <span className="text-xs text-gray-600">{porcentajeComision.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-1.5">
        <span className="text-xs text-gray-500 flex items-center">
          <Target className="w-3 h-3 mr-1 text-amber-600" />
          Inversión:
        </span>
        <div className="text-right">
          <span className="text-sm font-semibold text-amber-700">
            {formatCurrency(inversion)}
          </span>
          <div className="flex items-center justify-end space-x-1 mt-0.5">
            <Percent className="w-2.5 h-2.5 text-gray-400" />
            <span className="text-xs text-gray-600">{porcentajeInversion.toFixed(2)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Indicador de tendencia
const TrendIndicator: React.FC<{ value: number; previousValue?: number }> = ({
  value,
  previousValue,
}) => {
  if (!previousValue || previousValue === 0) return null;

  const change = ((value - previousValue) / previousValue) * 100;
  const isPositive = change > 0;
  const isNeutral = Math.abs(change) < 0.1;

  const Icon = isNeutral ? Minus : isPositive ? ArrowUpRight : ArrowDownRight;
  const colorClass = isNeutral
    ? 'text-gray-600 bg-gray-100'
    : isPositive
      ? 'text-green-600 bg-green-50'
      : 'text-red-600 bg-red-50';

  return (
    <div className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full ${colorClass}`}>
      <Icon className="w-3 h-3" />
      <span className="text-xs font-semibold">{Math.abs(change).toFixed(1)}%</span>
    </div>
  );
};

// Barra de estadísticas
const StatsBar: React.FC<{ comisiones: Comision[] }> = ({ comisiones }) => {
  const stats = useMemo(() => {
    const total = comisiones.length;
    const totalPrima = comisiones.reduce((acc, c) => acc + (c.valor_prima_emitida || 0), 0);
    const totalComision = comisiones.reduce((acc, c) => acc + (c.valor_comision_emitida_2024 || 0), 0);
    const totalInversion = comisiones.reduce((acc, c) => acc + (c.valor_inversion || 0), 0);
    const promedioComision = total > 0 ? totalComision / total : 0;
    const tasaComisionPromedio = totalPrima > 0 ? (totalComision / totalPrima) * 100 : 0;

    return {
      total,
      totalPrima,
      totalComision,
      totalInversion,
      promedioComision,
      tasaComisionPromedio,
    };
  }, [comisiones]);

  const statCards = [
    {
      label: 'Total Registros',
      value: stats.total.toString(),
      icon: FileText,
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-500/10',
    },
    {
      label: 'Prima Total Emitida',
      value: formatCurrency(stats.totalPrima),
      icon: DollarSign,
      gradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-500/10',
    },
    {
      label: 'Comisión Total Neta',
      value: formatCurrency(stats.totalComision),
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-500/10',
      subtitle: `Tasa prom: ${stats.tasaComisionPromedio.toFixed(2)}%`,
    },
    {
      label: 'Inversión Total',
      value: formatCurrency(stats.totalInversion),
      icon: Target,
      gradient: 'from-amber-500 to-amber-600',
      iconBg: 'bg-amber-500/10',
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
          {card.subtitle && (
            <p className={`text-xs text-${card.gradient.split('-')[1]}-600 mt-1`}>
              {card.subtitle}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export const ComisionesList: React.FC<ComisionesListProps> = ({
  comisiones,
  onEdit,
  onDelete,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCliente, setFilterCliente] = useState<string>('all');
  const [filterARL, setFilterARL] = useState<string>('all');
  const [filterFechaInicio, setFilterFechaInicio] = useState('');
  const [filterFechaFin, setFilterFechaFin] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filtrado y búsqueda
  const filteredComisiones = useMemo(() => {
    let filtered = [...comisiones];

    // Búsqueda global
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (comision) =>
          comision.cliente?.nombre_cliente?.toLowerCase().includes(search) ||
          comision.arl?.nombre?.toLowerCase().includes(search)
      );
    }

    // Filtro por cliente
    if (filterCliente !== 'all') {
      filtered = filtered.filter((comision) => comision.cliente_id === filterCliente);
    }

    // Filtro por ARL
    if (filterARL !== 'all') {
      filtered = filtered.filter((comision) => comision.arl_id === filterARL);
    }

    // Filtro por rango de fechas
    if (filterFechaInicio) {
      filtered = filtered.filter(
        (comision) => new Date(comision.fecha) >= new Date(filterFechaInicio)
      );
    }
    if (filterFechaFin) {
      filtered = filtered.filter(
        (comision) => new Date(comision.fecha) <= new Date(filterFechaFin)
      );
    }

    return filtered.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [comisiones, searchTerm, filterCliente, filterARL, filterFechaInicio, filterFechaFin]);

  // Obtener opciones únicas para filtros
  const { clienteOptions, arlOptions } = useMemo(() => {
    const clientes = new Map();
    const arls = new Map();

    comisiones.forEach((c) => {
      if (c.cliente_id && c.cliente) {
        clientes.set(c.cliente_id, c.cliente.nombre_cliente);
      }
      if (c.arl_id && c.arl) {
        arls.set(c.arl_id, c.arl.nombre);
      }
    });

    return {
      clienteOptions: Array.from(clientes.entries()).map(([id, nombre]) => ({ id, nombre })),
      arlOptions: Array.from(arls.entries()).map(([id, nombre]) => ({ id, nombre })),
    };
  }, [comisiones]);

  // Exportar a CSV
  const handleExport = () => {
    const headers = [
      'Cliente',
      'ARL',
      'Fecha',
      'Período Cobertura',
      'Prima Emitida',
      'Comisión Bruta',
      'Comisión Neta',
      'Inversión',
      '% Comisión ARL',
      '% Comisión Impuesto',
      '% Inversión',
    ];

    const csvData = filteredComisiones.map((c) => [
      c.cliente?.nombre_cliente || '',
      c.arl?.nombre || '',
      formatDate(c.fecha),
      formatDate(c.cobertura),
      c.valor_prima_emitida || '',
      c.valor_comision_emitida || '',
      c.valor_comision_emitida_2024 || '',
      c.valor_inversion || '',
      c.porcentaje_comision_arl || '',
      c.porcentaje_comision_impuesto || '',
      c.porcentaje_inversion || '',
    ]);

    const csv = [headers, ...csvData].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comisiones_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const hasActiveFilters =
    filterCliente !== 'all' ||
    filterARL !== 'all' ||
    filterFechaInicio ||
    filterFechaFin;

  const clearFilters = () => {
    setFilterCliente('all');
    setFilterARL('all');
    setFilterFechaInicio('');
    setFilterFechaFin('');
  };

  const columns = [
    {
      key: 'cliente',
      label: 'Cliente y ARL',
      render: (c: Comision) => (
        <div className="space-y-2">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
              {c.cliente?.nombre_cliente?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {c.cliente?.nombre_cliente || 'Sin cliente'}
              </p>
              {c.cliente?.nit_documento && (
                <p className="text-xs text-gray-500 flex items-center mt-0.5">
                  <FileText className="w-3 h-3 mr-1" />
                  NIT: {c.cliente.nit_documento}
                </p>
              )}
            </div>
          </div>
          <ARLBadge arl={c.arl} />
        </div>
      ),
    },
    {
      key: 'fechas',
      label: 'Período',
      render: (c: Comision) => (
        <div className="space-y-1.5">
          <div className="flex items-center text-sm text-gray-900">
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
            <span className="font-medium">{formatDate(c.fecha)}</span>
          </div>
          {c.cobertura && (
            <div className="flex items-start space-x-1.5 text-xs text-gray-600">
              <Shield className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-gray-500">Cobertura:</span>
                <br />
                <span className="font-medium">{formatDate(c.cobertura)}</span>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'metricas',
      label: 'Métricas Financieras',
      render: (c: Comision) => (
        <FinancialMetrics
          prima={c.valor_prima_emitida || 0}
          comisionNeta={c.valor_comision_emitida_2024 || 0}
          inversion={c.valor_inversion || 0}
        />
      ),
    },
    {
      key: 'porcentajes',
      label: 'Configuración de Cálculo',
      render: (c: Comision) => (
        <div className="space-y-1.5">
          {c.porcentaje_comision_arl && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">% ARL:</span>
              <span className="font-semibold text-purple-700">
                {(c.porcentaje_comision_arl * 100).toFixed(2)}%
              </span>
            </div>
          )}
          {c.porcentaje_comision_impuesto && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">% Impuesto:</span>
              <span className="font-semibold text-red-700">
                {(c.porcentaje_comision_impuesto * 100).toFixed(2)}%
              </span>
            </div>
          )}
          {c.porcentaje_inversion && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">% Inversión:</span>
              <span className="font-semibold text-amber-700">
                {(c.porcentaje_inversion * 100).toFixed(2)}%
              </span>
            </div>
          )}
          {!c.porcentaje_comision_arl &&
            !c.porcentaje_comision_impuesto &&
            !c.porcentaje_inversion && (
              <span className="text-xs text-gray-400">Sin configuración</span>
            )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Barra de estadísticas */}
      <StatsBar comisiones={comisiones} />

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por cliente o ARL..."
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
              {hasActiveFilters && (
                <span className="ml-2 w-2 h-2 bg-primary-600 rounded-full" />
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleExport}
              disabled={filteredComisiones.length === 0}
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

            {/* Botón para limpiar filtros */}
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
                Mostrando <strong className="text-gray-900">{filteredComisiones.length}</strong>{' '}
                de <strong className="text-gray-900">{comisiones.length}</strong> comisiones
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>
                Total: <strong className="text-gray-900">{comisiones.length}</strong> comisiones
              </span>
            </>
          )}
        </div>

        {filteredComisiones.length === 0 && !isLoading && (
          <span className="text-amber-600 font-medium">No se encontraron resultados</span>
        )}
      </div>

      {/* Tabla */}
      <Table<Comision>
        columns={columns}
        data={filteredComisiones}
        onEdit={onEdit}
        onDelete={onDelete}
        isLoading={isLoading}
        getRowKey={(c) => c.id}
        emptyMessage={
          searchTerm || hasActiveFilters
            ? 'No se encontraron comisiones con los criterios de búsqueda'
            : 'No hay comisiones registradas. Crea la primera para comenzar.'
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
