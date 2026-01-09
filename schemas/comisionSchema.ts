import { z } from 'zod';

const primaComisionSchema = z.object({
  id: z.string().optional(),
  mes: z.string(),
  prima: z.coerce.number().min(0, 'La prima no puede ser negativa').default(0),
  comision: z.coerce.number().min(0, 'La comisión no puede ser negativa').default(0),
});

export const comisionSchema = z.object({
  cliente_id: z.string().uuid('Debe seleccionar un cliente'),
  arl_id: z.coerce.number().min(1, 'La ARL es requerida'),
  fecha: z.string().min(1, 'La fecha es requerida'),
  cobertura: z.string().min(1, 'La fecha de cobertura es requerida'),
  porcentaje_comision_arl: z.coerce.number().min(0).max(1, 'Debe estar entre 0 y 1'),
  porcentaje_comision_impuesto: z.coerce.number().min(0).max(1, 'Debe estar entre 0 y 1'),
  porcentaje_inversion: z.coerce.number().min(0).max(1, 'Debe estar entre 0 y 1'),
  primas: z.array(primaComisionSchema).length(12, 'Debe haber 12 registros de primas'),
});

export type ComisionFormData = z.infer<typeof comisionSchema>;
export type PrimaComisionFormData = z.infer<typeof primaComisionSchema>;
