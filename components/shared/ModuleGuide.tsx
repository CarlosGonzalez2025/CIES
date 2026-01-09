import React, { useState } from 'react';
import {
  Info,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Rocket,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  BookOpen,
  Video,
  HelpCircle,
  Zap,
  Target,
  Play,
  CheckCircle,
  Circle,
  Award,
  TrendingUp,
  FileText,
  MessageCircle,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface ModuleGuideProps {
  title: string;
  children: React.ReactNode;
  type?: 'info' | 'tip' | 'warning' | 'success' | 'onboarding';
  collapsible?: boolean;
  defaultExpanded?: boolean;
  onDismiss?: () => void;
  showIcon?: boolean;
  actions?: GuideAction[];
  steps?: GuideStep[];
  documentationUrl?: string;
  videoUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  illustration?: React.ReactNode;
}

interface GuideAction {
  label: string;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'primary' | 'outline';
}

interface GuideStep {
  title: string;
  description: string;
  completed?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Configuración por tipo
const TYPE_CONFIG = {
  info: {
    icon: Info,
    gradient: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    textColor: 'text-blue-900',
    descriptionColor: 'text-blue-700',
  },
  tip: {
    icon: Lightbulb,
    gradient: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
    textColor: 'text-amber-900',
    descriptionColor: 'text-amber-700',
  },
  warning: {
    icon: AlertTriangle,
    gradient: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
    textColor: 'text-orange-900',
    descriptionColor: 'text-orange-700',
  },
  success: {
    icon: CheckCircle2,
    gradient: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    textColor: 'text-green-900',
    descriptionColor: 'text-green-700',
  },
  onboarding: {
    icon: Rocket,
    gradient: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
    textColor: 'text-purple-900',
    descriptionColor: 'text-purple-700',
  },
};

export const ModuleGuide: React.FC<ModuleGuideProps> = ({
  title,
  children,
  type = 'info',
  collapsible = false,
  defaultExpanded = true,
  onDismiss,
  showIcon = true,
  actions = [],
  steps = [],
  documentationUrl,
  videoUrl,
  size = 'md',
  illustration,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const toggleExpanded = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleStepComplete = (index: number) => {
    const newCompleted = new Set(completedSteps);
    if (completedSteps.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedSteps(newCompleted);
  };

  const completionPercentage = steps.length > 0
    ? (completedSteps.size / steps.length) * 100
    : 0;

  return (
    <Card className={`${config.bgColor} border ${config.borderColor} ${sizeClasses[size]} overflow-hidden`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {showIcon && (
            <div className={`flex-shrink-0 w-10 h-10 ${config.iconBg} rounded-lg flex items-center justify-center shadow-sm`}>
              <Icon className={`w-5 h-5 ${config.iconColor}`} />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <button
              onClick={toggleExpanded}
              className={`text-left w-full group ${collapsible ? 'cursor-pointer' : 'cursor-default'}`}
              disabled={!collapsible}
            >
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${config.textColor} group-hover:${config.iconColor} transition-colors`}>
                  {title}
                </h3>
                {collapsible && (
                  <div className={`ml-2 ${config.iconColor}`}>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                )}
              </div>
            </button>

            {/* Progress bar para steps */}
            {steps.length > 0 && isExpanded && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className={config.descriptionColor}>
                    Progreso: {completedSteps.size} de {steps.length} completados
                  </span>
                  <span className={`font-semibold ${config.iconColor}`}>
                    {Math.round(completionPercentage)}%
                  </span>
                </div>
                <div className={`w-full ${config.iconBg} rounded-full h-2 overflow-hidden`}>
                  <div
                    className={`h-full bg-gradient-to-r ${config.gradient} transition-all duration-500 ease-out`}
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botón de cerrar */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`flex-shrink-0 p-1 ${config.iconColor} hover:bg-white/50 rounded transition-colors`}
            aria-label="Cerrar guía"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content - Solo se muestra si está expandido */}
      {isExpanded && (
        <div className="mt-4 space-y-4 animate-slide-down">
          {/* Ilustración opcional */}
          {illustration && (
            <div className="flex justify-center py-4">
              {illustration}
            </div>
          )}

          {/* Children content */}
          <div className={`text-sm ${config.descriptionColor} space-y-2 leading-relaxed`}>
            {children}
          </div>

          {/* Steps (si existen) */}
          {steps.length > 0 && (
            <div className="space-y-3 pt-2">
              {steps.map((step, index) => {
                const isCompleted = completedSteps.has(index);
                const isLast = index === steps.length - 1;

                return (
                  <div
                    key={index}
                    className={`relative pl-8 pb-3 ${!isLast ? 'border-l-2 border-dashed' : ''} ${isCompleted ? 'border-green-300' : config.borderColor
                      } ml-4`}
                  >
                    {/* Número del paso o check */}
                    <button
                      onClick={() => handleStepComplete(index)}
                      className={`absolute -left-4 top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold text-sm transition-all ${isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : `bg-white ${config.borderColor} ${config.textColor} hover:border-current`
                        }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </button>

                    {/* Contenido del paso */}
                    <div className={isCompleted ? 'opacity-60' : ''}>
                      <h4 className={`font-semibold ${config.textColor} mb-1 ${isCompleted ? 'line-through' : ''}`}>
                        {step.title}
                      </h4>
                      <p className={`text-sm ${config.descriptionColor}`}>
                        {step.description}
                      </p>

                      {/* Acción del paso */}
                      {step.action && !isCompleted && (
                        <Button
                          onClick={step.action.onClick}
                          variant="outline"
                          size="sm"
                          className="mt-2"
                        >
                          {step.action.label}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Celebración al completar todos los pasos */}
              {completedSteps.size === steps.length && steps.length > 0 && (
                <div className="bg-green-100 border border-green-300 rounded-lg p-4 flex items-start space-x-3 animate-bounce-once">
                  <Award className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">
                      ¡Excelente trabajo!
                    </h4>
                    <p className="text-sm text-green-700">
                      Has completado todos los pasos de esta guía.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Enlaces a recursos */}
          {(documentationUrl || videoUrl) && (
            <div className={`border-t ${config.borderColor} pt-4 space-y-2`}>
              <p className={`text-xs font-medium ${config.textColor} mb-2`}>
                Recursos adicionales:
              </p>
              <div className="flex flex-wrap gap-2">
                {documentationUrl && (
                  <a
                    href={documentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border ${config.borderColor} rounded-lg text-sm ${config.iconColor} hover:bg-white/50 transition-colors`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Documentación</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {videoUrl && (
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border ${config.borderColor} rounded-lg text-sm ${config.iconColor} hover:bg-white/50 transition-colors`}
                  >
                    <Video className="w-4 h-4" />
                    <span>Video tutorial</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          {actions.length > 0 && (
            <div className={`border-t ${config.borderColor} pt-4 flex flex-wrap gap-2`}>
              {actions.map((action, index) => {
                const ActionIcon = action.icon;
                return (
                  <Button
                    key={index}
                    onClick={action.onClick}
                    variant={action.variant || 'primary'}
                    size="sm"
                    icon={ActionIcon}
                  >
                    {action.label}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Animaciones CSS */}
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

        @keyframes bounce-once {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        .animate-bounce-once {
          animation: bounce-once 0.6s ease-in-out;
        }
      `}</style>
    </Card>
  );
};

// Variantes pre-configuradas
export const QuickTip: React.FC<Omit<ModuleGuideProps, 'type'>> = (props) => (
  <ModuleGuide {...props} type="tip" size="sm" />
);

export const OnboardingGuide: React.FC<Omit<ModuleGuideProps, 'type'>> = (props) => (
  <ModuleGuide {...props} type="onboarding" defaultExpanded={true} />
);

export const WarningGuide: React.FC<Omit<ModuleGuideProps, 'type'>> = (props) => (
  <ModuleGuide {...props} type="warning" />
);

// Componente de guía compacta (inline)
export const InlineGuide: React.FC<{
  message: string;
  type?: 'info' | 'tip' | 'warning' | 'success';
  action?: {
    label: string;
    onClick: () => void;
  };
}> = ({ message, type = 'info', action }) => {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-lg px-4 py-3 flex items-center justify-between gap-3`}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Icon className={`w-4 h-4 ${config.iconColor} flex-shrink-0`} />
        <p className={`text-sm ${config.descriptionColor}`}>{message}</p>
      </div>
      {action && (
        <Button onClick={action.onClick} variant="outline" size="sm" className="flex-shrink-0">
          {action.label}
        </Button>
      )}
    </div>
  );
};

// Ejemplo de uso completo
export const ExampleUsage = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Guía básica */}
      <ModuleGuide title="Bienvenido a Clientes" type="info">
        <p>
          En este módulo puedes gestionar toda la información de tus clientes y empresas asociadas.
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Crear y editar clientes</li>
          <li>Asignar comisiones</li>
          <li>Generar reportes personalizados</li>
        </ul>
      </ModuleGuide>

      {/* Guía con pasos */}
      <ModuleGuide
        title="Configuración Inicial"
        type="onboarding"
        collapsible
        steps={[
          {
            title: 'Crea tu primer cliente',
            description: 'Registra la información básica de tu primer cliente o empresa.',
            action: {
              label: 'Crear cliente',
              onClick: () => console.log('Crear cliente'),
            },
          },
          {
            title: 'Asigna una comisión',
            description: 'Configura la primera comisión para el cliente creado.',
            action: {
              label: 'Ir a comisiones',
              onClick: () => console.log('Ir a comisiones'),
            },
          },
          {
            title: 'Genera un reporte',
            description: 'Crea tu primer reporte para visualizar los datos.',
            action: {
              label: 'Ver reportes',
              onClick: () => console.log('Ver reportes'),
            },
          },
        ]}
        documentationUrl="https://docs.example.com"
        videoUrl="https://youtube.com/example"
      />

      {/* Tip rápido */}
      <QuickTip title="Consejo Rápido" collapsible defaultExpanded={false}>
        <p>
          Usa <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Ctrl + K</kbd> para
          abrir la búsqueda rápida en cualquier momento.
        </p>
      </QuickTip>

      {/* Advertencia */}
      <WarningGuide
        title="Acción Requerida"
        onDismiss={() => console.log('Dismissed')}
        actions={[
          {
            label: 'Actualizar ahora',
            onClick: () => console.log('Update'),
            icon: Zap,
            variant: 'primary',
          },
          {
            label: 'Más tarde',
            onClick: () => console.log('Later'),
            variant: 'outline',
          },
        ]}
      >
        <p>
          Tu versión de la aplicación está desactualizada. Actualiza para obtener las últimas
          funciones y mejoras de seguridad.
        </p>
      </WarningGuide>

      {/* Guía inline */}
      <InlineGuide
        message="Recuerda guardar tus cambios antes de salir"
        type="tip"
        action={{
          label: 'Guardar',
          onClick: () => console.log('Save'),
        }}
      />
    </div>
  );
};
