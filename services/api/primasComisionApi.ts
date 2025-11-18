import { supabase } from '../supabaseClient';
import type { PrimasComision } from '../../types';

export const primasComisionApi = {
  async getByComision(comisionId: string): Promise<PrimasComision[]> {
    const { data, error } = await supabase
      .from('primas_comision')
      .select('*')
      .eq('comision_id', comisionId)
      .order('created_at'); // Assuming order matters
    
    if (error) throw error;
    return data || [];
  },

  async bulkUpdate(primas: {id: string, prima: number, comision: number}[]): Promise<any[]> {
    const updates = primas.map(p => 
      supabase
        .from('primas_comision')
        .update({ prima: p.prima, comision: p.comision })
        .eq('id', p.id)
    );

    const results = await Promise.all(updates);
    const errors = results.filter(res => res.error);

    if (errors.length > 0) {
      console.error("Error updating primas:", errors);
      throw errors[0].error;
    }

    return results.map(res => res.data);
  }
};
