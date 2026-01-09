# CIES - Control Integral de Empresas y Servicios

Sistema de gestión integral para administrar el ciclo completo de relaciones con clientes, comisiones ARL, presupuestos y órdenes de servicio.

![CIES Logo](https://i.postimg.cc/dV5QBqw5/CIES-07.png)

## 🚀 Características Principales

- **Gestión de Clientes**: Administración completa de clientes con ARLs asociadas
- **Control de Comisiones**: Seguimiento de primas y comisiones de seguros ARL
- **Presupuestos**: Gestión de presupuestos por cliente con cálculo automático
- **Órdenes de Servicio**: Control total de órdenes de trabajo y ejecución
- **Aliados**: Gestión de proveedores y tarifas
- **Reportes**: Análisis y visualización de datos con gráficos interactivos
- **Autenticación Segura**: Sistema de login con Supabase Auth
- **Dashboard Interactivo**: Métricas y KPIs en tiempo real

## 🛠️ Stack Tecnológico

### Frontend
- **React 19** - Library de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **React Router** - Navegación
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de schemas
- **TailwindCSS** - Estilos (via CDN)
- **Lucide React** - Iconos
- **Recharts** - Gráficos y visualizaciones

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Row Level Security (RLS)
  - Real-time subscriptions

### Estado y Datos
- **TanStack Query (React Query)** - Server state management
- **React Query Devtools** - Debugging

### Exportación
- **jsPDF** - Generación de PDFs
- **XLSX** - Exportación a Excel

## 📋 Requisitos Previos

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0 (o yarn/pnpm equivalente)
- **Cuenta de Supabase**: Para base de datos y autenticación

## 🔧 Instalación Local

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd CIES
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basado en `.env.example`:

```bash
cp .env.example .env
```

Edita `.env` y añade tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

#### ¿Dónde obtener las credenciales de Supabase?

1. Ve a [supabase.com](https://supabase.com)
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a **Settings** → **API**
4. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### 4. Configurar Base de Datos Supabase

Consulta [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) para instrucciones detalladas sobre:
- Creación de tablas
- Configuración de RLS (Row Level Security)
- Triggers y funciones
- Seed data inicial

### 5. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📦 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo con HMR |
| `npm run build` | Genera build de producción en `dist/` |
| `npm run preview` | Preview del build de producción localmente |

## 🚢 Despliegue en Vercel

### Opción 1: Deploy con GitHub (Recomendado)

1. **Sube el código a GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <tu-repo-url>
   git push -u origin main
   ```

2. **Conecta con Vercel**:
   - Ve a [vercel.com](https://vercel.com)
   - Click en **"New Project"**
   - Importa tu repositorio de GitHub
   - Vercel detectará automáti camente que es un proyecto Vite

3. **Configurar Variables de Entorno**:
   - En la página de configuración del proyecto en Vercel
   - Ve a **Settings** → **Environment Variables**
   - Añade:
     - `VITE_SUPABASE_URL`: Tu URL de Supabase
     - `VITE_SUPABASE_ANON_KEY`: Tu anon key de Supabase

4. **Deploy**:
   - Click en **"Deploy"**
   - Espera a que termine el build (~1-2 minutos)
   - Tu aplicación estará en `https://tu-proyecto.vercel.app`

### Opción 2: Deploy con Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

Sigue las instrucciones interactivas y añade las variables de entorno cuando se te solicite.

## 🔐 Configuración de Seguridad

### Supabase Row Level Security (RLS)

Asegúrate de que todas las tablas tengan RLS habilitado. Ver [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) para políticas recomendadas.

### Variables de Entorno en Producción

**NUNCA** commitees el archivo `.env` al repositorio. El archivo `.gitignore` ya está configurado para excluirlo.

## 📝 Uso de la Aplicación

### Roles de Usuario

El sistema soporta 4 roles:

- **ADMIN**: Acceso total al sistema
- **ANALISTA**: Puede crear y editar datos
- **CONSULTA**: Solo lectura
- **CLIENTE**: Acceso limitado a sus propios datos

### Flujo de Trabajo Típico

1. **Registrar Clientes**: Añade clientes con su NIT y ARL asociada
2. **Crear Comisiones**: Registra primas y comisiones de ARL
3. **Generar Presupuestos**: El sistema calcula automáticamente basado en comisiones
4. **Emitir Órdenes de Servicio**: Descuenta del presupuesto disponible
5. **Seguimiento**: Monitorea ejecución en el dashboard y reportes

## 🐛 Troubleshooting

### Error: "Missing Supabase configuration"

**Causa**: Variables de entorno no configuradas

**Solución**:
```bash
# Verifica que .env existe y tiene las variables correctas
cat .env

# Si no existe, créalo desde el ejemplo
cp .env.example .env
# Edita .env y añade tus credenciales
```

### Build falla en Vercel

**Causa**: Variables de entorno no configuradas en Vercel

**Solución**:
1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
4. Redeploy desde Deployments → ... → Redeploy

### Errores de TypeScript en dev

**Causa**: Errores menores que no bloquean el build

**Solución**: El build de producción es exitoso. Los errores de ErrorBoundary son falsos positivos que no afectan funcionalidad.

## 📚 Documentación Adicional

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Configuración detallada de base de datos
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guía paso a paso de despliegue

## 🤝 Contribución

Pull requests son bienvenidos. Para cambios mayores, abre un issue primero para discutir los cambios propuestos.

## 📄 Licencia

Este proyecto es privado y propiedad de CIES Seguros y Soluciones.

## 📧 Contacto

- **Soporte**: soporte@cies.com
- **Website**: [En construcción]

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2026  
**Estado**: ✅ Listo para Producción
