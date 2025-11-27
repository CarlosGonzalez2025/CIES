
import { z } from 'zod';

export const usuarioSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'El email es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional().or(z.literal('')),
  nombre: z.string().min(3, 'El nombre es requerido'),
  rol: z.enum(['ADMIN', 'ANALISTA', 'CONSULTA', 'CLIENTE'], {
    required_error: "Debe seleccionar un rol",
  }),
  modulos_autorizados: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Debe seleccionar al menos un módulo.",
  }),
  cliente_id: z.string().uuid().optional(), // Solo requerido para rol CLIENTE
  activo: z.boolean().default(true),
}).refine((data) => {
  // Si el rol es CLIENTE, debe tener un cliente_id
  if (data.rol === 'CLIENTE' && !data.cliente_id) {
    return false;
  }
  return true;
}, {
  message: "Los usuarios tipo CLIENTE deben tener un cliente asociado",
  path: ["cliente_id"],
});

export type UsuarioFormData = z.infer<typeof usuarioSchema>;
