# Supabase Setup Guide - CIES

Esta guía te ayudará a configurar la base de datos de Supabase para la aplicación CIES.

## 📋 Pre-requisitos

- Cuenta en [Supabase](https://supabase.com)
- Proyecto de Supabase creado
- Acceso al SQL Editor en Supabase

## 🗄️ Estructura de Base de Datos

### Tablas Principales

#### 1. `arls` - Administradoras de Riesgos Laborales

```sql
CREATE TABLE arls (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Datos iniciales
INSERT INTO arls (nombre) VALUES 
  ('Sura'),
  ('Positiva'),
  ('Colmena'),
  ('Liberty'),
  ('Bolivar'),
  ('Equidad'),
  ('AXA Colpatria');
```

#### 2. `clientes` - Gestión de Clientes

```sql
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario VARCHAR(255),
  fecha DATE NOT NULL,
  nombre_cliente VARCHAR(255) NOT NULL,
  nit_documento VARCHAR(50) NOT NULL UNIQUE,
  arl_id BIGINT REFERENCES arls(id),
  nombre_contacto VARCHAR(255),
  numero_contacto VARCHAR(50),
  email_contacto VARCHAR(255),
  valor_hora DECIMAL(15,2),
  porcentaje_comision DECIMAL(5,4),
  valor_comision DECIMAL(15,2),
  valor_hora_mas_comision DECIMAL(15,2),
  direccion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_clientes_nit ON clientes(nit_documento);
CREATE INDEX idx_clientes_arl ON clientes(arl_id);
```

#### 3. `aliados` - Proveedores de Servicios

```sql
CREATE TABLE aliados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario VARCHAR(255),
  fecha_registro DATE NOT NULL,
  especialidad VARCHAR(255),
  nit VARCHAR(50),
  ciu VARCHAR(50),
  actividad_economica VARCHAR(255),
  aliado VARCHAR(255) NOT NULL,
  contacto VARCHAR(255),
  numero_telefonico VARCHAR(50),
  direccion TEXT,
  email VARCHAR(255),
  hora_pbl DECIMAL(15,2),
  hora_especializada DECIMAL(15,2),
  tipo_cuenta VARCHAR(50),
  banco VARCHAR(100),
  numero_cuenta VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. `comisiones` - Control de Comisiones ARL

```sql
CREATE TABLE comisiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario VARCHAR(255),
  fecha DATE,
  arl_id BIGINT REFERENCES arls(id),
  nit VARCHAR(50),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  cobertura VARCHAR(50),
  porcentaje_comision_arl DECIMAL(5,4),
  porcentaje_comision_impuesto DECIMAL(5,4),
  valor_comision_emitida_2024 DECIMAL(15,2),
  valor_prima_emitida DECIMAL(15,2),
  valor_comision_emitida DECIMAL(15,2),
  valor_inversion DECIMAL(15,2),
  porcentaje_inversion DECIMAL(5,4),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_comisiones_cliente ON comisiones(cliente_id);
CREATE INDEX idx_comisiones_arl ON comisiones(arl_id);
```

#### 5. `primas_comision` - Desglose Mensual de Primas

```sql
CREATE TABLE primas_comision (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comision_id UUID REFERENCES comisiones(id) ON DELETE CASCADE,
  usuario VARCHAR(255),
  fecha DATE,
  nit VARCHAR(50),
  cliente_id UUID REFERENCES clientes(id),
  porcentaje_comision_impuesto DECIMAL(5,4),
  mes VARCHAR(20) NOT NULL,
  prima DECIMAL(15,2) DEFAULT 0,
  comision DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice
CREATE INDEX idx_primas_comision ON primas_comision(comision_id);
```

#### 6. `presupuestos` - Gestión de Presupuestos

```sql
CREATE TABLE presupuestos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario VARCHAR(255),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  nit VARCHAR(50),
  comision DECIMAL(15,2),
  porcentaje_inversion_anio DECIMAL(5,4),
  inversion_ejecutar DECIMAL(15,2),
  actividad_programada DECIMAL(15,2),
  horas_unidades DECIMAL(10,2),
  costo_hora_unidad DECIMAL(15,2),
  valor_total_ejecutar DECIMAL(15,2),
  valor_ejecutado DECIMAL(15,2),
  total_fecha DECIMAL(15,2),
  saldo_pendiente_ejecutar DECIMAL(15,2),
  porcentaje_ejecucion DECIMAL(5,4),
  estado_actividad VARCHAR(50) DEFAULT 'PENDIENTE',
  mes_ejecucion VARCHAR(20),
  aliado_id UUID REFERENCES aliados(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_presupuestos_cliente ON presupuestos(cliente_id);
CREATE INDEX idx_presupuestos_estado ON presupuestos(estado_actividad);
```

#### 7. `ordenes_servicio` - Órdenes de Trabajo

```sql
CREATE TABLE ordenes_servicio (
  id BIGSERIAL PRIMARY KEY,
  presupuesto_id UUID REFERENCES presupuestos(id),
  usuario VARCHAR(255),
  os_numero VARCHAR(100) NOT NULL UNIQUE,
  fecha_envio DATE,
  nit VARCHAR(50),
  empresa_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  aliado_id UUID REFERENCES aliados(id),
  especialidad VARCHAR(255),
  categoria_servicio VARCHAR(255),
  servicio_contratado TEXT NOT NULL,
  programa VARCHAR(255),
  unidad DECIMAL(10,2),
  costo_hora DECIMAL(15,2),
  total DECIMAL(15,2),
  numero_factura VARCHAR(100),
  fecha_radicacion DATE,
  estado_actividad VARCHAR(50) DEFAULT 'PENDIENTE',
  horas_ejecutadas DECIMAL(10,2),
  admon DECIMAL(15,2),
  costo_hora_mas_admon DECIMAL(15,2),
  inversion_proyectada DECIMAL(15,2),
  total_ejecutado DECIMAL(15,2),
  cancelado BOOLEAN DEFAULT FALSE,
  porcentaje_ejecucion_horas DECIMAL(5,4),
  porcentaje_ejecucion_valor DECIMAL(5,4),
  nombre_contacto VARCHAR(255),
  telefono VARCHAR(50),
  email VARCHAR(255),
  direccion_cliente TEXT,
  correo_aliado VARCHAR(255),
  estado_correo VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_ordenes_empresa ON ordenes_servicio(empresa_id);
CREATE INDEX idx_ordenes_aliado ON ordenes_servicio(aliado_id);
CREATE INDEX idx_ordenes_estado ON ordenes_servicio(estado_actividad);
CREATE INDEX idx_ordenes_numero ON ordenes_servicio(os_numero);
```

#### 8. `perfiles_usuario` - Gestión de Usuarios y Permisos

```sql
CREATE TABLE perfiles_usuario (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  nombre VARCHAR(255),
  rol VARCHAR(20) NOT NULL DEFAULT 'CONSULTA' CHECK (rol IN ('ADMIN', 'ANALISTA', 'CONSULTA', 'CLIENTE')),
  modulos_autorizados TEXT[] DEFAULT '{}',
  activo BOOLEAN DEFAULT TRUE,
  cliente_id UUID REFERENCES clientes(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice
CREATE INDEX idx_perfiles_email ON perfiles_usuario(email);
```

## 🔒 Row Level Security (RLS)

### Habilitar RLS en Todas las Tablas

```sql
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE aliados ENABLE ROW LEVEL SECURITY;
ALTER TABLE comisiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE primas_comision ENABLE ROW LEVEL SECURITY;
ALTER TABLE presupuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_servicio ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles_usuario ENABLE ROW LEVEL SECURITY;
-- ARLs es tabla de catálogo, no requiere RLS
```

### Políticas RLS

#### Perfiles de Usuario - Acceso Total para Usuarios Autenticados

```sql
CREATE POLICY "Usuarios autenticados pueden ver perfiles"
  ON perfiles_usuario FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON perfiles_usuario FOR UPDATE
  USING (auth.uid() = id);
```

#### Clientes - Control por Rol

```sql
CREATE POLICY "Ver clientes - todos los roles"
  ON clientes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Insertar clientes - admin y analista"
  ON clientes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM perfiles_usuario
      WHERE id = auth.uid() AND rol IN ('ADMIN', 'ANALISTA')
    )
  );

CREATE POLICY "Actualizar clientes - admin y analista"
  ON clientes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM perfiles_usuario
      WHERE id = auth.uid() AND rol IN ('ADMIN', 'ANALISTA')
    )
  );

CREATE POLICY "Eliminar clientes - solo admin"
  ON clientes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM perfiles_usuario
      WHERE id = auth.uid() AND rol = 'ADMIN'
    )
  );
