import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { clientesApi } from '../services/api/clientesApi';
import toast from 'react-hot-toast';
import type { Cliente } from '../types';

export const useClientes = () => {
  const queryClient = useQueryClient();

  const { data: clientes, isLoading, error } = useQuery<Cliente[]>({
    queryKey: ['clientes'],
    queryFn: clientesApi.getAll
  });

  const clienteOptions = useMemo(() => {
    if (!clientes) return [];
    return clientes.map(c => ({ value: c.id, label: `${c.nombre_cliente} (${c.nit_documento})` }));
  }, [clientes]);

  const createMutation = useMutation({
    mutationFn: (newCliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => clientesApi.create(newCliente),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success(`Cliente ${data.nombre_cliente} creado exitosamente`);
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Cliente> }) => clientesApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  return {
    clientes,
    clienteOptions,
    isLoading,
    error,
    createCliente: createMutation.mutate,
    updateCliente: updateMutation.mutate,
    deleteCliente: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useCliente = (id: string | null) => {
  return useQuery({
    queryKey: ['cliente', id],
    queryFn: () => id ? clientesApi.getById(id) : null,
    enabled: !!id
  });
};
