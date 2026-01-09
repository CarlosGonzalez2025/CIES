import React, { useState, useEffect, useRef } from 'react';
import {
    BookOpen,
    Share2,
    Users,
    DollarSign,
    FileText,
    ClipboardList,
    Shield,
    HelpCircle,
    ArrowRight,
    Search,
    ChevronDown,
    ChevronUp,
    Copy,
    Check,
    Download,
    Play,
    ExternalLink,
    Menu,
    X,
    Zap,
    AlertCircle,
    CheckCircle,
    Info,
    Bookmark,
    MessageSquare,
    Video,
    Code,
    List,
    Settings,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SearchBar } from '../components/shared/SearchBar';
import { Card } from '../components/ui/Card';

interface Section {
    id: string;
    title: string;
    icon: React.ReactNode;
}

export default function GuiaPage() {
    const [activeSection, setActiveSection] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFaqs, setExpandedFaqs] = useState<Set<number>>(new Set());
    const [showToc, setShowToc] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const sections: Section[] = [
        { id: 'intro', title: 'Introducción', icon: <BookOpen className="w-4 h-4" /> },
        { id: 'architecture', title: 'Arquitectura', icon: <Share2 className="w-4 h-4" /> },
        { id: 'modules', title: 'Módulos', icon: <List className="w-4 h-4" /> },
        { id: 'tutorials', title: 'Tutoriales', icon: <Video className="w-4 h-4" /> },
        { id: 'faq', title: 'FAQ', icon: <HelpCircle className="w-4 h-4" /> },
        { id: 'api', title: 'API Reference', icon: <Code className="w-4 h-4" /> },
    ];

    // Intersection Observer for active section
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: '-100px 0px -80% 0px' }
        );

        sections.forEach(section => {
            const element = document.getElementById(section.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setShowToc(false);
        }
    };

    const toggleFaq = (index: number) => {
        const newExpanded = new Set(expandedFaqs);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedFaqs(newExpanded);
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div className="relative">
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowToc(!showToc)}
                                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                {showToc ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">Documentación CIES</h1>
                                    <p className="text-xs text-gray-500">v2.0 - Actualizado Enero 2026</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden md:block w-64">
                                <SearchBar
                                    onSearch={setSearchQuery}
                                    placeholder="Buscar en la guía..."
                                    value={searchQuery}
                                />
                            </div>
                            <Button variant="ghost" size="sm" icon={Download}>
                                PDF
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Table of Contents - Sidebar */}
                    <aside className={`
                        ${showToc ? 'block' : 'hidden'} lg:block
                        fixed lg:sticky top-20 left-0 lg:left-auto
                        w-64 lg:w-72 h-[calc(100vh-8rem)]
                        bg-white lg:bg-transparent
                        shadow-xl lg:shadow-none
                        z-30 lg:z-0
                        p-6 lg:p-0
                        overflow-y-auto
                    `}>
                        <nav className="space-y-1">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                                Contenido
                            </h3>
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => scrollToSection(section.id)}
                                    className={`
                                        w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left
                                        ${activeSection === section.id
                                            ? 'bg-primary-100 text-primary-700'
                                            : 'text-gray-700 hover:bg-gray-100'}
                                    `}
                                >
                                    {section.icon}
                                    {section.title}
                                </button>
                            ))}
                        </nav>

                        {/* Quick Links */}
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                                Enlaces Rápidos
                            </h3>
                            <div className="space-y-2">
                                <a href="#" className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600">
                                    <ExternalLink className="w-4 h-4" />
                                    Changelog
                                </a>
                                <a href="#" className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600">
                                    <MessageSquare className="w-4 h-4" />
                                    Soporte
                                </a>
                                <a href="#" className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600">
                                    <Video className="w-4 h-4" />
                                    Video Tutoriales
                                </a>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 max-w-4xl space-y-12">
                        {/* Introduction Section */}
                        <section id="intro" className="scroll-mt-24">
                            <Card className="p-8 border-l-4 border-primary-500">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="p-3 bg-primary-100 rounded-full text-primary-600">
                                        <BookOpen className="w-8 h-8" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                            Bienvenido a la Guía CIES
                                        </h2>
                                        <p className="text-gray-600 text-lg">
                                            Manual completo de funcionamiento, arquitectura y mejores prácticas del sistema CIES.
                                        </p>
                                    </div>
                                </div>

                                <div className="prose prose-blue max-w-none">
                                    <p className="text-gray-700 leading-relaxed mb-4">
                                        CIES (Control Integral de Empresas y Servicios) es un sistema diseñado para gestionar
                                        el ciclo completo de relaciones con clientes, comisiones, presupuestos y órdenes de servicio.
                                    </p>

                                    <div className="grid md:grid-cols-3 gap-4 mt-6">
                                        <QuickStartCard
                                            icon={<Zap className="w-5 h-5" />}
                                            title="Inicio Rápido"
                                            description="Comienza en 5 minutos"
                                            link="#tutorials"
                                        />
                                        <QuickStartCard
                                            icon={<Code className="w-5 h-5" />}
                                            title="API Reference"
                                            description="Documentación técnica"
                                            link="#api"
                                        />
                                        <QuickStartCard
                                            icon={<Video className="w-5 h-5" />}
                                            title="Videos"
                                            description="Tutoriales visuales"
                                            link="#tutorials"
                                        />
                                    </div>
                                </div>
                            </Card>
                        </section>

                        {/* Architecture Section */}
                        <section id="architecture" className="scroll-mt-24">
                            <SectionHeader
                                icon={<Share2 className="w-6 h-6" />}
                                title="Arquitectura de Información"
                                description="Comprende cómo se relacionan los módulos del sistema"
                            />

                            <Card className="p-8 mt-6">
                                {/* Interactive Architecture Diagram */}
                                <InteractiveArchitectureDiagram />

                                {/* Key Principles */}
                                <div className="mt-8 grid md:grid-cols-3 gap-4">
                                    <InfoCard
                                        icon={<AlertCircle className="w-5 h-5" />}
                                        title="Regla de Oro"
                                        text="No se puede crear una Orden de Servicio sin un Cliente y un Aliado definidos."
                                        type="warning"
                                    />
                                    <InfoCard
                                        icon={<Info className="w-5 h-5" />}
                                        title="Dependencias"
                                        text="Las Comisiones dependen 100% de la configuración del Cliente (NIT)."
                                        type="info"
                                    />
                                    <InfoCard
                                        icon={<CheckCircle className="w-5 h-5" />}
                                        title="Flujo de Dinero"
                                        text="Presupuesto = Dinero Disponible. Orden de Servicio = Dinero Gastado."
                                        type="success"
                                    />
                                </div>

                                {/* Data Flow Example */}
                                <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <ArrowRight className="w-5 h-5 text-primary-600" />
                                        Ejemplo de Flujo de Datos
                                    </h4>
                                    <div className="space-y-3">
                                        <FlowStep number={1} text="Cliente registrado con ARL asignada" />
                                        <FlowStep number={2} text="ARL emite prima → Genera comisión automática" />
                                        <FlowStep number={3} text="Presupuesto creado con base en la comisión" />
                                        <FlowStep number={4} text="Orden de Servicio descuenta del presupuesto" />
                                        <FlowStep number={5} text="Aliado ejecuta y registra avance" />
                                    </div>
                                </div>
                            </Card>
                        </section>

                        {/* Modules Section */}
                        <section id="modules" className="scroll-mt-24">
                            <SectionHeader
                                icon={<List className="w-6 h-6" />}
                                title="Guía de Módulos"
                                description="Funcionalidad detallada de cada componente"
                            />

                            <div className="mt-6 space-y-4">
                                <CollapsibleModuleCard
                                    icon={<Users className="w-6 h-6 text-blue-600" />}
                                    title="Gestión de Clientes"
                                    color="blue"
                                    steps={[
                                        "Registrar NIT y Razón Social.",
                                        "Obligatorio: Asignar una ARL.",
                                        "Definir el % de Comisión pactado para cálculos automáticos.",
                                    ]}
                                    details={{
                                        description: "El módulo de Clientes es la base del sistema. Cada cliente debe tener un NIT único y estar asociado a una ARL.",
                                        keyFeatures: [
                                            "Validación automática de NIT",
                                            "Cálculo dinámico de comisiones",
                                            "Historial de transacciones completo",
                                        ],
                                        bestPractices: [
                                            "Verificar datos antes de guardar",
                                            "Mantener actualizado el % de comisión",
                                            "Revisar periódicamente clientes inactivos",
                                        ]
                                    }}
                                />

                                <CollapsibleModuleCard
                                    icon={<Users className="w-6 h-6 text-purple-600" />}
                                    title="Gestión de Aliados"
                                    color="purple"
                                    steps={[
                                        "Registrar proveedores y su especialidad.",
                                        "Configurar tarifas (Hora PBL/Especializada).",
                                        "Fundamental para el cálculo de costos en Órdenes.",
                                    ]}
                                    details={{
                                        description: "Los Aliados son los proveedores que ejecutan las órdenes de servicio.",
                                        keyFeatures: [
                                            "Gestión de tarifas por hora",
                                            "Especialidades configurables",
                                            "Seguimiento de desempeño",
                                        ],
                                        bestPractices: [
                                            "Actualizar tarifas regularmente",
                                            "Documentar especialidades claramente",
                                            "Evaluar rendimiento periódicamente",
                                        ]
                                    }}
                                />

                                <CollapsibleModuleCard
                                    icon={<DollarSign className="w-6 h-6 text-green-600" />}
                                    title="Control de Comisiones"
                                    color="green"
                                    steps={[
                                        "Registro de pagos de ARL.",
                                        "Cruce automático con % de comisión del cliente.",
                                        "Seguimiento de ingresos reales vs proyectados.",
                                    ]}
                                    details={{
                                        description: "Sistema automatizado de cálculo y seguimiento de comisiones.",
                                        keyFeatures: [
                                            "Cálculo automático basado en primas",
                                            "Reportes de comisiones por periodo",
                                            "Alertas de desviaciones",
                                        ],
                                        bestPractices: [
                                            "Registrar pagos puntualmente",
                                            "Reconciliar mensualmente",
                                            "Verificar cálculos automáticos",
                                        ]
                                    }}
                                />

                                <CollapsibleModuleCard
                                    icon={<FileText className="w-6 h-6 text-orange-600" />}
                                    title="Presupuestos y Órdenes"
                                    color="orange"
                                    steps={[
                                        "Presupuesto: Bolsa de dinero por Cliente.",
                                        "Orden de Servicio: Descuenta del presupuesto.",
                                        "Validación automática de saldos disponibles.",
                                    ]}
                                    details={{
                                        description: "Control del flujo de inversión desde la asignación hasta la ejecución.",
                                        keyFeatures: [
                                            "Validación de saldos en tiempo real",
                                            "Trazabilidad completa de gastos",
                                            "Alertas de sobregiro",
                                        ],
                                        bestPractices: [
                                            "Revisar saldos antes de aprobar órdenes",
                                            "Mantener presupuestos actualizados",
                                            "Documentar todas las modificaciones",
                                        ]
                                    }}
                                />
                            </div>
                        </section>

                        {/* Tutorials Section */}
                        <section id="tutorials" className="scroll-mt-24">
                            <SectionHeader
                                icon={<Video className="w-6 h-6" />}
                                title="Tutoriales Paso a Paso"
                                description="Guías prácticas para tareas comunes"
                            />

                            <div className="mt-6 grid md:grid-cols-2 gap-6">
                                <TutorialCard
                                    title="Crear un Cliente Nuevo"
                                    duration="3 min"
                                    difficulty="Básico"
                                    steps={5}
                                />
                                <TutorialCard
                                    title="Generar Orden de Servicio"
                                    duration="5 min"
                                    difficulty="Intermedio"
                                    steps={8}
                                />
                                <TutorialCard
                                    title="Configurar Presupuesto Anual"
                                    duration="4 min"
                                    difficulty="Intermedio"
                                    steps={6}
                                />
                                <TutorialCard
                                    title="Exportar Reportes"
                                    duration="2 min"
                                    difficulty="Básico"
                                    steps={3}
                                />
                            </div>
                        </section>

                        {/* FAQ Section */}
                        <section id="faq" className="scroll-mt-24">
                            <SectionHeader
                                icon={<HelpCircle className="w-6 h-6" />}
                                title="Preguntas Frecuentes"
                                description="Respuestas a dudas comunes"
                            />

                            <Card className="mt-6 divide-y divide-gray-200">
                                {faqData.map((faq, index) => (
                                    <FaqItem
                                        key={index}
                                        question={faq.question}
                                        answer={faq.answer}
                                        category={faq.category}
                                        isExpanded={expandedFaqs.has(index)}
                                        onToggle={() => toggleFaq(index)}
                                    />
                                ))}
                            </Card>
                        </section>

                        {/* API Reference Section */}
                        <section id="api" className="scroll-mt-24">
                            <SectionHeader
                                icon={<Code className="w-6 h-6" />}
                                title="API Reference"
                                description="Endpoints y ejemplos de código"
                            />

                            <div className="mt-6 space-y-6">
                                <ApiEndpoint
                                    method="GET"
                                    endpoint="/api/clientes"
                                    description="Obtener lista de clientes"
                                    example={`fetch('/api/clientes', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  }
})`}
                                    onCopy={(text) => copyToClipboard(text, 'get-clientes')}
                                    isCopied={copiedCode === 'get-clientes'}
                                />

                                <ApiEndpoint
                                    method="POST"
                                    endpoint="/api/presupuestos"
                                    description="Crear nuevo presupuesto"
                                    example={`fetch('/api/presupuestos', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    cliente_id: 123,
    comision: 5000000,
    porcentaje_inversion_anio: 0.8
  })
})`}
                                    onCopy={(text) => copyToClipboard(text, 'post-presupuesto')}
                                    isCopied={copiedCode === 'post-presupuesto'}
                                />
                            </div>
                        </section>

                        {/* Footer Help */}
                        <Card className="p-8 bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
                            <div className="text-center">
                                <HelpCircle className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    ¿Necesitas más ayuda?
                                </h3>
                                <p className="text-gray-700 mb-6">
                                    Nuestro equipo de soporte está disponible para asistirte
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-3">
                                    <Button icon={MessageSquare}>
                                        Chat en Vivo
                                    </Button>
                                    <Button variant="outline" icon={ExternalLink}>
                                        Centro de Ayuda
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </main>
                </div>
            </div>
        </div>
    );
}

