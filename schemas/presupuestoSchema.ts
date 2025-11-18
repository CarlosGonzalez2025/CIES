import { z } from 'zod';

export const presupuestoSchema = z.object({
  cliente_id: z.string().uuid('Debe seleccionar un cliente válido'),
  comision: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().positive('La comisión debe ser un número positivo')
  ),
  porcentaje_inversion_anio: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(0, 'El porcentaje no puede ser negativo').max(1, 'El porcentaje no puede ser mayor a 1 (100%)')
  ),
  horas_unidades: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().positive('Las horas/unidades deben ser un número positivo').optional()
  ),
  costo_hora_unidad: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().positive('El costo debe ser un número positivo').optional()
  ),
  estado_actividad: z.string().min(1, 'El estado es requerido'),
  mes_ejecucion: z.string().optional(),
  aliado_id: z.string().uuid('Debe seleccionar un aliado válido').optional().nullable(),
});

export type PresupuestoFormData = z.infer<typeof presupuestoSchema>;
