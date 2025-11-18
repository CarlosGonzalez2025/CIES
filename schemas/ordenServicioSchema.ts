
import { z } from 'zod';

export const ordenServicioSchema = z.object({
  presupuesto_id: z.string().uuid('Debe seleccionar un presupuesto'),
  os_numero: z.string().min(1, 'El número de OS es requerido'),
  fecha_envio: z.string().min(1, 'La fecha de envío es requerida'),
  empresa_id: z.string().uuid('El cliente es requerido'), // Se refiere a cliente_id en la tabla, pero la UI puede llamarlo empresa
  aliado_id: z.string().uuid('Debe seleccionar un aliado'),
  especialidad: z.string().optional(),
  categoria_servicio: z.string().optional(),
  servicio_contratado: z.string().min(3, 'El servicio contratado es requerido'),
  unidad: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().positive('Debe ser mayor a 0').optional()
  ),
  costo_hora: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().positive('El costo debe ser positivo').optional()
  ),
  numero_factura: z.string().optional(),
  fecha_radicacion: z.string().optional().or(z.literal('')),
  estado_actividad: z.enum(['PENDIENTE', 'EJECUTADO', 'FACTURADO', 'ANULADO']).default('PENDIENTE'),
  nombre_contacto: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  direccion_cliente: z.string().optional(),
});

export type OrdenServicioFormData = z.infer<typeof ordenServicioSchema>;
