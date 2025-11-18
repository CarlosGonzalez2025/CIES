import { z } from 'zod';

const primaComisionSchema = z.object({
  id: z.string().optional(),
  mes: z.string(),
  prima: z.preprocess(
    (val) => (val === '' || val === null ? 0 : Number(val)),
    z.number().min(0, 'La prima no puede ser negativa').default(0)
  ),
  comision: z.preprocess(
    (val) => (val === '' || val === null ? 0 : Number(val)),
    z.number().min(0, 'La comisión no puede ser negativa').default(0)
  ),
});

export const comisionSchema = z.object({
  cliente_id: z.string().uuid('Debe seleccionar un cliente'),
  arl_id: z.preprocess((val) => Number(val), z.number().min(1, 'La ARL es requerida')),
  fecha: z.string().min(1, 'La fecha es requerida'),
  cobertura: z.string().min(1, 'La fecha de cobertura es requerida'),
  porcentaje_comision_arl: z.preprocess(
    (val) => (val === '' ? 0 : Number(val)),
    z.number().min(0).max(1, 'Debe estar entre 0 y 1')
  ),
  porcentaje_comision_impuesto: z.preprocess(
    (val) => (val === '' ? 0 : Number(val)),
    z.number().min(0).max(1, 'Debe estar entre 0 y 1')
  ),
  porcentaje_inversion: z.preprocess(
    (val) => (val === '' ? 0 : Number(val)),
    z.number().min(0).max(1, 'Debe estar entre 0 y 1')
  ),
  primas: z.array(primaComisionSchema).length(12, 'Debe haber 12 registros de primas'),
});

export type ComisionFormData = z.infer<typeof comisionSchema>;
export type PrimaComisionFormData = z.infer<typeof primaComisionSchema>;
