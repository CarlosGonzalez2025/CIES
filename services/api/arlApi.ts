
import { supabase } from '../supabaseClient';
import type { Arl } from '../../types';

export const arlApi = {
  async getAll(): Promise<Arl[]> {
    const { data, error } = await supabase
      .from('arl')
      .select('*')
      .order('nombre');
    
    if (error) throw error;
    return data || [];
  }
};
