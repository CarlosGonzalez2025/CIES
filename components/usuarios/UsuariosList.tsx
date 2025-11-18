
import React from 'react';
import { Table } from '../ui/Table';
import type { PerfilUsuario } from '../../types';
import { Badge } from '../ui/Badge';
import { formatDate } from '../../utils/formatters';

interface UsuariosListProps {
  usuarios: PerfilUsuario[];
  onEdit: (usuario: PerfilUsuario) => void;
  onDelete: (usuario: PerfilUsuario) => void;
  isLoading?: boolean;
}

export const UsuariosList: React.FC<UsuariosListProps> = ({ usuarios, onEdit, onDelete, isLoading }) => {
  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    { 
      key: 'rol', 
      label: 'Rol',
      render: (u: PerfilUsuario) => (
        <Badge variant={u.rol === 'ADMIN' ? 'primary' : 'info'}>{u.rol}</Badge>
      )
    },
    { 
        key: 'modulos_autorizados', 
        label: 'Módulos Acceso',
        render: (u: PerfilUsuario) => u.rol === 'ADMIN' ? 'Todos' : `${u.modulos_autorizados.length} módulos`
    },
    { 
        key: 'activo', 
        label: 'Estado',
        render: (u: PerfilUsuario) => (
            <Badge variant={u.activo ? 'success' : 'danger'}>
                {u.activo ? 'Activo' : 'Inactivo'}
            </Badge>
        )
    },
    { 
        key: 'created_at', 
        label: 'Fecha Registro',
        render: (u: PerfilUsuario) => formatDate(u.created_at)
    },
  ];

  return (
    <Table<PerfilUsuario>
      columns={columns}
      data={usuarios}
      onEdit={onEdit}
      onDelete={onDelete}
      isLoading={isLoading}
      getRowKey={(u) => u.id}
    />
  );
};
