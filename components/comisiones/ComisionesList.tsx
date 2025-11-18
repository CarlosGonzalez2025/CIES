import React from 'react';
import { Table } from '../ui/Table';
import type { Comision } from '../../types';
import { formatDate, formatCurrency } from '../../utils/formatters';

interface ComisionesListProps {
  comisiones: Comision[];
  onEdit: (comision: Comision) => void;
  onDelete: (comision: Comision) => void;
  isLoading?: boolean;
}

export const ComisionesList: React.FC<ComisionesListProps> = ({ comisiones, onEdit, onDelete, isLoading }) => {
  const columns = [
    { 
      key: 'cliente', 
      label: 'Cliente',
      render: (c: Comision) => c.cliente?.nombre_cliente || 'N/A'
    },
    { 
      key: 'arl', 
      label: 'ARL',
      render: (c: Comision) => c.arl?.nombre || 'N/A'
    },
    { 
      key: 'fecha', 
      label: 'Fecha Comisión',
      render: (c: Comision) => formatDate(c.fecha)
    },
    { 
      key: 'valor_prima_emitida', 
      label: 'Prima Total',
      render: (c: Comision) => formatCurrency(c.valor_prima_emitida)
    },
    { 
      key: 'valor_comision_emitida_2024', 
      label: 'Comisión Neta',
      render: (c: Comision) => formatCurrency(c.valor_comision_emitida_2024)
    },
     { 
      key: 'valor_inversion', 
      label: 'Inversión',
      render: (c: Comision) => formatCurrency(c.valor_inversion)
    },
  ];

  return (
    <Table<Comision>
      columns={columns}
      data={comisiones}
      onEdit={onEdit}
      onDelete={onDelete}
      isLoading={isLoading}
      getRowKey={(c) => c.id}
    />
  );
};
