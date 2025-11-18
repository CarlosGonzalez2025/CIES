import React, { useEffect, useMemo } from 'react';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { comisionSchema, ComisionFormData } from '../../schemas/comisionSchema';
import type { Comision } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useARL } from '../../hooks/useARL';
import { useClientes } from '../../hooks/useClientes';
import { PrimasComisionTable } from './PrimasComisionTable';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';
import { calculateComisionTotals } from '../../utils/calculations';
import { useComision } from '../../hooks/useComisiones';

const MESES = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];

interface ComisionFormProps {
  onSubmit: SubmitHandler<ComisionFormData>;
  onClose: () => void;
  selectedId?: string | null;
  isSubmitting?: boolean;
}

export const ComisionForm: React.FC<ComisionFormProps> = ({ onSubmit, onClose, selectedId, isSubmitting }) => {
  const { data: defaultValues, isLoading: isLoadingForm } = useComision(selectedId);
  const { arlOptions, isLoading: isLoadingArl } = useARL();
  const { clienteOptions, isLoading: isLoadingClientes } = useClientes();

  const methods = useForm<ComisionFormData>({
    resolver: zodResolver(comisionSchema),
    defaultValues: {
      primas: MESES.map(mes => ({ mes, prima: 0, comision: 0 }))
    }
  });

  const { register, handleSubmit, formState: { errors }, reset, watch } = methods;

  useEffect(() => {
    if (defaultValues) {
        const primasData = MESES.map(mes => {
            const existing = defaultValues.primas_comision.find(p => p.mes === mes);
            return existing ? { ...existing, prima: existing.prima || 0, comision: existing.comision || 0 } : { mes, prima: 0, comision: 0 };
        });

        reset({
            ...defaultValues,
            fecha: defaultValues.fecha ? new Date(defaultValues.fecha).toISOString().split('T')[0] : '',
            cobertura: defaultValues.cobertura ? new Date(defaultValues.cobertura).toISOString().split('T')[0] : '',
            primas: primasData,
        });
    } else {
        reset({
            fecha: new Date().toISOString().split('T')[0],
            cobertura: new Date().toISOString().split('T')[0],
            primas: MESES.map(mes => ({ mes, prima: 0, comision: 0 }))
        });
    }
  }, [defaultValues, reset]);
  
  const watchedPrimas = watch('primas');
  const watchedPercentages = watch(['porcentaje_comision_arl', 'porcentaje_comision_impuesto', 'porcentaje_inversion']);

  const totals = useMemo(() => {
    return calculateComisionTotals(watchedPrimas, {
      porcentaje_comision_arl: watchedPercentages[0],
      porcentaje_comision_impuesto: watchedPercentages[1],
      porcentaje_inversion: watchedPercentages[2]
    });
  }, [watchedPrimas, watchedPercentages]);

  if (isLoadingForm) return <div>Cargando formulario...</div>;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
            <Card title="Datos Generales">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select 
                        label="Cliente" 
                        options={clienteOptions} 
                        {...register('cliente_id')} 
                        error={errors.cliente_id?.message} 
                        disabled={isLoadingClientes}
                        required
                    />
                    <Select 
                        label="ARL" 
                        options={arlOptions} 
                        {...register('arl_id')} 
                        error={errors.arl_id?.message} 
                        disabled={isLoadingArl}
                        required
                    />
                    <Input 
                        label="Fecha de Comisión" 
                        type="date" 
                        {...register('fecha')} 
                        error={errors.fecha?.message} 
                        required 
                    />
                    <Input 
                        label="Período de Cobertura" 
                        type="date" 
                        {...register('cobertura')} 
                        error={errors.cobertura?.message} 
                        required 
                    />
                </div>
            </Card>

            <Card title="Cálculo de Primas y Comisiones">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                     <Input 
                        label="% Comisión ARL" 
                        type="number" 
                        step="0.0001" 
                        {...register('porcentaje_comision_arl')} 
                        error={errors.porcentaje_comision_arl?.message} 
                    />
                     <Input 
                        label="% Comisión s/ Impuesto" 
                        type="number" 
                        step="0.0001" 
                        {...register('porcentaje_comision_impuesto')} 
                        error={errors.porcentaje_comision_impuesto?.message} 
                    />
                     <Input 
                        label="% Inversión" 
                        type="number" 
                        step="0.0001" 
                        {...register('porcentaje_inversion')} 
                        error={errors.porcentaje_inversion?.message} 
                    />
                </div>
                <PrimasComisionTable />
            </Card>
            
            <Card title="Resumen de Totales">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-2 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">Prima Emitida</p>
                        <p className="font-semibold">{formatCurrency(totals.valor_prima_emitida)}</p>
                    </div>
                     <div className="p-2 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">Comisión Emitida</p>
                        <p className="font-semibold">{formatCurrency(totals.valor_comision_emitida)}</p>
                    </div>
                     <div className="p-2 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">Comisión (Impuesto)</p>
                        <p className="font-semibold">{formatCurrency(totals.valor_comision_emitida_2024)}</p>
                    </div>
                     <div className="p-2 bg-green-50 rounded">
                        <p className="text-sm text-green-700">Inversión</p>
                        <p className="font-semibold text-green-800">{formatCurrency(totals.valor_inversion)}</p>
                    </div>
                </div>
            </Card>
        </div>
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" isLoading={isSubmitting}>
              {selectedId ? 'Actualizar Comisión' : 'Crear Comisión'}
            </Button>
        </div>
      </form>
    </FormProvider>
  );
};
