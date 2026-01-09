import React, { useEffect, useMemo, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usuarioSchema, UsuarioFormData } from '../../schemas/usuarioSchema';
import type { PerfilUsuario } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useClientes } from '../../hooks/useClientes';
import {
  User,
  Mail,
  Lock,
  Shield,
  Users,
  Building2,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  UserCog,
  CheckCircle2,
  AlertCircle,
  Info,
  Eye,
  EyeOff,
  Zap,
  Briefcase,
  FileText,
  DollarSign,
  ClipboardList,
  BarChart3,
  Handshake,
  UserCircle2,
  Globe
} from 'lucide-react';

interface UsuarioFormProps {
  onSubmit: SubmitHandler<UsuarioFormData>;
  onClose: () => void;
  defaultValues?: PerfilUsuario | null;
  isSubmitting?: boolean;
}

// Configuración de roles con metadata
const ROLES_CONFIG = [
  {
    value: 'ADMIN',
    label: 'Administrador',
    description: 'Acceso total al sistema',
    icon: ShieldCheck,
    color: 'purple',
    permissions: 'Todos los módulos',
  },
  {
    value: 'ANALISTA',
    label: 'Analista',
    description: 'Gestión y análisis de datos',
    icon: UserCog,
    color: 'blue',
    permissions: 'Módulos seleccionables',
  },
  {
    value: 'CONSULTA',
    label: 'Solo Consulta',
    description: 'Visualización sin edición',
    icon: ShieldQuestion,
    color: 'green',
    permissions: 'Módulos de solo lectura',
  },
  {
    value: 'CLIENTE',
    label: 'Cliente',
    description: 'Acceso al portal del cliente',
    icon: ShieldAlert,
    color: 'amber',
    permissions: 'Solo portal del cliente',
  },
];

// Módulos organizados por categorías
const MODULOS_CATEGORIAS = [
  {
    categoria: 'Gestión de Entidades',
    icon: Building2,
    modulos: [
      { id: '/clientes', label: 'Clientes', icon: Building2, description: 'Gestión de empresas' },
      { id: '/aliados', label: 'Aliados', icon: Handshake, description: 'Socios estratégicos' },
      { id: '/usuarios', label: 'Usuarios', icon: Users, description: 'Gestión de accesos' },
    ],
  },
  {
    categoria: 'Operaciones Financieras',
    icon: DollarSign,
    modulos: [
      { id: '/comisiones', label: 'Comisiones', icon: DollarSign, description: 'Cálculo de comisiones' },
      { id: '/presupuesto', label: 'Presupuestos', icon: FileText, description: 'Control presupuestario' },
      {
        id: '/ordenes-servicio',
        label: 'Órdenes de Servicio',
        icon: ClipboardList,
        description: 'Gestión de OS',
      },
    ],
  },
  {
    categoria: 'Análisis y Reportes',
    icon: BarChart3,
    modulos: [
      { id: '/reportes', label: 'Reportes', icon: BarChart3, description: 'Informes y análisis' },
    ],
  },
];

