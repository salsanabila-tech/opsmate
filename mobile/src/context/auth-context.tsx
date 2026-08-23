import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { fetchCurrentUser, loginUser, logoutUser } from '../services/auth.service';

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
        const refreshToken = await getRefreshToken();

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

        setUser(response.data.user);

        setStatus('authenticated');
      } catch (error) {
        console.error('Restore session failed:', error);

        await clearTokens();

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
    const response = await loginUser({
      email: email.trim(),
      password,
    });

    await saveTokens({
      accessToken: response.data.accessToken,

      refreshToken: response.data.refreshToken,
    });

    setUser(response.data.user);

    setStatus('authenticated');
  }

  async function signOut(): Promise<void> {
    try {
      await logoutUser();
    } catch (error) {
      console.warn('Server logout failed:', error);
    } finally {
      await clearTokens();

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

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }

  return context;
}
