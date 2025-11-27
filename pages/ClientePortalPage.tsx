import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { BarChart3, DollarSign, FileText, TrendingUp, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function ClientePortalPage() {
  const { profile } = useAuth();

  // Solo accesible para usuarios con rol CLIENTE
  if (profile?.rol !== 'CLIENTE') {
    return <Navigate to="/" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portal del Cliente</h1>
          <p className="text-gray-600 mt-1">
            Bienvenido, {profile.nombre}. Aquí encontrarás toda tu información financiera.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={Download}>
            Exportar a Excel
          </Button>
          <Button variant="outline" icon={Download}>
            Exportar a PDF
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Comisiones Totales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">$0</p>
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
              <p className="text-2xl font-bold text-gray-900 mt-1">$0</p>
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
              <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
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
              <p className="text-2xl font-bold text-gray-900 mt-1">$0</p>
            </div>
            <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Evolución de Comisiones">
          <div className="h-64 flex items-center justify-center text-gray-400">
            Gráfico de evolución mensual
          </div>
        </Card>

        <Card title="Distribución de Presupuesto">
          <div className="h-64 flex items-center justify-center text-gray-400">
            Gráfico de distribución
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card title="Actividad Reciente">
        <div className="space-y-4">
          <p className="text-gray-500 text-center py-8">
            No hay actividad reciente para mostrar
          </p>
        </div>
      </Card>
    </div>
  );
}