```

#### Políticas Similares para Otras Tablas

Replica el patrón anterior (SELECT para todos, INSERT/UPDATE para ADMIN y ANALISTA, DELETE solo para ADMIN) para:
- `aliados`
- `comisiones`
- `primas_comision`
- `presupuestos`
- `ordenes_servicio`

## 🔄 Triggers Automáticos

### Actualizar `updated_at` Automáticamente

```sql
-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a todas las tablas relevantes
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aliados_updated_at BEFORE UPDATE ON aliados
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comisiones_updated_at BEFORE UPDATE ON comisiones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presupuestos_updated_at BEFORE UPDATE ON presupuestos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ordenes_updated_at BEFORE UPDATE ON ordenes_servicio
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 👤 Configuración de Autenticación

### 1. Habilitar Email/Password Auth

1. Ve a **Authentication** → **Providers**
2. Asegúrate de que **Email** esté habilitado
3. Configura las preferencias de confirmación de email según necesidades

### 2. Crear Usuario Administrador Inicial

```sql
-- Después de registrar el usuario via UI, actualiza su perfil
INSERT INTO perfiles_usuario (id, email, nombre, rol, modulos_autorizados, activo)
VALUES (
  'user-uuid-from-auth-users', -- Reemplazar con UUID real del auth.users
  'admin@cies.com',
  'Administrador',
  'ADMIN',
  ARRAY['*'], -- Acceso a todos los módulos
  TRUE
);
```

## ✅ Verificación de Configuración

Ejecuta estas queries para verificar que todo esté correcto:

```sql
-- 1. Verificar que existen ARLs
SELECT * FROM arls;

-- 2. Verificar RLS habilitado
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = TRUE;

-- 3. Verificar políticas RLS
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';

-- 4. Verificar triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

## 🔗 Conectar con la Aplicación

Una vez configurada la base de datos:

1. Copia tu **Project URL** desde Settings → API
2. Copia tu **anon public** key desde Settings → API
3. Añádelos a tu `.env`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

## 📚 Recursos Adicionales

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Functions](https://supabase.com/docs/guides/database/functions)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

¿Necesitas ayuda? Contacta a soporte@cies.com
