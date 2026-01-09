import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Bug,
  ArrowLeft,
  Mail,
  ExternalLink,
  Copy,
  CheckCircle2,
  XCircle,
  Wifi,
  WifiOff,
  FileQuestion,
  Server,
  Zap,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  enableReset?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorType: ErrorType;
  showStackTrace: boolean;
  copied: boolean;
}

type ErrorType = 'network' | 'chunk' | 'render' | 'unknown';

// Servicio de logging (integración con Sentry, LogRocket, etc.)
class ErrorLogger {
  static log(error: Error, errorInfo: ErrorInfo, errorType: ErrorType) {
    // Log a consola en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught');
      console.error('Type:', errorType);
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    // Aquí integrar servicios de logging como Sentry
    try {
      // Ejemplo con Sentry (comentado)
      // if (window.Sentry) {
      //   window.Sentry.captureException(error, {
      //     contexts: {
      //       react: {
      //         componentStack: errorInfo.componentStack,
      //         errorType,
      //       },
      //     },
      //   });
      // }

      // Log a tu API de errores
      // fetch('/api/log-error', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     error: error.toString(),
      //     stack: error.stack,
      //     componentStack: errorInfo.componentStack,
      //     type: errorType,
      //     timestamp: new Date().toISOString(),
      //     url: window.location.href,
      //     userAgent: navigator.userAgent,
      //   }),
      // });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }
}

// Detectar tipo de error
const detectErrorType = (error: Error): ErrorType => {
  const errorMessage = error.message.toLowerCase();

  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'network';
  }

  if (errorMessage.includes('loading chunk') || errorMessage.includes('dynamically imported')) {
    return 'chunk';
  }

  if (error.name === 'ChunkLoadError' || errorMessage.includes('chunk')) {
    return 'chunk';
  }

  if (error.stack?.includes('at render')) {
    return 'render';
  }

  return 'unknown';
};

// Configuración por tipo de error
const ERROR_CONFIGS = {
  network: {
    icon: WifiOff,
    color: 'amber',
    title: 'Error de Conexión',
    description: 'No se pudo establecer conexión con el servidor',
    suggestions: [
      'Verifica tu conexión a internet',
      'Intenta recargar la página',
      'Comprueba el estado del servicio',
    ],
    canRetry: true,
    autoRetry: false,
  },
  chunk: {
    icon: FileQuestion,
    color: 'blue',
    title: 'Error de Carga',
    description: 'Hubo un problema al cargar un componente de la aplicación',
    suggestions: [
      'La aplicación puede haber sido actualizada',
      'Recarga la página para obtener la última versión',
      'Limpia la caché del navegador si el problema persiste',
    ],
    canRetry: true,
    autoRetry: true,
  },
  render: {
    icon: Zap,
    color: 'red',
    title: 'Error de Renderizado',
    description: 'Ocurrió un error al mostrar esta parte de la aplicación',
    suggestions: [
      'Este es un error interno de la aplicación',
      'El equipo ha sido notificado automáticamente',
      'Puedes intentar volver al inicio',
    ],
    canRetry: false,
    autoRetry: false,
  },
  unknown: {
    icon: AlertTriangle,
    color: 'red',
    title: 'Error Inesperado',
    description: 'Ha ocurrido un error inesperado en la aplicación',
    suggestions: [
      'Intenta recargar la página',
      'Si el problema persiste, contacta con soporte',
      'El error ha sido reportado automáticamente',
    ],
    canRetry: true,
    autoRetry: false,
  },
};

export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorType: 'unknown',
    showStackTrace: false,
    copied: false,
  };

  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    const errorType = detectErrorType(error);
    return {
      hasError: true,
      error,
      errorType,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorType = detectErrorType(error);

    // Log error
    ErrorLogger.log(error, errorInfo, errorType);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    this.setState({ errorInfo });

    // Auto-retry para chunk loading errors
    const config = ERROR_CONFIGS[errorType];
    if (config.autoRetry && this.retryCount < this.maxRetries) {
      this.retryCount++;
      setTimeout(() => {
        this.handleRetry();
      }, 1000);
    }
  }

  private handleRetry = () => {
    if (this.props.enableReset !== false) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        showStackTrace: false,
        copied: false,
      });
    }
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleGoBack = () => {
    window.history.back();
  };

  private copyErrorDetails = async () => {
    const { error, errorInfo } = this.state;
    const errorDetails = `
Error: ${error?.toString()}

Stack Trace:
${error?.stack}

Component Stack:
${errorInfo?.componentStack}

URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorDetails);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  private toggleStackTrace = () => {
    this.setState({ showStackTrace: !this.state.showStackTrace });
  };

  public render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorType, showStackTrace, copied } = this.state;
      const config = ERROR_CONFIGS[errorType];
      const Icon = config.icon;

      // Si se proporciona un fallback personalizado
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const colorClasses = {
        red: {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          iconBg: 'bg-red-100',
          text: 'text-red-900',
          button: 'bg-red-600 hover:bg-red-700',
        },
        amber: {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          icon: 'text-amber-600',
          iconBg: 'bg-amber-100',
          text: 'text-amber-900',
          button: 'bg-amber-600 hover:bg-amber-700',
        },
        blue: {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          iconBg: 'bg-blue-100',
          text: 'text-blue-900',
          button: 'bg-blue-600 hover:bg-blue-700',
        },
      };

      const colors = colorClasses[config.color as keyof typeof colorClasses];

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
          <div className="max-w-2xl w-full">
            {/* Main Error Card */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header con gradiente */}
              <div className={`bg-gradient-to-r from-${config.color}-500 to-${config.color}-600 p-8 text-white`}>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <Icon className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-2">{config.title}</h1>
                    <p className="text-white/90">{config.description}</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-8 space-y-6">
                {/* Sugerencias */}
                <div className={`${colors.bg} border ${colors.border} rounded-xl p-4`}>
                  <h3 className={`text-sm font-semibold ${colors.text} mb-3 flex items-center`}>
                    <HelpCircle className={`w-4 h-4 mr-2 ${colors.icon}`} />
                    ¿Qué puedes hacer?
                  </h3>
                  <ul className="space-y-2">
                    {config.suggestions.map((suggestion, index) => (
                      <li key={index} className={`text-sm ${colors.text} flex items-start`}>
                        <span className="mr-2 mt-1">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Botones de acción */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {config.canRetry && (
                    <Button
                      onClick={this.handleRetry}
                      icon={RefreshCw}
                      className="w-full"
                      variant="primary"
                    >
                      Reintentar
                    </Button>
                  )}

                  <Button
                    onClick={this.handleGoHome}
                    icon={Home}
                    variant="outline"
                    className="w-full"
                  >
                    Ir al Inicio
                  </Button>

                  <Button
                    onClick={this.handleGoBack}
                    icon={ArrowLeft}
                    variant="outline"
                    className="w-full"
                  >
                    Volver
                  </Button>
                </div>

                {/* Contacto de soporte */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-start space-x-3 text-sm text-gray-600">
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 mb-1">¿Necesitas ayuda?</p>
                      <p>
                        Si el problema persiste, contacta con soporte en{' '}
                        <a
                          href="mailto:soporte@cies.com"
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          soporte@cies.com
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detalles técnicos (solo desarrollo o si se habilita showDetails) */}
                {(process.env.NODE_ENV === 'development' || this.props.showDetails) && error && (
                  <div className="border-t border-gray-200 pt-6">
                    <button
                      onClick={this.toggleStackTrace}
                      className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors mb-3"
                    >
                      <span className="flex items-center">
                        <Bug className="w-4 h-4 mr-2" />
                        Detalles técnicos
                      </span>
                      {showStackTrace ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    {showStackTrace && (
                      <div className="space-y-3 animate-slide-down">
                        {/* Error message */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Error:
                          </label>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <code className="text-xs text-red-900 font-mono break-all">
                              {error.toString()}
                            </code>
                          </div>
                        </div>

                        {/* Stack trace */}
                        {error.stack && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Stack Trace:
                            </label>
                            <div className="bg-gray-900 rounded-lg p-3 max-h-64 overflow-auto">
                              <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-all">
                                {error.stack}
                              </pre>
                            </div>
                          </div>
                        )}

                        {/* Component stack */}
                        {errorInfo?.componentStack && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Component Stack:
                            </label>
                            <div className="bg-gray-900 rounded-lg p-3 max-h-48 overflow-auto">
                              <pre className="text-xs text-blue-400 font-mono whitespace-pre-wrap">
                                {errorInfo.componentStack}
                              </pre>
                            </div>
                          </div>
                        )}

                        {/* Copy button */}
                        <Button
                          onClick={this.copyErrorDetails}
                          icon={copied ? CheckCircle2 : Copy}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          {copied ? 'Copiado!' : 'Copiar detalles del error'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer info */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>ID de Error: {Date.now().toString(36)}</span>
                    <span>{new Date().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Retry counter (solo en desarrollo) */}
            {process.env.NODE_ENV === 'development' && this.retryCount > 0 && (
              <div className="mt-4 text-center text-sm text-gray-600">
                <p>
                  Intentos de recuperación automática: {this.retryCount} / {this.maxRetries}
                </p>
              </div>
            )}
          </div>

          {/* Animación CSS */}
          <style jsx>{`
            @keyframes slide-down {
              from {
                opacity: 0;
                max-height: 0;
              }
              to {
                opacity: 1;
                max-height: 2000px;
              }
            }

            .animate-slide-down {
              animation: slide-down 0.3s ease-out;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

// Componente de error específico para errores de red
export class NetworkErrorBoundary extends ErrorBoundary {
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (detectErrorType(error) === 'network') {
      super.componentDidCatch(error, errorInfo);
    } else {
      throw error; // Re-throw para que sea capturado por un boundary superior
    }
  }
}

// HOC para envolver componentes con Error Boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Hook para resetear error boundary (usar con react-error-boundary package)
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
};
