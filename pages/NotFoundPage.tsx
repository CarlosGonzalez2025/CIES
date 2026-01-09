import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { SearchBar } from '../components/shared/SearchBar';
import {
  Home,
  Search,
  ArrowLeft,
  FileQuestion,
  Compass,
  BookOpen,
  BarChart3,
  Users,
  DollarSign,
  RefreshCw,
  Mail,
  HelpCircle,
} from 'lucide-react';

// Different 404 page variants
type PageVariant = 'default' | 'creative' | 'minimal' | 'illustrated';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [variant, setVariant] = useState<PageVariant>('default');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    // Randomly select a variant (or use default)
    const variants: PageVariant[] = ['default', 'creative', 'minimal', 'illustrated'];
    setVariant(variants[Math.floor(Math.random() * variants.length)]);
  }, []);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleGoBack = () => {
    window.history.length > 1 ? navigate(-1) : navigate('/');
  };

  // Popular/Recommended links
  const recommendedLinks = [
    { to: '/', icon: Home, label: 'Inicio', description: 'Volver a la página principal' },
    { to: '/dashboard', icon: BarChart3, label: 'Dashboard', description: 'Ver tus estadísticas' },
    { to: '/clientes', icon: Users, label: 'Clientes', description: 'Gestionar clientes' },
    { to: '/presupuestos', icon: DollarSign, label: 'Presupuestos', description: 'Ver presupuestos' },
  ];

  if (variant === 'creative') {
    return <CreativeNotFound onGoBack={handleGoBack} />;
  }

  if (variant === 'minimal') {
    return <MinimalNotFound onGoBack={handleGoBack} />;
  }

  if (variant === 'illustrated') {
    return <IllustratedNotFound onGoBack={handleGoBack} />;
  }

  // Default enhanced 404 page
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Main Content */}
        <div className={`text-center transition-all duration-1000 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* 404 Number with Animation */}
          <div className="relative inline-block mb-8">
            <h1 className="text-9xl md:text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 animate-pulse">
              404
            </h1>
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-full opacity-20 animate-ping"></div>
          </div>

          {/* Error Message */}
          <div className="mb-8 space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              ¡Oops! Página no encontrada
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Lo sentimos, la página que estás buscando no existe o ha sido movida.
              Parece que te has perdido en el espacio digital.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-12 max-w-xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-4 flex items-center justify-center gap-2">
                <Search className="w-4 h-4" />
                ¿Qué estabas buscando? Intenta buscar aquí:
              </p>
              <SearchBar
                onSearch={handleSearch}
                placeholder="Buscar en el sitio..."
                value={searchQuery}
                autoFocus
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-12 flex flex-wrap items-center justify-center gap-4">
            <Button
              onClick={handleGoBack}
              icon={ArrowLeft}
              size="lg"
              variant="primary"
            >
              Volver Atrás
            </Button>

            <Link to="/">
              <Button
                icon={Home}
                size="lg"
                variant="outline"
              >
                Ir al Inicio
              </Button>
            </Link>

            <Button
              onClick={() => window.location.reload()}
              icon={RefreshCw}
              size="lg"
              variant="ghost"
            >
              Recargar Página
            </Button>
          </div>

          {/* Recommended Links */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              O visita una de estas páginas:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {recommendedLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 hover:border-primary-300 hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary-100 text-primary-600 rounded-lg group-hover:bg-primary-600 group-hover:text-white transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="text-left flex-1">
                        <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {link.label}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {link.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-3">
              <HelpCircle className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">
                ¿Necesitas ayuda?
              </h3>
            </div>
            <p className="text-sm text-blue-700 mb-4">
              Si crees que esto es un error o necesitas asistencia, no dudes en contactarnos.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/ayuda">
                <Button variant="outline" size="sm" icon={BookOpen}>
                  Centro de Ayuda
                </Button>
              </Link>
              <Link to="/contacto">
                <Button variant="outline" size="sm" icon={Mail}>
                  Contactar Soporte
                </Button>
              </Link>
            </div>
          </div>

          {/* Fun Facts or Tips (Optional) */}
          <div className="mt-12 text-sm text-gray-500">
            <p className="italic">
              "No todos los que deambulan están perdidos... pero tú sí." - J.R.R. Tolkien (más o menos)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Creative 404 Variant
const CreativeNotFound: React.FC<{ onGoBack: () => void }> = ({ onGoBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-white rounded-full opacity-10 -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-64 h-64 bg-white rounded-full opacity-10 -bottom-32 -right-32 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 text-center text-white max-w-2xl">
        <div className="mb-8">
          <div className="inline-block animate-bounce">
            <FileQuestion className="w-32 h-32 mb-6" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-7xl md:text-9xl font-black mb-6 animate-pulse">
          404
        </h1>

        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          ¡Houston, tenemos un problema!
        </h2>

        <p className="text-xl mb-8 opacity-90">
          La página que buscas se ha ido a otra dimensión.
          Nuestros científicos están trabajando para traerla de vuelta.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button
            onClick={onGoBack}
            variant="outline"
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100 border-white"
            icon={ArrowLeft}
          >
            Regresar al Planeta Tierra
          </Button>

          <Link to="/">
            <Button
              variant="outline"
              size="lg"
              className="bg-transparent text-white border-white hover:bg-white hover:text-purple-600"
              icon={Home}
            >
              Base de Operaciones
            </Button>
          </Link>
        </div>

        <div className="mt-12 text-sm opacity-75">
          <p>Error Code: LOST_IN_SPACE_404</p>
        </div>
      </div>
    </div>
  );
};

// Minimal 404 Variant
const MinimalNotFound: React.FC<{ onGoBack: () => void }> = ({ onGoBack }) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-4xl">🔍</span>
          </div>
        </div>

        <h1 className="text-8xl font-bold text-gray-900 mb-4">404</h1>

        <h2 className="text-2xl font-semibold text-gray-700 mb-3">
          Página no encontrada
        </h2>

        <p className="text-gray-600 mb-8">
          La página que buscas no existe.
        </p>

        <div className="space-y-3">
          <Button
            onClick={onGoBack}
            variant="primary"
            size="lg"
            className="w-full"
            icon={ArrowLeft}
          >
            Volver Atrás
          </Button>

          <Link to="/" className="block">
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              icon={Home}
            >
              Ir al Inicio
            </Button>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            ¿Necesitas ayuda?{' '}
            <Link to="/contacto" className="text-primary-600 hover:underline font-medium">
              Contáctanos
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Illustrated 404 Variant
const IllustratedNotFound: React.FC<{ onGoBack: () => void }> = ({ onGoBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Illustration Side */}
          <div className="order-2 md:order-1">
            <div className="relative">
              {/* Simple SVG Illustration */}
              <svg
                viewBox="0 0 400 300"
                className="w-full h-auto"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Lost person */}
                <circle cx="200" cy="150" r="40" fill="#3B82F6" opacity="0.2" className="animate-pulse" />
                <circle cx="200" cy="140" r="25" fill="#3B82F6" />
                <rect x="185" y="165" width="30" height="50" rx="5" fill="#3B82F6" />

                {/* Question marks floating */}
                <text x="120" y="80" fontSize="40" fill="#9CA3AF" className="animate-bounce">?</text>
                <text x="260" y="100" fontSize="35" fill="#9CA3AF" className="animate-bounce delay-300">?</text>
                <text x="180" y="50" fontSize="30" fill="#9CA3AF" className="animate-bounce delay-700">?</text>

                {/* Compass */}
                <circle cx="320" cy="240" r="30" fill="none" stroke="#10B981" strokeWidth="3" />
                <line x1="320" y1="220" x2="320" y2="230" stroke="#10B981" strokeWidth="3" />
                <text x="315" y="250" fontSize="12" fill="#10B981" fontWeight="bold">N</text>
              </svg>
            </div>
          </div>

          {/* Content Side */}
          <div className="order-1 md:order-2 text-center md:text-left">
            <h1 className="text-8xl font-black text-primary-600 mb-4">
              404
            </h1>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¡Te has perdido!
            </h2>

            <p className="text-lg text-gray-600 mb-8">
              Parece que has tomado un camino equivocado.
              No te preocupes, te ayudaremos a encontrar el camino de vuelta.
            </p>

            <div className="space-y-3">
              <Button
                onClick={onGoBack}
                variant="primary"
                size="lg"
                className="w-full md:w-auto"
                icon={ArrowLeft}
              >
                Volver Atrás
              </Button>

              <Link to="/">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full md:w-auto md:ml-3"
                  icon={Compass}
                >
                  Encontrar el Camino
                </Button>
              </Link>
            </div>

            {/* Fun tip */}
            <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="text-sm text-blue-800">
                <strong>💡 Consejo:</strong> Usa la búsqueda en la barra superior para encontrar lo que necesitas.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600 mb-4 font-medium">
            Enlaces rápidos que podrían interesarte:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/dashboard" className="text-primary-600 hover:underline flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </Link>
            <Link to="/clientes" className="text-primary-600 hover:underline flex items-center gap-2">
              <Users className="w-4 h-4" />
              Clientes
            </Link>
            <Link to="/presupuestos" className="text-primary-600 hover:underline flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Presupuestos
            </Link>
            <Link to="/ayuda" className="text-primary-600 hover:underline flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Ayuda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
