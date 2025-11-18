
import { z } from 'zod';

export const usuarioSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'El email es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional().or(z.literal('')), // Optional for editing
  nombre: z.string().min(3, 'El nombre es requerido'),
  rol: z.enum(['ADMIN', 'ANALISTA', 'CONSULTA'], {
    required_error: "Debe seleccionar un rol",
  }),
  modulos_autorizados: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Debe seleccionar al menos un módulo.",
  }),
  activo: z.boolean().default(true),
});

export type UsuarioFormData = z.infer<typeof usuarioSchema>;
