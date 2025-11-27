# CIES Gestión Integral

<div align="center">

Sistema de Gestión Integral para **CIES Seguros y Soluciones**

Administra comisiones ARL, clientes, aliados estratégicos, presupuestos y órdenes de servicio en una sola plataforma.

</div>

## 🚀 Tecnologías

- **Frontend:** React 19 + TypeScript + Vite
- **Backend:** Supabase (Auth + Database + Real-time)
- **Estilos:** Tailwind CSS
- **Estado:** TanStack Query (React Query)
- **Formularios:** React Hook Form + Zod
- **Routing:** React Router DOM v7
- **Iconos:** Lucide React
- **Gráficas:** Recharts

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta de Supabase (ya configurada)
- Git

## 🔧 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/CarlosGonzalez2025/CIES.git
cd CIES
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

El archivo `.env` ya contiene las credenciales de Supabase configuradas. Si necesitas cambiarlas:

```env
VITE_SUPABASE_URL=https://czszsegsoigpxtfyplsl.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anon_aqui
```

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:3000`

### 5. Construir para producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`

### 6. Vista previa de producción

```bash
npm run preview
```

## 📁 Estructura del Proyecto

```
CIES/
├── components/          # Componentes React organizados por módulo
│   ├── ui/             # Componentes UI reutilizables
│   ├── layout/         # Layout, Navbar, Sidebar, Footer
│   ├── dashboard/      # Componentes del dashboard
│   ├── clientes/       # Componentes de clientes
│   ├── aliados/        # Componentes de aliados
│   ├── comisiones/     # Componentes de comisiones
│   ├── presupuesto/    # Componentes de presupuesto
│   ├── ordenes/        # Componentes de órdenes de servicio
│   └── usuarios/       # Componentes de usuarios
├── pages/              # Páginas principales
├── hooks/              # Custom hooks (useAuth, useClientes, etc.)
├── services/           # Servicios de API y Supabase client
├── schemas/            # Esquemas de validación Zod
├── utils/              # Utilidades y helpers
├── types.ts            # Definiciones de tipos TypeScript
└── App.tsx             # Componente principal con routing
```

## 🔐 Autenticación y Roles

El sistema implementa autenticación con Supabase y control de acceso basado en roles:

- **ADMIN**: Acceso completo a todos los módulos
- **ANALISTA**: Puede crear y editar registros
- **CONSULTA**: Solo lectura

## 🌐 Módulos Disponibles

1. **Dashboard** - Vista general con KPIs y gráficas
2. **Clientes** - Gestión de clientes
3. **Aliados Estratégicos** - Gestión de proveedores y consultores
4. **Comisiones ARL** - Seguimiento de primas y comisiones de seguros
5. **Presupuestos** - Planificación y control presupuestario
6. **Órdenes de Servicio** - Gestión de órdenes de trabajo
7. **Usuarios** - Administración de usuarios y permisos

## 🚀 Despliegue

### Opciones de Despliegue

El proyecto puede desplegarse en cualquiera de estas plataformas:

**Vercel (Recomendado)**
```bash
npm install -g vercel
vercel
```

**Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Railway / Render / Fly.io**
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: Configurar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`

### Variables de Entorno en Producción

Asegúrate de configurar estas variables en tu plataforma de deployment:

```
VITE_SUPABASE_URL=https://czszsegsoigpxtfyplsl.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anon_aqui
```

## 📝 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa de la build de producción

## 🔒 Seguridad

- Las credenciales sensibles están en `.env` (no versionado en Git)
- Autenticación mediante Supabase Auth
- Row Level Security (RLS) configurado en Supabase
- Validación de datos con Zod

## 📄 Licencia

© 2025 CIES Seguros y Soluciones. Todos los derechos reservados.

## 🤝 Soporte

Para soporte técnico, contacta a: soporte@cies.com
