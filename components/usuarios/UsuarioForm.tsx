
import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usuarioSchema, UsuarioFormData } from '../../schemas/usuarioSchema';
import type { PerfilUsuario } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useClientes } from '../../hooks/useClientes';

interface UsuarioFormProps {
  onSubmit: SubmitHandler<UsuarioFormData>;
  onClose: () => void;
  defaultValues?: PerfilUsuario | null;
  isSubmitting?: boolean;
}

const ROLES = [
    { value: "ADMIN", label: "Administrador (Acceso Total)" },
    { value: "ANALISTA", label: "Analista (Gestión)" },
    { value: "CONSULTA", label: "Solo Consulta" },
    { value: "CLIENTE", label: "Cliente (Solo Portal)" },
];

const MODULOS = [
    { id: '/clientes', label: 'Gestión de Clientes' },
    { id: '/aliados', label: 'Aliados Estratégicos' },
    { id: '/comisiones', label: 'Comisiones' },
    { id: '/presupuesto', label: 'Presupuestos' },
    { id: '/ordenes-servicio', label: 'Órdenes de Servicio' },
    { id: '/reportes', label: 'Reportes' },
    { id: '/usuarios', label: 'Gestión de Usuarios' },
];

export const UsuarioForm: React.FC<UsuarioFormProps> = ({ onSubmit, onClose, defaultValues, isSubmitting }) => {
  const { clienteOptions, isLoading: loadingClientes } = useClientes();
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
        modulos_autorizados: [],
        activo: true
    }
  });

  const rol = watch('rol');

  useEffect(() => {
    if (defaultValues) {
      reset({
        email: defaultValues.email,
        nombre: defaultValues.nombre,
        rol: defaultValues.rol,
        modulos_autorizados: defaultValues.modulos_autorizados || [],
        cliente_id: defaultValues.cliente_id,
        activo: defaultValues.activo
      });
    }
  }, [defaultValues, reset]);

  // Auto-select all modules if Admin, clear modules if Cliente
  useEffect(() => {
      if (rol === 'ADMIN') {
          setValue('modulos_autorizados', MODULOS.map(m => m.id));
      } else if (rol === 'CLIENTE') {
          setValue('modulos_autorizados', ['/portal-cliente']);
      }
  }, [rol, setValue]);
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Nombre Completo" 
              {...register('nombre')} 
              error={errors.nombre?.message} 
              required 
            />
            <Input 
              label="Correo Electrónico" 
              type="email" 
              {...register('email')} 
              error={errors.email?.message} 
              required 
            />
            {!defaultValues && (
                 <Input 
                    label="Contraseña Temporal" 
                    type="password" 
                    {...register('password')} 
                    error={errors.password?.message} 
                 />
            )}
            <Select
              label="Rol de Usuario"
              options={ROLES}
              {...register('rol')}
              error={errors.rol?.message}
              required
            />
        </div>

        {rol === 'CLIENTE' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <Select
              label="Cliente Asociado"
              options={clienteOptions}
              {...register('cliente_id')}
              error={errors.cliente_id?.message}
              disabled={loadingClientes}
              required
            />
            <p className="text-xs text-blue-600 mt-2">
              Este usuario tendrá acceso exclusivo al portal del cliente seleccionado.
            </p>
          </div>
        )}

        {rol !== 'CLIENTE' && (
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Asignación de Módulos</label>
            <div className="grid grid-cols-2 gap-3">
                {MODULOS.map(modulo => (
                    <label key={modulo.id} className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                        <input
                            type="checkbox"
                            value={modulo.id}
                            {...register('modulos_autorizados')}
                            disabled={rol === 'ADMIN'}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{modulo.label}</span>
                    </label>
                ))}
            </div>
            {errors.modulos_autorizados && <p className="text-sm text-red-600 mt-1">{errors.modulos_autorizados.message}</p>}
          </div>
        )}
        
        <div className="flex items-center gap-2">
            <input 
                type="checkbox" 
                id="activo"
                {...register('activo')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="activo" className="text-sm font-medium text-gray-700">Usuario Activo</label>
        </div>
      </div>

       <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" isLoading={isSubmitting}>
              {defaultValues ? 'Guardar Cambios' : 'Crear Usuario'}
            </Button>
        </div>
    </form>
  );
};
