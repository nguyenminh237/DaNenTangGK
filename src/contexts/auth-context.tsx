import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import { isAdminUid } from '@/config/admin';
import { authService } from '@/services/auth.service';
import { getErrorMessage } from '@/utils/service-error';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const fail = (cause: unknown) => {
      if (!active) return;
      setUser(null);
      setError(getErrorMessage(cause));
      setLoading(false);
    };
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = authService.subscribe((nextUser) => {
        if (!active) return;
        setUser(nextUser);
        setError('');
        setLoading(false);
      }, fail);
    } catch (cause) { fail(cause); }
    return () => { active = false; unsubscribe?.(); };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, isAdmin: isAdminUid(user?.uid) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth phải được dùng bên trong AuthProvider.');
  return context;
}
