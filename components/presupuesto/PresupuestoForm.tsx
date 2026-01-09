import React, { useEffect, useMemo, useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { presupuestoSchema, PresupuestoFormData } from '../../schemas/presupuestoSchema';
import type { Presupuesto } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useClientes } from '../../hooks/useClientes';
import { useAliados } from '../../hooks/useAliados';
import { useComisiones } from '../../hooks/useComisiones';
import { formatCurrency } from '../../utils/formatters';
import {
  Building2,
  Users,
  DollarSign,
  Percent,
  Target,
  Calculator,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Activity,
  Hash,
  Zap,
  Info,
  ArrowRight,
  PieChart,
  Briefcase,
  Sparkles
} from 'lucide-react';

const ESTADOS_ACTIVIDAD = [
  { value: 'PENDIENTE', label: 'Pendiente', color: 'amber', icon: Clock },
  { value: 'ACTIVO', label: 'Activo', color: 'blue', icon: Activity },
  { value: 'EN EJECUCIÓN', label: 'En Ejecución', color: 'green', icon: TrendingUp },
  { value: 'COMPLETADO', label: 'Completado', color: 'gray', icon: CheckCircle2 },
];

interface PresupuestoFormProps {
  onSubmit: SubmitHandler<PresupuestoFormData>;
  onClose: () => void;
  defaultValues?: Presupuesto | null;
  isSubmitting?: boolean;
}

