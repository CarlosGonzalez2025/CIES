import React, { useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Input } from '../ui/Input';
import { ComisionFormData } from '../../schemas/comisionSchema';
import { formatCurrency } from '../../utils/formatters';
import { calculateComisionFromPrima } from '../../utils/calculations';

export const PrimasComisionTable: React.FC = () => {
  const { control, watch, setValue, getValues } = useFormContext<ComisionFormData>();
  const { fields } = useFieldArray({
    control,
    name: "primas",
  });

  const porcentajeImpuesto = watch('porcentaje_comision_impuesto');

  useEffect(() => {
    // Recalculate all commissions when the tax percentage changes
    const primas = getValues('primas');
    primas.forEach((prima, index) => {
        const newComision = calculateComisionFromPrima(prima.prima, porcentajeImpuesto);
        setValue(`primas.${index}.comision`, newComision);
    });
  }, [porcentajeImpuesto, setValue, getValues]);

  const handlePrimaChange = (index: number, value: string) => {
    const primaValue = Number(value) || 0;
    setValue(`primas.${index}.prima`, primaValue);
    const newComision = calculateComisionFromPrima(primaValue, porcentajeImpuesto);
    setValue(`primas.${index}.comision`, newComision);
  };

  const primas = watch('primas');
  const totalPrimas = primas.reduce((acc, curr) => acc + (curr.prima || 0), 0);
  const totalComisiones = primas.reduce((acc, curr) => acc + (curr.comision || 0), 0);

  return (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mes</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prima</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Comisión</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {fields.map((field, index) => (
                    <tr key={field.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{field.mes}</td>
                        <td className="px-4 py-2">
                           <Input
                                type="number"
                                step="0.01"
                                defaultValue={field.prima}
                                onChange={(e) => handlePrimaChange(index, e.target.value)}
                                className="w-full"
                            />
                        </td>
                        <td className="px-4 py-2">
                            <Input
                                type="number"
                                step="0.01"
                                {...control.register(`primas.${index}.comision`)}
                                readOnly
                                className="w-full bg-gray-100"
                            />
                        </td>
                    </tr>
                ))}
            </tbody>
            <tfoot className="bg-gray-100">
                <tr>
                    <th className="px-4 py-2 text-right text-sm font-bold text-gray-700">Totales</th>
                    <td className="px-4 py-2 text-sm font-semibold text-gray-900">{formatCurrency(totalPrimas)}</td>
                    <td className="px-4 py-2 text-sm font-semibold text-gray-900">{formatCurrency(totalComisiones)}</td>
                </tr>
            </tfoot>
        </table>
    </div>
  );
};
