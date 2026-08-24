import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { fetchCurrentUser, loginAdmin, logoutAdmin } from '../services/auth.service';

import { clearTokens, getRefreshToken, saveTokens } from '../services/token-storage';

import type { AuthUser } from '../types/auth';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  user: AuthUser | null;

  status: AuthStatus;

  signIn: (email: string, password: string) => Promise<void>;

  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const refreshToken = getRefreshToken();

        if (!refreshToken) {
          if (mounted) {
            setUser(null);

            setStatus('unauthenticated');
          }

          return;
        }

        const response = await fetchCurrentUser();

        if (!mounted) {
          return;
        }

        if (response.data.user.role !== 'ADMIN') {
          clearTokens();

          setUser(null);

          setStatus('unauthenticated');

          return;
        }

        setUser(response.data.user);

        setStatus('authenticated');
      } catch {
        clearTokens();

        if (mounted) {
          setUser(null);

          setStatus('unauthenticated');
        }
      }
    }

    void restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  async function signIn(email: string, password: string): Promise<void> {
    const response = await loginAdmin({
      email,
      password,
    });

    if (response.data.user.role !== 'ADMIN') {
      throw new Error('Akun ini bukan akun Admin.');
    }

    saveTokens({
      accessToken: response.data.accessToken,

      refreshToken: response.data.refreshToken,
    });

    setUser(response.data.user);

    setStatus('authenticated');
  }

  async function signOut(): Promise<void> {
    try {
      await logoutAdmin();
    } catch {
      // Local session tetap dibersihkan
      // walaupun server logout gagal.
    } finally {
      clearTokens();

      setUser(null);

      setStatus('unauthenticated');
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      signIn,
      signOut,
    }),
    [user, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }

  return context;
}
