
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

  // Create a new user in auth.users and their profile
  async createPerfil(perfil: Omit<PerfilUsuario, 'created_at'> & { password?: string }): Promise<PerfilUsuario> {
    // Step 1: Create auth user first (if password is provided)
    if (perfil.password) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: perfil.email,
        password: perfil.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            nombre: perfil.nombre
          }
        }
      });

      if (authError) throw new Error(`Error creando usuario de autenticación: ${authError.message}`);
      if (!authData.user) throw new Error('No se pudo crear el usuario');

      // Wait a bit for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Update the auto-created profile with admin settings
      const { data: profileData, error: profileError } = await supabase
        .from('perfiles')
        .update({
          nombre: perfil.nombre,
          rol: perfil.rol,
          modulos_autorizados: perfil.modulos_autorizados,
          activo: perfil.activo
        })
        .eq('id', authData.user.id)
        .select()
        .single();

      if (profileError) {
        throw new Error(`Error actualizando perfil: ${profileError.message}`);
      }

      return profileData;
    } else {
      // If no password, just create profile (assuming user exists in auth)
      const { data, error } = await supabase
        .from('perfiles')
        .insert([perfil])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
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
