import { supabase } from '../supabaseClient';
import type { Presupuesto } from '../../types';

export const presupuestoApi = {
  async getAll(): Promise<Presupuesto[]> {
    const { data, error } = await supabase
      .from('presupuesto')
      .select('*, cliente:cliente_id(id, nombre_cliente), aliado:aliado_id(id, aliado)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Presupuesto | null> {
    const { data, error } = await supabase
      .from('presupuesto')
      .select('*, cliente:cliente_id(id, nombre_cliente), aliado:aliado_id(id, aliado)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  async create(presupuesto: Omit<Presupuesto, 'id' | 'created_at' | 'updated_at'>): Promise<Presupuesto> {
    const { data, error } = await supabase
      .from('presupuesto')
      .insert([presupuesto])
      .select('*, cliente:cliente_id(id, nombre_cliente), aliado:aliado_id(id, aliado)')
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Presupuesto>): Promise<Presupuesto> {
    const { data, error } = await supabase
      .from('presupuesto')
      .update(updates)
      .eq('id', id)
      .select('*, cliente:cliente_id(id, nombre_cliente), aliado:aliado_id(id, aliado)')
      .single();

    if (error) throw error;
    return data;
  },

  // Nuevo método crítico para la lógica de negocio
  async updateEjecucion(id: string): Promise<void> {
    // 1. Obtener todas las órdenes activas (no anuladas) de este presupuesto
    const { data: ordenes, error: ordenesError } = await supabase
      .from('ordenes_servicio')
      .select('total, horas_ejecutadas') // Asumiendo que usamos 'total' monetario
      .eq('presupuesto_id', id)
      .neq('estado_actividad', 'ANULADO');

    if (ordenesError) throw ordenesError;

    // 2. Calcular totales
    const totalEjecutado = ordenes?.reduce((sum, orden) => sum + (orden.total || 0), 0) || 0;

    // 3. Obtener el presupuesto actual para saber la meta
    const { data: presupuesto, error: presError } = await supabase
      .from('presupuesto')
      .select('inversion_ejecutar')
      .eq('id', id)
      .single();
    
    if (presError) throw presError;

    const inversionTotal = presupuesto.inversion_ejecutar || 0;
    const saldoPendiente = inversionTotal - totalEjecutado;
    const porcentajeEjecucion = inversionTotal > 0 ? (totalEjecutado / inversionTotal) : 0;
    
    let estado = 'ACTIVO';
    if (porcentajeEjecucion >= 1) estado = 'COMPLETADO';
    else if (porcentajeEjecucion > 0) estado = 'EN EJECUCIÓN';

    // 4. Actualizar el presupuesto
    const { error: updateError } = await supabase
      .from('presupuesto')
      .update({
        valor_ejecutado: totalEjecutado,
        saldo_pendiente_ejecutar: saldoPendiente,
        porcentaje_ejecucion: porcentajeEjecucion,
        estado_actividad: estado
      })
      .eq('id', id);

    if (updateError) throw updateError;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('presupuesto')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};