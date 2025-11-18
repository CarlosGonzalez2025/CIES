import React from 'react';
import { Table } from '../ui/Table';
import type { Presupuesto } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Badge } from '../ui/Badge';

interface PresupuestoListProps {
  presupuestos: Presupuesto[];
  onEdit: (presupuesto: Presupuesto) => void;
  onDelete: (presupuesto: Presupuesto) => void;
  isLoading?: boolean;
}

export const PresupuestoList: React.FC<PresupuestoListProps> = ({ presupuestos, onEdit, onDelete, isLoading }) => {

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVO':
      case 'EN EJECUCIÓN':
        return 'success';
      case 'PENDIENTE':
        return 'warning';
      case 'COMPLETADO':
        return 'primary';
      default:
        return 'default';
    }
  };

  const columns = [
    { 
      key: 'cliente', 
      label: 'Cliente',
      render: (p: Presupuesto) => p.cliente?.nombre_cliente || 'N/A'
    },
    { 
      key: 'inversion_ejecutar', 
      label: 'Inversión a Ejecutar',
      render: (p: Presupuesto) => formatCurrency(p.inversion_ejecutar)
    },
     { 
      key: 'valor_ejecutado', 
      label: 'Valor Ejecutado',
      render: (p: Presupuesto) => formatCurrency(p.valor_ejecutado)
    },
     { 
      key: 'saldo_pendiente_ejecutar', 
      label: 'Saldo Pendiente',
      render: (p: Presupuesto) => formatCurrency(p.saldo_pendiente_ejecutar)
    },
    { 
      key: 'porcentaje_ejecucion', 
      label: '% Ejecución',
      render: (p: Presupuesto) => `${((p.porcentaje_ejecucion || 0) * 100).toFixed(2)}%`
    },
    { 
      key: 'estado_actividad', 
      label: 'Estado',
      render: (p: Presupuesto) => (
        <Badge variant={getStatusVariant(p.estado_actividad || '')}>
            {p.estado_actividad}
        </Badge>
      )
    },
    { 
      key: 'aliado', 
      label: 'Aliado',
      render: (p: Presupuesto) => p.aliado?.aliado || 'No asignado'
    },
  ];

  return (
    <Table<Presupuesto>
      columns={columns}
      data={presupuestos}
      onEdit={onEdit}
      onDelete={onDelete}
      isLoading={isLoading}
      getRowKey={(p) => p.id}
    />
  );
};
