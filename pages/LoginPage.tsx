import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Mail, Lock, Shield, BarChart3, Users, FileText, ArrowRight } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('¡Bienvenido a CIES!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.error_description || error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return <Navigate to="/" replace />;
  }

  const features = [
    {
      icon: BarChart3,
      title: 'Comisiones ARL',
      description: 'Gestión completa de primas y comisiones de seguros',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      title: 'Clientes y Aliados',
      description: 'Administra tu red de clientes y socios estratégicos',
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      icon: FileText,
      title: 'Órdenes de Servicio',
      description: 'Control total de tus órdenes de trabajo',
      gradient: 'from-amber-500 to-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />

      {/* Animated Gradient Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

      <div className="w-full max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">

          {/* Left Side - Branding & Features */}
          <div className="hidden lg:block text-white space-y-8 animate-fade-in-left">
            {/* Logo and Title */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-white/20 shadow-lg transform transition-transform hover:scale-105">
                  <img
                    src="https://i.postimg.cc/dV5QBqw5/CIES-07.png"
                    alt="CIES Logo"
                    className="h-14 w-auto object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-5xl font-bold tracking-tight">CIES</h1>
                  <p className="text-primary-100 text-lg font-medium">Seguros y Soluciones</p>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-4xl font-bold leading-tight">
                  Sistema de Gestión Integral
                </h2>
                <p className="text-primary-100 text-lg leading-relaxed">
                  Administra comisiones ARL, presupuestos, órdenes de servicio y más en una sola plataforma.
                </p>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group flex items-start space-x-4 bg-white/5 backdrop-blur-md rounded-xl p-5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer transform hover:translate-x-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                    <p className="text-sm text-primary-100 leading-relaxed">{feature.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full animate-fade-in-right">
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 backdrop-blur-sm">

              {/* Mobile Logo */}
              <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
                <div className="bg-white rounded-xl p-2 shadow-lg border border-gray-200">
                  <img
                    src="https://i.postimg.cc/dV5QBqw5/CIES-07.png"
                    alt="CIES Logo"
                    className="h-12 w-auto object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">CIES</h1>
                  <p className="text-sm text-gray-600 font-medium">Seguros y Soluciones</p>
                </div>
              </div>

              {/* Form Header */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Iniciar Sesión
                </h2>
                <p className="text-gray-600">
                  Ingresa tus credenciales para acceder al sistema
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                <Input
                  label="Correo Electrónico"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@cies.com"
                  required
                  disabled={loading}
                  icon={Mail}
                  autoComplete="email"
                />

                <Input
                  label="Contraseña"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  icon={Lock}
                  autoComplete="current-password"
                />

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 cursor-pointer transition-all"
                      disabled={loading}
                    />
                    <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                      Recordarme
                    </span>
                  </label>

                  <button
                    type="button"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors hover:underline focus:outline-none focus:underline"
                    disabled={loading}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  isLoading={loading}
                  disabled={loading}
                >
                  {loading ? 'Iniciando sesión...' : 'Ingresar al Sistema'}
                </Button>
              </form>

              {/* Support Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-center text-sm text-gray-600">
                  ¿Necesitas ayuda?{' '}
                  <a
                    href="mailto:soporte@cies.com"
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors hover:underline focus:outline-none focus:underline"
                  >
                    Contacta a soporte
                  </a>
                </p>
              </div>
            </div>

            {/* Footer Note */}
            <p className="text-center text-white/90 text-sm mt-6 font-medium">
              © {new Date().getFullYear()} CIES Seguros y Soluciones. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>

      {/* Add custom animations to your global CSS */}
      <style jsx>{`
        @keyframes fade-in-left {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-fade-in-left {
          animation: fade-in-left 0.6s ease-out;
        }

        .animate-fade-in-right {
          animation: fade-in-right 0.6s ease-out;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
