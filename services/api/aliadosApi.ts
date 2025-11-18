import { supabase } from '../supabaseClient';
import type { Aliado } from '../../types';

export const aliadosApi = {
  async getAll(): Promise<Aliado[]> {
    const { data, error } = await supabase
      .from('aliados')
      .select('*')
      .order('aliado', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Aliado | null> {
    const { data, error } = await supabase
      .from('aliados')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  async create(aliado: Omit<Aliado, 'id' | 'created_at' | 'updated_at'>): Promise<Aliado> {
    const { data, error } = await supabase
      .from('aliados')
      .insert([aliado])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Aliado>): Promise<Aliado> {
    const { data, error } = await supabase
      .from('aliados')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('aliados')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
