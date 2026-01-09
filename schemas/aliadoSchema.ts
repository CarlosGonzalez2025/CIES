import { z } from 'zod';

export const aliadoSchema = z.object({
  aliado: z.string().min(3, 'El nombre del aliado es requerido'),
  especialidad: z.string().optional(),
  nit: z.string().optional(),
  contacto: z.string().optional(),
  numero_telefonico: z.string().optional(),
  email: z.string().email('Email no válido').optional().or(z.literal('')),
  fecha_registro: z.string().min(1, 'La fecha es requerida'),
  hora_pbl: z.coerce.number().positive('El valor debe ser positivo').optional(),
  hora_especializada: z.coerce.number().positive('El valor debe ser positivo').optional(),
  direccion: z.string().optional(),
  tipo_cuenta: z.string().optional(),
  banco: z.string().optional(),
  numero_cuenta: z.string().optional(),
});

export type AliadoFormData = z.infer<typeof aliadoSchema>;
