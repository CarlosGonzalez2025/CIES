import React, { useEffect, useMemo } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { presupuestoSchema, PresupuestoFormData } from '../../schemas/presupuestoSchema';
import type { Presupuesto } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useClientes } from '../../hooks/useClientes';
import { useAliados } from '../../hooks/useAliados';
import { useComisiones } from '../../hooks/useComisiones';
import { formatCurrency } from '../../utils/formatters';

const ESTADOS_ACTIVIDAD = [
    { value: "ACTIVO", label: "Activo" },
    { value: "EN EJECUCIÓN", label: "En Ejecución" },
    { value: "COMPLETADO", label: "Completado" },
    { value: "PENDIENTE", label: "Pendiente" },
];

interface PresupuestoFormProps {
  onSubmit: SubmitHandler<PresupuestoFormData>;
  onClose: () => void;
  defaultValues?: Presupuesto | null;
  isSubmitting?: boolean;
}

export const PresupuestoForm: React.FC<PresupuestoFormProps> = ({ onSubmit, onClose, defaultValues, isSubmitting }) => {
  const { clienteOptions, isLoading: isLoadingClientes } = useClientes();
  const { aliadoOptions, isLoading: isLoadingAliados } = useAliados();
  const { comisiones, isLoading: isLoadingComisiones } = useComisiones();

  const { register, handleSubmit, formState: { errors }, reset, watch, control, setValue } = useForm<PresupuestoFormData>({
    resolver: zodResolver(presupuestoSchema),
  });

  const [comision, porcentajeInversion, selectedClienteId] = watch(['comision', 'porcentaje_inversion_anio', 'cliente_id']);

  useEffect(() => {
    if (defaultValues) {
        reset({
            ...defaultValues,
            aliado_id: defaultValues.aliado_id || null
        });
    } else if (!selectedClienteId) { // Only reset commission if creating a new one
        setValue('comision', 0);
        reset({ estado_actividad: "PENDIENTE", comision: 0 });
    }
  }, [defaultValues, reset, selectedClienteId, setValue]);

  useEffect(() => {
    if (selectedClienteId && comisiones && !defaultValues) { // Auto-calculate only on new forms
      const totalComision = comisiones
        .filter(c => c.cliente_id === selectedClienteId)
        .reduce((sum, current) => sum + (current.valor_comision_emitida || 0), 0);
      setValue('comision', totalComision, { shouldValidate: true });
    }
  }, [selectedClienteId, comisiones, setValue, defaultValues]);

  const inversionEjecutar = useMemo(() => {
    return (comision || 0) * (porcentajeInversion || 0);
  }, [comision, porcentajeInversion]);
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <Controller
            name="cliente_id"
            control={control}
            render={({ field }) => (
                <Select 
                    label="Cliente"
                    options={clienteOptions}
                    {...field}
                    error={errors.cliente_id?.message}
                    disabled={isLoadingClientes || !!defaultValues}
                    required
                />
            )}
        />

        <Input 
          label="Comisión Total (Automático)" 
          type="number"
          step="0.01"
          {...register('comision')} 
          error={errors.comision?.message} 
          required 
          readOnly
          className="bg-gray-100 cursor-not-allowed"
        />
        
        <Input 
          label="Porcentaje Inversión (ej. 0.6)" 
          type="number"
          step="0.0001"
          {...register('porcentaje_inversion_anio')} 
          error={errors.porcentaje_inversion_anio?.message} 
          required 
        />
        
        <div className="p-3 bg-gray-100 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-1">Inversión a Ejecutar</label>
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(inversionEjecutar)}</p>
        </div>

        <Input 
          label="Horas / Unidades" 
          type="number"
          step="0.01"
          {...register('horas_unidades')} 
          error={errors.horas_unidades?.message} 
        />
        
        <Input 
          label="Costo por Hora/Unidad" 
          type="number"
          step="0.01"
          {...register('costo_hora_unidad')} 
          error={errors.costo_hora_unidad?.message} 
        />

        <Controller
            name="aliado_id"
            control={control}
            render={({ field }) => (
                <Select 
                    label="Aliado Asignado"
                    options={aliadoOptions}
                    {...field}
                    value={field.value ?? ""}
                    error={errors.aliado_id?.message}
                    disabled={isLoadingAliados}
                />
            )}
        />
        
        <Select 
            label="Estado Actividad"
            options={ESTADOS_ACTIVIDAD}
            {...register('estado_actividad')}
            error={errors.estado_actividad?.message}
            required
        />
        
      </div>
       <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" isLoading={isSubmitting}>
              {defaultValues ? 'Actualizar Presupuesto' : 'Crear Presupuesto'}
            </Button>
        </div>
    </form>
  );
};
