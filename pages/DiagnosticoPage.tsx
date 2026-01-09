import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Database,
  Shield,
  Users,
  Activity,
  RefreshCw
} from 'lucide-react';

interface DiagnosticResult {
  category: string;
  test: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR' | 'RUNNING';
  message: string;
  details?: any;
}

const DiagnosticoPage: React.FC = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result]);
  };

  const testConnection = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        addResult({
          category: 'CONEXIÓN',
          test: 'Conexión a Supabase',
          status: 'ERROR',
          message: `Error de conexión: ${error.message}`,
          details: error
        });
        return false;
      }

      addResult({
        category: 'CONEXIÓN',
        test: 'Conexión a Supabase',
        status: 'SUCCESS',
        message: 'Conexión establecida correctamente',
        details: { hasSession: !!data.session }
      });

      return true;
    } catch (error: any) {
      addResult({
        category: 'CONEXIÓN',
        test: 'Conexión a Supabase',
        status: 'ERROR',
        message: `Excepción: ${error.message}`,
        details: error
      });
      return false;
    }
  };

  const testTables = async () => {
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
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: false })
          .limit(1);

        if (error) {
          addResult({
            category: 'TABLAS',
            test: `Tabla: ${table}`,
            status: 'ERROR',
            message: `Error de acceso: ${error.message}`,
            details: error
          });
        } else {
          addResult({
            category: 'TABLAS',
            test: `Tabla: ${table}`,
            status: 'SUCCESS',
            message: `Acceso correcto (${count || 0} registros)`,
            details: { registros: count, muestraDatos: data?.length > 0 }
          });
        }
      } catch (error: any) {
        addResult({
          category: 'TABLAS',
          test: `Tabla: ${table}`,
          status: 'ERROR',
          message: `Excepción: ${error.message}`,
          details: error
        });
      }
    }
  };

  const testAuth = async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        addResult({
          category: 'AUTENTICACIÓN',
          test: 'Obtener Sesión',
          status: 'ERROR',
          message: `Error al obtener sesión: ${sessionError.message}`,
          details: sessionError
        });
      } else {
        addResult({
          category: 'AUTENTICACIÓN',
          test: 'Obtener Sesión',
          status: sessionData.session ? 'SUCCESS' : 'WARNING',
          message: sessionData.session ? 'Sesión activa encontrada' : 'No hay sesión activa',
          details: sessionData.session ? {
            userId: sessionData.session.user.id,
            email: sessionData.session.user.email
          } : null
        });

        if (sessionData.session) {
          const { data: profileData, error: profileError } = await supabase
            .from('perfiles')
            .select('*')
            .eq('id', sessionData.session.user.id)
            .single();

          if (profileError) {
            addResult({
              category: 'AUTENTICACIÓN',
              test: 'Perfil de Usuario',
              status: 'ERROR',
              message: `Error al obtener perfil: ${profileError.message}`,
              details: profileError
            });
          } else {
            addResult({
              category: 'AUTENTICACIÓN',
              test: 'Perfil de Usuario',
              status: 'SUCCESS',
              message: `Perfil cargado: ${profileData.nombre} (${profileData.rol})`,
              details: {
                nombre: profileData.nombre,
                email: profileData.email,
                rol: profileData.rol,
                activo: profileData.activo
              }
            });
          }
        }
      }
    } catch (error: any) {
      addResult({
        category: 'AUTENTICACIÓN',
        test: 'Sistema de Autenticación',
        status: 'ERROR',
        message: `Excepción: ${error.message}`,
        details: error
      });
    }
  };

  const testCRUD = async () => {
    try {
      const { data, error } = await supabase
        .from('arl')
        .select('*')
        .limit(5);

      if (error) {
        addResult({
          category: 'CRUD',
          test: 'Lectura (SELECT)',
          status: 'ERROR',
          message: `Error en SELECT: ${error.message}`,
          details: error
        });
      } else {
        addResult({
          category: 'CRUD',
          test: 'Lectura (SELECT)',
          status: 'SUCCESS',
          message: `Lectura exitosa (${data?.length || 0} registros en tabla ARL)`,
          details: { registrosObtenidos: data?.length || 0 }
        });
      }
    } catch (error: any) {
      addResult({
        category: 'CRUD',
        test: 'Lectura (SELECT)',
        status: 'ERROR',
        message: `Excepción: ${error.message}`,
        details: error
      });
    }
  };

  const testAPIs = async () => {
    try {
      // Test API de Clientes
      const { data: clientes, error: clientesError } = await supabase
        .from('clientes')
        .select('*')
        .limit(1);

      if (clientesError) {
        addResult({
          category: 'APIs',
          test: 'API Clientes',
          status: 'ERROR',
          message: `Error: ${clientesError.message}`,
          details: clientesError
        });
      } else {
        addResult({
          category: 'APIs',
          test: 'API Clientes',
          status: 'SUCCESS',
          message: 'API de clientes funcional',
          details: { hasData: clientes && clientes.length > 0 }
        });
      }

      // Test API de Aliados
      const { data: aliados, error: aliadosError } = await supabase
        .from('aliados')
        .select('*')
        .limit(1);

      if (aliadosError) {
        addResult({
          category: 'APIs',
          test: 'API Aliados',
          status: 'ERROR',
          message: `Error: ${aliadosError.message}`,
          details: aliadosError
        });
      } else {
        addResult({
          category: 'APIs',
          test: 'API Aliados',
          status: 'SUCCESS',
          message: 'API de aliados funcional',
          details: { hasData: aliados && aliados.length > 0 }
        });
      }

      // Test API de Perfiles
      const { data: perfiles, error: perfilesError } = await supabase
        .from('perfiles')
        .select('*')
        .limit(1);

      if (perfilesError) {
        addResult({
          category: 'APIs',
          test: 'API Usuarios',
          status: 'ERROR',
          message: `Error: ${perfilesError.message}`,
          details: perfilesError
        });
      } else {
        addResult({
          category: 'APIs',
          test: 'API Usuarios',
          status: 'SUCCESS',
          message: 'API de usuarios funcional',
          details: { hasData: perfiles && perfiles.length > 0 }
        });
      }
    } catch (error: any) {
      addResult({
        category: 'APIs',
        test: 'APIs del Sistema',
        status: 'ERROR',
        message: `Error: ${error.message}`,
        details: error
      });
    }
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);
    setSummary(null);

    try {
      const connectionOk = await testConnection();

      if (!connectionOk) {
        setSummary({
          total: 1,
          exitosos: 0,
          advertencias: 0,
          errores: 1,
          fatal: true
        });
        return;
      }

      await testTables();
      await testAuth();
      await testCRUD();
      await testAPIs();

      // Calcular resumen
      const allResults = await new Promise<DiagnosticResult[]>(resolve => {
        setTimeout(() => resolve(results), 100);
      });

      const newSummary = {
        total: allResults.length + results.length,
        exitosos: [...allResults, ...results].filter(r => r.status === 'SUCCESS').length,
        advertencias: [...allResults, ...results].filter(r => r.status === 'WARNING').length,
        errores: [...allResults, ...results].filter(r => r.status === 'ERROR').length,
        fatal: false
      };

      setSummary(newSummary);
    } catch (error: any) {
      addResult({
        category: 'SISTEMA',
        test: 'Diagnóstico General',
        status: 'ERROR',
        message: `Error fatal: ${error.message}`,
        details: error
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'ERROR':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'RUNNING':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'CONEXIÓN':
        return <Database className="w-5 h-5" />;
      case 'TABLAS':
        return <Database className="w-5 h-5" />;
      case 'AUTENTICACIÓN':
        return <Shield className="w-5 h-5" />;
      case 'CRUD':
        return <Activity className="w-5 h-5" />;
      case 'APIs':
        return <Users className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Diagnóstico de Sistema
        </h1>
        <p className="text-gray-600">
          Verificación completa de la conexión con Supabase y funcionalidades del sistema
        </p>
      </div>

      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Ejecutar Diagnóstico Completo
            </h2>
            <p className="text-sm text-gray-600">
              Esta prueba verificará la conexión, tablas, autenticación y operaciones CRUD
            </p>
          </div>
          <Button
            onClick={runDiagnostics}
            disabled={isRunning}
            isLoading={isRunning}
            className="bg-primary-600 hover:bg-primary-700"
          >
            {isRunning ? 'Ejecutando...' : 'Iniciar Diagnóstico'}
          </Button>
        </div>
      </Card>

      {summary && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Resultados</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
              <div className="text-sm text-gray-600">Total de Pruebas</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{summary.exitosos}</div>
              <div className="text-sm text-gray-600">Exitosas</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{summary.advertencias}</div>
              <div className="text-sm text-gray-600">Advertencias</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{summary.errores}</div>
              <div className="text-sm text-gray-600">Errores</div>
            </div>
          </div>

          {summary.errores === 0 && summary.advertencias === 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                ✓ Todos los tests pasaron exitosamente. El sistema está funcionando correctamente.
              </p>
            </div>
          )}

          {summary.errores > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">
                ⚠️ Se encontraron {summary.errores} error(es) que requieren atención inmediata.
              </p>
            </div>
          )}

          {summary.advertencias > 0 && summary.errores === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-medium">
                ⚠️ Sistema funcional, pero hay {summary.advertencias} advertencia(s) a revisar.
              </p>
            </div>
          )}
        </Card>
      )}

      {results.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resultados Detallados</h2>
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.status === 'SUCCESS'
                    ? 'bg-green-50 border-green-200'
                    : result.status === 'WARNING'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(result.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getCategoryIcon(result.category)}
                      <span className="font-medium text-sm text-gray-700">
                        {result.category}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{result.test}</span>
                    </div>
                    <p className="text-sm text-gray-800">{result.message}</p>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                          Ver detalles técnicos
                        </summary>
                        <pre className="mt-2 text-xs bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {results.length === 0 && !isRunning && (
        <Card>
          <div className="text-center py-12">
            <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se han ejecutado diagnósticos
            </h3>
            <p className="text-gray-600">
              Haz clic en "Iniciar Diagnóstico" para comenzar las pruebas
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DiagnosticoPage;
