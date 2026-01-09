/**
 * Script de Diagnóstico de Conexión con Supabase
 *
 * Este script verifica:
 * 1. Conexión con Supabase
 * 2. Estructura de tablas
 * 3. Permisos y políticas RLS
 * 4. Operaciones CRUD básicas
 */

import { supabase } from './services/supabaseClient';

interface DiagnosticResult {
  category: string;
  test: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
  message: string;
  details?: any;
}

const results: DiagnosticResult[] = [];

function log(result: DiagnosticResult) {
  results.push(result);
  const icon = result.status === 'SUCCESS' ? '✓' : result.status === 'WARNING' ? '⚠' : '✗';
  console.log(`${icon} [${result.category}] ${result.test}: ${result.message}`);
  if (result.details) {
    console.log('  Detalles:', result.details);
  }
}

async function testConnection() {
  console.log('\n=== 1. PRUEBA DE CONEXIÓN ===\n');

  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      log({
        category: 'CONEXIÓN',
        test: 'Conexión a Supabase',
        status: 'ERROR',
        message: `Error de conexión: ${error.message}`,
        details: error
      });
      return false;
    }

    log({
      category: 'CONEXIÓN',
      test: 'Conexión a Supabase',
      status: 'SUCCESS',
      message: 'Conexión establecida correctamente',
      details: { hasSession: !!data.session }
    });

    return true;
  } catch (error: any) {
    log({
      category: 'CONEXIÓN',
      test: 'Conexión a Supabase',
      status: 'ERROR',
      message: `Excepción: ${error.message}`,
      details: error
    });
    return false;
  }
}

async function testTables() {
  console.log('\n=== 2. VERIFICACIÓN DE TABLAS ===\n');

  const tables = [
    'perfiles',
    'clientes',
    'aliados',
    'arl',
    'comisiones',
    'primas_comision',
    'presupuesto',
    'ordenes_servicio'
  ];

  for (const table of tables) {
    try {
      // Intentar hacer un select con limit 1 para verificar acceso a la tabla
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: false })
        .limit(1);

      if (error) {
        log({
          category: 'TABLAS',
          test: `Tabla: ${table}`,
          status: 'ERROR',
          message: `Error de acceso: ${error.message}`,
          details: error
        });
      } else {
        log({
          category: 'TABLAS',
          test: `Tabla: ${table}`,
          status: 'SUCCESS',
          message: `Acceso correcto`,
          details: { registros: count, muestraDatos: data?.length > 0 }
        });
      }
    } catch (error: any) {
      log({
        category: 'TABLAS',
        test: `Tabla: ${table}`,
        status: 'ERROR',
        message: `Excepción: ${error.message}`,
        details: error
      });
    }
  }
}

async function testAuth() {
  console.log('\n=== 3. PRUEBAS DE AUTENTICACIÓN ===\n');

  try {
    // Verificar sesión actual
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      log({
        category: 'AUTENTICACIÓN',
        test: 'Obtener Sesión',
        status: 'ERROR',
        message: `Error al obtener sesión: ${sessionError.message}`,
        details: sessionError
      });
    } else {
      log({
        category: 'AUTENTICACIÓN',
        test: 'Obtener Sesión',
        status: sessionData.session ? 'SUCCESS' : 'WARNING',
        message: sessionData.session ? 'Sesión activa encontrada' : 'No hay sesión activa',
        details: sessionData.session ? {
          userId: sessionData.session.user.id,
          email: sessionData.session.user.email,
          expiresAt: new Date(sessionData.session.expires_at! * 1000).toLocaleString()
        } : null
      });

      // Si hay sesión, verificar perfil
      if (sessionData.session) {
        const { data: profileData, error: profileError } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', sessionData.session.user.id)
          .single();

        if (profileError) {
          log({
            category: 'AUTENTICACIÓN',
            test: 'Perfil de Usuario',
            status: 'ERROR',
            message: `Error al obtener perfil: ${profileError.message}`,
            details: profileError
          });
        } else {
          log({
            category: 'AUTENTICACIÓN',
            test: 'Perfil de Usuario',
            status: 'SUCCESS',
            message: 'Perfil cargado correctamente',
            details: {
              nombre: profileData.nombre,
              email: profileData.email,
              rol: profileData.rol,
              activo: profileData.activo,
              modulosAutorizados: profileData.modulos_autorizados
            }
          });
        }
      }
    }
  } catch (error: any) {
    log({
      category: 'AUTENTICACIÓN',
      test: 'Sistema de Autenticación',
      status: 'ERROR',
      message: `Excepción: ${error.message}`,
      details: error
    });
  }
}

