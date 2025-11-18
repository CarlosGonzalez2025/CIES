import React, { useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ordenServicioSchema, OrdenServicioFormData } from '../../schemas/ordenServicioSchema';
import type { OrdenServicio } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/TextArea';
import { usePresupuestos } from '../../hooks/usePresupuesto';
import { useAliados } from '../../hooks/useAliados';
import { useClientes } from '../../hooks/useClientes';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';
import { AlertTriangle } from 'lucide-react';

interface OrdenFormProps {
  onSubmit: SubmitHandler<OrdenServicioFormData>;
  onClose: () => void;
  defaultValues?: OrdenServicio | null;
  isSubmitting?: boolean;
}

const ESTADOS = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'EJECUTADO', label: 'Ejecutado' },
  { value: 'FACTURADO', label: 'Facturado' },
  { value: 'ANULADO', label: 'Anulado' },
];

export const OrdenForm: React.FC<OrdenFormProps> = ({ onSubmit, onClose, defaultValues, isSubmitting }) => {
  const { presupuestos } = usePresupuestos();
  const { aliados } = useAliados();
  const { clientes } = useClientes();

  const presupuestoOptions = presupuestos?.map(p => ({
    value: p.id,
    label: `${p.cliente?.nombre_cliente} - Saldo: ${formatCurrency(p.saldo_pendiente_ejecutar)}`
  })) || [];

  const aliadoOptions = aliados?.map(a => ({ value: a.id, label: a.aliado })) || [];
  const clienteOptions = clientes?.map(c => ({ value: c.id, label: c.nombre_cliente })) || [];

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue, control } = useForm<OrdenServicioFormData>({
    resolver: zodResolver(ordenServicioSchema),
    defaultValues: {
        estado_actividad: 'PENDIENTE',
        fecha_envio: new Date().toISOString().split('T')[0]
    }
  });

  const selectedPresupuestoId = watch('presupuesto_id');
  const unidad = watch('unidad');
  const costoHora = watch('costo_hora');

  // Logic for budget validation
  const selectedPresupuesto = presupuestos?.find(p => p.id === selectedPresupuestoId);
  const totalCalculado = (unidad || 0) * (costoHora || 0);
  
  // Si editamos, sumamos el valor actual de la orden al saldo para comparar justamente
  const saldoDisponibleReal = selectedPresupuesto 
    ? (selectedPresupuesto.saldo_pendiente_ejecutar || 0) + (defaultValues?.total || 0)
    : 0;

  const excedePresupuesto = selectedPresupuesto && totalCalculado > saldoDisponibleReal;

  // Auto-fill data based on selected Budget
  useEffect(() => {
    if (selectedPresupuestoId && !defaultValues) {
        const presupuesto = presupuestos?.find(p => p.id === selectedPresupuestoId);
        if (presupuesto) {
            setValue('empresa_id', presupuesto.cliente_id);
            if (presupuesto.aliado_id) {
                setValue('aliado_id', presupuesto.aliado_id);
                // Try to find aliado info
                const aliado = aliados?.find(a => a.id === presupuesto.aliado_id);
                if (aliado) {
                    setValue('especialidad', aliado.especialidad || '');
                }
            }
            setValue('costo_hora', presupuesto.costo_hora_unidad);
            setValue('unidad', 1);
        }
    }
  }, [selectedPresupuestoId, presupuestos, aliados, defaultValues, setValue]);

  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        presupuesto_id: defaultValues.presupuesto_id || '',
        aliado_id: defaultValues.aliado_id,
        empresa_id: defaultValues.empresa_id,
        fecha_envio: defaultValues.fecha_envio ? new Date(defaultValues.fecha_envio).toISOString().split('T')[0] : '',
        fecha_radicacion: defaultValues.fecha_radicacion ? new Date(defaultValues.fecha_radicacion).toISOString().split('T')[0] : '',
        unidad: defaultValues.unidad || undefined,
        costo_hora: defaultValues.costo_hora || undefined,
        estado_actividad: (defaultValues.estado_actividad as any) || 'PENDIENTE',
      });
    }
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6">
        <Card title="Información Base">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                    label="Número OS" 
                    {...register('os_numero')} 
                    error={errors.os_numero?.message}
                    required
                />
                <Input 
                    label="Fecha Envío" 
                    type="date" 
                    {...register('fecha_envio')} 
                    error={errors.fecha_envio?.message}
                    required
                />
                <div className="md:col-span-2">
                    <Controller
                        name="presupuesto_id"
                        control={control}
                        render={({ field }) => (
                            <Select 
                                label="Vincular a Presupuesto" 
                                options={presupuestoOptions} 
                                {...field} 
                                error={errors.presupuesto_id?.message}
                                required
                            />
                        )}
                    />
                    {selectedPresupuesto && (
                        <p className="text-xs text-gray-500 mt-1 ml-1">
                            Saldo disponible: <span className="font-medium">{formatCurrency(selectedPresupuesto.saldo_pendiente_ejecutar)}</span>
                        </p>
                    )}
                </div>
                <Controller
                    name="empresa_id"
                    control={control}
                    render={({ field }) => (
                        <Select 
                            label="Cliente (Empresa)" 
                            options={clienteOptions} 
                            {...field} 
                            error={errors.empresa_id?.message}
                            required
                        />
                    )}
                />
                <Controller
                    name="aliado_id"
                    control={control}
                    render={({ field }) => (
                        <Select 
                            label="Aliado Ejecutor" 
                            options={aliadoOptions} 
                            {...field} 
                            error={errors.aliado_id?.message}
                            required
                        />
                    )}
                />
            </div>
        </Card>

        <Card title="Detalles del Servicio">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <Input 
                        label="Servicio Contratado" 
                        {...register('servicio_contratado')} 
                        error={errors.servicio_contratado?.message}
                        required
                    />
                </div>
                 <Input 
                    label="Especialidad" 
                    {...register('especialidad')} 
                    error={errors.especialidad?.message}
                />
                 <Input 
                    label="Categoría" 
                    {...register('categoria_servicio')} 
                    error={errors.categoria_servicio?.message}
                />
                <Input 
                    label="Unidades / Horas" 
                    type="number" 
                    step="0.01"
                    {...register('unidad')} 
                    error={errors.unidad?.message}
                />
                <Input 
                    label="Costo Unitario" 
                    type="number" 
                    step="0.01"
                    {...register('costo_hora')} 
                    error={errors.costo_hora?.message}
                />
                <div className={`md:col-span-2 p-3 rounded border flex flex-col gap-2 ${excedePresupuesto ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Total Estimado:</span>
                        <span className={`text-xl font-bold ${excedePresupuesto ? 'text-red-700' : 'text-primary-700'}`}>
                            {formatCurrency(totalCalculado)}
                        </span>
                    </div>
                    {excedePresupuesto && (
                        <div className="flex items-center text-red-600 text-sm mt-1">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            <span>Advertencia: El valor excede el saldo disponible del presupuesto ({formatCurrency(saldoDisponibleReal)}).</span>
                        </div>
                    )}
                </div>
            </div>
        </Card>

        <Card title="Estado y Facturación">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select 
                    label="Estado" 
                    options={ESTADOS} 
                    {...register('estado_actividad')} 
                    error={errors.estado_actividad?.message}
                />
                <Input 
                    label="Número de Factura" 
                    {...register('numero_factura')} 
                    error={errors.numero_factura?.message}
                />
                <Input 
                    label="Fecha Radicación" 
                    type="date"
                    {...register('fecha_radicacion')} 
                    error={errors.fecha_radicacion?.message}
                />
            </div>
        </Card>
         
         <Card title="Datos de Contacto (Opcional)">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nombre Contacto" {...register('nombre_contacto')} />
                <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
                <div className="md:col-span-2">
                    <TextArea label="Dirección de Ejecución" {...register('direccion_cliente')} />
                </div>
            </div>
         </Card>

      </div>
       <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" isLoading={isSubmitting}>
              {defaultValues ? 'Actualizar Orden' : 'Crear Orden'}
            </Button>
        </div>
    </form>
  );
};