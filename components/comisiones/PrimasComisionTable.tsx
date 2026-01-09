import React, { useEffect, useMemo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Input } from '../ui/Input';
import { ComisionFormData } from '../../schemas/comisionSchema';
import { formatCurrency } from '../../utils/formatters';
import { calculateComisionFromPrima } from '../../utils/calculations';
import {
    Calendar,
    DollarSign,
    TrendingUp,
    CheckCircle2,
    AlertCircle,
    BarChart3,
    Percent,
    Calculator,
    ChevronDown,
    ChevronUp,
    Info
} from 'lucide-react';

const TRIMESTRES = [
    { nombre: 'Q1', meses: ['ENERO', 'FEBRERO', 'MARZO'], color: 'blue' },
    { nombre: 'Q2', meses: ['ABRIL', 'MAYO', 'JUNIO'], color: 'emerald' },
    { nombre: 'Q3', meses: ['JULIO', 'AGOSTO', 'SEPTIEMBRE'], color: 'amber' },
    { nombre: 'Q4', meses: ['OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'], color: 'purple' },
];

const MESES_CORTOS: Record<string, string> = {
    ENERO: 'Ene',
    FEBRERO: 'Feb',
    MARZO: 'Mar',
    ABRIL: 'Abr',
    MAYO: 'May',
    JUNIO: 'Jun',
    JULIO: 'Jul',
    AGOSTO: 'Ago',
    SEPTIEMBRE: 'Sep',
    OCTUBRE: 'Oct',
    NOVIEMBRE: 'Nov',
    DICIEMBRE: 'Dic',
};

