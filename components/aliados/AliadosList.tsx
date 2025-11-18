import React from 'react';
import { Table } from '../ui/Table';
import type { Aliado } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface AliadosListProps {
  aliados: Aliado[];
  onEdit: (aliado: Aliado) => void;
  onDelete: (aliado: Aliado) => void;
  isLoading?: boolean;
}

export const AliadosList: React.FC<AliadosListProps> = ({ aliados, onEdit, onDelete, isLoading }) => {
  const columns = [
    { key: 'aliado', label: 'Nombre Aliado' },
    { key: 'especialidad', label: 'Especialidad' },
    { key: 'contacto', label: 'Contacto' },
    { key: 'numero_telefonico', label: 'Teléfono' },
    { key: 'email', label: 'Email' },
    { 
      key: 'hora_pbl', 
      label: 'Tarifa PBL',
      render: (aliado: Aliado) => formatCurrency(aliado.hora_pbl)
    },
  ];

  return (
    <Table<Aliado>
      columns={columns}
      data={aliados}
      onEdit={onEdit}
      onDelete={onDelete}
      isLoading={isLoading}
      getRowKey={(aliado) => aliado.id}
    />
  );
};
