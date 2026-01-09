
import { z } from 'zod';

export const clienteSchema = z.object({
  nombre_cliente: z.string().min(3, 'El nombre del cliente es requerido'),
  nit_documento: z.string().min(5, 'El NIT es requerido'),
  fecha: z.string().min(1, 'La fecha es requerida'),
  arl_id: z.coerce.number().min(1, 'La ARL es requerida'),
  nombre_contacto: z.string().optional(),
  numero_contacto: z.string().optional(),
  email_contacto: z.string().email('Email de contacto no válido').optional().or(z.literal('')),
  valor_hora: z.coerce.number().optional(),
  porcentaje_comision: z.coerce.number().min(0).max(1, 'El porcentaje debe estar entre 0 y 1').optional(),
  direccion: z.string().optional(),
});

export type ClienteFormData = z.infer<typeof clienteSchema>;