// Componente de visualización de comisión auto-calculada
const ComisionAutoCalculada: React.FC<{
  clienteId?: string;
  comisiones: any[];
  comisionCalculada: number;
  isLoading: boolean;
}> = ({ clienteId, comisiones, comisionCalculada, isLoading }) => {
  const comisionesCliente = useMemo(() => {
    return comisiones.filter((c) => c.cliente_id === clienteId);
  }, [comisiones, clienteId]);

  if (!clienteId) {
    return (
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              Cálculo Automático de Comisión
            </h4>
            <p className="text-xs text-blue-700">
              Selecciona un cliente para calcular automáticamente la comisión total basada en
              todas las comisiones registradas.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center space-x-2">
          <Calculator className="w-5 h-5 text-gray-400 animate-pulse" />
          <span className="text-sm text-gray-600">Calculando comisión...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center shadow-md">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-green-900">
              ✓ Comisión Calculada Automáticamente
            </h4>
            <p className="text-xs text-green-700 mt-0.5">
              {comisionesCliente.length} comisión(es) encontrada(s)
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-green-700">Total comisiones</p>
          <p className="text-2xl font-bold text-green-900">
            {formatCurrency(comisionCalculada)}
          </p>
        </div>
      </div>

      {comisionesCliente.length > 0 && (
        <div className="bg-white/60 rounded-lg p-3 border border-green-100">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-green-800 font-medium">Detalle del cálculo:</span>
            <span className="text-green-700">
              Promedio: {formatCurrency(comisionCalculada / comisionesCliente.length)}
            </span>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {comisionesCliente.slice(0, 5).map((comision, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-xs text-green-700"
              >
                <span className="truncate flex-1">
                  {comision.arl?.nombre || 'Sin ARL'} - {comision.fecha}
                </span>
                <span className="font-medium ml-2">
                  {formatCurrency(comision.valor_comision_emitida || 0)}
                </span>
              </div>
            ))}
            {comisionesCliente.length > 5 && (
              <p className="text-xs text-green-600 text-center pt-1">
                +{comisionesCliente.length - 5} más...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de calculadora de inversión
const InversionCalculator: React.FC<{
  comision: number;
  porcentaje: number;
  inversionTotal: number;
}> = ({ comision, porcentaje, inversionTotal }) => {
  const hasValues = comision > 0 && porcentaje > 0;

  return (
    <div className={`rounded-lg p-5 border-2 transition-all ${hasValues
        ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 shadow-md'
        : 'bg-gray-50 border-gray-200'
      }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${hasValues ? 'bg-amber-500' : 'bg-gray-400'
            }`}>
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className={`text-sm font-semibold ${hasValues ? 'text-amber-900' : 'text-gray-700'
              }`}>
              Inversión a Ejecutar
            </h4>
            <p className={`text-xs ${hasValues ? 'text-amber-700' : 'text-gray-500'}`}>
              Presupuesto disponible
            </p>
          </div>
        </div>
        {hasValues && <Sparkles className="w-5 h-5 text-amber-500" />}
      </div>

      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-amber-200/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-sm">
            <DollarSign className="w-4 h-4 text-amber-600" />
            <span className="text-amber-900 font-medium">
              {formatCurrency(comision)}
            </span>
            <span className="text-amber-700">×</span>
            <Percent className="w-4 h-4 text-amber-600" />
            <span className="text-amber-900 font-medium">
              {(porcentaje * 100).toFixed(2)}%
            </span>
            <ArrowRight className="w-4 h-4 text-amber-600" />
          </div>
        </div>

        <div className="text-center pt-3 border-t border-amber-200">
          <p className="text-xs text-amber-700 mb-1">Total disponible para ejecutar</p>
          <p className={`text-3xl font-bold ${hasValues ? 'text-amber-900' : 'text-gray-400'
            }`}>
            {formatCurrency(inversionTotal)}
          </p>
        </div>
      </div>

      {hasValues && (
        <div className="mt-3 flex items-start space-x-2 text-xs text-amber-700 bg-amber-100/50 rounded-lg p-2">
          <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
          <span>
            Este es el presupuesto máximo disponible para crear órdenes de servicio
          </span>
        </div>
      )}
    </div>
  );
};

// Componente de cálculo de costo total
const CostoTotalCalculator: React.FC<{
  horas?: number;
  costoHora?: number;
}> = ({ horas, costoHora }) => {
  const total = (horas || 0) * (costoHora || 0);
  const hasValues = horas && costoHora && horas > 0 && costoHora > 0;

  return (
    <div className={`rounded-lg p-4 border ${hasValues
        ? 'bg-purple-50 border-purple-200'
        : 'bg-gray-50 border-gray-200'
      }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Calculator className={`w-5 h-5 ${hasValues ? 'text-purple-600' : 'text-gray-400'
            }`} />
          <span className={`text-sm font-medium ${hasValues ? 'text-purple-900' : 'text-gray-700'
            }`}>
            Costo Total Estimado
          </span>
        </div>
        {hasValues && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
      </div>

      <div className="flex items-center space-x-2 text-xs text-purple-700 mb-2">
        <Hash className="w-3 h-3" />
        <span className="font-medium">{horas || 0} unidades</span>
        <span>×</span>
        <DollarSign className="w-3 h-3" />
        <span className="font-medium">{formatCurrency(costoHora || 0)}</span>
      </div>

      <div className="text-right">
        <p className={`text-2xl font-bold ${hasValues ? 'text-purple-900' : 'text-gray-400'
          }`}>
          {formatCurrency(total)}
        </p>
      </div>
    </div>
  );
};

// Badge de estado
const EstadoBadge: React.FC<{ estado: string }> = ({ estado }) => {
  const estadoConfig = ESTADOS_ACTIVIDAD.find((e) => e.value === estado);
  if (!estadoConfig) return null;

  const Icon = estadoConfig.icon;
  const colorClasses = {
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${colorClasses[estadoConfig.color as keyof typeof colorClasses]
        }`}
    >
      <Icon className="w-3.5 h-3.5 mr-1.5" />
      {estadoConfig.label}
    </span>
  );
};

export const PresupuestoForm: React.FC<PresupuestoFormProps> = ({
  onSubmit,
  onClose,
  defaultValues,
  isSubmitting,
}) => {
  const { clienteOptions, isLoading: isLoadingClientes } = useClientes();
  const { aliadoOptions, isLoading: isLoadingAliados } = useAliados();
  const { comisiones, isLoading: isLoadingComisiones } = useComisiones();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    control,
    setValue,
  } = useForm<PresupuestoFormData>({
    resolver: zodResolver(presupuestoSchema),
    mode: 'onChange',
  });

  const [comision, porcentajeInversion, selectedClienteId, horas, costoHora, estadoActividad] =
    watch([
      'comision',
      'porcentaje_inversion_anio',
      'cliente_id',
      'horas_unidades',
      'costo_hora_unidad',
      'estado_actividad',
    ]);

  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        aliado_id: defaultValues.aliado_id || null,
      });
    } else if (!selectedClienteId) {
      setValue('comision', 0);
      reset({ estado_actividad: 'PENDIENTE', comision: 0 });
    }
  }, [defaultValues, reset, selectedClienteId, setValue]);

  useEffect(() => {
    if (selectedClienteId && comisiones && !defaultValues) {
      const totalComision = comisiones
        .filter((c) => c.cliente_id === selectedClienteId)
        .reduce((sum, current) => sum + (current.valor_comision_emitida || 0), 0);
      setValue('comision', totalComision, { shouldValidate: true });
    }
  }, [selectedClienteId, comisiones, setValue, defaultValues]);

  const inversionEjecutar = useMemo(() => {
    return (comision || 0) * (porcentajeInversion || 0);
  }, [comision, porcentajeInversion]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center">
              <PieChart className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {defaultValues ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
              </h2>
              <p className="text-sm text-gray-600">
                {defaultValues
                  ? 'Actualiza la información del presupuesto'
                  : 'Crea un presupuesto basado en comisiones del cliente'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {estadoActividad && <EstadoBadge estado={estadoActividad} />}
            {isDirty && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full border border-amber-200">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium">Cambios sin guardar</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sección 1: Cliente y Comisión */}
      <Card>
        <div className="flex items-center space-x-3 pb-4 mb-4 border-b border-gray-200">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Cliente y Comisión Base</h3>
            <p className="text-sm text-gray-600">
              Selecciona el cliente y la comisión se calculará automáticamente
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Controller
            name="cliente_id"
            control={control}
            render={({ field }) => (
              <Select
                label="Cliente"
                options={[
                  { value: '', label: 'Seleccionar cliente...' },
                  ...clienteOptions,
                ]}
                {...field}
                error={errors.cliente_id?.message}
                disabled={isLoadingClientes || !!defaultValues}
                required
                icon={Building2}
              />
            )}
          />

          <ComisionAutoCalculada
            clienteId={selectedClienteId}
            comisiones={comisiones || []}
            comisionCalculada={comision || 0}
            isLoading={isLoadingComisiones}
          />

          <Input
            label="Comisión Total"
            type="number"
            step="0.01"
            {...register('comision', { valueAsNumber: true })}
            error={errors.comision?.message}
            required
            readOnly
            className="bg-green-50 border-green-200 cursor-not-allowed font-semibold text-green-900"
            icon={DollarSign}
          />
        </div>
      </Card>

      {/* Sección 2: Inversión */}
      <Card>
        <div className="flex items-center space-x-3 pb-4 mb-4 border-b border-gray-200">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Cálculo de Inversión</h3>
            <p className="text-sm text-gray-600">
              Define el porcentaje de inversión sobre la comisión
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start space-x-3">
              <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  Cálculo Automático de Inversión
                </h4>
                <p className="text-xs text-blue-700">
                  La inversión se calcula multiplicando la comisión total por el porcentaje de
                  inversión. Este será el presupuesto disponible para crear órdenes de servicio.
                </p>
              </div>
            </div>
          </div>

          <Input
            label="Porcentaje de Inversión"
            type="number"
            step="0.0001"
            {...register('porcentaje_inversion_anio', { valueAsNumber: true })}
            error={errors.porcentaje_inversion_anio?.message}
            required
            icon={Percent}
            placeholder="Ej: 0.6 para 60%"
          />

          {porcentajeInversion && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-purple-50 rounded-lg border border-purple-200">
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-900 font-medium">
                Porcentaje configurado: {(porcentajeInversion * 100).toFixed(2)}%
              </span>
            </div>
          )}

          <InversionCalculator
            comision={comision || 0}
            porcentaje={porcentajeInversion || 0}
            inversionTotal={inversionEjecutar}
          />
        </div>
      </Card>

      {/* Sección 3: Costos y Unidades */}
      <Card>
        <div className="flex items-center space-x-3 pb-4 mb-4 border-b border-gray-200">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Costos y Unidades</h3>
            <p className="text-sm text-gray-600">Información opcional de costos por unidad</p>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Opcional
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Horas / Unidades"
            type="number"
            step="0.01"
            min="0"
            {...register('horas_unidades', { valueAsNumber: true })}
            error={errors.horas_unidades?.message}
            icon={Hash}
            placeholder="Cantidad de unidades"
          />

          <Input
            label="Costo por Hora/Unidad"
            type="number"
            step="0.01"
            min="0"
            {...register('costo_hora_unidad', { valueAsNumber: true })}
            error={errors.costo_hora_unidad?.message}
            icon={DollarSign}
            placeholder="Costo unitario"
          />

          {(horas || costoHora) && (
            <div className="md:col-span-2">
              <CostoTotalCalculator horas={horas} costoHora={costoHora} />
            </div>
          )}
        </div>
      </Card>

      {/* Sección 4: Asignación y Estado */}
      <Card>
        <div className="flex items-center space-x-3 pb-4 mb-4 border-b border-gray-200">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Asignación y Estado</h3>
            <p className="text-sm text-gray-600">Aliado asignado y estado del presupuesto</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="aliado_id"
            control={control}
            render={({ field }) => (
              <Select
                label="Aliado Asignado"
                options={[
                  { value: '', label: 'Sin aliado asignado' },
                  ...aliadoOptions,
                ]}
                {...field}
                value={field.value ?? ''}
                error={errors.aliado_id?.message}
                disabled={isLoadingAliados}
                icon={Users}
              />
            )}
          />

          <Select
            label="Estado del Presupuesto"
            options={ESTADOS_ACTIVIDAD.map((e) => ({ value: e.value, label: e.label }))}
            {...register('estado_actividad')}
            error={errors.estado_actividad?.message}
            required
            icon={Activity}
          />
        </div>
      </Card>

      {/* Resumen de errores */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-900 mb-2">
                Corrige los siguientes errores:
              </h4>
              <ul className="space-y-1 text-sm text-red-700">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      <strong className="capitalize">{field.replace(/_/g, ' ')}:</strong>{' '}
                      {error.message}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3 pt-6 border-t-2 border-gray-200">
        <div className="text-sm text-gray-600 flex items-center">
          <Info className="w-4 h-4 mr-1.5" />
          Los campos marcados con <span className="text-red-500 mx-1">*</span> son obligatorios
        </div>

        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>

          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting} className="min-w-[180px]">
            {isSubmitting
              ? 'Guardando...'
              : defaultValues
                ? 'Actualizar Presupuesto'
                : 'Crear Presupuesto'}
          </Button>
        </div>
      </div>
    </form>
  );
};