async function testCRUDOperations() {
  console.log('\n=== 4. PRUEBAS DE OPERACIONES CRUD ===\n');

  // Test de lectura en tabla ARL (tabla de referencia simple)
  try {
    const { data, error } = await supabase
      .from('arl')
      .select('*')
      .limit(5);

    if (error) {
      log({
        category: 'CRUD',
        test: 'Lectura (SELECT)',
        status: 'ERROR',
        message: `Error en SELECT: ${error.message}`,
        details: error
      });
    } else {
      log({
        category: 'CRUD',
        test: 'Lectura (SELECT)',
        status: 'SUCCESS',
        message: `Lectura exitosa en tabla 'arl'`,
        details: { registrosObtenidos: data?.length || 0 }
      });
    }
  } catch (error: any) {
    log({
      category: 'CRUD',
      test: 'Lectura (SELECT)',
      status: 'ERROR',
      message: `Excepción: ${error.message}`,
      details: error
    });
  }

  // Nota: No hacemos pruebas de INSERT/UPDATE/DELETE para evitar modificar datos reales
  log({
    category: 'CRUD',
    test: 'Escritura (INSERT/UPDATE/DELETE)',
    status: 'WARNING',
    message: 'No se ejecutaron pruebas de escritura para evitar modificar datos reales',
    details: 'Las operaciones de escritura deben probarse en un ambiente controlado'
  });
}

async function testRLSPolicies() {
  console.log('\n=== 5. VERIFICACIÓN DE POLÍTICAS RLS ===\n');

  // Intentar acceder a tablas con diferentes permisos
  const criticalTables = ['perfiles', 'clientes', 'aliados'];

  for (const table of criticalTables) {
    try {
      // Intentar contar registros
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        log({
          category: 'RLS',
          test: `Políticas RLS - ${table}`,
          status: 'WARNING',
          message: `Posible restricción RLS: ${error.message}`,
          details: error
        });
      } else {
        log({
          category: 'RLS',
          test: `Políticas RLS - ${table}`,
          status: 'SUCCESS',
          message: `Acceso permitido`,
          details: { totalRegistros: count }
        });
      }
    } catch (error: any) {
      log({
        category: 'RLS',
        test: `Políticas RLS - ${table}`,
        status: 'ERROR',
        message: `Excepción: ${error.message}`,
        details: error
      });
    }
  }
}

