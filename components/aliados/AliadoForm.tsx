import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { aliadoSchema, AliadoFormData } from '../../schemas/aliadoSchema';
import type { Aliado } from '../../types';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';

interface AliadoFormProps {
  onSubmit: SubmitHandler<AliadoFormData>;
  onClose: () => void;
  defaultValues?: Aliado | null;
  isSubmitting?: boolean;
}

export const AliadoForm: React.FC<AliadoFormProps> = ({ onSubmit, onClose, defaultValues, isSubmitting }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AliadoFormData>({
    resolver: zodResolver(aliadoSchema),
  });

  useEffect(() => {
    if (defaultValues) {
      const formattedValues = {
        ...defaultValues,
        fecha_registro: defaultValues.fecha_registro ? new Date(defaultValues.fecha_registro).toISOString().split('T')[0] : '',
        hora_pbl: defaultValues.hora_pbl ?? undefined,
        hora_especializada: defaultValues.hora_especializada ?? undefined,
      };
      reset(formattedValues);
    } else {
        reset({ fecha_registro: new Date().toISOString().split('T')[0] });
    }
  }, [defaultValues, reset]);
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Info */}
        <Input 
          label="Nombre Aliado" 
          {...register('aliado')} 
          error={errors.aliado?.message} 
          required 
        />
        <Input 
          label="Especialidad" 
          {...register('especialidad')} 
          error={errors.especialidad?.message} 
        />
         <Input 
          label="Fecha de Registro" 
          type="date" 
          {...register('fecha_registro')} 
          error={errors.fecha_registro?.message} 
          required 
        />
        <Input 
          label="NIT / Documento" 
          {...register('nit')} 
          error={errors.nit?.message} 
        />
       
        {/* Contact Info */}
        <Input 
          label="Nombre Contacto" 
          {...register('contacto')} 
          error={errors.contacto?.message} 
        />
        <Input 
          label="Número Telefónico" 
          {...register('numero_telefonico')} 
          error={errors.numero_telefonico?.message} 
        />
        <Input 
          label="Email" 
          type="email" 
          {...register('email')} 
          error={errors.email?.message} 
        />
         <div className="md:col-span-2">
            <TextArea 
              label="Dirección" 
              {...register('direccion')} 
              error={errors.direccion?.message}
            />
        </div>
       
        {/* Financial Info */}
        <Input 
          label="Tarifa Hora PBL" 
          type="number" 
          step="0.01" 
          {...register('hora_pbl')} 
          error={errors.hora_pbl?.message} 
        />
        <Input 
          label="Tarifa Hora Especializada" 
          type="number" 
          step="0.01" 
          {...register('hora_especializada')} 
          error={errors.hora_especializada?.message} 
        />
        <Select
            label="Tipo de Cuenta"
            {...register('tipo_cuenta')}
            options={[
                { value: 'Ahorros', label: 'Ahorros'},
                { value: 'Corriente', label: 'Corriente'}
            ]}
        />
         <Input 
          label="Banco" 
          {...register('banco')} 
          error={errors.banco?.message} 
        />
        <Input 
          label="Número de Cuenta" 
          {...register('numero_cuenta')} 
          error={errors.numero_cuenta?.message} 
        />
      </div>
       <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" isLoading={isSubmitting}>
              {defaultValues ? 'Actualizar Aliado' : 'Crear Aliado'}
            </Button>
        </div>
    </form>
  );
};
