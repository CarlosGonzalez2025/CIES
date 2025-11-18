import React from 'react';
import { Card } from '../ui/Card';
import { Users, DollarSign, ClipboardList, TrendingUp } from 'lucide-react';
import { useClientes } from '../../hooks/useClientes';
import { useComisiones } from '../../hooks/useComisiones';
import { useOrdenesServicio } from '../../hooks/useOrdenesServicio';
import { usePresupuestos } from '../../hooks/usePresupuesto';
import { formatCurrency } from '../../utils/formatters';
import { Skeleton } from '../ui/Skeleton';

const StatCard: React.FC<{ icon: React.ElementType, title: string, value: string, loading?: boolean }> = ({ icon: Icon, title, value, loading }) => {
    return (
        <Card>
            <div className="flex items-center">
                <div className="p-3 rounded-full bg-primary-100 text-primary-600 mr-4">
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
                    {loading ? (
                        <Skeleton className="h-8 w-24 mt-1" />
                    ) : (
                        <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
                    )}
                </div>
            </div>
        </Card>
    );
};

export const DashboardStats: React.FC = () => {
    const { clientes, isLoading: l1 } = useClientes();
    const { comisiones, isLoading: l2 } = useComisiones();
    const { ordenes, isLoading: l3 } = useOrdenesServicio();
    const { presupuestos, isLoading: l4 } = usePresupuestos();

    const isLoading = l1 || l2 || l3 || l4;

    // Cálculos
    const clientesActivos = clientes?.length || 0;
    
    const comisionesTotales = comisiones?.reduce((acc, curr) => acc + (curr.valor_comision_emitida_2024 || 0), 0) || 0;
    
    const ordenesActivas = ordenes?.filter(o => o.estado_actividad !== 'ANULADO' && o.estado_actividad !== 'FACTURADO').length || 0;
    
    const promedioEjecucion = presupuestos && presupuestos.length > 0
        ? (presupuestos.reduce((acc, curr) => acc + (curr.porcentaje_ejecucion || 0), 0) / presupuestos.length) * 100
        : 0;

    const stats = [
        { icon: Users, title: 'Clientes Totales', value: clientesActivos.toString() },
        { icon: DollarSign, title: 'Comisiones Totales', value: formatCurrency(comisionesTotales) },
        { icon: ClipboardList, title: 'Órdenes Pendientes', value: ordenesActivas.toString() },
        { icon: TrendingUp, title: 'Ejecución Promedio', value: `${promedioEjecucion.toFixed(1)}%` },
    ];

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(stat => <StatCard key={stat.title} {...stat} loading={isLoading} />)}
        </div>
    );
};