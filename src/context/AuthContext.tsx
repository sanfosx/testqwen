import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Loader2 } from 'lucide-react';
import { insforge, isInsforgeConfigured } from '../lib/insforge';

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextValue {
  /** Usuario autenticado o null. */
  user: AdminUser | null;
  /** True mientras se restaura la sesión inicial. */
  loading: boolean;
  /** True cuando InsForge no está configurado (modo demo sin backend). */
  demoMode: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Shell de carga reutilizado por el provider y ProtectedRoute. */
export const AuthSpinner: React.FC = () => (
  <div className="min-h-screen bg-gray-950 flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
  </div>
);

/**
 * Credenciales de la cuenta demo usada ÚNICAMENTE cuando InsForge no está
 * configurado (fallback a localStorage). En producción esto nunca se usa:
 * la autenticación real ocurre contra `insforge.auth`.
 * Sobrescribilas en `.env` y cambiá el password por defecto.
 */
const DEMO_EMAIL = import.meta.env.VITE_DEMO_ADMIN_EMAIL || 'admin@losgenios.com';
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_ADMIN_PASSWORD || 'cambiar-este-password';
const DEMO_SESSION_KEY = 'pizzeria_admin_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const demoMode = !isInsforgeConfigured();

  // Restaurar sesión al montar.
  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      if (demoMode) {
        try {
          const raw = sessionStorage.getItem(DEMO_SESSION_KEY);
          if (raw) setUser(JSON.parse(raw) as AdminUser);
        } catch {
          sessionStorage.removeItem(DEMO_SESSION_KEY);
        }
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        // Intenta renovar el access token con la cookie httpOnly de refresh.
        await insforge.auth.refreshSession();
        const { data } = await insforge.auth.getCurrentUser();
        if (!cancelled && data?.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            name: (data.user as { profile?: { name?: string } }).profile?.name,
          });
        }
      } catch {
        // Sin sesión válida: permanece deslogueado.
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    restore();
    return () => {
      cancelled = true;
    };
  }, [demoMode]);

  const login = useCallback(
    async (email: string, password: string) => {
      if (demoMode) {
        if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
          const demoUser: AdminUser = { id: 'demo', email };
          setUser(demoUser);
          sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoUser));
          return { ok: true };
        }
        return { ok: false, error: 'Credenciales inválidas' };
      }

      const { data, error } = await insforge.auth.signInWithPassword({
        email,
        password,
        method: 'password',
      } as Parameters<typeof insforge.auth.signInWithPassword>[0]);

      if (error || !data) {
        return { ok: false, error: error?.message || 'Credenciales inválidas' };
      }

      setUser({ id: data.user.id, email: data.user.email });
      return { ok: true };
    },
    [demoMode],
  );

  const logout = useCallback(async () => {
    setUser(null);
    if (demoMode) {
      sessionStorage.removeItem(DEMO_SESSION_KEY);
      return;
    }
    try {
      await insforge.auth.signOut();
    } catch {
      // La sesión local ya fue limpiada; ignoramos errores de red.
    }
  }, [demoMode]);

  const value = useMemo(
    () => ({ user, loading, demoMode, login, logout }),
    [user, loading, demoMode, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {loading ? <AuthSpinner /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
};
