# 🏥 Diagnóstico del Sistema CIES - Supabase

## 📋 Resumen Ejecutivo

Este documento detalla el sistema de diagnóstico implementado para verificar la conexión con Supabase y garantizar el correcto funcionamiento de todas las operaciones del sistema CIES.

## ✅ Estado Actual del Sistema

### Arquitectura Verificada

#### 1. **Configuración de Supabase**
- ✅ Cliente de Supabase correctamente configurado en `services/supabaseClient.ts`
- ✅ Variables de entorno requeridas:
  - `VITE_SUPABASE_URL`: URL del proyecto de Supabase
  - `VITE_SUPABASE_ANON_KEY`: Clave anónima de Supabase
- ✅ Configuración de autenticación:
  - `autoRefreshToken: true` - Refresco automático de tokens
  - `persistSession: true` - Persistencia de sesión
  - `detectSessionInUrl: true` - Detección de sesión en URL

#### 2. **Estructura de Base de Datos**
El sistema utiliza las siguientes tablas principales:

| Tabla | Descripción | Estado |
|-------|-------------|--------|
| `perfiles` | Perfiles de usuarios del sistema | ✅ Verificada |
| `clientes` | Información de clientes | ✅ Verificada |
| `aliados` | Información de aliados comerciales | ✅ Verificada |
| `arl` | Listado de ARL | ✅ Verificada |
| `comisiones` | Comisiones de ARL | ✅ Verificada |
| `primas_comision` | Primas y comisiones mensuales | ✅ Verificada |
| `presupuesto` | Presupuestos de inversión | ✅ Verificada |
| `ordenes_servicio` | Órdenes de servicio | ✅ Verificada |

#### 3. **Sistema de Autenticación**
- ✅ Autenticación con email y contraseña
- ✅ Gestión de sesiones con manejo de errores de refresh token
- ✅ Perfiles de usuario con roles: `ADMIN`, `ANALISTA`, `CONSULTA`, `CLIENTE`
- ✅ Sistema de permisos por módulo
- ✅ Logout seguro con limpieza de estado

#### 4. **APIs Implementadas**
Todas las APIs siguen el patrón CRUD completo:

##### **usuariosApi** (`services/api/usuariosApi.ts`)
- `getAll()`: Obtener todos los usuarios
- `getById(id)`: Obtener usuario por ID
- `createPerfil(perfil)`: Crear nuevo usuario con autenticación
- `update(id, updates)`: Actualizar perfil de usuario
- `delete(id)`: Eliminar perfil de usuario

**Características especiales:**
- Manejo de creación de usuario en `auth.users` y tabla `perfiles`
- Manejo de conflictos cuando el trigger de Supabase ya creó el perfil
- Sincronización automática entre auth y perfiles

##### **clientesApi** (`services/api/clientesApi.ts`)
- `getAll()`: Obtener todos los clientes con información de ARL
- `getById(id)`: Obtener cliente por ID
- `create(cliente)`: Crear nuevo cliente
- `createMany(clientes)`: Crear múltiples clientes (importación masiva)
- `update(id, updates)`: Actualizar cliente
- `delete(id)`: Eliminar cliente

##### **aliadosApi** (`services/api/aliadosApi.ts`)
- Operaciones CRUD completas para aliados comerciales

##### **presupuestoApi** (`services/api/presupuestoApi.ts`)
- Operaciones CRUD completas
- `updateEjecucion(id)`: Método especial para actualizar estado de ejecución basado en órdenes de servicio

## 🔧 Herramienta de Diagnóstico

### Acceso a la Herramienta

La herramienta de diagnóstico está disponible en dos ubicaciones:

1. **Ruta directa**: `http://localhost:5173/diagnostico` (o URL de producción)
2. **Desde Configuración**:
   - Ir a `Configuración` (menú lateral)
   - Click en "Diagnóstico Sistema" (solo para usuarios ADMIN)
   - Click en "Ir a Diagnóstico Completo"

### Pruebas Realizadas

La herramienta ejecuta las siguientes pruebas automáticas:

#### 1. **Prueba de Conexión**
- Verifica que el cliente de Supabase esté correctamente inicializado
- Valida las variables de entorno
- Comprueba la conectividad con el servidor de Supabase

#### 2. **Verificación de Tablas**
- Accede a cada tabla del sistema
- Verifica permisos de lectura
- Cuenta registros disponibles
- Detecta errores de RLS (Row Level Security)

#### 3. **Pruebas de Autenticación**
- Obtiene la sesión actual
- Verifica el estado del usuario autenticado
- Carga el perfil del usuario desde la tabla `perfiles`
- Valida roles y permisos

#### 4. **Pruebas de Operaciones CRUD**
- Ejecuta operaciones de lectura (SELECT)
- Verifica el funcionamiento de las APIs
- **Nota**: No ejecuta operaciones de escritura para evitar modificar datos reales

#### 5. **Verificación de APIs**
- Prueba `clientesApi.getAll()`
- Prueba `aliadosApi.getAll()`
- Prueba `usuariosApi.getAll()`
- Verifica que todas las APIs respondan correctamente

### Interpretación de Resultados

Los resultados se muestran con tres estados:

