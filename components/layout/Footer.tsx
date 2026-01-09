import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  ExternalLink,
  Heart,
  Shield,
  FileText,
  HelpCircle,
  BookOpen,
  Github,
  Globe,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// Componente de estado del sistema
const SystemStatus: React.FC = () => {
  const [status, setStatus] = useState<'operational' | 'degraded' | 'down'>('operational');
  const [lastChecked, setLastChecked] = useState(new Date());

  useEffect(() => {
    // Aquí iría la lógica real de verificación del sistema
    const checkStatus = () => {
      // Simulación - reemplazar con llamada real a API de estado
      setStatus('operational');
      setLastChecked(new Date());
    };

    const interval = setInterval(checkStatus, 60000); // Check cada minuto
    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    operational: {
      icon: CheckCircle2,
      text: 'Todos los sistemas operativos',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      dotColor: 'bg-green-500',
    },
    degraded: {
      icon: AlertCircle,
      text: 'Rendimiento degradado',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      dotColor: 'bg-amber-500',
    },
    down: {
      icon: AlertCircle,
      text: 'Problemas detectados',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      dotColor: 'bg-red-500',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex items-center space-x-2 text-xs">
      <div className="flex items-center space-x-1.5">
        <span className={`relative flex h-2 w-2`}>
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.dotColor} opacity-75`}
          ></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`}></span>
        </span>
        <span className={`font-medium ${config.color}`}>{config.text}</span>
      </div>
      <span className="text-gray-400">•</span>
      <span className="text-gray-500 flex items-center">
        <Clock className="w-3 h-3 mr-1" />
        Actualizado hace {Math.floor((Date.now() - lastChecked.getTime()) / 1000)}s
      </span>
    </div>
  );
};

