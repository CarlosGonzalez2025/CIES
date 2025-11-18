import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordenesApi } from '../services/api/ordenesApi';
import { presupuestoApi } from '../services/api/presupuestoApi';
import toast from 'react-hot-toast';
import type { OrdenServicio } from '../types';

export const useOrdenesServicio = () => {
  const queryClient = useQueryClient();

  const { data: ordenes, isLoading, error } = useQuery<OrdenServicio[]>({
    queryKey: ['ordenes'],
    queryFn: ordenesApi.getAll
  });

  // Helper para actualizar presupuesto
  const updatePresupuestoRelacionado = async (presupuestoId?: string) => {
    if (presupuestoId) {
      try {
        await presupuestoApi.updateEjecucion(presupuestoId);
        queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
      } catch (e) {
        console.error("Error actualizando presupuesto:", e);
      }
    }
  };

  const createMutation = useMutation({
    mutationFn: (newOrden: Omit<OrdenServicio, 'id' | 'created_at' | 'updated_at'>) => ordenesApi.create(newOrden),
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['ordenes'] });
      toast.success(`Orden de Servicio creada exitosamente`);
      // Actualizar presupuesto
      if (data.presupuesto_id) {
        await updatePresupuestoRelacionado(data.presupuesto_id);
      }
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<OrdenServicio> }) => ordenesApi.update(id, updates),
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['ordenes'] });
      toast.success('Orden actualizada exitosamente');
      if (data.presupuesto_id) {
        await updatePresupuestoRelacionado(data.presupuesto_id);
      }
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      // Primero obtenemos la orden para saber qué presupuesto actualizar
      const orden = await ordenesApi.getById(id.toString());
      await ordenesApi.delete(id);
      return orden;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['ordenes'] });
      toast.success('Orden eliminada exitosamente');
      if (data?.presupuesto_id) {
         await updatePresupuestoRelacionado(data.presupuesto_id);
      }
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  return {
    ordenes,
    isLoading,
    error,
    createOrden: createMutation.mutate,
    updateOrden: updateMutation.mutate,
    deleteOrden: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};