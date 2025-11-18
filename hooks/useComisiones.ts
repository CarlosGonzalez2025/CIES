import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { comisionesApi } from '../services/api/comisionesApi';
import { primasComisionApi } from '../services/api/primasComisionApi';
import toast from 'react-hot-toast';
import type { Comision, PrimasComision } from '../types';

export const useComisiones = () => {
  const queryClient = useQueryClient();

  const { data: comisiones, isLoading, error } = useQuery<Comision[]>({
    queryKey: ['comisiones'],
    queryFn: comisionesApi.getAll
  });

  const createMutation = useMutation({
    mutationFn: ({ comision, primas }: { comision: Omit<Comision, 'id'|'created_at'|'updated_at'>, primas: Omit<PrimasComision, 'id'|'comision_id'|'created_at'>[] }) => 
      comisionesApi.create(comision, primas),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comisiones'] });
      toast.success(`Comisión creada exitosamente`);
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, comisionUpdates, primasUpdates }: { id: string; comisionUpdates: Partial<Comision>, primasUpdates: {id: string, prima: number, comision: number}[] }) => 
      Promise.all([
        comisionesApi.update(id, comisionUpdates),
        primasComisionApi.bulkUpdate(primasUpdates)
      ]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comisiones'] });
      queryClient.invalidateQueries({ queryKey: ['comision'] });
      toast.success('Comisión actualizada exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => comisionesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comisiones'] });
      toast.success('Comisión eliminada exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  return {
    comisiones,
    isLoading,
    error,
    createComision: createMutation.mutate,
    updateComision: updateMutation.mutate,
    deleteComision: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useComision = (id: string | null) => {
  return useQuery({
    queryKey: ['comision', id],
    queryFn: () => id ? comisionesApi.getById(id) : null,
    enabled: !!id
  });
};
