
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Mail, Lock, Shield, BarChart3, Users, FileText } from 'lucide-react';

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
      toast.error(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

      <div className="w-full max-w-6xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-8 items-center">

          {/* Left Side - Branding */}
          <div className="hidden lg:block text-white space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">CIES</h1>
                  <p className="text-primary-100 text-lg">Seguros y Soluciones</p>
                </div>
              </div>

              <h2 className="text-3xl font-bold leading-tight">
                Sistema de Gestión Integral
              </h2>

              <p className="text-primary-100 text-lg">
                Administra comisiones ARL, presupuestos, órdenes de servicio y más en una sola plataforma.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3 bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Comisiones ARL</h3>
                  <p className="text-sm text-primary-100">Gestión completa de primas y comisiones de seguros</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Clientes y Aliados</h3>
                  <p className="text-sm text-primary-100">Administra tu red de clientes y socios estratégicos</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Órdenes de Servicio</h3>
                  <p className="text-sm text-primary-100">Control total de tus órdenes de trabajo</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full">
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
              {/* Logo Mobile */}
              <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">CIES</h1>
                  <p className="text-sm text-gray-500">Seguros y Soluciones</p>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Iniciar Sesión
                </h2>
                <p className="text-gray-600">
                  Ingresa tus credenciales para acceder al sistema
                </p>
              </div>

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
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                      disabled={loading}
                    />
                    <span className="ml-2 text-sm text-gray-700">Recordarme</span>
                  </label>

                  <button
                    type="button"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                    disabled={loading}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  isLoading={loading}
                >
                  {loading ? 'Iniciando sesión...' : 'Ingresar al Sistema'}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-center text-sm text-gray-500">
                  ¿Necesitas ayuda?{' '}
                  <a
                    href="mailto:soporte@cies.com"
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    Contacta a soporte
                  </a>
                </p>
              </div>
            </div>

            {/* Footer Note */}
            <p className="text-center text-white/80 text-sm mt-6">
              © 2025 CIES Seguros y Soluciones. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
