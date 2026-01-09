import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { aliadoSchema, AliadoFormData } from '../../schemas/aliadoSchema';
import type { Aliado } from '../../types';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import {
  User,
  Briefcase,
  Calendar,
  FileText,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  CreditCard,
  Building2,
  Hash,
  Info
} from 'lucide-react';

interface AliadoFormProps {
  onSubmit: SubmitHandler<AliadoFormData>;
  onClose: () => void;
  defaultValues?: Aliado | null;
  isSubmitting?: boolean;
}

// Componente de sección para mejor organización
const FormSection: React.FC<{
  title: string;
  description?: string;
  icon: React.ElementType;
  children: React.ReactNode;
}> = ({ title, description, icon: Icon, children }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-start space-x-3 pb-3 border-b border-gray-200">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
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

export const AliadoForm: React.FC<AliadoFormProps> = ({
  onSubmit,
  onClose,
  defaultValues,
  isSubmitting
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
    watch
  } = useForm<AliadoFormData>({
    resolver: zodResolver(aliadoSchema),
    mode: 'onChange', // Validación en tiempo real
  });

  // Watch para mostrar información dinámica
  const horaPbl = watch('hora_pbl');
  const horaEspecializada = watch('hora_especializada');

  useEffect(() => {
    if (defaultValues) {
      const formattedValues = {
        ...defaultValues,
        fecha_registro: defaultValues.fecha_registro
          ? new Date(defaultValues.fecha_registro).toISOString().split('T')[0]
          : '',
        hora_pbl: defaultValues.hora_pbl ?? undefined,
        hora_especializada: defaultValues.hora_especializada ?? undefined,
      };
      reset(formattedValues);
    } else {
      reset({ fecha_registro: new Date().toISOString().split('T')[0] });
    }
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header con indicador de progreso */}
      <div className="bg-gradient-to-r from-primary-50 to-indigo-50 rounded-lg p-4 border border-primary-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center">
              {defaultValues ? (
                <User className="w-6 h-6 text-primary-600" />
              ) : (
                <Briefcase className="w-6 h-6 text-primary-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {defaultValues ? 'Editar Aliado' : 'Nuevo Aliado'}
              </h2>
              <p className="text-sm text-gray-600">
                {defaultValues
                  ? 'Actualiza la información del aliado comercial'
                  : 'Registra un nuevo aliado en el sistema'
                }
              </p>
            </div>
          </div>
          {isDirty && (
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full border border-amber-200">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium">Cambios sin guardar</span>
            </div>
          )}
        </div>
      </div>

      {/* Información Básica */}
      <FormSection
        title="Información Básica"
        description="Datos generales del aliado comercial"
        icon={User}
      >
        <Input
          label="Nombre del Aliado"
          {...register('aliado')}
          error={errors.aliado?.message}
          required
          icon={User}
          placeholder="Ej: Consultores S.A.S"
        />
        <Input
          label="Especialidad"
          {...register('especialidad')}
          error={errors.especialidad?.message}
          icon={Briefcase}
          placeholder="Ej: Seguridad Industrial"
        />
        <Input
          label="Fecha de Registro"
          type="date"
          {...register('fecha_registro')}
          error={errors.fecha_registro?.message}
          required
          icon={Calendar}
        />
        <Input
          label="NIT / Documento"
          {...register('nit')}
          error={errors.nit?.message}
          icon={FileText}
          placeholder="Ej: 900123456-7"
        />
      </FormSection>

      {/* Información de Contacto */}
      <FormSection
        title="Datos de Contacto"
        description="Información para comunicación con el aliado"
        icon={Phone}
      >
        <Input
          label="Nombre del Contacto"
          {...register('contacto')}
          error={errors.contacto?.message}
          icon={User}
          placeholder="Ej: Juan Pérez"
        />
        <Input
          label="Número Telefónico"
          {...register('numero_telefonico')}
          error={errors.numero_telefonico?.message}
          icon={Phone}
          type="tel"
          placeholder="Ej: +57 300 123 4567"
        />
        <Input
          label="Correo Electrónico"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          icon={Mail}
          placeholder="Ej: contacto@aliado.com"
        />
        <div className="md:col-span-2">
          <TextArea
            label="Dirección Física"
            {...register('direccion')}
            error={errors.direccion?.message}
            icon={MapPin}
            placeholder="Ej: Calle 123 # 45-67, Bogotá"
            rows={3}
          />
        </div>
      </FormSection>

      {/* Información Financiera */}
      <FormSection
        title="Información Financiera"
        description="Tarifas y datos bancarios del aliado"
        icon={DollarSign}
      >
        <div>
          <Input
            label="Tarifa Hora PBL"
            type="number"
            step="0.01"
            {...register('hora_pbl', { valueAsNumber: true })}
            error={errors.hora_pbl?.message}
            icon={DollarSign}
            placeholder="0.00"
          />
          {horaPbl && horaPbl > 0 && (
            <div className="mt-2 flex items-start space-x-2 text-xs text-gray-600 bg-blue-50 rounded-lg p-2 border border-blue-100">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>
                Tarifa mensual estimada (160h): <strong className="text-blue-700">
                  ${(horaPbl * 160).toLocaleString('es-CO')}
                </strong>
              </span>
            </div>
          )}
        </div>

        <div>
          <Input
            label="Tarifa Hora Especializada"
            type="number"
            step="0.01"
            {...register('hora_especializada', { valueAsNumber: true })}
            error={errors.hora_especializada?.message}
            icon={DollarSign}
            placeholder="0.00"
          />
          {horaEspecializada && horaEspecializada > 0 && (
            <div className="mt-2 flex items-start space-x-2 text-xs text-gray-600 bg-purple-50 rounded-lg p-2 border border-purple-100">
              <Info className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
              <span>
                Tarifa mensual estimada (160h): <strong className="text-purple-700">
                  ${(horaEspecializada * 160).toLocaleString('es-CO')}
                </strong>
              </span>
            </div>
          )}
        </div>

        <Select
          label="Tipo de Cuenta Bancaria"
          {...register('tipo_cuenta')}
          error={errors.tipo_cuenta?.message}
          icon={CreditCard}
          options={[
            { value: '', label: 'Seleccionar tipo...' },
            { value: 'Ahorros', label: 'Cuenta de Ahorros' },
            { value: 'Corriente', label: 'Cuenta Corriente' }
          ]}
        />

        <Input
          label="Entidad Bancaria"
          {...register('banco')}
          error={errors.banco?.message}
          icon={Building2}
          placeholder="Ej: Bancolombia"
        />

        <div className="md:col-span-2">
          <Input
            label="Número de Cuenta"
            {...register('numero_cuenta')}
            error={errors.numero_cuenta?.message}
            icon={Hash}
            placeholder="Ej: 1234567890"
          />
        </div>
      </FormSection>

      {/* Resumen de Validación */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-900 mb-2">
                Corrige los siguientes errores:
              </h4>
              <ul className="space-y-1 text-sm text-red-700">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>{field}:</strong> {error.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3 pt-6 border-t-2 border-gray-200">
        <div className="text-sm text-gray-600">
          <span className="flex items-center">
            <Info className="w-4 h-4 mr-1.5" />
            Los campos marcados con <span className="text-red-500 mx-1">*</span> son obligatorios
          </span>
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
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              'Guardando...'
            ) : defaultValues ? (
              'Actualizar Aliado'
            ) : (
              'Crear Aliado'
            )}
          </Button>
        </div>
      </div>

      {/* Estilos personalizados */}
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
