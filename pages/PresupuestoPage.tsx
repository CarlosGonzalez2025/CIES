import React, { useState, useMemo } from 'react';
import { usePresupuestos } from '../hooks/usePresupuesto';
import { PresupuestoList } from '../components/presupuesto/PresupuestoList';
import { PresupuestoCardView } from '../components/presupuesto/PresupuestoCardView';
import { PresupuestoForm } from '../components/presupuesto/PresupuestoForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { SearchBar } from '../components/shared/SearchBar';
import { Card } from '../components/ui/Card';
import type { Presupuesto } from '../types';
import type { PresupuestoFormData } from '../schemas/presupuestoSchema';
import { useAuth } from '../hooks/useAuth';
import { ModuleGuide } from '../components/shared/ModuleGuide';
import {
  Plus,
  Filter,
  Download,
  Upload,
  LayoutGrid,
  List,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  X,
  FileText,
  Copy,
  Trash2,
  Eye,
  Settings,
  RefreshCw,
  Calendar,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

// Types
type ViewMode = 'table' | 'cards';
type SortField = 'cliente' | 'comision' | 'inversion_ejecutar' | 'fecha' | 'estado';
type SortDirection = 'asc' | 'desc';
type FilterStatus = 'all' | 'activo' | 'pendiente' | 'ejecutado';

interface Stats {
  totalPresupuestos: number;
  totalComision: number;
  totalInversion: number;
  totalEjecutado: number;
  presupuestosActivos: number;
  presupuestosPendientes: number;
}

const PresupuestoPage: React.FC = () => {
  const { user } = useAuth();
  const {
    presupuestos,
    isLoading,
    createPresupuesto,
    updatePresupuesto,
    deletePresupuesto,
    isCreating,
    isUpdating,
    refetch
  } = usePresupuestos();

  // View & UI State
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedPresupuesto, setSelectedPresupuesto] = useState<Presupuesto | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterAliado, setFilterAliado] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);

  // Sort State
  const [sortField, setSortField] = useState<SortField>('fecha');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Bulk Actions
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Stats calculation
  const stats: Stats = useMemo(() => {
    if (!presupuestos) return {
      totalPresupuestos: 0,
      totalComision: 0,
      totalInversion: 0,
      totalEjecutado: 0,
      presupuestosActivos: 0,
      presupuestosPendientes: 0,
    };

    return {
      totalPresupuestos: presupuestos.length,
      totalComision: presupuestos.reduce((sum, p) => sum + (p.comision || 0), 0),
      totalInversion: presupuestos.reduce((sum, p) => sum + (p.inversion_ejecutar || 0), 0),
      totalEjecutado: presupuestos.reduce((sum, p) => sum + (p.valor_total_ejecutar || 0), 0),
      presupuestosActivos: presupuestos.filter(p => p.estado === 'activo').length,
      presupuestosPendientes: presupuestos.filter(p => p.estado === 'pendiente').length,
    };
  }, [presupuestos]);

  // Filtered and sorted presupuestos
  const filteredPresupuestos = useMemo(() => {
    if (!presupuestos) return [];

    let filtered = presupuestos.filter(p => {
      // Search filter
      const matchesSearch =
        p.cliente?.nombre_cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.aliado && p.aliado.aliado.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.nit?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Status filter
      if (filterStatus !== 'all' && p.estado !== filterStatus) return false;

      // Aliado filter
      if (filterAliado !== 'all' && p.aliado_id?.toString() !== filterAliado) return false;

      // Date range filter
      if (dateRange) {
        const pDate = new Date(p.fecha);
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        if (pDate < start || pDate > end) return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortField) {
        case 'cliente':
          aVal = a.cliente?.nombre_cliente || '';
          bVal = b.cliente?.nombre_cliente || '';
          break;
        case 'comision':
          aVal = a.comision || 0;
          bVal = b.comision || 0;
          break;
        case 'inversion_ejecutar':
          aVal = a.inversion_ejecutar || 0;
          bVal = b.inversion_ejecutar || 0;
          break;
        case 'fecha':
          aVal = new Date(a.fecha).getTime();
          bVal = new Date(b.fecha).getTime();
          break;
        case 'estado':
          aVal = a.estado || '';
          bVal = b.estado || '';
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [presupuestos, searchQuery, filterStatus, filterAliado, dateRange, sortField, sortDirection]);

  // Get unique aliados for filter
  const uniqueAliados = useMemo(() => {
    if (!presupuestos) return [];
    const aliados = presupuestos
      .filter(p => p.aliado)
      .map(p => ({ id: p.aliado_id!, nombre: p.aliado!.aliado }));

    return Array.from(new Map(aliados.map(a => [a.id, a])).values());
  }, [presupuestos]);

  // Handlers
  const handleOpenModal = (presupuesto: Presupuesto | null = null) => {
    setSelectedPresupuesto(presupuesto);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedPresupuesto(null);
    setIsModalOpen(false);
  };

  const handleOpenConfirm = (presupuesto: Presupuesto) => {
    setSelectedPresupuesto(presupuesto);
    setIsConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setSelectedPresupuesto(null);
    setIsConfirmOpen(false);
  };

  const handleSubmit = (formData: PresupuestoFormData) => {
    if (!user?.email) {
      alert("Debe iniciar sesión para realizar esta acción.");
      return;
    }

    const inversion_ejecutar = (formData.comision || 0) * (formData.porcentaje_inversion_anio || 0);
    const valor_total_ejecutar = (formData.horas_unidades || 0) * (formData.costo_hora_unidad || 0);

    const presupuestoData = {
      ...formData,
      usuario: user.email,
      inversion_ejecutar,
      valor_total_ejecutar,
      aliado_id: formData.aliado_id || undefined,
    };

    if (selectedPresupuesto) {
      updatePresupuesto({ id: selectedPresupuesto.id, updates: presupuestoData }, {
        onSuccess: handleCloseModal,
      });
    } else {
      createPresupuesto(presupuestoData, {
        onSuccess: handleCloseModal,
      });
    }
  };

  const handleDelete = () => {
    if (selectedPresupuesto) {
      deletePresupuesto(selectedPresupuesto.id, {
        onSuccess: handleCloseConfirm,
      });
    }
  };

  const handleDuplicate = (presupuesto: Presupuesto) => {
    const duplicateData = {
      ...presupuesto,
      id: undefined,
      fecha: new Date().toISOString().split('T')[0],
    };
    handleOpenModal(duplicateData as Presupuesto);
  };

  // Bulk actions
  const handleSelectAll = () => {
    if (selectedIds.size === filteredPresupuestos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPresupuestos.map(p => p.id)));
    }
  };

  const handleSelectRow = (id: number) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`¿Eliminar ${selectedIds.size} presupuesto(s)?`)) {
      selectedIds.forEach(id => deletePresupuesto(id));
      setSelectedIds(new Set());
      setShowBulkActions(false);
    }
  };

  const handleBulkExport = () => {
    const selected = filteredPresupuestos.filter(p => selectedIds.has(p.id));
    const csv = convertToCSV(selected);
    downloadCSV(csv, 'presupuestos_seleccionados.csv');
  };

  // Export functions
  const convertToCSV = (data: Presupuesto[]) => {
    const headers = ['ID', 'Cliente', 'NIT', 'Comisión', 'Inversión', 'Ejecutado', 'Estado', 'Fecha'];
    const rows = data.map(p => [
      p.id,
      p.cliente?.nombre_cliente || '',
      p.nit || '',
      p.comision || 0,
      p.inversion_ejecutar || 0,
      p.valor_total_ejecutar || 0,
      p.estado || '',
      p.fecha,
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const handleExportAll = () => {
    const csv = convertToCSV(filteredPresupuestos);
    downloadCSV(csv, `presupuestos_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setFilterAliado('all');
    setDateRange(null);
  };

  const hasActiveFilters = searchQuery || filterStatus !== 'all' || filterAliado !== 'all' || dateRange;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Gestión de Presupuestos
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Crea y administra los presupuestos de inversión por cliente.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" icon={FileText} onClick={() => setShowGuide(true)}>
            Guía
          </Button>

          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={refetch}>
            Actualizar
          </Button>

          {/* Export Dropdown */}
          <div className="relative group">
            <Button variant="ghost" size="sm" icon={Download}>
              Exportar
            </Button>
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={handleExportAll}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar Todo (CSV)
              </button>
              <button
                onClick={() => {/* Import logic */ }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-b-lg flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Importar CSV
              </button>
            </div>
          </div>

          <Button onClick={() => handleOpenModal()} icon={Plus}>
            Nuevo Presupuesto
          </Button>
        </div>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <Modal
          isOpen={showGuide}
          onClose={() => setShowGuide(false)}
          title="Guía del Módulo de Presupuestos"
          size="lg"
        >
          <ModuleGuide title="">
            <p className="mb-4">
              El presupuesto representa el monto de la comisión de un cliente que se destinará a la inversión en servicios. Es el puente entre los ingresos (comisiones) y los gastos (órdenes de servicio).
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Paso 1:</strong> Crea un presupuesto a partir de la <strong>Comisión</strong> total de un cliente.</li>
              <li><strong>Paso 2:</strong> Asigna un <strong>Aliado</strong> si ya se conoce quién ejecutará el trabajo.</li>
              <li><strong>Conexión:</strong> Desde un presupuesto aprobado se generan una o varias <strong>Órdenes de Servicio</strong> para ejecutar las actividades.</li>
            </ul>
          </ModuleGuide>
        </Modal>
      )}

      {/* Stats KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Presupuestos"
          value={stats.totalPresupuestos.toString()}
          icon={FileText}
          color="blue"
          subtitle={`${stats.presupuestosActivos} activos`}
        />
        <StatCard
          title="Comisión Total"
          value={formatCurrency(stats.totalComision)}
          icon={DollarSign}
          color="green"
          trend={12.5}
        />
        <StatCard
          title="Inversión Proyectada"
          value={formatCurrency(stats.totalInversion)}
          icon={TrendingUp}
          color="purple"
          subtitle={`${((stats.totalInversion / stats.totalComision) * 100 || 0).toFixed(1)}% de comisión`}
        />
        <StatCard
          title="Total Ejecutado"
          value={formatCurrency(stats.totalEjecutado)}
          icon={CheckCircle}
          color="orange"
          progress={((stats.totalEjecutado / stats.totalInversion) * 100) || 0}
        />
      </div>

      {/* Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left: Search & Filters */}
          <div className="flex flex-1 items-center gap-3">
            <div className="flex-1 max-w-md">
              <SearchBar
                onSearch={setSearchQuery}
                placeholder="Buscar por cliente, NIT o aliado..."
                value={searchQuery}
              />
            </div>

            <Button
              variant={showFilters ? 'primary' : 'ghost'}
              size="sm"
              icon={Filter}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filtros
              {hasActiveFilters && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-primary-600 text-white rounded-full">
                  {[searchQuery, filterStatus !== 'all', filterAliado !== 'all', dateRange].filter(Boolean).length}
                </span>
              )}
            </Button>
          </div>

          {/* Right: View Mode & Actions */}
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-200 rounded-lg">
                <span className="text-sm font-medium text-primary-900">
                  {selectedIds.size} seleccionado{selectedIds.size > 1 ? 's' : ''}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBulkExport}
                  >
                    Exportar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="text-red-600 hover:text-red-700"
                  >
                    Eliminar
                  </Button>
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="p-1 hover:bg-primary-100 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded transition-colors ${viewMode === 'table'
                    ? 'bg-white shadow-sm text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
                aria-label="Vista de tabla"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded transition-colors ${viewMode === 'cards'
                    ? 'bg-white shadow-sm text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
                aria-label="Vista de tarjetas"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                label="Estado"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                options={[
                  { value: 'all', label: 'Todos los estados' },
                  { value: 'activo', label: 'Activo' },
                  { value: 'pendiente', label: 'Pendiente' },
                  { value: 'ejecutado', label: 'Ejecutado' },
                ]}
              />

              <Select
                label="Aliado"
                value={filterAliado}
                onChange={(e) => setFilterAliado(e.target.value)}
                options={[
                  { value: 'all', label: 'Todos los aliados' },
                  ...uniqueAliados.map(a => ({ value: a.id.toString(), label: a.nombre }))
                ]}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={dateRange?.start || ''}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value, end: prev?.end || '' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={dateRange?.end || ''}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value, start: prev?.start || '' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {filteredPresupuestos.length} resultado{filteredPresupuestos.length !== 1 ? 's' : ''}
                </span>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Content */}
      {viewMode === 'table' ? (
        <Card>
          <PresupuestoList
            presupuestos={filteredPresupuestos}
            onEdit={handleOpenModal}
            onDelete={handleOpenConfirm}
            onDuplicate={handleDuplicate}
            onView={(p) => {/* View details */ }}
            isLoading={isLoading}
            selectedIds={selectedIds}
            onSelectRow={handleSelectRow}
            onSelectAll={handleSelectAll}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPresupuestos.map(presupuesto => (
            <PresupuestoCardView
              key={presupuesto.id}
              presupuesto={presupuesto}
              onEdit={() => handleOpenModal(presupuesto)}
              onDelete={() => handleOpenConfirm(presupuesto)}
              onDuplicate={() => handleDuplicate(presupuesto)}
              isSelected={selectedIds.has(presupuesto.id)}
              onSelect={() => handleSelectRow(presupuesto.id)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredPresupuestos.length === 0 && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {hasActiveFilters ? 'No se encontraron resultados' : 'No hay presupuestos aún'}
            </h3>
            <p className="text-gray-600 mb-6">
              {hasActiveFilters
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza creando tu primer presupuesto'}
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            ) : (
              <Button onClick={() => handleOpenModal()} icon={Plus}>
                Crear Presupuesto
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Modals */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedPresupuesto ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
        size="lg"
      >
        <PresupuestoForm
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
          defaultValues={selectedPresupuesto}
          isSubmitting={isCreating || isUpdating}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleDelete}
        title="Confirmar Eliminación"
        message="¿Estás seguro de que quieres eliminar este presupuesto? Esta acción no se puede deshacer."
        variant="danger"
      />
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'purple' | 'orange';
  subtitle?: string;
  trend?: number;
  progress?: number;
}> = ({ title, value, icon: Icon, color, subtitle, trend, progress }) => {
  const colors = {
    blue: { bg: 'from-blue-500 to-blue-600', icon: 'bg-blue-100 text-blue-600', bar: 'bg-blue-600' },
    green: { bg: 'from-green-500 to-green-600', icon: 'bg-green-100 text-green-600', bar: 'bg-green-600' },
    purple: { bg: 'from-purple-500 to-purple-600', icon: 'bg-purple-100 text-purple-600', bar: 'bg-purple-600' },
    orange: { bg: 'from-orange-500 to-orange-600', icon: 'bg-orange-100 text-orange-600', bar: 'bg-orange-600' },
  };

  return (
    <Card className={`p-6 border-l-4 bg-gradient-to-br ${colors[color].bg} bg-opacity-5`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(trend).toFixed(1)}%
              </span>
            </div>
          )}
          {progress !== undefined && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${colors[color].bar} transition-all duration-500`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colors[color].icon}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};

export default PresupuestoPage;
