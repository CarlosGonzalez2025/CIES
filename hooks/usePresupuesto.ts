import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { presupuestoApi } from '../services/api/presupuestoApi';
import toast from 'react-hot-toast';
import type { Presupuesto } from '../types';

export const usePresupuestos = () => {
  const queryClient = useQueryClient();

  const { data: presupuestos, isLoading, error } = useQuery<Presupuesto[]>({
    queryKey: ['presupuestos'],
    queryFn: presupuestoApi.getAll
  });

  const createMutation = useMutation({
    mutationFn: (newPresupuesto: Omit<Presupuesto, 'id' | 'created_at' | 'updated_at'>) => presupuestoApi.create(newPresupuesto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
      toast.success(`Presupuesto creado exitosamente`);
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Presupuesto> }) => presupuestoApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
      toast.success('Presupuesto actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => presupuestoApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
      toast.success('Presupuesto eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  return {
    presupuestos,
    isLoading,
    error,
    createPresupuesto: createMutation.mutate,
    updatePresupuesto: updateMutation.mutate,
    deletePresupuesto: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const usePresupuesto = (id: string | null) => {
  return useQuery({
    queryKey: ['presupuesto', id],
    queryFn: () => id ? presupuestoApi.getById(id) : null,
    enabled: !!id
  });
};