// Componente de links sociales
const SocialLinks: React.FC = () => {
  const socialNetworks = [
    { icon: Facebook, href: 'https://facebook.com/cies', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/cies', label: 'Twitter' },
    { icon: Linkedin, href: 'https://linkedin.com/company/cies', label: 'LinkedIn' },
    { icon: Instagram, href: 'https://instagram.com/cies', label: 'Instagram' },
    { icon: Youtube, href: 'https://youtube.com/@cies', label: 'YouTube' },
  ];

  return (
    <div className="flex items-center space-x-2">
      {socialNetworks.map((social) => {
        const Icon = social.icon;
        return (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={social.label}
            title={social.label}
          >
            <Icon className="w-4 h-4" />
          </a>
        );
      })}
    </div>
  );
};

export const Footer: React.FC = () => {
  const { profile } = useAuth();
  const currentYear = new Date().getFullYear();
  const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';
  const buildDate = import.meta.env.VITE_BUILD_DATE || new Date().toISOString().split('T')[0];

  // Links principales del footer
  const footerSections = {
    producto: [
      { label: 'Características', path: '/caracteristicas' },
      { label: 'Precios', path: '/precios' },
      { label: 'Actualizaciones', path: '/actualizaciones' },
      { label: 'Roadmap', path: '/roadmap' },
    ],
    soporte: [
      { label: 'Centro de Ayuda', path: '/ayuda', icon: HelpCircle },
      { label: 'Documentación', path: '/documentacion', icon: BookOpen },
      { label: 'API Reference', path: '/api', icon: FileText },
      { label: 'Contacto', path: '/contacto', icon: Mail },
    ],
    empresa: [
      { label: 'Acerca de', path: '/acerca' },
      { label: 'Blog', path: '/blog' },
      { label: 'Carreras', path: '/carreras' },
      { label: 'Prensa', path: '/prensa' },
    ],
    legal: [
      { label: 'Términos de Servicio', path: '/terminos' },
      { label: 'Política de Privacidad', path: '/privacidad' },
      { label: 'Política de Cookies', path: '/cookies' },
      { label: 'Cumplimiento', path: '/cumplimiento' },
    ],
  };

  // Footer minimalista para dashboards
  const MinimalFooter = () => (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left Section - Brand & Copyright */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-primary-600">CIES</h2>
                <span className="text-xs text-gray-400">v{appVersion}</span>
              </div>
              <p className="text-sm text-gray-600">
                © {currentYear} CIES Seguros y Soluciones.{' '}
                <span className="hidden sm:inline">Todos los derechos reservados.</span>
              </p>
            </div>

            {/* Center Section - Quick Links */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <Link
                to="/ayuda"
                className="flex items-center text-gray-600 hover:text-primary-600 transition-colors"
              >
                <HelpCircle className="w-4 h-4 mr-1.5" />
                Ayuda
              </Link>
              <Link
                to="/documentacion"
                className="flex items-center text-gray-600 hover:text-primary-600 transition-colors"
              >
                <BookOpen className="w-4 h-4 mr-1.5" />
                Documentación
              </Link>
              <Link
                to="/terminos"
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                Términos
              </Link>
              <Link
                to="/privacidad"
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                Privacidad
              </Link>
            </div>

            {/* Right Section - Social & Status */}
            <div className="flex flex-col md:items-end space-y-2">
              <SocialLinks />
              <SystemStatus />
            </div>
          </div>
        </div>

        {/* Bottom Bar - Additional Info */}
        <div className="border-t border-gray-100 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Shield className="w-3 h-3 mr-1" />
                SSL Seguro
              </span>
              <span className="flex items-center">
                <Globe className="w-3 h-3 mr-1" />
                Bogotá, Colombia
              </span>
              {profile?.rol === 'ADMIN' && (
                <span className="flex items-center text-primary-600">
                  <Activity className="w-3 h-3 mr-1" />
                  Build: {buildDate}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1">
              <span>Hecho con</span>
              <Heart className="w-3 h-3 text-red-500 fill-current" />
              <span>por</span>
              <a
                href="https://www.datenova.io"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary-600 hover:text-primary-700 transition-colors hover:underline"
              >
                DateNova
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );

  // Footer completo para páginas públicas/marketing
  const FullFooter = () => (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Main Footer Grid */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <h2 className="text-2xl font-bold text-white">CIES</h2>
            </div>
            <p className="text-sm text-gray-400 mb-4 max-w-xs">
              Soluciones integrales en seguros y gestión de riesgos para empresas.
            </p>
            <SocialLinks />
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Producto</h3>
            <ul className="space-y-2">
              {footerSections.producto.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Soporte</h3>
            <ul className="space-y-2">
              {footerSections.soporte.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center"
                  >
                    {link.icon && <link.icon className="w-3.5 h-3.5 mr-1.5" />}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Empresa</h3>
            <ul className="space-y-2">
              {footerSections.empresa.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerSections.legal.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} CIES Seguros y Soluciones. Todos los derechos reservados.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span className="flex items-center">
                <Shield className="w-3.5 h-3.5 mr-1" />
                SSL Seguro
              </span>
              <span className="flex items-center">
                <Globe className="w-3.5 h-3.5 mr-1" />
                Colombia
              </span>
              <span>v{appVersion}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );

  // Retornar footer minimalista para usuarios autenticados en dashboard
  // y footer completo para páginas públicas
  return profile ? <MinimalFooter /> : <FullFooter />;
};

// Export también variantes específicas si se necesitan
export const DashboardFooter = () => {
  const currentYear = new Date().getFullYear();
  const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
          <div className="flex items-center space-x-4">
            <p className="text-gray-600">
              © {currentYear} CIES <span className="hidden sm:inline">Seguros y Soluciones</span>
            </p>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">v{appVersion}</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/ayuda" className="text-gray-600 hover:text-primary-600 transition-colors">
              Ayuda
            </Link>
            <Link
              to="/terminos"
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              Términos
            </Link>
            <SystemStatus />
          </div>
        </div>
      </div>
    </footer>
  );
};