async function testAPIs() {
  console.log('\n=== 6. PRUEBAS DE APIs DEL SISTEMA ===\n');

  try {
    // Importar APIs dinámicamente
    const { usuariosApi } = await import('./services/api/usuariosApi');
    const { clientesApi } = await import('./services/api/clientesApi');
    const { aliadosApi } = await import('./services/api/aliadosApi');

    // Test API de Usuarios
    try {
      const usuarios = await usuariosApi.getAll();
      log({
        category: 'APIs',
        test: 'usuariosApi.getAll()',
        status: 'SUCCESS',
        message: 'API de usuarios funcional',
        details: { totalUsuarios: usuarios.length }
      });
    } catch (error: any) {
      log({
        category: 'APIs',
        test: 'usuariosApi.getAll()',
        status: 'ERROR',
        message: `Error: ${error.message}`,
        details: error
      });
    }

    // Test API de Clientes
    try {
      const clientes = await clientesApi.getAll();
      log({
        category: 'APIs',
        test: 'clientesApi.getAll()',
        status: 'SUCCESS',
        message: 'API de clientes funcional',
        details: { totalClientes: clientes.length }
      });
    } catch (error: any) {
      log({
        category: 'APIs',
        test: 'clientesApi.getAll()',
        status: 'ERROR',
        message: `Error: ${error.message}`,
        details: error
      });
    }

    // Test API de Aliados
    try {
      const aliados = await aliadosApi.getAll();
      log({
        category: 'APIs',
        test: 'aliadosApi.getAll()',
        status: 'SUCCESS',
        message: 'API de aliados funcional',
        details: { totalAliados: aliados.length }
      });
    } catch (error: any) {
      log({
        category: 'APIs',
        test: 'aliadosApi.getAll()',
        status: 'ERROR',
        message: `Error: ${error.message}`,
        details: error
      });
    }
  } catch (error: any) {
    log({
      category: 'APIs',
      test: 'Importación de APIs',
      status: 'ERROR',
      message: `Error al cargar APIs: ${error.message}`,
      details: error
    });
  }
}

async function generateReport() {
  console.log('\n=== RESUMEN DEL DIAGNÓSTICO ===\n');

  const summary = {
    total: results.length,
    exitosos: results.filter(r => r.status === 'SUCCESS').length,
    advertencias: results.filter(r => r.status === 'WARNING').length,
    errores: results.filter(r => r.status === 'ERROR').length
  };

  console.log(`Total de pruebas: ${summary.total}`);
  console.log(`✓ Exitosas: ${summary.exitosos}`);
  console.log(`⚠ Advertencias: ${summary.advertencias}`);
  console.log(`✗ Errores: ${summary.errores}`);

  if (summary.errores > 0) {
    console.log('\n⚠️  SE ENCONTRARON PROBLEMAS QUE REQUIEREN ATENCIÓN ⚠️\n');
    console.log('Errores encontrados:');
    results.filter(r => r.status === 'ERROR').forEach(r => {
      console.log(`  - [${r.category}] ${r.test}: ${r.message}`);
    });
  } else if (summary.advertencias > 0) {
    console.log('\n⚠️  Todo funcional, pero hay algunas advertencias\n');
  } else {
    console.log('\n✓ TODOS LOS TESTS PASARON EXITOSAMENTE\n');
  }

  return summary;
}

async function runDiagnostics() {
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║   DIAGNÓSTICO DE CONEXIÓN SUPABASE - CIES         ║');
  console.log('╚════════════════════════════════════════════════════╝');

  const connectionOk = await testConnection();

  if (!connectionOk) {
    console.log('\n❌ NO SE PUDO ESTABLECER CONEXIÓN CON SUPABASE');
    console.log('Verifica que las variables de entorno estén correctamente configuradas:');
    console.log('  - VITE_SUPABASE_URL');
    console.log('  - VITE_SUPABASE_ANON_KEY');
    return;
  }

  await testTables();
  await testAuth();
  await testCRUDOperations();
  await testRLSPolicies();
  await testAPIs();

  const summary = await generateReport();

  // Guardar resultados en un archivo JSON
  const reportData = {
    timestamp: new Date().toISOString(),
    summary,
    results
  };

  console.log('\n📄 Reporte detallado disponible en memoria');
  console.log('Para exportar: JSON.stringify(reportData, null, 2)');

  return reportData;
}

// Ejecutar diagnósticos
if (import.meta.url === `file://${process.argv[1]}`) {
  runDiagnostics()
    .then(() => {
      console.log('\n✓ Diagnóstico completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Error fatal durante el diagnóstico:', error);
      process.exit(1);
    });
}

export { runDiagnostics, results };
