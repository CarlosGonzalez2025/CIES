
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosApi } from '../services/api/usuariosApi';
import toast from 'react-hot-toast';
import type { PerfilUsuario } from '../types';

export const useUsuarios = () => {
  const queryClient = useQueryClient();

  const { data: usuarios, isLoading, error } = useQuery<PerfilUsuario[]>({
    queryKey: ['usuarios'],
    queryFn: usuariosApi.getAll
  });

  const createMutation = useMutation({
    mutationFn: (newUsuario: Omit<PerfilUsuario, 'created_at'>) => usuariosApi.createPerfil(newUsuario),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success(`Usuario configurado exitosamente`);
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PerfilUsuario> }) => usuariosApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Usuario actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usuariosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Usuario eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  return {
    usuarios,
    isLoading,
    error,
    createUsuario: createMutation.mutate,
    updateUsuario: updateMutation.mutate,
    deleteUsuario: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
