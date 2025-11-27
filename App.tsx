
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Layout } from './components/layout/Layout';
import { Loader } from './components/ui/Loader';
import { ErrorBoundary } from './components/shared/ErrorBoundary';

// Pages
import DashboardPage from './pages/DashboardPage';
import ClientesPage from './pages/ClientesPage';
import AliadosPage from './pages/AliadosPage';
import ComisionesPage from './pages/ComisionesPage';
import PresupuestoPage from './pages/PresupuestoPage';
import OrdenesServicioPage from './pages/OrdenesServicioPage';
import UsuariosPage from './pages/UsuariosPage';
import ClientePortalPage from './pages/ClientePortalPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><Layout><DashboardPage /></Layout></PrivateRoute>} />
      <Route path="/portal-cliente" element={<PrivateRoute><Layout><ClientePortalPage /></Layout></PrivateRoute>} />
      <Route path="/clientes" element={<PrivateRoute><Layout><ClientesPage /></Layout></PrivateRoute>} />
      <Route path="/aliados" element={<PrivateRoute><Layout><AliadosPage /></Layout></PrivateRoute>} />
      <Route path="/comisiones" element={<PrivateRoute><Layout><ComisionesPage /></Layout></PrivateRoute>} />
      <Route path="/presupuesto" element={<PrivateRoute><Layout><PresupuestoPage /></Layout></PrivateRoute>} />
      <Route path="/ordenes-servicio" element={<PrivateRoute><Layout><OrdenesServicioPage /></Layout></PrivateRoute>} />
      <Route path="/usuarios" element={<PrivateRoute><Layout><UsuariosPage /></Layout></PrivateRoute>} />
      {/* Placeholder pages */}
      <Route path="/reportes" element={<PrivateRoute><Layout><div><h1>Reportes</h1></div></Layout></PrivateRoute>} />
      <Route path="/configuracion" element={<PrivateRoute><Layout><div><h1>Configuración</h1></div></Layout></PrivateRoute>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
            <Toaster position="top-right" />
          </AuthProvider>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
