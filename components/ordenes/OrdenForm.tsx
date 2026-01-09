import React, { useEffect, useMemo, useState } from 'react';
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
import {
    AlertTriangle,
    FileText,
    Calendar,
    Building2,
    Users,
    Briefcase,
    DollarSign,
    Clock,
    CheckCircle2,
    Mail,
    MapPin,
    TrendingUp,
    Info,
    Wallet,
    Calculator,
    Target,
    ArrowRight,
    AlertCircle,
    Hash,
    XCircle,
    ShieldCheck
} from 'lucide-react';

interface OrdenFormProps {
    onSubmit: SubmitHandler<OrdenServicioFormData>;
    onClose: () => void;
    defaultValues?: OrdenServicio | null;
    isSubmitting?: boolean;
}

const ESTADOS = [
    { value: 'PENDIENTE', label: 'Pendiente', color: 'amber', icon: Clock },
    { value: 'EJECUTADO', label: 'Ejecutado', color: 'blue', icon: CheckCircle2 },
    { value: 'FACTURADO', label: 'Facturado', color: 'green', icon: FileText },
    { value: 'ANULADO', label: 'Anulado', color: 'red', icon: XCircle },
];

// Timeline de estados
const EstadoTimeline: React.FC<{ estadoActual: string }> = ({ estadoActual }) => {
    const estados = ['PENDIENTE', 'EJECUTADO', 'FACTURADO'];
    const currentIndex = estados.indexOf(estadoActual);
    const isAnulado = estadoActual === 'ANULADO';

    if (isAnulado) {
        return (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                        <XCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-red-900">Orden Anulada</p>
                        <p className="text-xs text-red-700">Esta orden no será procesada</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
                {estados.map((estado, index) => {
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const estadoConfig = ESTADOS.find(e => e.value === estado);

                    return (
                        <React.Fragment key={estado}>
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isCompleted
                                            ? 'bg-green-500 text-white'
                                            : isCurrent
                                                ? 'bg-blue-500 text-white ring-4 ring-blue-200'
                                                : 'bg-gray-200 text-gray-400'
                                        }`}
                                >
                                    {estadoConfig && <estadoConfig.icon className="w-5 h-5" />}
                                </div>
                                <span
                                    className={`text-xs font-medium mt-2 ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                                        }`}
                                >
                                    {estadoConfig?.label}
                                </span>
                            </div>
                            {index < estados.length - 1 && (
                                <div className="flex-1 mx-2">
                                    <div className="h-0.5 bg-gray-200 relative">
                                        <div
                                            className={`absolute inset-0 transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'
                                                }`}
                                        />
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

// Componente de validación de presupuesto
const BudgetValidation: React.FC<{
    selectedPresupuesto: any;
    totalCalculado: number;
    saldoDisponibleReal: number;
    excedePresupuesto: boolean;
}> = ({ selectedPresupuesto, totalCalculado, saldoDisponibleReal, excedePresupuesto }) => {
    if (!selectedPresupuesto) return null;

    const porcentajeUsado = saldoDisponibleReal > 0
        ? (totalCalculado / saldoDisponibleReal) * 100
        : 0;

    const getStatusColor = () => {
        if (excedePresupuesto) return 'red';
        if (porcentajeUsado > 80) return 'amber';
        return 'green';
    };

    const statusColor = getStatusColor();

    const colorClasses = {
        red: {
            bg: 'bg-red-50',
            border: 'border-red-300',
            text: 'text-red-700',
            progressBg: 'bg-red-500',
            icon: AlertTriangle,
        },
        amber: {
            bg: 'bg-amber-50',
            border: 'border-amber-300',
            text: 'text-amber-700',
            progressBg: 'bg-amber-500',
            icon: AlertCircle,
        },
        green: {
            bg: 'bg-green-50',
            border: 'border-green-300',
            text: 'text-green-700',
            progressBg: 'bg-green-500',
            icon: CheckCircle2,
        },
    };

    const colors = colorClasses[statusColor];

    return (
        <div className={`${colors.bg} rounded-lg border-2 ${colors.border} p-5`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center border ${colors.border}`}>
                        <colors.icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div>
                        <h4 className={`text-sm font-semibold ${colors.text}`}>
                            {excedePresupuesto
                                ? '⚠️ Presupuesto Excedido'
                                : porcentajeUsado > 80
                                    ? '⚠️ Saldo Bajo'
                                    : '✓ Presupuesto Disponible'}
                        </h4>
                        <p className="text-xs text-gray-600 mt-0.5">
                            {excedePresupuesto
                                ? 'El total supera el saldo disponible'
                                : 'Validación de presupuesto activa'}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-600">Saldo disponible</p>
                    <p className={`text-lg font-bold ${colors.text}`}>
                        {formatCurrency(saldoDisponibleReal)}
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                {/* Barra de progreso */}
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Uso del presupuesto</span>
                        <span className={`font-semibold ${colors.text}`}>
                            {Math.min(porcentajeUsado, 100).toFixed(1)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                            className={`h-full ${colors.progressBg} transition-all duration-500 rounded-full`}
                            style={{ width: `${Math.min(porcentajeUsado, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Detalles financieros */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-white/60 rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">Total de esta orden</p>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(totalCalculado)}</p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">
                            {excedePresupuesto ? 'Excedente' : 'Saldo restante'}
                        </p>
                        <p className={`text-lg font-bold ${excedePresupuesto ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(Math.abs(saldoDisponibleReal - totalCalculado))}
                        </p>
                    </div>
                </div>

                {excedePresupuesto && (
                    <div className="flex items-start space-x-2 mt-3 p-3 bg-red-100 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-700">
                            <strong>Acción requerida:</strong> Reduce las unidades, ajusta el costo unitario, o
                            selecciona otro presupuesto con saldo suficiente.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Calculadora de totales
const TotalCalculator: React.FC<{
    unidad?: number;
    costoHora?: number;
}> = ({ unidad, costoHora }) => {
    const total = (unidad || 0) * (costoHora || 0);
    const hasValues = unidad && costoHora && unidad > 0 && costoHora > 0;

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <Calculator className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-900">Cálculo Automático</span>
                </div>
                {hasValues && <CheckCircle2 className="w-5 h-5 text-green-600" />}
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-blue-700">
                    <span className="font-medium">{unidad || 0} unidades</span>
                    <span>×</span>
                    <span className="font-medium">{formatCurrency(costoHora || 0)}</span>
                    <ArrowRight className="w-4 h-4" />
                </div>
                <div className="text-right">
                    <p className="text-xs text-blue-700 mb-1">Total Orden</p>
                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(total)}</p>
                </div>
            </div>
        </div>
    );
};

export const OrdenForm: React.FC<OrdenFormProps> = ({
    onSubmit,
    onClose,
    defaultValues,
    isSubmitting,
}) => {
    const { presupuestos } = usePresupuestos();
    const { aliados } = useAliados();
    const { clientes } = useClientes();

    const presupuestoOptions = useMemo(
        () =>
            presupuestos?.map((p) => ({
                value: p.id,
                label: `${p.cliente?.nombre_cliente} - Saldo: ${formatCurrency(
                    p.saldo_pendiente_ejecutar
                )}`,
            })) || [],
        [presupuestos]
    );

    const aliadoOptions = useMemo(
        () => aliados?.map((a) => ({ value: a.id, label: a.aliado })) || [],
        [aliados]
    );

    const clienteOptions = useMemo(
        () => clientes?.map((c) => ({ value: c.id, label: c.nombre_cliente })) || [],
        [clientes]
    );

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        reset,
        watch,
        setValue,
        control,
    } = useForm<OrdenServicioFormData>({
        resolver: zodResolver(ordenServicioSchema),
        mode: 'onChange',
        defaultValues: {
            estado_actividad: 'PENDIENTE',
            fecha_envio: new Date().toISOString().split('T')[0],
        },
    });

    const selectedPresupuestoId = watch('presupuesto_id');
    const unidad = watch('unidad');
    const costoHora = watch('costo_hora');
    const estadoActividad = watch('estado_actividad');

    const selectedPresupuesto = useMemo(
        () => presupuestos?.find((p) => p.id === selectedPresupuestoId),
        [presupuestos, selectedPresupuestoId]
    );

    const totalCalculado = (unidad || 0) * (costoHora || 0);

    const saldoDisponibleReal =
        selectedPresupuesto
            ? (selectedPresupuesto.saldo_pendiente_ejecutar || 0) + (defaultValues?.total || 0)
            : 0;

    const excedePresupuesto = selectedPresupuesto && totalCalculado > saldoDisponibleReal;

    // Auto-fill data based on selected Budget
    useEffect(() => {
        if (selectedPresupuestoId && !defaultValues) {
            const presupuesto = presupuestos?.find((p) => p.id === selectedPresupuestoId);
            if (presupuesto) {
                setValue('empresa_id', presupuesto.cliente_id);
                if (presupuesto.aliado_id) {
                    setValue('aliado_id', presupuesto.aliado_id);
                    const aliado = aliados?.find((a) => a.id === presupuesto.aliado_id);
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
                fecha_envio: defaultValues.fecha_envio
                    ? new Date(defaultValues.fecha_envio).toISOString().split('T')[0]
                    : '',
                fecha_radicacion: defaultValues.fecha_radicacion
                    ? new Date(defaultValues.fecha_radicacion).toISOString().split('T')[0]
                    : '',
                unidad: defaultValues.unidad || undefined,
                costo_hora: defaultValues.costo_hora || undefined,
                estado_actividad: (defaultValues.estado_actividad as any) || 'PENDIENTE',
            });
        }
    }, [defaultValues, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Header con estado */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {defaultValues ? 'Editar Orden de Servicio' : 'Nueva Orden de Servicio'}
                            </h2>
                            <p className="text-sm text-gray-600">
                                {defaultValues
                                    ? `OS #${defaultValues.os_numero}`
                                    : 'Crea una nueva orden vinculada a un presupuesto'}
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

                {/* Timeline de estados */}
                <EstadoTimeline estadoActual={estadoActividad || 'PENDIENTE'} />
            </div>

            {/* Sección 1: Información Base */}
            <Card>
                <div className="flex items-center space-x-3 pb-4 mb-4 border-b border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                        <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Información Base</h3>
                        <p className="text-sm text-gray-600">Número de orden y vinculación con presupuesto</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Número de Orden (OS)"
                        {...register('os_numero')}
                        error={errors.os_numero?.message}
                        required
                        icon={Hash}
                        placeholder="Ej: OS-2026-001"
                    />

                    <Input
                        label="Fecha de Envío"
                        type="date"
                        {...register('fecha_envio')}
                        error={errors.fecha_envio?.message}
                        required
                        icon={Calendar}
                    />

                    <div className="md:col-span-2">
                        <Controller
                            name="presupuesto_id"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    label="Presupuesto Vinculado"
                                    options={[{ value: '', label: 'Seleccionar presupuesto...' }, ...presupuestoOptions]}
                                    {...field}
                                    error={errors.presupuesto_id?.message}
                                    required
                                    icon={Wallet}
                                />
                            )}
                        />
                        {selectedPresupuesto && (
                            <div className="mt-2 flex items-center justify-between text-sm bg-blue-50 rounded-lg p-3 border border-blue-200">
                                <div className="flex items-center space-x-2">
                                    <Info className="w-4 h-4 text-blue-600" />
                                    <span className="text-blue-900 font-medium">
                                        Saldo disponible: {formatCurrency(selectedPresupuesto.saldo_pendiente_ejecutar)}
                                    </span>
                                </div>
                                <span className="text-xs text-blue-700">
                                    Presupuesto total: {formatCurrency(selectedPresupuesto.presupuesto_valor)}
                                </span>
                            </div>
                        )}
                    </div>

                    <Controller
                        name="empresa_id"
                        control={control}
                        render={({ field }) => (
                            <Select
                                label="Cliente (Empresa)"
                                options={[{ value: '', label: 'Seleccionar cliente...' }, ...clienteOptions]}
                                {...field}
                                error={errors.empresa_id?.message}
                                required
                                icon={Building2}
                            />
                        )}
                    />

                    <Controller
                        name="aliado_id"
                        control={control}
                        render={({ field }) => (
                            <Select
                                label="Aliado Ejecutor"
                                options={[{ value: '', label: 'Seleccionar aliado...' }, ...aliadoOptions]}
                                {...field}
                                error={errors.aliado_id?.message}
                                required
                                icon={Users}
                            />
                        )}
                    />
                </div>
            </Card>

            {/* Sección 2: Detalles del Servicio */}
            <Card>
                <div className="flex items-center space-x-3 pb-4 mb-4 border-b border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                        <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Detalles del Servicio</h3>
                        <p className="text-sm text-gray-600">Descripción y costos del servicio contratado</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <Input
                            label="Servicio Contratado"
                            {...register('servicio_contratado')}
                            error={errors.servicio_contratado?.message}
                            required
                            icon={Briefcase}
                            placeholder="Descripción del servicio"
                        />
                    </div>

                    <Input
                        label="Especialidad"
                        {...register('especialidad')}
                        error={errors.especialidad?.message}
                        icon={Target}
                        placeholder="Ej: Seguridad Industrial"
                    />

                    <Input
                        label="Categoría del Servicio"
                        {...register('categoria_servicio')}
                        error={errors.categoria_servicio?.message}
                        icon={FileText}
                        placeholder="Ej: Consultoría"
                    />

                    <Input
                        label="Unidades / Horas"
                        type="number"
                        step="0.01"
                        min="0"
                        {...register('unidad', { valueAsNumber: true })}
                        error={errors.unidad?.message}
                        icon={Hash}
                        placeholder="0.00"
                    />

                    <Input
                        label="Costo por Unidad"
                        type="number"
                        step="0.01"
                        min="0"
                        {...register('costo_hora', { valueAsNumber: true })}
                        error={errors.costo_hora?.message}
                        icon={DollarSign}
                        placeholder="0.00"
                    />

                    {/* Calculadora */}
                    <div className="md:col-span-2">
                        <TotalCalculator unidad={unidad} costoHora={costoHora} />
                    </div>

                    {/* Validación de presupuesto */}
                    {selectedPresupuesto && totalCalculado > 0 && (
                        <div className="md:col-span-2">
                            <BudgetValidation
                                selectedPresupuesto={selectedPresupuesto}
                                totalCalculado={totalCalculado}
                                saldoDisponibleReal={saldoDisponibleReal}
                                excedePresupuesto={!!excedePresupuesto}
                            />
                        </div>
                    )}
                </div>
            </Card>

            {/* Sección 3: Estado y Facturación */}
            <Card>
                <div className="flex items-center space-x-3 pb-4 mb-4 border-b border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Estado y Facturación</h3>
                        <p className="text-sm text-gray-600">Control del estado y datos de facturación</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        label="Estado de la Orden"
                        options={ESTADOS.map((e) => ({ value: e.value, label: e.label }))}
                        {...register('estado_actividad')}
                        error={errors.estado_actividad?.message}
                        icon={Clock}
                    />

                    <Input
                        label="Número de Factura"
                        {...register('numero_factura')}
                        error={errors.numero_factura?.message}
                        icon={FileText}
                        placeholder="Ej: FAC-2026-001"
                    />

                    <Input
                        label="Fecha de Radicación"
                        type="date"
                        {...register('fecha_radicacion')}
                        error={errors.fecha_radicacion?.message}
                        icon={Calendar}
                    />
                </div>
            </Card>

            {/* Sección 4: Contacto */}
            <Card>
                <div className="flex items-center space-x-3 pb-4 mb-4 border-b border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md">
                        <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">Datos de Contacto</h3>
                        <p className="text-sm text-gray-600">Información opcional del contacto y ubicación</p>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        Opcional
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Nombre del Contacto"
                        {...register('nombre_contacto')}
                        icon={Users}
                        placeholder="Ej: Juan Pérez"
                    />

                    <Input
                        label="Correo Electrónico"
                        type="email"
                        {...register('email')}
                        error={errors.email?.message}
                        icon={Mail}
                        placeholder="Ej: contacto@empresa.com"
                    />

                    <div className="md:col-span-2">
                        <TextArea
                            label="Dirección de Ejecución"
                            {...register('direccion_cliente')}
                            icon={MapPin}
                            placeholder="Dirección donde se ejecutará el servicio"
                            rows={3}
                        />
                    </div>
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

                    <Button
                        type="submit"
                        isLoading={isSubmitting}
                        disabled={isSubmitting || !!excedePresupuesto}
                        className="min-w-[160px]"
                    >
                        {isSubmitting ? (
                            'Guardando...'
                        ) : defaultValues ? (
                            'Actualizar Orden'
                        ) : (
                            'Crear Orden'
                        )}
                    </Button>
                </div>
            </div>
        </form>
    );
};
