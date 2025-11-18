
import React from 'react';
import { Table } from '../ui/Table';
import type { Cliente } from '../../types';
import { formatDate, formatCurrency } from '../../utils/formatters';

interface ClientesListProps {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (cliente: Cliente) => void;
  isLoading?: boolean;
}

export const ClientesList: React.FC<ClientesListProps> = ({ clientes, onEdit, onDelete, isLoading }) => {
  const columns = [
    { key: 'nombre_cliente', label: 'Nombre Cliente' },
    { key: 'nit_documento', label: 'NIT' },
    { 
      key: 'arl', 
      label: 'ARL',
      render: (cliente: Cliente) => cliente.arl?.nombre || 'N/A'
    },
    { key: 'nombre_contacto', label: 'Contacto' },
    { key: 'numero_contacto', label: 'Teléfono' },
    { 
      key: 'valor_hora', 
      label: 'Valor Hora',
      render: (cliente: Cliente) => formatCurrency(cliente.valor_hora)
    },
    { 
      key: 'fecha', 
      label: 'Fecha Registro',
      render: (cliente: Cliente) => formatDate(cliente.fecha)
    },
  ];

  return (
    <Table<Cliente>
      columns={columns}
      data={clientes}
      onEdit={onEdit}
      onDelete={onDelete}
      isLoading={isLoading}
      getRowKey={(cliente) => cliente.id}
    />
  );
};