// Componente de resumen visual
const VisualSummary: React.FC<{
    primas: Array<{ mes: string; prima: number; comision: number }>;
}> = ({ primas }) => {
    const maxPrima = Math.max(...primas.map((p) => p.prima || 0));

    return (
        <div className="grid grid-cols-12 gap-2 mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="col-span-12 mb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        <h4 className="text-sm font-semibold text-blue-900">
                            Distribución Mensual de Primas
                        </h4>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-blue-700">
                        <span>Máximo:</span>
                        <span className="font-bold">{formatCurrency(maxPrima)}</span>
                    </div>
                </div>
            </div>

            {primas.map((prima, index) => {
                const percentage = maxPrima > 0 ? (prima.prima / maxPrima) * 100 : 0;
                const hasValue = prima.prima > 0;

                return (
                    <div key={index} className="flex flex-col items-center space-y-1">
                        <div className="w-full bg-gray-200 rounded-full h-16 relative overflow-hidden">
                            <div
                                className={`absolute bottom-0 w-full transition-all duration-500 rounded-full ${hasValue
                                        ? 'bg-gradient-to-t from-blue-600 to-blue-400'
                                        : 'bg-gray-300'
                                    }`}
                                style={{ height: `${percentage}%` }}
                            />
                            {hasValue && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                            {MESES_CORTOS[prima.mes]}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

// Componente de fila de trimestre
const TrimestreRow: React.FC<{
    trimestre: typeof TRIMESTRES[0];
    primasData: Array<{ mes: string; prima: number; comision: number }>;
    onPrimaChange: (index: number, value: string) => void;
    startIndex: number;
    control: any;
}> = ({ trimestre, primasData, onPrimaChange, startIndex, control }) => {
    const [isExpanded, setIsExpanded] = React.useState(true);

    const totalPrima = primasData.reduce((acc, p) => acc + (p.prima || 0), 0);
    const totalComision = primasData.reduce((acc, p) => acc + (p.comision || 0), 0);
    const mesesConDatos = primasData.filter((p) => p.prima > 0).length;

    const colorClasses = {
        blue: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-700',
            badge: 'bg-blue-100 text-blue-700 border-blue-200',
        },
        emerald: {
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            text: 'text-emerald-700',
            badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        },
        amber: {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            text: 'text-amber-700',
            badge: 'bg-amber-100 text-amber-700 border-amber-200',
        },
        purple: {
            bg: 'bg-purple-50',
            border: 'border-purple-200',
            text: 'text-purple-700',
            badge: 'bg-purple-100 text-purple-700 border-purple-200',
        },
    };

    const colors = colorClasses[trimestre.color as keyof typeof colorClasses];

    return (
        <div className={`rounded-lg border ${colors.border} overflow-hidden mb-4`}>
            {/* Header del trimestre */}
            <div
                className={`${colors.bg} px-4 py-3 cursor-pointer hover:opacity-80 transition-opacity`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <button
                            type="button"
                            className={`w-8 h-8 ${colors.badge} rounded-lg flex items-center justify-center border`}
                        >
                            {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                            ) : (
                                <ChevronDown className="w-4 h-4" />
                            )}
                        </button>
                        <div>
                            <h3 className={`text-sm font-bold ${colors.text}`}>
                                {trimestre.nombre} - {trimestre.meses.join(', ')}
                            </h3>
                            <p className="text-xs text-gray-600 mt-0.5">
                                {mesesConDatos} de {primasData.length} meses con datos
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-xs text-gray-600">Prima Total</p>
                            <p className={`text-sm font-bold ${colors.text}`}>
                                {formatCurrency(totalPrima)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-600">Comisión Total</p>
                            <p className={`text-sm font-bold ${colors.text}`}>
                                {formatCurrency(totalComision)}
                            </p>
                        </div>
                        {mesesConDatos === primasData.length && (
                            <CheckCircle2 className={`w-5 h-5 ${colors.text}`} />
                        )}
                    </div>
                </div>
            </div>

            {/* Contenido expandible */}
            {isExpanded && (
                <div className="bg-white">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-1/4">
                                    <Calendar className="w-4 h-4 inline mr-1.5" />
                                    Mes
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-3/8">
                                    <DollarSign className="w-4 h-4 inline mr-1.5" />
                                    Prima Mensual
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-3/8">
                                    <TrendingUp className="w-4 h-4 inline mr-1.5" />
                                    Comisión Calculada
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {primasData.map((prima, localIndex) => {
                                const globalIndex = startIndex + localIndex;
                                const hasValue = prima.prima > 0;

                                return (
                                    <tr
                                        key={globalIndex}
                                        className={`hover:bg-gray-50 transition-colors ${hasValue ? 'bg-green-50/30' : ''
                                            }`}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {prima.mes}
                                                </span>
                                                {hasValue && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                        Completado
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    defaultValue={prima.prima}
                                                    onChange={(e) => onPrimaChange(globalIndex, e.target.value)}
                                                    className="pl-10"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="relative">
                                                <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 w-4 h-4" />
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    {...control.register(`primas.${globalIndex}.comision`)}
                                                    readOnly
                                                    className="pl-10 bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold cursor-not-allowed"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export const PrimasComisionTable: React.FC = () => {
    const { control, watch, setValue, getValues } = useFormContext<ComisionFormData>();
    const { fields } = useFieldArray({
        control,
        name: 'primas',
    });

    const porcentajeImpuesto = watch('porcentaje_comision_impuesto');
    const porcentajeARL = watch('porcentaje_comision_arl');

    useEffect(() => {
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

    // Cálculos de totales
    const totals = useMemo(() => {
        const totalPrimas = primas.reduce((acc, curr) => acc + (curr.prima || 0), 0);
        const totalComisiones = primas.reduce((acc, curr) => acc + (curr.comision || 0), 0);
        const mesesConDatos = primas.filter((p) => p.prima > 0).length;
        const promedioMensual = mesesConDatos > 0 ? totalPrimas / mesesConDatos : 0;

        return {
            totalPrimas,
            totalComisiones,
            mesesConDatos,
            promedioMensual,
        };
    }, [primas]);

    // Agrupar por trimestres
    const trimestreData = TRIMESTRES.map((trimestre, trimestreIndex) => {
        const startIndex = trimestreIndex * 3;
        const primasDelTrimestre = primas.slice(startIndex, startIndex + 3);
        return {
            trimestre,
            primas: primasDelTrimestre,
            startIndex,
        };
    });

    return (
        <div className="space-y-6">
            {/* Información de ayuda */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-blue-900 mb-1">
                            Cálculo Automático de Comisiones
                        </h4>
                        <p className="text-xs text-blue-700 leading-relaxed">
                            Ingresa las primas mensuales y las comisiones se calcularán automáticamente
                            basándose en el porcentaje configurado
                            {porcentajeARL && porcentajeImpuesto && (
                                <>
                                    {' '}
                                    (<strong>{(porcentajeARL * 100).toFixed(2)}% ARL</strong> −{' '}
                                    <strong>{(porcentajeImpuesto * 100).toFixed(2)}% impuesto</strong>)
                                </>
                            )}
                            . Los campos de comisión son de solo lectura.
                        </p>
                    </div>
                </div>
            </div>

            {/* Resumen visual */}
            <VisualSummary primas={primas} />

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span className="text-2xl font-bold text-blue-600">{totals.mesesConDatos}</span>
                    </div>
                    <p className="text-sm text-gray-600">Meses con Datos</p>
                    <p className="text-xs text-gray-500 mt-1">de 12 meses totales</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <DollarSign className="w-5 h-5 text-purple-600" />
                        <span className="text-lg font-bold text-purple-600">
                            {formatCurrency(totals.totalPrimas)}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600">Prima Total Anual</p>
                    <p className="text-xs text-gray-500 mt-1">Suma de todos los meses</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        <span className="text-lg font-bold text-emerald-600">
                            {formatCurrency(totals.totalComisiones)}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600">Comisión Total</p>
                    <p className="text-xs text-gray-500 mt-1">Calculada automáticamente</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <BarChart3 className="w-5 h-5 text-amber-600" />
                        <span className="text-lg font-bold text-amber-600">
                            {formatCurrency(totals.promedioMensual)}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600">Promedio Mensual</p>
                    <p className="text-xs text-gray-500 mt-1">Prima por mes con datos</p>
                </div>
            </div>

            {/* Tabla agrupada por trimestres */}
            <div className="space-y-4">
                {trimestreData.map((data) => (
                    <TrimestreRow
                        key={data.trimestre.nombre}
                        trimestre={data.trimestre}
                        primasData={data.primas}
                        onPrimaChange={handlePrimaChange}
                        startIndex={data.startIndex}
                        control={control}
                    />
                ))}
            </div>

            {/* Resumen final */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-gray-300 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                            <Calculator className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Totales Anuales</h3>
                    </div>
                    {totals.mesesConDatos === 12 && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                            <CheckCircle2 className="w-4 h-4 mr-1.5" />
                            Año Completo
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center space-x-2 mb-2">
                            <DollarSign className="w-4 h-4 text-purple-600" />
                            <span className="text-sm text-gray-600">Prima Total</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-900">
                            {formatCurrency(totals.totalPrimas)}
                        </p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center space-x-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm text-gray-600">Comisión Total</span>
                        </div>
                        <p className="text-2xl font-bold text-emerald-900">
                            {formatCurrency(totals.totalComisiones)}
                        </p>
                        {porcentajeARL && totals.totalPrimas > 0 && (
                            <div className="flex items-center space-x-1 mt-1">
                                <Percent className="w-3 h-3 text-gray-500" />
                                <span className="text-xs text-gray-600">
                                    {((totals.totalComisiones / totals.totalPrimas) * 100).toFixed(2)}% efectivo
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center space-x-2 mb-2">
                            <BarChart3 className="w-4 h-4 text-amber-600" />
                            <span className="text-sm text-gray-600">Promedio Mensual</span>
                        </div>
                        <p className="text-2xl font-bold text-amber-900">
                            {formatCurrency(totals.promedioMensual)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Basado en {totals.mesesConDatos} {totals.mesesConDatos === 1 ? 'mes' : 'meses'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
