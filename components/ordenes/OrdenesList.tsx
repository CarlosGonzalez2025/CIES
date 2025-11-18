
import React from 'react';
import { Table } from '../ui/Table';
import type { OrdenServicio } from '../../types';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { Badge } from '../ui/Badge';

interface OrdenesListProps {
  ordenes: OrdenServicio[];
  onEdit: (orden: OrdenServicio) => void;
  onDelete: (orden: OrdenServicio) => void;
  isLoading?: boolean;
}

export const OrdenesList: React.FC<OrdenesListProps> = ({ ordenes, onEdit, onDelete, isLoading }) => {
  
  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'EJECUTADO': return 'primary';
      case 'FACTURADO': return 'success';
      case 'ANULADO': return 'danger';
      default: return 'warning';
    }
  };

  const columns = [
    { key: 'os_numero', label: '# OS' },
    { key: 'fecha_envio', label: 'Fecha', render: (o: OrdenServicio) => formatDate(o.fecha_envio) },
    { key: 'cliente', label: 'Cliente', render: (o: OrdenServicio) => o.cliente?.nombre_cliente || 'N/A' },
    { key: 'aliado', label: 'Aliado', render: (o: OrdenServicio) => o.aliado?.aliado || 'N/A' },
    { key: 'servicio_contratado', label: 'Servicio' },
    { key: 'total', label: 'Total', render: (o: OrdenServicio) => formatCurrency(o.total) },
    { 
        key: 'estado_actividad', 
        label: 'Estado', 
        render: (o: OrdenServicio) => (
            <Badge variant={getStatusVariant(o.estado_actividad)}>{o.estado_actividad || 'PENDIENTE'}</Badge>
        )
    },
  ];

  return (
    <Table<OrdenServicio>
      columns={columns}
      data={ordenes}
      onEdit={onEdit}
      onDelete={onDelete}
      isLoading={isLoading}
      getRowKey={(o) => o.id}
    />
  );
};