// Helper Components
const SectionHeader: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
}> = ({ icon, title, description }) => (
    <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-primary-100 rounded-lg text-primary-600">
            {icon}
        </div>
        <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{title}</h2>
            <p className="text-gray-600">{description}</p>
        </div>
    </div>
);

const QuickStartCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    link: string;
}> = ({ icon, title, description, link }) => (
    <a
        href={link}
        className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all group"
    >
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-100 text-primary-600 rounded group-hover:bg-primary-600 group-hover:text-white transition-colors">
                {icon}
            </div>
            <h4 className="font-semibold text-gray-900">{title}</h4>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
    </a>
);

const InfoCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    text: string;
    type: 'warning' | 'info' | 'success';
}> = ({ icon, title, text, type }) => {
    const colors = {
        warning: "bg-orange-50 text-orange-900 border-orange-200",
        info: "bg-blue-50 text-blue-900 border-blue-200",
        success: "bg-green-50 text-green-900 border-green-200"
    };

    const iconColors = {
        warning: "text-orange-600",
        info: "text-blue-600",
        success: "text-green-600"
    };

    return (
        <div className={`p-4 rounded-lg border ${colors[type]}`}>
            <div className="flex items-start gap-3">
                <div className={iconColors[type]}>{icon}</div>
                <div>
                    <h4 className="font-bold mb-1">{title}</h4>
                    <p className="text-sm opacity-90">{text}</p>
                </div>
            </div>
        </div>
    );
};

