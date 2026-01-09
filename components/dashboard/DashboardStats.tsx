import React, { useMemo } from 'react';
import { Card } from '../ui/Card';
import {
    Users,
    DollarSign,
    ClipboardList,
    TrendingUp,
    TrendingDown,
    Minus,
    ArrowUpRight,
    ArrowDownRight,
    Activity
} from 'lucide-react';
import { useClientes } from '../../hooks/useClientes';
import { useComisiones } from '../../hooks/useComisiones';
import { useOrdenesServicio } from '../../hooks/useOrdenesServicio';
import { usePresupuestos } from '../../hooks/usePresupuesto';
import { formatCurrency } from '../../utils/formatters';
import { Skeleton } from '../ui/Skeleton';

interface StatCardProps {
    icon: React.ElementType;
    title: string;
    value: string;
    trend?: number;
    subtitle?: string;
    loading?: boolean;
    gradient: string;
    iconColor: string;
    delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({
    icon: Icon,
    title,
    value,
    trend,
    subtitle,
    loading,
    gradient,
    iconColor,
    delay = 0
}) => {
    const getTrendIcon = () => {
        if (trend === undefined || trend === 0) return Minus;
        return trend > 0 ? ArrowUpRight : ArrowDownRight;
    };

    const getTrendColor = () => {
        if (trend === undefined || trend === 0) return 'text-gray-500';
        return trend > 0 ? 'text-green-600' : 'text-red-600';
    };

    const getTrendBgColor = () => {
        if (trend === undefined || trend === 0) return 'bg-gray-100';
        return trend > 0 ? 'bg-green-50' : 'bg-red-50';
    };

    const TrendIcon = getTrendIcon();

    return (
        <div
            className="group relative"
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Gradient Background Border Effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-500`} />

            <Card className="relative bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                {/* Top Gradient Accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />

                <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        {/* Icon Container */}
                        <div className={`relative p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="h-6 w-6 text-white" />

                            {/* Pulse Animation */}
                            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradient} animate-ping opacity-20`} />
                        </div>

                        {/* Trend Indicator */}
                        {trend !== undefined && !loading && (
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getTrendBgColor()} ${getTrendColor()}`}>
                                <TrendIcon className="w-4 h-4" />
                                <span className="text-xs font-semibold">
                                    {Math.abs(trend).toFixed(1)}%
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>

                    {/* Value */}
                    {loading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    ) : (
                        <>
                            <p className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
                                {value}
                            </p>
                            {subtitle && (
                                <p className="text-xs text-gray-500 flex items-center">
                                    <Activity className="w-3 h-3 mr-1" />
                                    {subtitle}
                                </p>
                            )}
                        </>
                    )}
                </div>

                {/* Bottom Shine Effect */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Card>
        </div>
    );
};

export const DashboardStats: React.FC = () => {
    const { clientes, isLoading: l1 } = useClientes();
    const { comisiones, isLoading: l2 } = useComisiones();
    const { ordenes, isLoading: l3 } = useOrdenesServicio();
    const { presupuestos, isLoading: l4 } = usePresupuestos();

    const isLoading = l1 || l2 || l3 || l4;

    // Cálculos principales
    const clientesActivos = clientes?.length || 0;

    const comisionesTotales = useMemo(() =>
        comisiones?.reduce((acc, curr) => acc + (curr.valor_comision_emitida_2024 || 0), 0) || 0,
        [comisiones]
    );

    const ordenesActivas = useMemo(() =>
        ordenes?.filter(o => o.estado_actividad !== 'ANULADO' && o.estado_actividad !== 'FACTURADO').length || 0,
        [ordenes]
    );

    const promedioEjecucion = useMemo(() => {
        if (!presupuestos || presupuestos.length === 0) return 0;
        return (presupuestos.reduce((acc, curr) => acc + (curr.porcentaje_ejecucion || 0), 0) / presupuestos.length) * 100;
    }, [presupuestos]);

    // Cálculos de tendencias (simulados - puedes reemplazar con datos reales)
    const clientesTrend = useMemo(() => {
        // Aquí podrías calcular el cambio vs mes anterior
        // Por ahora, simulamos basándonos en el total
        return clientesActivos > 0 ? (Math.random() * 20 - 5) : 0;
    }, [clientesActivos]);

    const comisionesTrend = useMemo(() => {
        // Simulación - reemplazar con comparación real vs período anterior
        return comisionesTotales > 0 ? (Math.random() * 15 - 2) : 0;
    }, [comisionesTotales]);

    const ordenesTrend = useMemo(() => {
        // Simulación
        return ordenesActivas > 0 ? (Math.random() * 25 - 10) : 0;
    }, [ordenesActivas]);

    const ejecucionTrend = useMemo(() => {
        // Simulación
        return promedioEjecucion > 0 ? (Math.random() * 12 - 3) : 0;
    }, [promedioEjecucion]);

    const stats = [
        {
            icon: Users,
            title: 'Clientes Activos',
            value: clientesActivos.toLocaleString('es-CO'),
            trend: clientesTrend,
            subtitle: `Total de ${clientesActivos} clientes registrados`,
            gradient: 'from-blue-500 to-blue-600',
            iconColor: 'text-blue-600',
        },
        {
            icon: DollarSign,
            title: 'Comisiones Totales',
            value: formatCurrency(comisionesTotales),
            trend: comisionesTrend,
            subtitle: `${comisiones?.length || 0} registros de comisión`,
            gradient: 'from-emerald-500 to-emerald-600',
            iconColor: 'text-emerald-600',
        },
        {
            icon: ClipboardList,
            title: 'Órdenes Pendientes',
            value: ordenesActivas.toLocaleString('es-CO'),
            trend: ordenesTrend,
            subtitle: `De ${ordenes?.length || 0} órdenes totales`,
            gradient: 'from-amber-500 to-amber-600',
            iconColor: 'text-amber-600',
        },
        {
            icon: TrendingUp,
            title: 'Ejecución Promedio',
            value: `${promedioEjecucion.toFixed(1)}%`,
            trend: ejecucionTrend,
            subtitle: `${presupuestos?.length || 0} presupuestos analizados`,
            gradient: 'from-purple-500 to-purple-600',
            iconColor: 'text-purple-600',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Panel de Control</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Resumen general de métricas clave del sistema
                    </p>
                </div>
                {!isLoading && (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium">Datos actualizados</span>
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <StatCard
                        key={stat.title}
                        {...stat}
                        loading={isLoading}
                        delay={index * 100}
                    />
                ))}
            </div>

            {/* Additional Info Bar */}
            {!isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-blue-600 mb-1">Tasa de Conversión</p>
                                <p className="text-lg font-bold text-blue-900">
                                    {clientesActivos > 0 ? ((ordenesActivas / clientesActivos) * 100).toFixed(1) : 0}%
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-emerald-600 mb-1">Comisión Promedio</p>
                                <p className="text-lg font-bold text-emerald-900">
                                    {formatCurrency(comisiones && comisiones.length > 0 ? comisionesTotales / comisiones.length : 0)}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-emerald-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-purple-600 mb-1">Órdenes Completadas</p>
                                <p className="text-lg font-bold text-purple-900">
                                    {ordenes?.filter(o => o.estado_actividad === 'FACTURADO').length || 0}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                                <ClipboardList className="w-5 h-5 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add animations to your global CSS or Tailwind config */}
            <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .group {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
        </div>
    );
};
