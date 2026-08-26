import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { fetchCurrentUser, loginUser, logoutUser, registerCustomer } from '../services/auth.service';

import { clearTokens, getRefreshToken, saveTokens } from '../services/token-storage';

import type { AuthUser, RegisterCustomerInput } from '../types/auth';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  user: AuthUser | null;

  status: AuthStatus;

  signIn: (email: string, password: string) => Promise<void>;

  signUp: (input: RegisterCustomerInput) => Promise<void>;

  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function assertCustomerUser(user: AuthUser): void {
  if (user.role !== 'CUSTOMER') {
    throw new Error('OpsMate Customer hanya dapat digunakan oleh akun Customer.');
  }

  if (!user.customerId) {
    throw new Error('Profil Customer tidak ditemukan pada akun ini.');
  }
}

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

        try {
          assertCustomerUser(response.data.user);
        } catch {
          try {
            await logoutUser();
          } catch {
            // Local token tetap dibersihkan.
          }

          await clearTokens();

          setUser(null);

          setStatus('unauthenticated');

          return;
        }

        setUser(response.data.user);

        setStatus('authenticated');
      } catch (error) {
        console.error('Restore customer session failed:', error);

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
      email,
      password,
    });

    await saveTokens({
      accessToken: response.data.accessToken,

      refreshToken: response.data.refreshToken,
    });

    try {
      assertCustomerUser(response.data.user);
    } catch (error) {
      try {
        await logoutUser();
      } catch {
        // Session lokal tetap dibersihkan.
      }

      await clearTokens();

      setUser(null);

      setStatus('unauthenticated');

      throw error;
    }

    setUser(response.data.user);

    setStatus('authenticated');
  }

  async function signUp(input: RegisterCustomerInput): Promise<void> {
    await registerCustomer(input);

    await signIn(input.email, input.password);
  }

  async function signOut(): Promise<void> {
    try {
      await logoutUser();
    } catch (error) {
      console.warn('Customer logout on server failed:', error);
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
      signUp,
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
