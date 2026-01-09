import React, { useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { useReportsData } from '../hooks/useReportsData';
import { Loader } from '../components/ui/Loader';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    ComposedChart,
} from 'recharts';
import {
    Calendar,
    Download,
    Filter,
    LayoutDashboard,
    DollarSign,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    ArrowUp,
    ArrowDown,
    RefreshCw,
    FileText,
    X,
    ChevronDown,
    ChevronUp,
    Info,
    Eye,
    Settings,
    Share2,
} from 'lucide-react';
import { formatCurrency, formatDate, formatPercentage } from '../utils/formatters';

// Types
interface DateRange {
    start: string;
    end: string;
    label: string;
}

interface FilterState {
    dateRange: DateRange;
    clients: string[];
    programs: string[];
    arl: string[];
}

export default function ReportesPage() {
    const { isLoading, commissionMetrics, budgetMetrics, error, refetch } = useReportsData();
    const [activeTab, setActiveTab] = useState<'presupuesto' | 'comisiones'>('presupuesto');
    const [showFilters, setShowFilters] = useState(false);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [compareMode, setCompareMode] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState<'inversion' | 'ejecucion'>('ejecucion');

    // Date ranges presets
    const dateRanges: DateRange[] = [
        { start: '2026-01-01', end: '2026-01-31', label: 'Este mes' },
        { start: '2025-01-01', end: '2025-12-31', label: 'Este año' },
        { start: '2025-10-01', end: '2025-12-31', label: 'Último trimestre' },
        { start: '2025-07-01', end: '2025-09-30', label: 'Trimestre anterior' },
    ];

    const [filters, setFilters] = useState<FilterState>({
        dateRange: dateRanges[1], // Este año por defecto
        clients: [],
        programs: [],
        arl: [],
    });

    // Export functions
    const exportToCSV = (data: any[], filename: string) => {
        const headers = Object.keys(data[0] || {});
        const csv = [
            headers.join(','),
            ...data.map(row => headers.map(h => row[h]).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const exportToPDF = () => {
        window.print();
    };

    // Toggle row expansion
    const toggleRow = (id: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    // Calculate comparison metrics
    const comparisonMetrics = useMemo(() => {
        if (!compareMode || !budgetMetrics) return null;

        // Comparar con periodo anterior
        return {
            inversionChange: 12.5, // % cambio vs periodo anterior
            ejecucionChange: 8.3,
            saldoChange: -15.2,
        };
    }, [compareMode, budgetMetrics]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <AlertCircle className="w-16 h-16 text-red-500" />
                <h3 className="text-xl font-semibold text-gray-900">Error al cargar datos</h3>
                <p className="text-gray-600">{error.message}</p>
                <Button onClick={refetch} icon={RefreshCw}>
                    Reintentar
                </Button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader size="lg" />
                <p className="text-gray-600">Cargando reportes...</p>
            </div>
        );
    }

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

    return (
        <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        {activeTab === 'presupuesto' ? 'Presupuesto Inversión' : 'Análisis Comisiones'}
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                        {activeTab === 'presupuesto'
                            ? 'Seguimiento detallado de ejecución por programas.'
                            : 'Indicadores financieros de primas y comisiones.'}
                    </p>
                    {filters.dateRange && (
                        <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Periodo: {filters.dateRange.label}
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Tab Switcher */}
                    <div className="inline-flex rounded-lg shadow-sm border border-gray-200 bg-white" role="group">
                        <button
                            onClick={() => setActiveTab('presupuesto')}
                            className={`
                                px-4 py-2 text-sm font-medium rounded-l-lg transition-all
                                ${activeTab === 'presupuesto'
                                    ? 'bg-primary-600 text-white shadow-sm'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'}
                            `}
                        >
                            <DollarSign className="w-4 h-4 inline mr-1" />
                            Presupuesto
                        </button>
                        <button
                            onClick={() => setActiveTab('comisiones')}
                            className={`
                                px-4 py-2 text-sm font-medium rounded-r-lg transition-all border-l
                                ${activeTab === 'comisiones'
                                    ? 'bg-primary-600 text-white shadow-sm'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'}
                            `}
                        >
                            <TrendingUp className="w-4 h-4 inline mr-1" />
                            Comisiones
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={Filter}
                            onClick={() => setShowFilters(!showFilters)}
                            className={showFilters ? 'bg-primary-50 text-primary-700' : ''}
                        >
                            Filtros
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            icon={RefreshCw}
                            onClick={refetch}
                            aria-label="Actualizar"
                        />

                        {/* Export Dropdown */}
                        <div className="relative group">
                            <Button variant="ghost" size="sm" icon={Download}>
                                Exportar
                            </Button>
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                <button
                                    onClick={() => exportToCSV(
                                        activeTab === 'presupuesto' ? budgetMetrics.budgetTable : commissionMetrics.tableData,
                                        activeTab
                                    )}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg flex items-center gap-2"
                                >
                                    <FileText className="w-4 h-4" />
                                    Exportar CSV
                                </button>
                                <button
                                    onClick={exportToPDF}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-b-lg flex items-center gap-2"
                                >
                                    <FileText className="w-4 h-4" />
                                    Exportar PDF
                                </button>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            icon={Share2}
                            aria-label="Compartir"
                        />
                    </div>
                </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
                <Card className="p-6 border-l-4 border-primary-500">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            Filtros Avanzados
                        </h3>
                        <button
                            onClick={() => setShowFilters(false)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Select
                            label="Periodo"
                            options={dateRanges.map(r => ({ value: r.label, label: r.label }))}
                            value={filters.dateRange.label}
                            onChange={(e) => {
                                const range = dateRanges.find(r => r.label === e.target.value);
                                if (range) setFilters({ ...filters, dateRange: range });
                            }}
                        />

                        <Select
                            label="Cliente"
                            options={[
                                { value: 'all', label: 'Todos los clientes' },
                                ...(budgetMetrics?.budgetTable || []).map((c: any) => ({
                                    value: c.nit,
                                    label: c.cliente
                                }))
                            ]}
                            placeholder="Seleccionar cliente"
                        />

                        {activeTab === 'presupuesto' && (
                            <Select
                                label="Programa"
                                options={[
                                    { value: 'all', label: 'Todos los programas' },
                                    ...(budgetMetrics?.programDetails || []).map((p: any) => ({
                                        value: p.programa,
                                        label: p.programa
                                    }))
                                ]}
                                placeholder="Seleccionar programa"
                            />
                        )}

                        {activeTab === 'comisiones' && (
                            <Select
                                label="ARL"
                                options={[
                                    { value: 'all', label: 'Todas las ARL' },
                                    ...Array.from(new Set((commissionMetrics?.tableData || []).map((d: any) => d.arl)))
                                        .map(arl => ({ value: arl, label: arl }))
                                ]}
                                placeholder="Seleccionar ARL"
                            />
                        )}

                        <div className="flex items-end gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                                Aplicar
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => {
                                setFilters({
                                    dateRange: dateRanges[1],
                                    clients: [],
                                    programs: [],
                                    arl: [],
                                });
                            }}>
                                Limpiar
                            </Button>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={compareMode}
                                onChange={(e) => setCompareMode(e.target.checked)}
                                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <span>Comparar con periodo anterior</span>
                        </label>
                    </div>
                </Card>
            )}

            {/* PRESUPUESTO TAB */}
            {activeTab === 'presupuesto' && (
                <div className="space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <KPICard
                            title="Inversión Total"
                            value={formatCurrency(budgetMetrics?.totalInversion || 0)}
                            icon={DollarSign}
                            trend={comparisonMetrics?.inversionChange}
                            trendLabel="vs periodo anterior"
                            color="blue"
                        />
                        <KPICard
                            title="Total Ejecutado"
                            value={formatCurrency(budgetMetrics?.totalEjecutado || 0)}
                            icon={TrendingUp}
                            trend={comparisonMetrics?.ejecucionChange}
                            trendLabel="vs periodo anterior"
                            color="green"
                        />
                        <KPICard
                            title="Saldo Pendiente"
                            value={formatCurrency(
                                (budgetMetrics?.totalInversion || 0) - (budgetMetrics?.totalEjecutado || 0)
                            )}
                            icon={AlertCircle}
                            trend={comparisonMetrics?.saldoChange}
                            trendLabel="vs periodo anterior"
                            color="orange"
                        />
                        <KPICard
                            title="% Ejecución"
                            value={`${((budgetMetrics?.porcentajeEjecucion || 0) * 100).toFixed(1)}%`}
                            icon={LayoutDashboard}
                            progress={(budgetMetrics?.porcentajeEjecucion || 0) * 100}
                            color="purple"
                        />
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Main Execution Chart */}
                        <Card className="p-6 lg:col-span-2">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Ejecución por Programa
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Comparativa de inversión proyectada vs ejecutada
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedMetric('ejecucion')}
                                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${selectedMetric === 'ejecucion'
                                                ? 'bg-primary-100 text-primary-700'
                                                : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        Ejecución
                                    </button>
                                    <button
                                        onClick={() => setSelectedMetric('inversion')}
                                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${selectedMetric === 'inversion'
                                                ? 'bg-primary-100 text-primary-700'
                                                : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        Inversión
                                    </button>
                                </div>
                            </div>

                            <div className="h-96">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart
                                        data={budgetMetrics?.programDetails || []}
                                        layout="vertical"
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis
                                            type="number"
                                            fontSize={12}
                                            tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
                                        />
                                        <YAxis
                                            dataKey="programa"
                                            type="category"
                                            width={150}
                                            fontSize={11}
                                        />
                                        <Tooltip
                                            formatter={(value: number) => formatCurrency(value)}
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <Legend />
                                        <Bar
                                            dataKey="inversion_proyectada"
                                            name="Proyectada"
                                            fill="#93C5FD"
                                            barSize={20}
                                            radius={[0, 4, 4, 0]}
                                        />
                                        <Bar
                                            dataKey="inversion_ejecutada"
                                            name="Ejecutada"
                                            fill="#3B82F6"
                                            barSize={20}
                                            radius={[0, 4, 4, 0]}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="porcentaje"
                                            stroke="#10B981"
                                            strokeWidth={2}
                                            name="% Cumplimiento"
                                            yAxisId="right"
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* Execution Gauge */}
                        <Card className="p-6 flex flex-col items-center justify-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">
                                Ejecución Global
                            </h3>
                            <div className="relative w-64 h-64">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    {/* Background circle */}
                                    <path
                                        className="text-gray-200"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3.5"
                                    />
                                    {/* Progress circle */}
                                    <path
                                        className="text-primary-600 transition-all duration-1000 ease-out"
                                        strokeDasharray={`${(budgetMetrics?.porcentajeEjecucion || 0) * 100}, 100`}
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                    <span className="text-4xl font-bold text-primary-600">
                                        {((budgetMetrics?.porcentajeEjecucion || 0) * 100).toFixed(1)}%
                                    </span>
                                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-wide">
                                        Ejecutado
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 grid grid-cols-2 gap-4 w-full">
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1">Proyectado</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {formatCurrency(budgetMetrics?.totalInversion || 0)}
                                    </p>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1">Ejecutado</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {formatCurrency(budgetMetrics?.totalEjecutado || 0)}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Distribution Pie Chart */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">
                                Distribución por Programa
                            </h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={budgetMetrics?.programDetails || []}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ programa, porcentaje }) =>
                                                `${programa.substring(0, 15)}... ${(porcentaje * 100).toFixed(0)}%`
                                            }
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="inversion_ejecutada"
                                        >
                                            {(budgetMetrics?.programDetails || []).map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>

                    {/* Client Budget Table */}
                    <Card className="overflow-hidden">
                        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg">Resumen por Cliente</h3>
                                <span className="text-sm opacity-90">
                                    {budgetMetrics?.budgetTable?.length || 0} clientes
                                </span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-primary-50 border-b-2 border-primary-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-primary-900 uppercase tracking-wider">
                                            Cliente
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-primary-900 uppercase tracking-wider">
                                            NIT
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-primary-900 uppercase tracking-wider">
                                            Inversión Año
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-primary-900 uppercase tracking-wider">
                                            Ejecutado
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-primary-900 uppercase tracking-wider bg-primary-100">
                                            Saldo Pendiente
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-primary-900 uppercase tracking-wider">
                                            % Ejecución
                                        </th>
                                        <th className="px-6 py-4 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {(budgetMetrics?.budgetTable || []).map((row: any, i: number) => {
                                        const isExpanded = expandedRows.has(row.nit);
                                        return (
                                            <React.Fragment key={i}>
                                                <tr className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-gray-900">
                                                        {row.cliente}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                                                        {row.nit}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-gray-900">
                                                        {formatCurrency(row.inversion_anio)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-gray-900">
                                                        {formatCurrency(row.ejecutado)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-semibold text-primary-700 bg-primary-50">
                                                        {formatCurrency(row.inversion_ejecutar)}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <ExecutionBadge value={row.porcentaje} />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => toggleRow(row.nit)}
                                                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                            aria-label={isExpanded ? 'Contraer' : 'Expandir'}
                                                        >
                                                            {isExpanded ? (
                                                                <ChevronUp className="w-4 h-4" />
                                                            ) : (
                                                                <ChevronDown className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {isExpanded && (
                                                    <tr>
                                                        <td colSpan={7} className="px-6 py-4 bg-gray-50">
                                                            <div className="grid grid-cols-3 gap-4 p-4">
                                                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                                    <p className="text-xs text-gray-600 mb-1">Programas Activos</p>
                                                                    <p className="text-2xl font-bold text-gray-900">5</p>
                                                                </div>
                                                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                                    <p className="text-xs text-gray-600 mb-1">Último Pago</p>
                                                                    <p className="text-sm font-semibold text-gray-900">
                                                                        {formatDate(new Date().toISOString())}
                                                                    </p>
                                                                </div>
                                                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                                    <p className="text-xs text-gray-600 mb-1">Próximo Vencimiento</p>
                                                                    <p className="text-sm font-semibold text-gray-900">
                                                                        15 días
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="bg-gray-100 font-semibold">
                                    <tr>
                                        <td colSpan={2} className="px-6 py-4 text-gray-900">
                                            TOTAL
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-900">
                                            {formatCurrency(budgetMetrics?.totalInversion || 0)}
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-900">
                                            {formatCurrency(budgetMetrics?.totalEjecutado || 0)}
                                        </td>
                                        <td className="px-6 py-4 text-right text-primary-700 bg-primary-100">
                                            {formatCurrency(
                                                (budgetMetrics?.totalInversion || 0) - (budgetMetrics?.totalEjecutado || 0)
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <ExecutionBadge value={budgetMetrics?.porcentajeEjecucion || 0} />
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </Card>

                    {/* Program Execution Table */}
                    <Card className="overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg">Ejecución por Programa</h3>
                                <span className="text-sm opacity-90">
                                    Total: {formatCurrency(budgetMetrics?.totalEjecutado || 0)}
                                </span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-indigo-50 border-b-2 border-indigo-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">
                                            Programa / Categoría
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-indigo-900 uppercase tracking-wider">
                                            Inversión Proyectada
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-indigo-900 uppercase tracking-wider">
                                            Inversión Ejecutada
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-indigo-900 uppercase tracking-wider">
                                            % Cumplimiento
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {(budgetMetrics?.programDetails || []).map((prog: any, i: number) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {prog.programa}
                                            </td>
                                            <td className="px-6 py-4 text-right text-gray-900">
                                                {formatCurrency(prog.inversion_proyectada)}
                                            </td>
                                            <td className="px-6 py-4 text-right text-gray-900">
                                                {formatCurrency(prog.inversion_ejecutada)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <ProgressBar percentage={prog.porcentaje * 100} />
                                            </td>
                                        </tr>
                                    ))}
                                    {(budgetMetrics?.programDetails || []).length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-12 text-center">
                                                <div className="flex flex-col items-center text-gray-400">
                                                    <AlertCircle className="w-12 h-12 mb-3" />
                                                    <p className="text-gray-500 font-medium">No hay datos disponibles</p>
                                                    <p className="text-sm text-gray-400 mt-1">
                                                        Intenta ajustar los filtros
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* COMISIONES TAB */}
            {activeTab === 'comisiones' && (
                <div className="space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <KPICard
                            title="Valor Inversión Total"
                            value={formatCurrency(commissionMetrics?.totalInversion || 0)}
                            icon={DollarSign}
                            color="blue"
                        />
                        <KPICard
                            title="Valor Prima Emitida"
                            value={formatCurrency(commissionMetrics?.totalPrimaEmitida || 0)}
                            icon={FileText}
                            color="orange"
                        />
                        <KPICard
                            title="Valor Comisión Emitida"
                            value={formatCurrency(commissionMetrics?.totalComisionEmitida || 0)}
                            icon={TrendingUp}
                            color="green"
                        />
                    </div>

                    {/* Main Trend Chart */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Tendencia de Primas vs Comisiones
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Evolución mensual de primas y comisiones emitidas
                                </p>
                            </div>
                            <Button variant="ghost" size="sm" icon={Eye}>
                                Ver Detalle
                            </Button>
                        </div>

                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={commissionMetrics?.tableData || []}>
                                    <defs>
                                        <linearGradient id="colorPrima" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
                                        </linearGradient>
                                        <linearGradient id="colorComision" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="fecha"
                                        fontSize={12}
                                        stroke="#6B7280"
                                        tickFormatter={(val) => new Date(val).toLocaleDateString('es-CO', { month: 'short' })}
                                    />
                                    <YAxis
                                        fontSize={12}
                                        stroke="#6B7280"
                                        tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
                                    />
                                    <Tooltip
                                        formatter={(value: number) => formatCurrency(value)}
                                        labelFormatter={(label) => formatDate(label)}
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <Legend
                                        wrapperStyle={{ paddingTop: '20px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="prima_emitida"
                                        stroke="#8B5CF6"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorPrima)"
                                        name="Prima Emitida"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="comision_emitida"
                                        stroke="#10B981"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorComision)"
                                        name="Comisión Emitida"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Commission Rate Distribution */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">
                                Distribución por ARL
                            </h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={Object.entries(
                                                (commissionMetrics?.tableData || []).reduce((acc: any, curr: any) => {
                                                    acc[curr.arl] = (acc[curr.arl] || 0) + curr.comision_emitida;
                                                    return acc;
                                                }, {})
                                            ).map(([arl, value]) => ({ arl, value }))}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ arl, percent }) => `${arl} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {Object.keys((commissionMetrics?.tableData || []).reduce((acc: any, curr: any) => {
                                                acc[curr.arl] = true;
                                                return acc;
                                            }, {})).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">
                                Top 5 Clientes por Comisión
                            </h3>
                            <div className="space-y-3">
                                {(commissionMetrics?.tableData || [])
                                    .sort((a: any, b: any) => b.comision_emitida - a.comision_emitida)
                                    .slice(0, 5)
                                    .map((row: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${i === 0 ? 'bg-yellow-500' :
                                                        i === 1 ? 'bg-gray-400' :
                                                            i === 2 ? 'bg-orange-600' :
                                                                'bg-gray-300'
                                                    }`}>
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">{row.cliente}</p>
                                                    <p className="text-xs text-gray-500">{row.arl}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-green-600">
                                                    {formatCurrency(row.comision_emitida)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {(row.porcentaje_comision * 100).toFixed(2)}%
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </Card>
                    </div>

                    {/* Detailed Commission Table */}
                    <Card className="overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg">Detalle de Comisiones</h3>
                                <span className="text-sm opacity-90">
                                    {commissionMetrics?.tableData?.length || 0} registros
                                </span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 border-b-2 border-gray-300">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Fecha
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            ARL
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Cliente
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            % Comisión
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Valor Inversión
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Prima Emitida
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider bg-green-50">
                                            Comisión Emitida
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {(commissionMetrics?.tableData || []).map((row: any, i: number) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-gray-900">
                                                {formatDate(row.fecha)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                                    {row.arl}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                <div>
                                                    <p>{row.cliente}</p>
                                                    <p className="text-xs text-gray-500 font-mono">{row.nit}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded">
                                                    {(row.porcentaje_comision * 100).toFixed(2)}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-gray-900">
                                                {formatCurrency(row.valor_inversion)}
                                            </td>
                                            <td className="px-6 py-4 text-right text-gray-900">
                                                {formatCurrency(row.prima_emitida)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-green-700 bg-green-50">
                                                {formatCurrency(row.comision_emitida)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-100 font-semibold border-t-2 border-gray-300">
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-gray-900">
                                            TOTAL
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-900">
                                            {formatCurrency(commissionMetrics?.totalInversion || 0)}
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-900">
                                            {formatCurrency(commissionMetrics?.totalPrimaEmitida || 0)}
                                        </td>
                                        <td className="px-6 py-4 text-right text-green-700 bg-green-100">
                                            {formatCurrency(commissionMetrics?.totalComisionEmitida || 0)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

// KPI Card Component
const KPICard: React.FC<{
    title: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    trend?: number;
    trendLabel?: string;
    progress?: number;
    color: 'blue' | 'green' | 'orange' | 'purple';
}> = ({ title, value, icon: Icon, trend, trendLabel, progress, color }) => {
    const colors = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        orange: 'from-orange-500 to-orange-600',
        purple: 'from-purple-500 to-purple-600',
    };

    const iconBgColors = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        orange: 'bg-orange-100 text-orange-600',
        purple: 'bg-purple-100 text-purple-600',
    };

    return (
        <Card className={`p-6 border-l-4 bg-gradient-to-br ${colors[color]} bg-opacity-5`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                        {title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        {value}
                    </p>
                    {trend !== undefined && (
                        <div className="flex items-center gap-1 mt-2">
                            {trend > 0 ? (
                                <ArrowUp className="w-4 h-4 text-green-600" />
                            ) : (
                                <ArrowDown className="w-4 h-4 text-red-600" />
                            )}
                            <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {Math.abs(trend).toFixed(1)}%
                            </span>
                            {trendLabel && (
                                <span className="text-xs text-gray-500 ml-1">{trendLabel}</span>
                            )}
                        </div>
                    )}
                    {progress !== undefined && (
                        <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full bg-gradient-to-r ${colors[color]} transition-all duration-500`}
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${iconBgColors[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </Card>
    );
};

// Execution Badge Component
const ExecutionBadge: React.FC<{ value: number }> = ({ value }) => {
    const percentage = value * 100;
    let bgColor = 'bg-blue-100';
    let textColor = 'text-blue-800';
    let ringColor = 'ring-blue-200';

    if (percentage >= 90) {
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        ringColor = 'ring-green-200';
    } else if (percentage >= 70) {
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        ringColor = 'ring-blue-200';
    } else if (percentage >= 50) {
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        ringColor = 'ring-yellow-200';
    } else {
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        ringColor = 'ring-red-200';
    }

    return (
        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ring-2 ${bgColor} ${textColor} ${ringColor}`}>
            {percentage.toFixed(1)}%
        </span>
    );
};

// Progress Bar Component
const ProgressBar: React.FC<{ percentage: number }> = ({ percentage }) => {
    let barColor = 'bg-blue-600';

    if (percentage >= 90) barColor = 'bg-green-600';
    else if (percentage >= 70) barColor = 'bg-blue-600';
    else if (percentage >= 50) barColor = 'bg-yellow-600';
    else barColor = 'bg-red-600';

    return (
        <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                    className={`h-3 rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
            </div>
            <span className="text-xs font-medium text-gray-700 text-center block">
                {percentage.toFixed(1)}%
            </span>
        </div>
    );
};
