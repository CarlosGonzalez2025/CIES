import React, { useEffect, useMemo } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clienteSchema, ClienteFormData } from '../../schemas/clienteSchema';
import type { Cliente } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { TextArea } from '../ui/TextArea';
import { useARL } from '../../hooks/useARL';
import { Button } from '../ui/Button';
import {
  Building2,
  FileText,
  Calendar,
  Shield,
  MapPin,
  User,
  Phone,
  Mail,
  DollarSign,
  Percent,
  Info,
  TrendingUp,
  Calculator,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface ClienteFormProps {
  onSubmit: SubmitHandler<ClienteFormData>;
  onClose: () => void;
  defaultValues?: Cliente | null;
  isSubmitting?: boolean;
}

// Componente de sección mejorado
const FormSection: React.FC<{
  title: string;
  description?: string;
  icon: React.ElementType;
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success';
}> = ({ title, description, icon: Icon, children, variant = 'default' }) => {
  const variants = {
    default: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      iconBg: 'bg-gradient-to-br from-gray-500 to-gray-600',
      titleColor: 'text-gray-900'
    },
    primary: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      titleColor: 'text-blue-900'
    },
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      titleColor: 'text-emerald-900'
    }
  };

  const style = variants[variant];

  return (
    <div className={`${style.bg} p-6 rounded-xl border ${style.border} shadow-sm`}>
      <div className="flex items-start space-x-3 pb-4 mb-4 border-b border-gray-200">
        <div className={`w-10 h-10 ${style.iconBg} rounded-lg flex items-center justify-center flex-shrink-0 shadow-md`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${style.titleColor}`}>{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
};

// Componente de calculadora de comisión
const ComisionCalculator: React.FC<{
  valorHora?: number;
  porcentajeComision?: number;
}> = ({ valorHora, porcentajeComision }) => {
  const horasMensuales = 160; // Estimado estándar

  const calculations = useMemo(() => {
    if (!valorHora || !porcentajeComision) return null;

    const valorMensual = valorHora * horasMensuales;
    const comisionMensual = valorMensual * porcentajeComision;
    const comisionAnual = comisionMensual * 12;

    return {
      valorMensual,
      comisionMensual,
      comisionAnual,
      porcentajeDisplay: (porcentajeComision * 100).toFixed(2)
    };
  }, [valorHora, porcentajeComision]);

  if (!calculations) return null;

  return (
    <div className="md:col-span-2 mt-2">
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Calculator className="w-4 h-4 text-white" />
          </div>
          <h4 className="text-sm font-semibold text-emerald-900">
            Proyección de Comisiones
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-emerald-100">
            <p className="text-xs text-emerald-700 font-medium mb-1">Valor Mensual (160h)</p>
            <p className="text-lg font-bold text-emerald-900">
              ${calculations.valorMensual.toLocaleString('es-CO')}
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-emerald-100">
            <p className="text-xs text-emerald-700 font-medium mb-1 flex items-center">
              Comisión Mensual ({calculations.porcentajeDisplay}%)
              <TrendingUp className="w-3 h-3 ml-1" />
            </p>
            <p className="text-lg font-bold text-emerald-900">
              ${calculations.comisionMensual.toLocaleString('es-CO')}
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-emerald-100">
            <p className="text-xs text-emerald-700 font-medium mb-1">Proyección Anual</p>
            <p className="text-lg font-bold text-emerald-900">
              ${calculations.comisionAnual.toLocaleString('es-CO')}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-start space-x-2 text-xs text-emerald-700">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            Cálculo basado en 160 horas mensuales. Las cifras son estimadas y pueden variar según las horas reales trabajadas.
          </p>
        </div>
      </div>
    </div>
  );
};

// Componente de ayuda para porcentaje
const PercentageHelper: React.FC = () => {
  const examples = [
    { percent: 5, decimal: 0.05 },
    { percent: 9, decimal: 0.09 },
    { percent: 15, decimal: 0.15 },
    { percent: 20, decimal: 0.20 }
  ];

  return (
    <div className="mt-2 bg-blue-50 rounded-lg p-3 border border-blue-200">
      <div className="flex items-start space-x-2 mb-2">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-xs font-medium text-blue-900 mb-1">
            Conversión Porcentaje → Decimal
          </p>
          <div className="grid grid-cols-2 gap-2">
            {examples.map(ex => (
              <div key={ex.percent} className="flex items-center justify-between text-xs text-blue-700 bg-white/60 rounded px-2 py-1">
                <span className="font-medium">{ex.percent}%</span>
                <span className="text-blue-500">→</span>
                <span className="font-mono font-bold">{ex.decimal}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ClienteForm: React.FC<ClienteFormProps> = ({
  onSubmit,
  onClose,
  defaultValues,
  isSubmitting
}) => {
  const { arlOptions, isLoading: isLoadingArl } = useARL();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
    watch
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    mode: 'onChange'
  });

  // Watch para cálculos en tiempo real
  const valorHora = watch('valor_hora');
  const porcentajeComision = watch('porcentaje_comision');
  const arlId = watch('arl_id');

  useEffect(() => {
    if (defaultValues) {
      const formattedValues = {
        ...defaultValues,
        fecha: defaultValues.fecha
          ? new Date(defaultValues.fecha).toISOString().split('T')[0]
          : '',
        valor_hora: defaultValues.valor_hora ?? undefined,
        porcentaje_comision: defaultValues.porcentaje_comision ?? undefined,
      };
      reset(formattedValues);
    } else {
      reset({ fecha: new Date().toISOString().split('T')[0] });
    }
  }, [defaultValues, reset]);

  // Encontrar nombre de ARL seleccionada
  const selectedArlName = useMemo(() => {
    if (!arlId || !arlOptions) return null;
    const arl = arlOptions.find(opt => opt.value === arlId);
    return arl?.label || null;
  }, [arlId, arlOptions]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header con indicador de progreso */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center">
              {defaultValues ? (
                <Building2 className="w-6 h-6 text-blue-600" />
              ) : (
                <User className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {defaultValues ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <p className="text-sm text-gray-600">
                {defaultValues
                  ? 'Actualiza la información del cliente'
                  : 'Registra un nuevo cliente en el sistema'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isDirty && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full border border-amber-200">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium">Cambios sin guardar</span>
              </div>
            )}
            {selectedArlName && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                <Shield className="w-3 h-3" />
                <span className="text-xs font-medium">{selectedArlName}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sección 1: Información Corporativa */}
      <FormSection
        title="Información Corporativa"
        description="Datos de identificación y registro de la empresa"
        icon={Building2}
        variant="default"
      >
        <Input
          label="Razón Social / Nombre Cliente"
          placeholder="Ej: Empresa S.A.S."
          {...register('nombre_cliente')}
          error={errors.nombre_cliente?.message}
          required
          icon={Building2}
        />

        <Input
          label="NIT / Documento"
          placeholder="Ej: 900.123.456-7"
          {...register('nit_documento')}
          error={errors.nit_documento?.message}
          required
          icon={FileText}
        />

        <Input
          label="Fecha de Registro"
          type="date"
          {...register('fecha')}
          error={errors.fecha?.message}
          required
          icon={Calendar}
        />

        <Select
          label="ARL Asignada"
          options={[
            { value: '', label: 'Seleccionar ARL...' },
            ...arlOptions
          ]}
          {...register('arl_id')}
          error={errors.arl_id?.message}
          disabled={isLoadingArl}
          required
          icon={Shield}
        />

        <div className="md:col-span-2">
          <TextArea
            label="Dirección Física"
            placeholder="Dirección completa de la empresa (Calle, número, ciudad, etc.)"
            {...register('direccion')}
            error={errors.direccion?.message}
            icon={MapPin}
            rows={3}
          />
        </div>
      </FormSection>

      {/* Sección 2: Contacto Principal */}
      <FormSection
        title="Información de Contacto"
        description="Persona de contacto principal en la empresa"
        icon={User}
        variant="default"
      >
        <Input
          label="Nombre Completo del Contacto"
          placeholder="Ej: Juan Pérez García"
          {...register('nombre_contacto')}
          error={errors.nombre_contacto?.message}
          icon={User}
        />

        <Input
          label="Teléfono / Celular"
          type="tel"
          placeholder="Ej: +57 300 123 4567"
          {...register('numero_contacto')}
          error={errors.numero_contacto?.message}
          icon={Phone}
        />

        <div className="md:col-span-2">
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="Ej: contacto@empresa.com"
            {...register('email_contacto')}
            error={errors.email_contacto?.message}
            icon={Mail}
          />
        </div>
      </FormSection>

      {/* Sección 3: Condiciones Comerciales */}
      <FormSection
        title="Condiciones Comerciales"
        description="Tarifas y porcentajes de comisión pactados"
        icon={DollarSign}
        variant="primary"
      >
        <Input
          label="Valor Hora Pactada"
          type="number"
          step="0.01"
          {...register('valor_hora', { valueAsNumber: true })}
          error={errors.valor_hora?.message}
          placeholder="0.00"
          icon={DollarSign}
        />

        <div>
          <Input
            label="Porcentaje de Comisión (Decimal)"
            type="number"
            step="0.0001"
            {...register('porcentaje_comision', { valueAsNumber: true })}
            error={errors.porcentaje_comision?.message}
            placeholder="Ej: 0.09 para 9%"
            icon={Percent}
          />
          {porcentajeComision && porcentajeComision > 0 && (
            <div className="mt-2 flex items-center space-x-2 text-sm">
              <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-semibold">
                  {(porcentajeComision * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          )}
          <PercentageHelper />
        </div>

        {/* Calculadora de comisiones */}
        <ComisionCalculator
          valorHora={valorHora}
          porcentajeComision={porcentajeComision}
        />
      </FormSection>

      {/* Resumen de validación */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-900 mb-2">
                Corrige los siguientes errores antes de continuar:
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
            disabled={isSubmitting || (!isDirty && !defaultValues)}
            className="min-w-[160px]"
          >
            {isSubmitting ? (
              'Guardando...'
            ) : defaultValues ? (
              'Actualizar Cliente'
            ) : (
              'Crear Cliente'
            )}
          </Button>
        </div>
      </div>

      {/* Animaciones */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        form > div {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </form>
  );
};
