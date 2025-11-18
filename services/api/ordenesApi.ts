
import { supabase } from '../supabaseClient';
import type { OrdenServicio } from '../../types';

export const ordenesApi = {
  async getAll(): Promise<OrdenServicio[]> {
    const { data, error } = await supabase
      .from('ordenes_servicio')
      .select('*, cliente:empresa_id(id, nombre_cliente), aliado:aliado_id(id, aliado), presupuesto:presupuesto_id(id)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<OrdenServicio | null> {
    const { data, error } = await supabase
      .from('ordenes_servicio')
      .select('*, cliente:empresa_id(id, nombre_cliente), aliado:aliado_id(id, aliado)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  async create(orden: Omit<OrdenServicio, 'id' | 'created_at' | 'updated_at'>): Promise<OrdenServicio> {
    const { data, error } = await supabase
      .from('ordenes_servicio')
      .insert([orden])
      .select('*, cliente:empresa_id(id, nombre_cliente), aliado:aliado_id(id, aliado)')
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: number, updates: Partial<OrdenServicio>): Promise<OrdenServicio> {
    const { data, error } = await supabase
      .from('ordenes_servicio')
      .update(updates)
      .eq('id', id)
      .select('*, cliente:empresa_id(id, nombre_cliente), aliado:aliado_id(id, aliado)')
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('ordenes_servicio')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
