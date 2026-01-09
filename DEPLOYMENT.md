# CIES - Guía de Despliegue

Guía paso a paso para desplegar la aplicación CIES en Vercel con base de datos Supabase.

## 📋 Lista de Verificación Pre-Despliegue

Antes de desplegar, asegúrate de tener:

- [ ] Código en un repositorio Git (GitHub, GitLab, o Bitbucket)
- [ ] Proyecto de Supabase configurado (ver [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
- [ ] Build local exitoso (`npm run build`)
- [ ] Variables de entorno documentadas
- [ ] Cuenta en Vercel

## 🚀 Opción 1: Despliegue vía GitHub + Vercel (Recomendado)

### Paso 1: Subir Código a GitHub

```bash
# Si aún no has inicializado git
git init

# Añadir todos los archivos
git add .

# Crear primer commit
git commit -m "Initial commit - CIES application"

# Crear rama main
git branch -M main

# Añadir repositorio remoto (reemplazar con tu URL)
git remote add origin https://github.com/tu-usuario/cies.git

# Subir código
git push -u origin main
```

### Paso 2: Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) y haz login
2. Click en **"New Project"**
3. Click en **"Import Git Repository"**
4. Selecciona tu repositorio de GitHub
5. Autoriza el acceso si es necesario

### Paso 3: Configurar Proyecto en Vercel

Vercel detectará automáticamente que es un proyecto Vite. Verifica la configuración:

**Framework Preset**: Vite  
**Build Command**: `npm run build`  
**Output Directory**: `dist`  
**Install Command**: `npm install`

### Paso 4: Configurar Variables de Entorno

En la pantalla de configuración, antes de hacer deploy:

1. Expande la sección **"Environment Variables"**
2. Añade las siguientes variables:

| Variable | Valor | Tipo |
|----------|-------|------|
| `VITE_SUPABASE_URL` | `https://tu-proyecto.supabase.co` | Plain Text |
| `VITE_SUPABASE_ANON_KEY` | `tu_anon_key` | Secret |

**Importante**: Marca `VITE_SUPABASE_ANON_KEY` como **Secret** para mayor seguridad.

### Paso 5: Desplegar

1. Click en **"Deploy"**
2. Espera 1-2 minutos mientras Vercel:
   - Instala dependencias
   - Ejecuta el build
   - Despliega a CDN global
3. ¡Listo! Tu aplicación estará en `https://tu-proyecto.vercel.app`

### Paso 6: Configurar Dominio Personalizado (Opcional)

1. En tu proyecto en Vercel, ve a **Settings** → **Domains**
2. Click en **"Add Domain"**
3. Ingresa tu dominio (ej: `cies.tuempresa.com`)
4. Sigue las instrucciones para configurar DNS

## 🔧 Opción 2: Despliegue con Vercel CLI

### Instalación de Vercel CLI

```bash
npm install -g vercel
```

### Login en Vercel

```bash
vercel login
```

Sigue las instrucciones en la terminal.

### Desplegar

```bash
# Desde la raíz del proyecto
vercel

# Sigue las prompts:
# - Set up and deploy? Yes
# - Which scope? (selecciona tu cuenta)
# - Link to existing project? No
# - What's your project's name? cies
# - In which directory is your code located? ./
# - Want to override the settings? No
```

### Configurar Variables de Entorno

```bash
# Añadir variables una por una
vercel env add VITE_SUPABASE_URL
# Ingresa el valor cuando se solicite

vercel env add VITE_SUPABASE_ANON_KEY
# Ingresa el valor cuando se solicite
# Selecciona "Secret" cuando se pregunte por el tipo
```

### Redesplegar con Variables

```bash
vercel --prod
```

## 🔄 Actualizaciones Continuas

### Despliegue Automático con GitHub

Una vez conectado con GitHub, Vercel desplegará automáticamente:

- **Production**: Cada push a la rama `main`
- **Preview**: Cada pull request

### Despliegue Manual

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

## 🔍 Monitoreo y Logs

### Ver Logs en Vercel

1. Ve a tu proyecto en Vercel
2. Selecciona tu deployment
3. Click en **"Logs"**
4. Filtra por:
   - Build Logs
   - Runtime Logs
   - Edge Network Logs

### Verificar Funcionamiento

Después del despliegue:

1. **Login**: Prueba hacer login con un usuario válido
2. **Datos**: Verifica que los datos se cargan correctamente
3. **Navegación**: Prueba todas las rutas principales
4. **Formularios**: Crea un registro de prueba
5. **Reportes**: Verifica que los gráficos se renderizan

## ⚙️ Configuración Avanzada

### Headers de Seguridad

Crea `vercel.json` en la raíz si no existe:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Cache Control

Optimiza el cache de assets estáticos agregando a `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## 🐛 Troubleshooting

### Build Falla

**Error**: `Command "npm run build" exited with 1`

**Solución**:
1. Verifica que `npm run build` funciona localmente
2. Revisa los Build Logs en Vercel
3. Asegúrate de que las variables de entorno estén configuradas

### Página Blanca Después del Deploy

**Posibles Causas**:
1. Variables de en torno faltantes
2. Errores de JavaScript no capturados
3. Rutas mal configuradas

**Solución**:
1. Abre las DevTools del navegador (F12)
2. Revisa la consola por errores
3. Verifica Network tab por requests fallidos
4. Revisa los Runtime Logs en Vercel

### Error 404 en Rutas

**Causa**: SPA routing no configurado correctamente

**Solución**: Verifica que `vercel.json` incluye:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Supabase No Conecta

**Síntomas**: Login falla, datos no cargan

**Solución**:
1. Verifica variables de entorno en Vercel
2. Confirma que las credenciales de Supabase son correctas
3. Revisa que RLS está configurado en Supabase
4. Verifica en Supabase Dashboard → Logs

## 📊 Performance

### Análisis de Rendimiento

Vercel Analytics están incluidos gratuitamente:

1. Ve a tu proyecto → **Analytics**
2. Revisa:
   - Core Web Vitals
   - Top Pages
   - Top Referrers
   - Real User Monitoring

### Mejoras de Performance

Si el sitio es lento:

1. **Code Splitting**: Implementar lazy loading
2. **Image Optimization**: Usar Image CDN
3. **Bundle Analysis**: Ejecutar `npm run build -- --analyze`
4. **Lighthouse**: Correr auditoría en DevTools

## 🔒 Seguridad

### Checklist de Seguridad

- [ ] Variables sensibles marcadas como "Secret"
- [ ] RLS habilitado en todas las tablas de Supabase
- [ ] HTTPS automático (manejado por Vercel)
- [ ] Headers de seguridad configurados
- [ ] Auth tokens seguros (manejado por Supabase)

### Monitoreo de Seguridad

Vercel incluye:
- DDoS protection
- SSL/TLS automático
- Edge network caching
- Firewall configurado

## 📞 Soporte

### Recursos Oficiales

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
- [Supabase Guides](https://supabase.com/docs)

### Soporte CIES

- **Email**: soporte@cies.com
- **Documentación**: Ver README.md y SUPABASE_SETUP.md

---

**Última Actualización**: Enero 2026  
**Versión**: 1.0.0  
**Estado**: Documentación Completa