const FlowStep: React.FC<{ number: number; text: string }> = ({ number, text }) => (
    <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
            {number}
        </div>
        <p className="text-gray-700">{text}</p>
    </div>
);

const CollapsibleModuleCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    color: string;
    steps: string[];
    details: {
        description: string;
        keyFeatures: string[];
        bestPractices: string[];
    };
}> = ({ icon, title, color, steps, details }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{steps.length} pasos principales</p>
                    </div>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
            </button>

            {isExpanded && (
                <div className="px-6 pb-6 space-y-6 border-t border-gray-100">
                    {/* Steps */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Pasos Básicos</h4>
                        <ul className="space-y-2">
                            {steps.map((step, i) => (
                                <li key={i} className="flex items-start text-sm text-gray-700">
                                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                    {step}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Description */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Descripción</h4>
                        <p className="text-sm text-gray-700">{details.description}</p>
                    </div>

                    {/* Features & Best Practices */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h5 className="font-semibold text-blue-900 mb-2 text-sm">Características Clave</h5>
                            <ul className="space-y-1">
                                {details.keyFeatures.map((feature, i) => (
                                    <li key={i} className="text-xs text-blue-800 flex items-start">
                                        <span className="mr-1">•</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <h5 className="font-semibold text-green-900 mb-2 text-sm">Mejores Prácticas</h5>
                            <ul className="space-y-1">
                                {details.bestPractices.map((practice, i) => (
                                    <li key={i} className="text-xs text-green-800 flex items-start">
                                        <span className="mr-1">✓</span>
                                        {practice}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

const TutorialCard: React.FC<{
    title: string;
    duration: string;
    difficulty: string;
    steps: number;
}> = ({ title, duration, difficulty, steps }) => {
    const difficultyColors = {
        'Básico': 'bg-green-100 text-green-800',
        'Intermedio': 'bg-yellow-100 text-yellow-800',
        'Avanzado': 'bg-red-100 text-red-800',
    };

    return (
        <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-100 text-primary-600 rounded-lg group-hover:bg-primary-600 group-hover:text-white transition-colors">
                    <Play className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-2">{title}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                            <Video className="w-3 h-3" />
                            {duration}
                        </span>
                        <span>•</span>
                        <span className={`px-2 py-1 rounded ${difficultyColors[difficulty as keyof typeof difficultyColors]}`}>
                            {difficulty}
                        </span>
                        <span>•</span>
                        <span>{steps} pasos</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

const FaqItem: React.FC<{
    question: string;
    answer: string;
    category: string;
    isExpanded: boolean;
    onToggle: () => void;
}> = ({ question, answer, category, isExpanded, onToggle }) => (
    <div className="p-6">
        <button
            onClick={onToggle}
            className="w-full flex items-start justify-between text-left group"
        >
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">{category}</span>
                </div>
                <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {question}
                </h4>
            </div>
            {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
            ) : (
                <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
            )}
        </button>
        {isExpanded && (
            <div className="mt-4 pl-4 border-l-2 border-primary-200">
                <p className="text-gray-700 text-sm leading-relaxed">{answer}</p>
            </div>
        )}
    </div>
);

const ApiEndpoint: React.FC<{
    method: string;
    endpoint: string;
    description: string;
    example: string;
    onCopy: (text: string) => void;
    isCopied: boolean;
}> = ({ method, endpoint, description, example, onCopy, isCopied }) => {
    const methodColors = {
        GET: 'bg-blue-100 text-blue-700',
        POST: 'bg-green-100 text-green-700',
        PUT: 'bg-yellow-100 text-yellow-700',
        DELETE: 'bg-red-100 text-red-700',
    };

    return (
        <Card className="overflow-hidden">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 text-xs font-bold rounded ${methodColors[method as keyof typeof methodColors]}`}>
                        {method}
                    </span>
                    <code className="text-sm font-mono text-gray-900">{endpoint}</code>
                </div>
                <p className="text-sm text-gray-600">{description}</p>
            </div>
            <div className="bg-gray-900 p-4 relative">
                <button
                    onClick={() => onCopy(example)}
                    className="absolute top-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
                >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <pre className="text-xs text-gray-300 overflow-x-auto">
                    <code>{example}</code>
                </pre>
            </div>
        </Card>
    );
};

const InteractiveArchitectureDiagram: React.FC = () => {
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    return (
        <div className="bg-gray-50 p-8 rounded-xl overflow-x-auto">
            <div className="min-w-[800px] flex flex-col items-center space-y-8 relative">
                {/* SVG connections could be added here for better visual flow */}

                {/* Level 1: ARL */}
                <div className="flex space-x-16">
                    <div
                        onMouseEnter={() => setHoveredNode('arl')}
                        onMouseLeave={() => setHoveredNode(null)}
                        className={`transition-all ${hoveredNode === 'arl' ? 'scale-110' : ''}`}
                    >
                        <Node
                            icon={<Shield className="w-5 h-5" />}
                            title="ARL"
                            color="bg-indigo-100 text-indigo-700 border-indigo-300"
                            isHighlighted={hoveredNode === 'arl'}
                        />
                        {hoveredNode === 'arl' && (
                            <div className="absolute mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-64">
                                <p className="text-xs text-gray-700">
                                    Administradora de Riesgos Laborales. Fuente de las primas que generan comisiones.
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="h-8 w-px bg-gray-300"></div>
                        <ArrowRight className="w-4 h-4 text-gray-400 rotate-90 my-1" />
                    </div>
                </div>

                {/* Level 2: Cliente */}
                <div className="relative">
                    <div
                        onMouseEnter={() => setHoveredNode('cliente')}
                        onMouseLeave={() => setHoveredNode(null)}
                        className={`transition-all ${hoveredNode === 'cliente' ? 'scale-110' : ''}`}
                    >
                        <Node
                            icon={<Users className="w-6 h-6" />}
                            title="CLIENTE"
                            isMain
                            color="bg-blue-100 text-blue-700 border-blue-400"
                            isHighlighted={hoveredNode === 'cliente'}
                        />
                    </div>
                    <div className="absolute top-full left-1/2 -ml-px h-8 w-px bg-gray-300"></div>
                </div>

                {/* Level 3: Downstream modules */}
                <div className="flex justify-between w-full max-w-4xl px-4">
                    {/* Comisiones */}
                    <div className="flex flex-col items-center relative group">
                        <div className="absolute -top-8 left-1/2 w-1/2 h-8 border-l border-t border-gray-300 rounded-tl-xl -translate-x-full"></div>
                        <div
                            onMouseEnter={() => setHoveredNode('comisiones')}
                            onMouseLeave={() => setHoveredNode(null)}
                            className={`transition-all ${hoveredNode === 'comisiones' ? 'scale-110' : ''}`}
                        >
                            <Node
                                icon={<DollarSign className="w-5 h-5" />}
                                title="COMISIONES"
                                color="bg-green-100 text-green-700 border-green-300"
                                isHighlighted={hoveredNode === 'comisiones'}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center max-w-[150px]">
                            Ingresos por primas<br />basados en el cliente
                        </p>
                    </div>

                    {/* Presupuesto → Orden */}
                    <div className="flex flex-col items-center relative">
                        <div className="absolute -top-8 left-1/2 w-px h-8 bg-gray-300"></div>
                        <div
                            onMouseEnter={() => setHoveredNode('presupuesto')}
                            onMouseLeave={() => setHoveredNode(null)}
                            className={`transition-all ${hoveredNode === 'presupuesto' ? 'scale-110' : ''}`}
                        >
                            <Node
                                icon={<FileText className="w-5 h-5" />}
                                title="PRESUPUESTO"
                                color="bg-emerald-100 text-emerald-700 border-emerald-300"
                                isHighlighted={hoveredNode === 'presupuesto'}
                            />
                        </div>

                        <div className="h-8 w-px bg-gray-300 my-2"></div>

                        <div
                            onMouseEnter={() => setHoveredNode('orden')}
                            onMouseLeave={() => setHoveredNode(null)}
                            className={`transition-all ${hoveredNode === 'orden' ? 'scale-110' : ''}`}
                        >
                            <Node
                                icon={<ClipboardList className="w-5 h-5" />}
                                title="ORDEN"
                                color="bg-orange-100 text-orange-700 border-orange-300"
                                isHighlighted={hoveredNode === 'orden'}
                            />
                        </div>
                    </div>

                    {/* Aliados */}
                    <div className="flex flex-col items-center relative">
                        <div className="absolute -top-8 right-1/2 w-1/2 h-8 border-r border-t border-gray-300 rounded-tr-xl -translate-x-full"></div>
                        <div
                            onMouseEnter={() => setHoveredNode('aliados')}
                            onMouseLeave={() => setHoveredNode(null)}
                            className={`transition-all ${hoveredNode === 'aliados' ? 'scale-110' : ''}`}
                        >
                            <Node
                                icon={<Users className="w-5 h-5" />}
                                title="ALIADOS"
                                color="bg-purple-100 text-purple-700 border-purple-300"
                                isHighlighted={hoveredNode === 'aliados'}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center max-w-[150px]">
                            Proveedores que ejecutan<br />las órdenes
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Node: React.FC<{
    icon: React.ReactNode;
    title: string;
    color: string;
    isMain?: boolean;
    isHighlighted?: boolean;
}> = ({ icon, title, color, isMain = false, isHighlighted = false }) => (
    <div
        className={`
            flex flex-col items-center justify-center rounded-lg border-2 shadow-sm z-10 font-bold text-xs transition-all
            ${color} 
            ${isMain ? 'w-40 h-20 text-sm ring-4 ring-offset-2 ring-blue-100' : 'w-32 h-16'}
            ${isHighlighted ? 'shadow-lg ring-2 ring-offset-2 ring-primary-400' : ''}
        `}
    >
        <div className="mb-1">{icon}</div>
        {title}
    </div>
);

// FAQ Data
const faqData = [
    {
        question: "¿Puedo borrar un Cliente que tiene Órdenes de Servicio?",
        answer: "NO. Por integridad de datos, primero debe eliminar o archivar las órdenes y presupuestos asociados. El sistema protege los datos históricos para mantener la trazabilidad completa de todas las transacciones.",
        category: "Clientes"
    },
    {
        question: "¿Qué sucede si un Aliado cambia sus tarifas?",
        answer: "Debe actualizar el valor en el módulo Aliados. Las Órdenes de Servicio NUEVAS tomarán el nuevo valor; las antiguas conservarán el precio histórico. Esto garantiza que los costos pasados se mantengan exactos.",
        category: "Aliados"
    },
    {
        question: "Soy usuario de CONSULTA y no veo botones de guardar.",
        answer: "Es el comportamiento esperado. Su rol solo permite visualizar información, no modificarla ni crear registros nuevos. Contacte al administrador si necesita permisos adicionales.",
        category: "Permisos"
    },
    {
        question: "¿Cómo se calculan las comisiones automáticamente?",
        answer: "Las comisiones se calculan multiplicando la prima emitida por la ARL por el porcentaje de comisión configurado en el cliente. Este cálculo se realiza automáticamente al registrar un pago.",
        category: "Comisiones"
    },
    {
        question: "¿Puedo crear múltiples presupuestos para un mismo cliente?",
        answer: "Sí, puede crear varios presupuestos para diferentes periodos o proyectos. Cada presupuesto se gestiona de forma independiente y tiene su propio saldo disponible.",
        category: "Presupuestos"
    }
];
