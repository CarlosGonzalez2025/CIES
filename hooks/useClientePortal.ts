import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './useAuth';
import type { Comision, Presupuesto, OrdenServicio } from '../types';

interface ClienteStats {
  totalComisiones: number;
  totalPresupuesto: number;
  presupuestoEjecutado: number;
  ordenesActivas: number;
  totalPrimas: number;
}

interface ClienteData {
  stats: ClienteStats;
  comisiones: Comision[];
  presupuestos: Presupuesto[];
  ordenes: OrdenServicio[];
}

export const useClientePortal = () => {
  const { profile } = useAuth();
  const clienteId = profile?.cliente_id;

  const { data: comisiones = [], isLoading: loadingComisiones } = useQuery({
    queryKey: ['cliente-comisiones', clienteId],
    queryFn: async () => {
      if (!clienteId) return [];

      const { data, error } = await supabase
        .from('comisiones')
        .select(`
          *,
          arl:arl_id (id, nombre),
          cliente:cliente_id (id, nombre_cliente, nit_documento)
        `)
        .eq('cliente_id', clienteId)
        .order('fecha', { ascending: false });

      if (error) throw error;
      return data as Comision[];
    },
    enabled: !!clienteId && profile?.rol === 'CLIENTE',
  });

  const { data: presupuestos = [], isLoading: loadingPresupuestos } = useQuery({
    queryKey: ['cliente-presupuestos', clienteId],
    queryFn: async () => {
      if (!clienteId) return [];

      const { data, error } = await supabase
        .from('presupuesto')
        .select(`
          *,
          cliente:cliente_id (id, nombre_cliente, nit_documento),
          aliado:aliado_id (id, aliado, contacto)
        `)
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Presupuesto[];
    },
    enabled: !!clienteId && profile?.rol === 'CLIENTE',
  });

  const { data: ordenes = [], isLoading: loadingOrdenes } = useQuery({
    queryKey: ['cliente-ordenes', clienteId],
    queryFn: async () => {
      if (!clienteId) return [];

      const { data, error } = await supabase
        .from('ordenes_servicio')
        .select(`
          *,
          cliente:empresa_id (id, nombre_cliente, nit_documento),
          aliado:aliado_id (id, aliado, contacto),
          presupuesto:presupuesto_id (id, comision)
        `)
        .eq('empresa_id', clienteId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as OrdenServicio[];
    },
    enabled: !!clienteId && profile?.rol === 'CLIENTE',
  });

  // Calcular estadísticas
  const stats: ClienteStats = {
    totalComisiones: comisiones.reduce((sum, c) => sum + (c.valor_comision_emitida || 0), 0),
    totalPrimas: comisiones.reduce((sum, c) => sum + (c.valor_prima_emitida || 0), 0),
    totalPresupuesto: presupuestos.reduce((sum, p) => sum + (p.inversion_ejecutar || 0), 0),
    presupuestoEjecutado: presupuestos.reduce((sum, p) => sum + (p.valor_ejecutado || 0), 0),
    ordenesActivas: ordenes.filter(o => !o.cancelado && o.estado_actividad !== 'Completada').length,
  };

  const clienteData: ClienteData = {
    stats,
    comisiones,
    presupuestos,
    ordenes,
  };

  return {
    data: clienteData,
    isLoading: loadingComisiones || loadingPresupuestos || loadingOrdenes,
    comisiones,
    presupuestos,
    ordenes,
    stats,
  };
};
