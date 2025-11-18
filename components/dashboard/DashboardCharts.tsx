import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card } from '../ui/Card';
import { useComisiones } from '../../hooks/useComisiones';
import { useClientes } from '../../hooks/useClientes';
import { formatCurrency } from '../../utils/formatters';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const DashboardCharts: React.FC = () => {
  const { comisiones } = useComisiones();
  const { clientes } = useClientes();

  // Transformar datos para gráfico de líneas (Comisiones por Mes)
  const chartDataComisiones = useMemo(() => {
    if (!comisiones) return [];
    
    // Agrupar por mes (usando la fecha de la comisión)
    const grouped: Record<string, number> = {};
    
    comisiones.forEach(c => {
        if (c.fecha) {
            const date = new Date(c.fecha);
            const key = date.toLocaleDateString('es-CO', { month: 'short' }); // 'Ene', 'Feb'
            grouped[key] = (grouped[key] || 0) + (c.valor_comision_emitida_2024 || 0);
        }
    });

    // Convertir a array ordenado (simple, por ahora orden de inserción/keys)
    // Idealmente ordenar por mes calendario
    const monthsOrder = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    
    return Object.entries(grouped)
        .map(([name, value]) => ({ name, Comisiones: value }))
        .sort((a, b) => monthsOrder.indexOf(a.name.toLowerCase()) - monthsOrder.indexOf(b.name.toLowerCase()));

  }, [comisiones]);

  // Transformar datos para gráfico de torta (Clientes por ARL)
  const chartDataArl = useMemo(() => {
      if (!clientes) return [];
      
      const grouped: Record<string, number> = {};
      
      clientes.forEach(c => {
          const arlName = c.arl?.nombre || 'Sin ARL';
          grouped[arlName] = (grouped[arlName] || 0) + 1;
      });

      return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [clientes]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <Card title="Comisiones Netas por Mes">
        <div className="h-80">
          {chartDataComisiones.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartDataComisiones}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="Comisiones" stroke="#1d4ed8" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
          ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                  No hay datos suficientes
              </div>
          )}
        </div>
      </Card>
      <Card title="Distribución de Clientes por ARL">
        <div className="h-80">
         {chartDataArl.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartDataArl}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartDataArl.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
           ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                  No hay datos suficientes
              </div>
          )}
        </div>
      </Card>
    </div>
  );
};