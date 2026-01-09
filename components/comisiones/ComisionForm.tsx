import React, { useEffect, useMemo, useState } from 'react';
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
import {
  Building2,
  Shield,
  Calendar,
  Percent,
  Calculator,
  TrendingUp,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle2,
  Info,
  Zap,
  Target,
  ArrowRight,
  PieChart
} from 'lucide-react';

const MESES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
];

interface ComisionFormProps {
  onSubmit: SubmitHandler<ComisionFormData>;
  onClose: () => void;
  selectedId?: string | null;
  isSubmitting?: boolean;
}

// Componente de ayuda para porcentajes
const PercentageHelper: React.FC<{ label: string; value?: number }> = ({ label, value }) => {
  if (!value) return null;

  return (
    <div className="flex items-center space-x-2 mt-1">
      <div className="flex items-center space-x-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full border border-blue-200">
        <CheckCircle2 className="w-3 h-3" />
        <span className="text-xs font-semibold">
          {(value * 100).toFixed(2)}%
        </span>
      </div>
      <span className="text-xs text-gray-600">{label}</span>
    </div>
  );
};

// Componente de resumen financiero mejorado
const FinancialSummary: React.FC<{
  totals: ReturnType<typeof calculateComisionTotals>;
  watchedPercentages: [number?, number?, number?];
}> = ({ totals, watchedPercentages }) => {
  const [comisionARL, comisionImpuesto, inversion] = watchedPercentages;

  const summaryCards = [
    {
      label: 'Prima Total Emitida',
      value: totals.valor_prima_emitida,
      icon: FileText,
      gradient: 'from-blue-500 to-blue-600',
      description: 'Suma de todas las primas mensuales'
    },
    {
      label: 'Comisión ARL Bruta',
      value: totals.valor_comision_emitida,
      icon: DollarSign,
      gradient: 'from-purple-500 to-purple-600',
      percentage: comisionARL,
      description: `${comisionARL ? (comisionARL * 100).toFixed(2) : 0}% sobre prima emitida`
    },
    {
      label: 'Comisión Neta (Post-Impuesto)',
      value: totals.valor_comision_emitida_2024,
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-emerald-600',
      percentage: comisionImpuesto,
      description: `Después de ${comisionImpuesto ? (comisionImpuesto * 100).toFixed(2) : 0}% impuesto`
    },
    {
      label: 'Inversión Final',
      value: totals.valor_inversion,
      icon: Target,
      gradient: 'from-amber-500 to-amber-600',
      percentage: inversion,
      highlighted: true,
      description: `${inversion ? (inversion * 100).toFixed(2) : 0}% de comisión neta`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {summaryCards.map((card, index) => (
        <div
          key={index}
          className={`relative overflow-hidden rounded-xl border ${card.highlighted
              ? 'border-amber-300 shadow-lg'
              : 'border-gray-200 shadow-sm'
            } bg-white p-5 hover:shadow-md transition-shadow duration-300`}
        >
          {/* Gradient accent */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}`} />

          <div className="flex items-start justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-md`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            {card.percentage && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full">
                <Percent className="w-3 h-3 text-gray-600" />
                <span className="text-xs font-semibold text-gray-700">
                  {(card.percentage * 100).toFixed(2)}%
                </span>
              </div>
            )}
          </div>

          <p className="text-xs font-medium text-gray-600 mb-1">{card.label}</p>
          <p className={`text-2xl font-bold ${card.highlighted ? 'text-amber-900' : 'text-gray-900'
            } mb-2`}>
            {formatCurrency(card.value)}
          </p>

          <div className="flex items-start space-x-1.5 text-xs text-gray-500">
            <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
            <span>{card.description}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// Indicador de progreso del formulario
const FormProgress: React.FC<{ currentStep: number; totalSteps: number }> = ({
  currentStep,
  totalSteps
}) => {
  return (
    <div className="flex items-center space-x-2">
      {Array.from({ length: totalSteps }, (_, i) => (
        <React.Fragment key={i}>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${i < currentStep
              ? 'bg-primary-600 text-white'
              : i === currentStep
                ? 'bg-primary-100 text-primary-600 border-2 border-primary-600'
                : 'bg-gray-100 text-gray-400'
            } font-semibold text-sm transition-all duration-300`}>
            {i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div className={`h-0.5 w-8 ${i < currentStep ? 'bg-primary-600' : 'bg-gray-200'
              } transition-all duration-300`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export const ComisionForm: React.FC<ComisionFormProps> = ({
  onSubmit,
  onClose,
  selectedId,
  isSubmitting,
}) => {
  const { data: defaultValues, isLoading: isLoadingForm } = useComision(selectedId);
  const { arlOptions, isLoading: isLoadingArl } = useARL();
  const { clienteOptions, isLoading: isLoadingClientes } = useClientes();
  const [currentStep, setCurrentStep] = useState(0);

  const methods = useForm<ComisionFormData>({
    resolver: zodResolver(comisionSchema),
    mode: 'onChange',
    defaultValues: {
      primas: MESES.map((mes) => ({ mes, prima: 0, comision: 0 })),
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = methods;

  useEffect(() => {
    if (defaultValues) {
      const primasData = MESES.map((mes) => {
        const existing = defaultValues.primas_comision.find((p) => p.mes === mes);
        return existing
          ? { ...existing, prima: existing.prima || 0, comision: existing.comision || 0 }
          : { mes, prima: 0, comision: 0 };
      });

      reset({
        ...defaultValues,
        fecha: defaultValues.fecha
          ? new Date(defaultValues.fecha).toISOString().split('T')[0]
          : '',
        cobertura: defaultValues.cobertura
          ? new Date(defaultValues.cobertura).toISOString().split('T')[0]
          : '',
        primas: primasData,
      });
    } else {
      reset({
        fecha: new Date().toISOString().split('T')[0],
        cobertura: new Date().toISOString().split('T')[0],
        primas: MESES.map((mes) => ({ mes, prima: 0, comision: 0 })),
      });
    }
  }, [defaultValues, reset]);

  const watchedPrimas = watch('primas');
  const watchedPercentages = watch([
    'porcentaje_comision_arl',
    'porcentaje_comision_impuesto',
    'porcentaje_inversion',
  ]);
  const watchedClienteId = watch('cliente_id');
  const watchedArlId = watch('arl_id');

  const totals = useMemo(() => {
    return calculateComisionTotals(watchedPrimas, {
      porcentaje_comision_arl: watchedPercentages[0],
      porcentaje_comision_impuesto: watchedPercentages[1],
      porcentaje_inversion: watchedPercentages[2],
    });
  }, [watchedPrimas, watchedPercentages]);

  // Calcular progreso del formulario
  const formProgress = useMemo(() => {
    let step = 0;
    if (watchedClienteId && watchedArlId) step = 1;
    if (watchedPercentages.some(p => p && p > 0)) step = 2;
    if (watchedPrimas.some(p => p.prima > 0)) step = 3;
    return step;
  }, [watchedClienteId, watchedArlId, watchedPercentages, watchedPrimas]);

  if (isLoadingForm) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando formulario...</p>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header con progreso */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center">
                <Calculator className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedId ? 'Editar Comisión' : 'Nueva Comisión'}
                </h2>
                <p className="text-sm text-gray-600">
                  {selectedId
                    ? 'Actualiza los datos de la comisión'
                    : 'Registra una nueva comisión en el sistema'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {isDirty && (
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full border border-amber-200">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium">Cambios sin guardar</span>
                </div>
              )}
              <FormProgress currentStep={formProgress} totalSteps={3} />
            </div>
          </div>

          {/* Indicador de completitud */}
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-blue-100">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">Progreso del formulario</span>
              <span className="font-bold text-blue-600">
                {Math.round((formProgress / 3) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(formProgress / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Sección 1: Datos Generales */}
        <Card>
          <div className="flex items-center space-x-3 pb-4 mb-4 border-b border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Datos Generales</h3>
              <p className="text-sm text-gray-600">Cliente, ARL y período de cobertura</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Cliente"
              options={[{ value: '', label: 'Seleccionar cliente...' }, ...clienteOptions]}
              {...register('cliente_id')}
              error={errors.cliente_id?.message}
              disabled={isLoadingClientes}
              required
              icon={Building2}
            />

            <Select
              label="ARL"
              options={[{ value: '', label: 'Seleccionar ARL...' }, ...arlOptions]}
              {...register('arl_id')}
              error={errors.arl_id?.message}
              disabled={isLoadingArl}
              required
              icon={Shield}
            />

            <Input
              label="Fecha de Comisión"
              type="date"
              {...register('fecha')}
              error={errors.fecha?.message}
              required
              icon={Calendar}
            />

            <Input
              label="Período de Cobertura"
              type="date"
              {...register('cobertura')}
              error={errors.cobertura?.message}
              required
              icon={Calendar}
            />
          </div>
        </Card>

        {/* Sección 2: Porcentajes */}
        <Card>
          <div className="flex items-center space-x-3 pb-4 mb-4 border-b border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <Percent className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Porcentajes de Cálculo</h3>
              <p className="text-sm text-gray-600">
                Define los porcentajes para calcular comisiones e inversión
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                label="% Comisión ARL"
                type="number"
                step="0.0001"
                {...register('porcentaje_comision_arl', { valueAsNumber: true })}
                error={errors.porcentaje_comision_arl?.message}
                icon={Percent}
                placeholder="Ej: 0.12 para 12%"
              />
              <PercentageHelper
                label="sobre prima emitida"
                value={watchedPercentages[0]}
              />
            </div>

            <div>
              <Input
                label="% Comisión s/ Impuesto"
                type="number"
                step="0.0001"
                {...register('porcentaje_comision_impuesto', { valueAsNumber: true })}
                error={errors.porcentaje_comision_impuesto?.message}
                icon={Percent}
                placeholder="Ej: 0.08 para 8%"
              />
              <PercentageHelper
                label="descuento fiscal"
                value={watchedPercentages[1]}
              />
            </div>

            <div>
              <Input
                label="% Inversión"
                type="number"
                step="0.0001"
                {...register('porcentaje_inversion', { valueAsNumber: true })}
                error={errors.porcentaje_inversion?.message}
                icon={Target}
                placeholder="Ej: 0.30 para 30%"
              />
              <PercentageHelper
                label="de comisión neta"
                value={watchedPercentages[2]}
              />
            </div>
          </div>

          {/* Explicación visual del cálculo */}
          <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start space-x-3">
              <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                  Flujo de Cálculo Automático
                </h4>
                <div className="flex items-center space-x-2 text-xs text-blue-700 flex-wrap">
                  <span className="font-medium">Prima Emitida</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="font-medium">× % ARL</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="font-medium">Comisión Bruta</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="font-medium">− % Impuesto</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="font-medium">Comisión Neta</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="font-medium">× % Inversión</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="font-bold bg-blue-100 px-2 py-1 rounded">Inversión Final</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Sección 3: Tabla de Primas */}
        <Card>
          <div className="flex items-center space-x-3 pb-4 mb-4 border-b border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
              <PieChart className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                Primas y Comisiones Mensuales
              </h3>
              <p className="text-sm text-gray-600">
                Ingresa las primas mensuales y se calcularán las comisiones automáticamente
              </p>
            </div>
            {watchedPrimas.some(p => p.prima > 0) && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {watchedPrimas.filter(p => p.prima > 0).length} meses registrados
                </span>
              </div>
            )}
          </div>

          <PrimasComisionTable />
        </Card>

        {/* Sección 4: Resumen Financiero */}
        <Card>
          <div className="flex items-center space-x-3 pb-4 mb-4 border-b border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Resumen Financiero</h3>
              <p className="text-sm text-gray-600">
                Cálculos automáticos basados en las primas ingresadas
              </p>
            </div>
          </div>

          <FinancialSummary totals={totals} watchedPercentages={watchedPercentages} />
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
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              className="min-w-[180px]"
            >
              {isSubmitting ? (
                'Guardando...'
              ) : selectedId ? (
                'Actualizar Comisión'
              ) : (
                'Crear Comisión'
              )}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