// Card de selección de rol
const RolCard: React.FC<{
  rol: typeof ROLES_CONFIG[0];
  isSelected: boolean;
  onClick: () => void;
}> = ({ rol, isSelected, onClick }) => {
  const Icon = rol.icon;

  const colorClasses = {
    purple: {
      bg: 'bg-purple-50 border-purple-300 shadow-purple-200',
      icon: 'text-purple-600',
      text: 'text-purple-900',
    },
    blue: {
      bg: 'bg-blue-50 border-blue-300 shadow-blue-200',
      icon: 'text-blue-600',
      text: 'text-blue-900',
    },
    green: {
      bg: 'bg-green-50 border-green-300 shadow-green-200',
      icon: 'text-green-600',
      text: 'text-green-900',
    },
    amber: {
      bg: 'bg-amber-50 border-amber-300 shadow-amber-200',
      icon: 'text-amber-600',
      text: 'text-amber-900',
    },
  };

  const colors = colorClasses[rol.color as keyof typeof colorClasses];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${isSelected
          ? `${colors.bg} shadow-md transform scale-105`
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }`}
    >
      <div className="flex items-start space-x-3">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${isSelected ? colors.bg : 'bg-gray-100'
            } border ${isSelected ? `border-${rol.color}-200` : 'border-gray-200'}`}
        >
          <Icon className={`w-6 h-6 ${isSelected ? colors.icon : 'text-gray-400'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className={`text-sm font-semibold ${isSelected ? colors.text : 'text-gray-900'
              }`}
          >
            {rol.label}
          </h4>
          <p className="text-xs text-gray-600 mt-0.5">{rol.description}</p>
          <p className="text-xs text-gray-500 mt-1 flex items-center">
            <Shield className="w-3 h-3 mr-1" />
            {rol.permissions}
          </p>
        </div>
        {isSelected && (
          <CheckCircle2 className={`w-5 h-5 ${colors.icon} flex-shrink-0`} />
        )}
      </div>
    </button>
  );
};

// Componente de módulo seleccionable
const ModuloCheckbox: React.FC<{
  modulo: any;
  isChecked: boolean;
  isDisabled: boolean;
  onChange: () => void;
}> = ({ modulo, isChecked, isDisabled, onChange }) => {
  const Icon = modulo.icon;

  return (
    <label
      className={`flex items-start space-x-3 p-3 border rounded-lg transition-all cursor-pointer ${isDisabled
          ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
          : isChecked
            ? 'bg-primary-50 border-primary-300 hover:bg-primary-100'
            : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
        }`}
    >
      <input
        type="checkbox"
        checked={isChecked}
        onChange={onChange}
        disabled={isDisabled}
        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <Icon className={`w-4 h-4 ${isChecked ? 'text-primary-600' : 'text-gray-400'}`} />
          <span className={`text-sm font-medium ${isChecked ? 'text-primary-900' : 'text-gray-900'}`}>
            {modulo.label}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{modulo.description}</p>
      </div>
      {isChecked && <CheckCircle2 className="w-4 h-4 text-primary-600 flex-shrink-0" />}
    </label>
  );
};

export const UsuarioForm: React.FC<UsuarioFormProps> = ({
  onSubmit,
  onClose,
  defaultValues,
  isSubmitting,
}) => {
  const { clienteOptions, isLoading: loadingClientes } = useClientes();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    mode: 'onChange',
    defaultValues: {
      modulos_autorizados: [],
      activo: true,
    },
  });

  const [rol, modulosAutorizados, activo] = watch(['rol', 'modulos_autorizados', 'activo']);

  const selectedRolConfig = useMemo(
    () => ROLES_CONFIG.find((r) => r.value === rol),
    [rol]
  );

  useEffect(() => {
    if (defaultValues) {
      reset({
        email: defaultValues.email,
        nombre: defaultValues.nombre,
        rol: defaultValues.rol,
        modulos_autorizados: defaultValues.modulos_autorizados || [],
        cliente_id: defaultValues.cliente_id,
        activo: defaultValues.activo,
      });
    }
  }, [defaultValues, reset]);

  // Auto-select modules based on role
  useEffect(() => {
    if (rol === 'ADMIN') {
      const todosModulos = MODULOS_CATEGORIAS.flatMap((cat) => cat.modulos.map((m) => m.id));
      setValue('modulos_autorizados', todosModulos);
    } else if (rol === 'CLIENTE') {
      setValue('modulos_autorizados', ['/portal-cliente']);
    }
  }, [rol, setValue]);

  const toggleModulo = (moduloId: string) => {
    const current = modulosAutorizados || [];
    if (current.includes(moduloId)) {
      setValue(
        'modulos_autorizados',
        current.filter((id) => id !== moduloId)
      );
    } else {
      setValue('modulos_autorizados', [...current, moduloId]);
    }
  };

  const totalModulosDisponibles = MODULOS_CATEGORIAS.reduce(
    (acc, cat) => acc + cat.modulos.length,
    0
  );
  const modulosSeleccionados = (modulosAutorizados || []).length;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center">
              <UserCircle2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {defaultValues ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <p className="text-sm text-gray-600">
                {defaultValues
                  ? 'Actualiza la información del usuario'
                  : 'Crea un nuevo usuario y asigna permisos'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {activo !== undefined && (
              <div
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border ${activo
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}
              >
                {activo ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="text-xs font-medium">{activo ? 'Activo' : 'Inactivo'}</span>
              </div>
            )}
            {isDirty && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full border border-amber-200">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium">Cambios sin guardar</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sección 1: Información Básica */}
      <Card>
        <div className="flex items-center space-x-3 pb-4 mb-4 border-b border-gray-200">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>
            <p className="text-sm text-gray-600">Datos de identificación del usuario</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre Completo"
            {...register('nombre')}
            error={errors.nombre?.message}
            required
            icon={User}
            placeholder="Ej: Juan Pérez"
          />

          <Input
            label="Correo Electrónico"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            required
            icon={Mail}
            placeholder="Ej: usuario@empresa.com"
          />

          {!defaultValues && (
            <div className="md:col-span-2">
              <div className="relative">
                <Input
                  label="Contraseña Temporal"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  error={errors.password?.message}
                  icon={Lock}
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500 flex items-start">
                <Info className="w-3 h-3 mr-1 flex-shrink-0 mt-0.5" />
                El usuario recibirá un correo para establecer su contraseña definitiva
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Sección 2: Rol y Permisos */}
      <Card>
        <div className="flex items-center space-x-3 pb-4 mb-4 border-b border-gray-200">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Rol y Permisos</h3>
            <p className="text-sm text-gray-600">Define el nivel de acceso del usuario</p>
          </div>
          {selectedRolConfig && (
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200">
              <selectedRolConfig.icon className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-700">{selectedRolConfig.label}</span>
            </div>
          )}
        </div>

        {/* Grid de selección de roles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {ROLES_CONFIG.map((rolConfig) => (
            <RolCard
              key={rolConfig.value}
              rol={rolConfig}
              isSelected={rol === rolConfig.value}
              onClick={() => setValue('rol', rolConfig.value)}
            />
          ))}
        </div>

        {errors.rol && (
          <p className="text-sm text-red-600 mb-4 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.rol.message}
          </p>
        )}

        {/* Cliente asociado (solo para rol CLIENTE) */}
        {rol === 'CLIENTE' && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3 mb-4">
              <Briefcase className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-900 mb-1">
                  Asignación de Cliente
                </h4>
                <p className="text-xs text-amber-700">
                  Este usuario tendrá acceso exclusivo al portal del cliente seleccionado
                </p>
              </div>
            </div>

            <Select
              label="Cliente Asociado"
              options={[{ value: '', label: 'Seleccionar cliente...' }, ...clienteOptions]}
              {...register('cliente_id')}
              error={errors.cliente_id?.message}
              disabled={loadingClientes}
              required
              icon={Building2}
            />
          </div>
        )}

        {/* Matriz de permisos (para roles que no son CLIENTE) */}
        {rol !== 'CLIENTE' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-gray-600" />
                <h4 className="text-sm font-semibold text-gray-900">Módulos Autorizados</h4>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-primary-600">{modulosSeleccionados}</span> de{' '}
                {totalModulosDisponibles} seleccionados
              </div>
            </div>

            {rol === 'ADMIN' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-start space-x-3">
                <Zap className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-purple-900 mb-1">
                    Acceso Total Automático
                  </h4>
                  <p className="text-xs text-purple-700">
                    Los administradores tienen acceso a todos los módulos del sistema. La selección
                    está deshabilitada.
                  </p>
                </div>
              </div>
            )}

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {MODULOS_CATEGORIAS.map((categoria, catIndex) => {
                const CatIcon = categoria.icon;
                const modulosCategoria = categoria.modulos;
                const seleccionadosCategoria = modulosCategoria.filter((m) =>
                  (modulosAutorizados || []).includes(m.id)
                ).length;

                return (
                  <div
                    key={catIndex}
                    className={catIndex > 0 ? 'border-t border-gray-200' : ''}
                  >
                    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CatIcon className="w-4 h-4 text-gray-600" />
                        <h5 className="text-sm font-semibold text-gray-900">
                          {categoria.categoria}
                        </h5>
                      </div>
                      <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full border border-gray-200">
                        {seleccionadosCategoria}/{modulosCategoria.length}
                      </span>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {modulosCategoria.map((modulo) => (
                        <ModuloCheckbox
                          key={modulo.id}
                          modulo={modulo}
                          isChecked={(modulosAutorizados || []).includes(modulo.id)}
                          isDisabled={rol === 'ADMIN'}
                          onChange={() => toggleModulo(modulo.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {errors.modulos_autorizados && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.modulos_autorizados.message}
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Sección 3: Estado del Usuario */}
      <Card>
        <div className="flex items-center space-x-3 pb-4 mb-4 border-b border-gray-200">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Estado del Usuario</h3>
            <p className="text-sm text-gray-600">Control de acceso al sistema</p>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <input
            type="checkbox"
            id="activo"
            {...register('activo')}
            className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-0.5"
          />
          <div className="flex-1">
            <label htmlFor="activo" className="text-sm font-medium text-gray-900 cursor-pointer">
              Usuario Activo
            </label>
            <p className="text-xs text-gray-600 mt-1">
              {activo
                ? 'El usuario puede iniciar sesión y acceder al sistema'
                : 'El usuario no podrá iniciar sesión hasta que sea activado'}
            </p>
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
            disabled={isSubmitting}
            className="min-w-[160px]"
          >
            {isSubmitting
              ? 'Guardando...'
              : defaultValues
                ? 'Guardar Cambios'
                : 'Crear Usuario'}
          </Button>
        </div>
      </div>
    </form>
  );
};
