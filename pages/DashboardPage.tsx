import React from 'react';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { DashboardCharts } from '../components/dashboard/DashboardCharts';
import { ModuleGuide } from '../components/shared/ModuleGuide';

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">Bienvenido al panel de control de CIES.</p>
      </header>
      
      <ModuleGuide title="¿Cómo funciona el Dashboard?">
        <p>
          Este panel te ofrece una vista general y resumida de la información más importante del sistema.
          Aquí encontrarás los indicadores clave (KPIs) y gráficos que consolidan los datos de los módulos de <strong>Clientes, Comisiones, Presupuestos y Órdenes de Servicio</strong>.
        </p>
      </ModuleGuide>
      
      <DashboardStats />
      
      <DashboardCharts />
      
    </div>
  );
};

export default DashboardPage;