- ✅ **SUCCESS** (Verde): La prueba pasó exitosamente
- ⚠️ **WARNING** (Amarillo): La prueba encontró algo que revisar, pero no es crítico
- ❌ **ERROR** (Rojo): La prueba falló y requiere atención inmediata

## 🚨 Problemas Comunes y Soluciones

### Error: "Missing Supabase configuration"
**Causa**: No se encontraron las variables de entorno

**Solución**:
1. Verificar que exista un archivo `.env` en la raíz del proyecto
2. Asegurarse de que contenga:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_clave_anon_key
   ```
3. Reiniciar el servidor de desarrollo después de agregar el archivo

### Error: "Could not connect to Supabase"
**Causa**: Problema de red o credenciales incorrectas

**Solución**:
1. Verificar la URL del proyecto en Supabase Dashboard
2. Verificar que la clave anónima sea correcta
3. Comprobar la conexión a internet
4. Verificar que el proyecto de Supabase esté activo

### Error: "Table not found" o "Permission denied"
**Causa**: Políticas RLS mal configuradas o tabla inexistente

**Solución**:
1. Ir a Supabase Dashboard → Table Editor
2. Verificar que la tabla exista
3. Ir a Authentication → Policies
4. Asegurarse de que existan políticas para:
   - SELECT
   - INSERT
   - UPDATE
   - DELETE
5. Verificar que las políticas permitan el acceso según el rol del usuario

### Error al crear usuarios: "Profile already exists"
**Causa**: El trigger de Supabase creó automáticamente un perfil básico

**Solución**:
- La API ya maneja este caso automáticamente
- Si persiste el error, verificar el trigger `on_auth_user_created` en Supabase

### Error: "Session refresh failed"
**Causa**: Token de sesión expirado o inválido

**Solución**:
- El sistema limpia automáticamente sesiones inválidas
- El usuario será redirigido al login
- Volver a iniciar sesión resolverá el problema

## 🔐 Seguridad y Mejores Prácticas

### Variables de Entorno
- ✅ Las credenciales se cargan desde variables de entorno
- ✅ No hay credenciales hardcodeadas en el código
- ⚠️ El archivo `.env` debe estar en `.gitignore`

### Row Level Security (RLS)
El sistema asume que Supabase tiene políticas RLS configuradas para:
- Proteger datos sensibles por rol de usuario
- Limitar acceso a registros basado en `cliente_id` para usuarios tipo CLIENTE
- Permitir acceso completo para usuarios ADMIN

### Autenticación
- ✅ Manejo seguro de tokens con refresh automático
- ✅ Limpieza de sesiones inválidas
- ✅ Redirección automática a login cuando no hay sesión
- ✅ Persistencia de sesión entre recargas de página

## 📊 Recomendaciones de Mantenimiento

### Diario
- Monitorear logs de errores en la consola del navegador
- Verificar que los usuarios puedan iniciar sesión correctamente

### Semanal
- Ejecutar el diagnóstico completo desde la interfaz
- Revisar cualquier advertencia o error reportado
- Verificar que todas las operaciones CRUD funcionen

### Mensual
- Revisar políticas RLS en Supabase Dashboard
- Verificar uso de base de datos y límites
- Actualizar dependencias si hay actualizaciones de seguridad
- Revisar y limpiar registros antiguos si es necesario

### Antes de Despliegues
- Ejecutar `npm run build` para verificar que no hay errores de compilación
- Ejecutar el diagnóstico completo
- Verificar que todas las pruebas pasen (verde)
- Hacer backup de la base de datos

## 🛠️ Archivos Clave del Sistema

| Archivo | Propósito | Crítico |
|---------|-----------|---------|
| `services/supabaseClient.ts` | Configuración del cliente Supabase | ⭐⭐⭐ |
| `hooks/useAuth.tsx` | Lógica de autenticación | ⭐⭐⭐ |
| `services/api/*.ts` | APIs de cada módulo | ⭐⭐⭐ |
| `pages/DiagnosticoPage.tsx` | Interfaz de diagnóstico | ⭐⭐ |
| `diagnostico-supabase.ts` | Script de diagnóstico standalone | ⭐⭐ |
| `.env` | Variables de entorno | ⭐⭐⭐ |

## 📞 Soporte

Si después de ejecutar el diagnóstico y seguir las recomendaciones aún experimentas problemas:

1. Exportar los resultados del diagnóstico (JSON)
2. Capturar capturas de pantalla de los errores
3. Revisar la consola del navegador (F12) para errores adicionales
4. Contactar al equipo de desarrollo con:
   - Resultados del diagnóstico
   - Capturas de pantalla
   - Logs de la consola
   - Descripción detallada del problema

## 📈 Próximas Mejoras

- [ ] Exportación de resultados del diagnóstico en PDF
- [ ] Historial de diagnósticos ejecutados
- [ ] Alertas automáticas cuando se detectan problemas
- [ ] Dashboard de salud del sistema en tiempo real
- [ ] Pruebas de escritura en ambiente de staging
- [ ] Monitoreo de rendimiento de queries

---

**Última actualización**: Enero 2026
**Versión del sistema**: 1.0.0
**Desarrollado por**: DateNova - Soluciones de Software Empresarial
