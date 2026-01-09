
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { User, Session } from '@supabase/supabase-js';
import type { PerfilUsuario } from '../types';

interface AuthContextType {
  user: User | null;
  profile: PerfilUsuario | null;
  session: Session | null;
  loading: boolean;
  logout: () => Promise<void>;
  hasPermission: (modulePath: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PerfilUsuario | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data);
      } else {
        // Fallback for initial admin or if profile doesn't exist yet
        console.warn('Profile not found for user:', userId, error?.message);
        setProfile(null);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setProfile(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      try {
        // Llamada directa sin timeout - dejar que Supabase maneje sus tiempos
        const { data, error } = await supabase.auth.getSession();

        // Si hay un error de refresh token, limpiar la sesión
        if (error?.message?.includes('refresh') || error?.message?.includes('token') || error?.message?.includes('invalid')) {
          await supabase.auth.signOut();
          // Limpiar localStorage manualmente si es necesario
          localStorage.removeItem('sb-czszsegsoigpxtfyplsl-auth-token');
          if (mounted) setLoading(false);
          return;
        }

        if (error) {
          console.error('Session error:', error.message);
          if (mounted) setLoading(false);
          return;
        }

        if (mounted && data?.session) {
          setSession(data.session);
          setUser(data.session.user ?? null);
          if (data.session.user) {
            await fetchProfile(data.session.user.id);
          }
        }
      } catch (error: any) {
        console.error("Auth initialization error:", error?.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Detectar errores de token refresh y limpiar sesión silenciosamente
      if (_event === 'TOKEN_REFRESHED' && !session) {
        setSession(null);
        setUser(null);
        setProfile(null);
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }

      if (_event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Limpiar estado local
      setSession(null);
      setUser(null);
      setProfile(null);

      toast.success('Sesión cerrada exitosamente');

      // Forzar navegación al login
      navigate('/login', { replace: true });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(`Error al cerrar sesión: ${error.message}`);

      // Aún así intentar navegar al login
      navigate('/login', { replace: true });
    }
  };

  const hasPermission = (modulePath: string): boolean => {
    if (!profile) return true; // Fail open for dev/first admin, or strict based on policy
    // Admins see everything
    if (profile.rol === 'ADMIN') return true;
    return profile.modulos_autorizados.includes(modulePath);
  };

  const value = {
    user,
    profile,
    session,
    loading,
    logout,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
