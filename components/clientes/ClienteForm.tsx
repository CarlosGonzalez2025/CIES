
import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clienteSchema, ClienteFormData } from '../../schemas/clienteSchema';
import type { Cliente } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { TextArea } from '../ui/TextArea';
import { useARL } from '../../hooks/useARL';
import { Button } from '../ui/Button';

interface ClienteFormProps {
  onSubmit: SubmitHandler<ClienteFormData>;
  onClose: () => void;
  defaultValues?: Cliente | null;
  isSubmitting?: boolean;
}

export const ClienteForm: React.FC<ClienteFormProps> = ({ onSubmit, onClose, defaultValues, isSubmitting }) => {
  const { arlOptions, isLoading: isLoadingArl } = useARL();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
  });

  useEffect(() => {
    if (defaultValues) {
      const formattedValues = {
        ...defaultValues,
        fecha: defaultValues.fecha ? new Date(defaultValues.fecha).toISOString().split('T')[0] : '',
        valor_hora: defaultValues.valor_hora ?? undefined,
        porcentaje_comision: defaultValues.porcentaje_comision ?? undefined,
      };
      reset(formattedValues);
    } else {
        reset({ fecha: new Date().toISOString().split('T')[0] });
    }
  }, [defaultValues, reset]);
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
          label="Nombre Cliente" 
          {...register('nombre_cliente')} 
          error={errors.nombre_cliente?.message} 
          required 
        />
        <Input 
          label="NIT / Documento" 
          {...register('nit_documento')} 
          error={errors.nit_documento?.message} 
          required 
        />
        <Input 
          label="Fecha de Registro" 
          type="date" 
          {...register('fecha')} 
          error={errors.fecha?.message} 
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
          label="Nombre Contacto" 
          {...register('nombre_contacto')} 
          error={errors.nombre_contacto?.message} 
        />
        <Input 
          label="Número Contacto" 
          {...register('numero_contacto')} 
          error={errors.numero_contacto?.message} 
        />
        <Input 
          label="Email Contacto" 
          type="email" 
          {...register('email_contacto')} 
          error={errors.email_contacto?.message} 
        />
        <Input 
          label="Valor Hora" 
          type="number" 
          step="0.01" 
          {...register('valor_hora')} 
          error={errors.valor_hora?.message} 
        />
        <Input 
          label="Porcentaje Comisión (ej. 0.09)" 
          type="number" 
          step="0.0001" 
          {...register('porcentaje_comision')} 
          error={errors.porcentaje_comision?.message} 
        />
        <div className="md:col-span-2">
            <TextArea 
              label="Dirección" 
              {...register('direccion')} 
              error={errors.direccion?.message}
            />
        </div>
      </div>
       <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" isLoading={isSubmitting}>
              {defaultValues ? 'Actualizar Cliente' : 'Crear Cliente'}
            </Button>
        </div>
    </form>
  );
};
