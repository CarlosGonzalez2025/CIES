
import { supabase } from '../supabaseClient';
import type { Cliente } from '../../types';

export const clientesApi = {
  async getAll(): Promise<Cliente[]> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*, arl:arl_id(id, nombre)')
      .order('nombre_cliente', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Cliente | null> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*, arl:arl_id(id, nombre)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>): Promise<Cliente> {
    const { data, error } = await supabase
      .from('clientes')
      .insert([cliente])
      .select('*, arl:arl_id(id, nombre)')
      .single();

    if (error) throw error;
    return data;
  },

  async createMany(clientes: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>[]): Promise<Cliente[]> {
    const { data, error } = await supabase
      .from('clientes')
      .insert(clientes)
      .select('*, arl:arl_id(id, nombre)');

    if (error) throw error;
    return data || [];
  },

  async update(id: string, updates: Partial<Cliente>): Promise<Cliente> {
    const { data, error } = await supabase
      .from('clientes')
      .update(updates)
      .eq('id', id)
      .select('*, arl:arl_id(id, nombre)')
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
