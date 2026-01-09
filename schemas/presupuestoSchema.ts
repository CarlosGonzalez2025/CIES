import { z } from 'zod';

export const presupuestoSchema = z.object({
  cliente_id: z.string().uuid('Debe seleccionar un cliente válido'),
  estado_actividad: z.string().min(1, 'El estado es requerido'),
  comision: z.coerce.number().positive('La comisión debe ser un número positivo').optional(),
  porcentaje_inversion_anio: z.coerce
    .number()
    .min(0, 'El porcentaje no puede ser negativo')
    .max(1, 'El porcentaje no puede ser mayor a 1 (100%)')
    .optional(),
  horas_unidades: z.coerce.number().positive('Las horas/unidades deben ser un número positivo').optional(),
  costo_hora_unidad: z.coerce.number().positive('El costo debe ser un número positivo').optional(),
  mes_ejecucion: z.string().optional(),
  aliado_id: z.string().uuid('Debe seleccionar un aliado válido').optional().nullable(),
});

export type PresupuestoFormData = z.infer<typeof presupuestoSchema>;
