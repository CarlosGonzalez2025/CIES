
import { supabase } from '../supabaseClient';
import type { PerfilUsuario } from '../../types';

export const usuariosApi = {
  async getAll(): Promise<PerfilUsuario[]> {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<PerfilUsuario | null> {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Note: In a real production Supabase app, creating the Auth User usually happens via 
  // supabase.auth.signUp() or via an Admin Edge Function to avoid logging out the current user.
  // For this implementation, we focus on the Profile creation which controls permissions.
  async createPerfil(perfil: Omit<PerfilUsuario, 'created_at'>): Promise<PerfilUsuario> {
    const { data, error } = await supabase
      .from('perfiles')
      .insert([perfil])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<PerfilUsuario>): Promise<PerfilUsuario> {
    const { data, error } = await supabase
      .from('perfiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  
  async delete(id: string): Promise<void> {
    // Only delete profile, auth user deletion requires admin privileges/edge function
    const { error } = await supabase
      .from('perfiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
