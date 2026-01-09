import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  TooltipProps,
  Area,
  AreaChart
} from 'recharts';
import { Card } from '../ui/Card';
import { useComisiones } from '../../hooks/useComisiones';
import { useClientes } from '../../hooks/useClientes';
import { formatCurrency } from '../../utils/formatters';
import { TrendingUp, PieChart as PieChartIcon, Calendar, Users } from 'lucide-react';

// Paleta de colores profesional y moderna
const COLORS = {
  primary: ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af'],
  gradient: ['#6366f1', '#8b5cf6', '#a855f7', '#c026d3', '#d946ef', '#e879f9'],
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  chart: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#f43f5e']
};

// Componente de Tooltip personalizado para gráfico de líneas
const CustomLineTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl p-4">
        <p className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-primary-600" />
          {label}
        </p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{formatCurrency(entry.value as number)}</span>
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Componente de Tooltip personalizado para gráfico de torta
const CustomPieTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl p-4">
        <p className="text-sm font-semibold text-gray-900 mb-1 flex items-center">
          <Users className="w-4 h-4 mr-2 text-primary-600" />
          {data.name}
        </p>
        <p className="text-lg font-bold text-primary-600">
          {data.value} cliente{data.value !== 1 ? 's' : ''}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {((data.value as number / payload[0].payload.total) * 100).toFixed(1)}% del total
        </p>
      </div>
    );
  }
  return null;
};

// Componente de estado vacío mejorado
const EmptyState: React.FC<{ icon: React.ReactNode; message: string }> = ({ icon, message }) => (
  <div className="h-full flex flex-col items-center justify-center text-gray-400 py-8">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      {icon}
    </div>
    <p className="text-sm font-medium">{message}</p>
    <p className="text-xs text-gray-400 mt-1">Los datos aparecerán aquí cuando estén disponibles</p>
  </div>
);

export const DashboardCharts: React.FC = () => {
  const { comisiones } = useComisiones();
  const { clientes } = useClientes();

  // Transformar datos para gráfico de área/líneas (Comisiones por Mes)
  const chartDataComisiones = useMemo(() => {
    if (!comisiones || comisiones.length === 0) return [];

    const grouped: Record<string, number> = {};
    const monthsOrder = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

    comisiones.forEach(c => {
      if (c.fecha && c.valor_comision_emitida_2024) {
        const date = new Date(c.fecha);
        const key = date.toLocaleDateString('es-CO', { month: 'short' });
        grouped[key] = (grouped[key] || 0) + (c.valor_comision_emitida_2024 || 0);
      }
    });

    return Object.entries(grouped)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        Comisiones: value
      }))
      .sort((a, b) =>
        monthsOrder.indexOf(a.name.toLowerCase()) - monthsOrder.indexOf(b.name.toLowerCase())
      );
  }, [comisiones]);

  // Transformar datos para gráfico de torta (Clientes por ARL)
  const chartDataArl = useMemo(() => {
    if (!clientes || clientes.length === 0) return [];

    const grouped: Record<string, number> = {};

    clientes.forEach(c => {
      const arlName = c.arl?.nombre || 'Sin ARL';
      grouped[arlName] = (grouped[arlName] || 0) + 1;
    });

    const total = Object.values(grouped).reduce((acc, val) => acc + val, 0);

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value, total }))
      .sort((a, b) => b.value - a.value);
  }, [clientes]);

  // Calcular totales para las tarjetas de resumen
  const totalComisiones = useMemo(() =>
    chartDataComisiones.reduce((acc, item) => acc + item.Comisiones, 0),
    [chartDataComisiones]
  );

  const totalClientes = useMemo(() =>
    chartDataArl.reduce((acc, item) => acc + item.value, 0),
    [chartDataArl]
  );

  return (
    <div className="space-y-6 mt-6">
      {/* Tarjetas de resumen rápido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Comisiones Totales</p>
              <p className="text-3xl font-bold">{formatCurrency(totalComisiones)}</p>
              <p className="text-blue-100 text-xs mt-2 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                Basado en {chartDataComisiones.length} meses
              </p>
            </div>
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">Total Clientes</p>
              <p className="text-3xl font-bold">{totalClientes}</p>
              <p className="text-purple-100 text-xs mt-2 flex items-center">
                <PieChartIcon className="w-3 h-3 mr-1" />
                Distribuidos en {chartDataArl.length} ARL
              </p>
            </div>
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Users className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Comisiones por Mes */}
        <Card
          title="Comisiones Netas por Mes"
          className="hover:shadow-lg transition-shadow duration-300"
        >
          <div className="h-80 min-h-[320px] w-full">
            {chartDataComisiones.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                <AreaChart
                  data={chartDataComisiones}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorComisiones" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary[0]} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={COLORS.primary[0]} stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis
                    tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickLine={{ stroke: '#e5e7eb' }}
                  />
                  <Tooltip content={<CustomLineTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                  />
                  <Area
                    type="monotone"
                    dataKey="Comisiones"
                    stroke={COLORS.primary[0]}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorComisiones)"
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={<TrendingUp className="w-8 h-8 text-gray-400" />}
                message="No hay datos de comisiones disponibles"
              />
            )}
          </div>
        </Card>

        {/* Gráfico de Distribución de Clientes por ARL */}
        <Card
          title="Distribución de Clientes por ARL"
          className="hover:shadow-lg transition-shadow duration-300"
        >
          <div className="h-80 min-h-[320px] w-full">
            {chartDataArl.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                <PieChart>
                  <Pie
                    data={chartDataArl}
                    cx="50%"
                    cy="50%"
                    labelLine={{
                      stroke: '#9ca3af',
                      strokeWidth: 1
                    }}
                    outerRadius={110}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''
                    }
                    animationDuration={1000}
                    animationBegin={0}
                  >
                    {chartDataArl.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS.chart[index % COLORS.chart.length]}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={<PieChartIcon className="w-8 h-8 text-gray-400" />}
                message="No hay datos de clientes disponibles"
              />
            )}
          </div>
        </Card>
      </div>

      {/* Leyenda mejorada para el gráfico de torta */}
      {chartDataArl.length > 0 && (
        <Card title="Detalle de Distribución">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {chartDataArl.map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS.chart[index % COLORS.chart.length] }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    {item.value} cliente{item.value !== 1 ? 's' : ''}
                    <span className="ml-1">
                      ({((item.value / totalClientes) * 100).toFixed(1)}%)
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
