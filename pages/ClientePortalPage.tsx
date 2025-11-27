import React, { useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useClientePortal } from '../hooks/useClientePortal';
import { Navigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { BarChart3, DollarSign, FileText, TrendingUp, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/formatters';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ClientePortalPage() {
  const { profile } = useAuth();
  const { data, isLoading, comisiones, presupuestos, ordenes, stats } = useClientePortal();

  // Solo accesible para usuarios con rol CLIENTE
  if (profile?.rol !== 'CLIENTE') {
    return <Navigate to="/" />;
  }

  // Preparar datos para gráficos
  const comisionesChart = useMemo(() => {
    const meses: { [key: string]: number } = {};
    comisiones.forEach(c => {
      if (c.fecha) {
        const mes = new Date(c.fecha).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
        meses[mes] = (meses[mes] || 0) + (c.valor_comision_emitida || 0);
      }
    });
    return Object.entries(meses).map(([mes, valor]) => ({ mes, valor })).slice(-12);
  }, [comisiones]);

  const presupuestoChart = useMemo(() => {
    return presupuestos.slice(0, 5).map(p => ({
      nombre: `Presup. ${p.id.slice(0, 8)}`,
      ejecutado: p.valor_ejecutado || 0,
      pendiente: (p.inversion_ejecutar || 0) - (p.valor_ejecutado || 0),
    }));
  }, [presupuestos]);

  const handleExportExcel = () => {
    try {
      // Prepare comisiones data
      const comisionesData = comisiones.map(c => ({
        Fecha: c.fecha ? new Date(c.fecha).toLocaleDateString('es-ES') : '-',
        ARL: c.arl?.nombre || '-',
        'Prima Emitida': c.valor_prima_emitida || 0,
        'Comisión': c.valor_comision_emitida || 0,
        '% Comisión': c.porcentaje_comision_arl?.toFixed(2) || '-'
      }));

      // Prepare ordenes data
      const ordenesData = ordenes.map(o => ({
        'OS #': o.os_numero,
        Fecha: o.fecha_envio ? new Date(o.fecha_envio).toLocaleDateString('es-ES') : '-',
        Aliado: o.aliado?.aliado || '-',
        Estado: o.cancelado ? 'Cancelada' : o.estado_actividad || 'Pendiente',
        Total: o.total || 0,
        '% Ejecución': o.porcentaje_ejecucion_valor?.toFixed(1) || '-'
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Add summary sheet
      const summaryData = [
        ['Resumen Financiero - ' + profile?.nombre],
        [],
        ['Métrica', 'Valor'],
        ['Comisiones Totales', formatCurrency(stats.totalComisiones)],
        ['Presupuesto Ejecutado', formatCurrency(stats.presupuestoEjecutado)],
        ['Total Presupuesto', formatCurrency(stats.totalPresupuesto)],
        ['Órdenes Activas', stats.ordenesActivas.toString()],
        ['Primas Totales', formatCurrency(stats.totalPrimas)]
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Resumen');

      // Add comisiones sheet
      if (comisionesData.length > 0) {
        const comisionesSheet = XLSX.utils.json_to_sheet(comisionesData);
        XLSX.utils.book_append_sheet(wb, comisionesSheet, 'Comisiones');
      }

      // Add ordenes sheet
      if (ordenesData.length > 0) {
        const ordenesSheet = XLSX.utils.json_to_sheet(ordenesData);
        XLSX.utils.book_append_sheet(wb, ordenesSheet, 'Órdenes de Servicio');
      }

      // Download
      const fileName = `portal-cliente-${profile?.nombre?.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Error exportando a Excel:', error);
      alert('Error al exportar a Excel. Por favor intente nuevamente.');
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Title
      doc.setFontSize(18);
      doc.text('Portal del Cliente - Reporte Financiero', pageWidth / 2, 15, { align: 'center' });

      doc.setFontSize(12);
      doc.text(profile?.nombre || '', pageWidth / 2, 25, { align: 'center' });
      doc.text(new Date().toLocaleDateString('es-ES'), pageWidth / 2, 32, { align: 'center' });

      // Summary stats
      doc.setFontSize(14);
      doc.text('Resumen Financiero', 14, 45);

      autoTable(doc, {
        startY: 50,
        head: [['Métrica', 'Valor']],
        body: [
          ['Comisiones Totales', formatCurrency(stats.totalComisiones)],
          ['Presupuesto Ejecutado', formatCurrency(stats.presupuestoEjecutado)],
          ['Total Presupuesto', formatCurrency(stats.totalPresupuesto)],
          ['Órdenes Activas', stats.ordenesActivas.toString()],
          ['Primas Totales', formatCurrency(stats.totalPrimas)]
        ],
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] }
      });

      // Comisiones table
      if (comisiones.length > 0) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Comisiones Recientes', 14, 15);

        autoTable(doc, {
          startY: 20,
          head: [['Fecha', 'ARL', 'Prima Emitida', 'Comisión', '% Comisión']],
          body: comisiones.slice(0, 20).map(c => [
            c.fecha ? new Date(c.fecha).toLocaleDateString('es-ES') : '-',
            c.arl?.nombre || '-',
            formatCurrency(c.valor_prima_emitida || 0),
            formatCurrency(c.valor_comision_emitida || 0),
            `${c.porcentaje_comision_arl?.toFixed(2) || '-'}%`
          ]),
          theme: 'striped',
          headStyles: { fillColor: [37, 99, 235] }
        });
      }

      // Ordenes table
      if (ordenes.length > 0) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Órdenes de Servicio Recientes', 14, 15);

        autoTable(doc, {
          startY: 20,
          head: [['OS #', 'Fecha', 'Aliado', 'Estado', 'Total', '% Ejecución']],
          body: ordenes.slice(0, 20).map(o => [
            o.os_numero,
            o.fecha_envio ? new Date(o.fecha_envio).toLocaleDateString('es-ES') : '-',
            o.aliado?.aliado || '-',
            o.cancelado ? 'Cancelada' : o.estado_actividad || 'Pendiente',
            formatCurrency(o.total || 0),
            `${o.porcentaje_ejecucion_valor?.toFixed(1) || '-'}%`
          ]),
          theme: 'striped',
          headStyles: { fillColor: [37, 99, 235] }
        });
      }

      // Download
      const fileName = `portal-cliente-${profile?.nombre?.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error exportando a PDF:', error);
      alert('Error al exportar a PDF. Por favor intente nuevamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portal del Cliente</h1>
          <p className="text-gray-600 mt-1">
            Bienvenido, {profile.nombre}. Aquí encontrarás toda tu información financiera.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={Download} onClick={handleExportExcel}>
            Exportar Excel
          </Button>
          <Button variant="outline" icon={Download} onClick={handleExportPDF}>
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Comisiones Totales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalComisiones)}</p>
              <p className="text-xs text-gray-500 mt-1">{comisiones.length} comisiones</p>
            </div>
            <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Presupuesto Ejecutado</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.presupuestoEjecutado)}</p>
              <p className="text-xs text-gray-500 mt-1">
                de {formatCurrency(stats.totalPresupuesto)}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Órdenes Activas</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.ordenesActivas}</p>
              <p className="text-xs text-gray-500 mt-1">{ordenes.length} órdenes totales</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Primas Totales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalPrimas)}</p>
              <p className="text-xs text-gray-500 mt-1">Primas ARL</p>
            </div>
            <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Evolución de Comisiones (Últimos 12 meses)">
          {comisionesChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={comisionesChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line type="monotone" dataKey="valor" stroke="#2563eb" strokeWidth={2} name="Comisión" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No hay datos de comisiones para mostrar
            </div>
          )}
        </Card>

        <Card title="Ejecución de Presupuestos">
          {presupuestoChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={presupuestoChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="ejecutado" fill="#10b981" name="Ejecutado" />
                <Bar dataKey="pendiente" fill="#f59e0b" name="Pendiente" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No hay datos de presupuesto para mostrar
            </div>
          )}
        </Card>
      </div>

      {/* Recent Commissions Table */}
      <Card title="Comisiones Recientes">
        {comisiones.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ARL</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Prima Emitida</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Comisión</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">% Comisión</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comisiones.slice(0, 10).map((comision) => (
                  <tr key={comision.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {comision.fecha ? new Date(comision.fecha).toLocaleDateString('es-ES') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{comision.arl?.nombre || '-'}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {formatCurrency(comision.valor_prima_emitida || 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-primary-600">
                      {formatCurrency(comision.valor_comision_emitida || 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {comision.porcentaje_comision_arl?.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No hay comisiones registradas</p>
        )}
      </Card>

      {/* Recent Orders Table */}
      <Card title="Órdenes de Servicio Recientes">
        {ordenes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">OS #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aliado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">% Ejecución</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ordenes.slice(0, 10).map((orden) => (
                  <tr key={orden.id}>
                    <td className="px-4 py-3 text-sm font-medium text-primary-600">{orden.os_numero}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {orden.fecha_envio ? new Date(orden.fecha_envio).toLocaleDateString('es-ES') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{orden.aliado?.aliado || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        orden.cancelado ? 'bg-red-100 text-red-800' :
                        orden.estado_actividad === 'Completada' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {orden.cancelado ? 'Cancelada' : orden.estado_actividad || 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {formatCurrency(orden.total || 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {orden.porcentaje_ejecucion_valor?.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No hay órdenes de servicio registradas</p>
        )}
      </Card>
    </div>
  );
}
