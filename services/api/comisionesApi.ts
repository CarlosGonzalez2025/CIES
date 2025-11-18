import { supabase } from '../supabaseClient';
import type { Comision, PrimasComision } from '../../types';

export const comisionesApi = {
  async getAll(): Promise<Comision[]> {
    const { data, error } = await supabase
      .from('comisiones')
      .select('*, cliente:cliente_id(id, nombre_cliente), arl:arl_id(id, nombre)')
      .order('fecha', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<(Comision & { primas_comision: PrimasComision[] }) | null> {
    const { data, error } = await supabase
      .from('comisiones')
      .select('*, cliente:cliente_id(id, nombre_cliente), arl:arl_id(id, nombre), primas_comision(*)')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async create(comision: Omit<Comision, 'id' | 'created_at' | 'updated_at'>, primas: Omit<PrimasComision, 'id' | 'comision_id' | 'created_at'>[]): Promise<Comision> {
    // 1. Create the main commission record
    const { data: comisionData, error: comisionError } = await supabase
      .from('comisiones')
      .insert([comision])
      .select()
      .single();

    if (comisionError) throw comisionError;

    // 2. Prepare and insert the 12 primas records
    const primasToInsert = primas.map(p => ({
      ...p,
      comision_id: comisionData.id,
      cliente_id: comisionData.cliente_id,
      usuario: comisionData.usuario,
    }));

    const { error: primasError } = await supabase
      .from('primas_comision')
      .insert(primasToInsert);

    if (primasError) {
      // Rollback commission creation if primas fail
      await supabase.from('comisiones').delete().eq('id', comisionData.id);
      throw primasError;
    }

    return comisionData;
  },

  async update(id: string, updates: Partial<Comision>): Promise<Comision> {
    const { data, error } = await supabase
      .from('comisiones')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('comisiones')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
