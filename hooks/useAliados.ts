import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { aliadosApi } from '../services/api/aliadosApi';
import toast from 'react-hot-toast';
import type { Aliado } from '../types';

export const useAliados = () => {
  const queryClient = useQueryClient();

  const { data: aliados, isLoading, error } = useQuery<Aliado[]>({
    queryKey: ['aliados'],
    queryFn: aliadosApi.getAll
  });

  const aliadoOptions = useMemo(() => {
    if (!aliados) return [];
    return aliados.map(a => ({ value: a.id, label: a.aliado }));
  }, [aliados]);

  const createMutation = useMutation({
    mutationFn: (newAliado: Omit<Aliado, 'id' | 'created_at' | 'updated_at'>) => aliadosApi.create(newAliado),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['aliados'] });
      toast.success(`Aliado ${data.aliado} creado exitosamente`);
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Aliado> }) => aliadosApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aliados'] });
      toast.success('Aliado actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => aliadosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aliados'] });
      toast.success('Aliado eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  return {
    aliados,
    aliadoOptions,
    isLoading,
    error,
    createAliado: createMutation.mutate,
    updateAliado: updateMutation.mutate,
    deleteAliado: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useAliado = (id: string | null) => {
  return useQuery({
    queryKey: ['aliado', id],
    queryFn: () => id ? aliadosApi.getById(id) : null,
    enabled: !!id
  });
};
