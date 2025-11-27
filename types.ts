
export interface Arl {
  id: number;
  nombre: string;
  created_at: string;
}

export interface Cliente {
  id: string;
  usuario: string;
  fecha: string;
  nombre_cliente: string;
  nit_documento: string;
  arl_id: number;
  arl?: Arl;
  nombre_contacto?: string;
  numero_contacto?: string;
  email_contacto?: string;
  valor_hora?: number;
  porcentaje_comision?: number;
  valor_comision?: number;
  valor_hora_mas_comision?: number;
  direccion?: string;
  created_at: string;
  updated_at: string;
}

export interface Aliado {
  id: string;
  usuario: string;
  fecha_registro: string;
  especialidad?: string;
  nit?: string;
  ciu?: string;
  actividad_economica?: string;
  aliado: string;
  contacto?: string;
  numero_telefonico?: string;
  direccion?: string;
  email?: string;
  hora_pbl?: number;
  hora_especializada?: number;
  tipo_cuenta?: string;
  banco?: string;
  numero_cuenta?: string;
  created_at: string;
  updated_at: string;
}

export interface Comision {
  id: string;
  usuario?: string;
  fecha?: string;
  arl_id: number;
  arl?: Arl;
  nit?: string;
  cliente_id: string;
  cliente?: Cliente;
  cobertura?: string;
  porcentaje_comision_arl?: number;
  porcentaje_comision_impuesto?: number;
  valor_comision_emitida_2024?: number;
  valor_prima_emitida?: number;
  valor_comision_emitida?: number;
  valor_inversion?: number;
  porcentaje_inversion?: number;
  created_at: string;
  updated_at: string;
}

export interface PrimasComision {
  id: string;
  comision_id: string;
  usuario?: string;
  fecha?: string;
  nit?: string;
  cliente_id: string;
  porcentaje_comision_impuesto?: number;
  mes: string;
  prima?: number;
  comision?: number;
  created_at: string;
}

export interface Presupuesto {
  id: string;
  usuario?: string;
  cliente_id: string;
  cliente?: Cliente;
  nit?: string;
  comision?: number;
  porcentaje_inversion_anio?: number;
  inversion_ejecutar?: number;
  actividad_programada?: number;
  horas_unidades?: number;
  costo_hora_unidad?: number;
  valor_total_ejecutar?: number;
  valor_ejecutado?: number;
  total_fecha?: number;
  saldo_pendiente_ejecutar?: number;
  porcentaje_ejecucion?: number;
  estado_actividad?: string;
  mes_ejecucion?: string;
  aliado_id?: string;
  aliado?: Aliado;
  created_at: string;
  updated_at: string;
}

export interface OrdenServicio {
  id: number;
  presupuesto_id?: string;
  presupuesto?: Presupuesto;
  usuario?: string;
  os_numero: string;
  fecha_envio?: string;
  nit?: string;
  empresa_id: string;
  cliente?: Cliente;
  aliado_id: string;
  aliado?: Aliado;
  especialidad?: string;
  categoria_servicio?: string;
  servicio_contratado?: string;
  programa?: string;
  unidad?: number;
  costo_hora?: number;
  total?: number;
  numero_factura?: string;
  fecha_radicacion?: string;
  estado_actividad?: string;
  horas_ejecutadas?: number;
  admon?: number;
  costo_hora_mas_admon?: number;
  inversion_proyectada?: number;
  total_ejecutado?: number;
  cancelado?: boolean;
  porcentaje_ejecucion_horas?: number;
  porcentaje_ejecucion_valor?: number;
  nombre_contacto?: string;
  telefono?: string;
  email?: string;
  direccion_cliente?: string;
  correo_aliado?: string;
  estado_correo?: string;
  created_at: string;
  updated_at: string;
}

export interface PerfilUsuario {
  id: string;
  email: string;
  nombre?: string;
  rol: 'ADMIN' | 'ANALISTA' | 'CONSULTA' | 'CLIENTE';
  modulos_autorizados: string[]; // Array of module paths/keys
  activo: boolean;
  cliente_id?: string; // ID del cliente asociado (solo para rol CLIENTE)
  created_at: string;
}