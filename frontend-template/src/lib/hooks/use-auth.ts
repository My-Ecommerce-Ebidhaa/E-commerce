'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useCallback } from 'react';

export function useAuth() {
  const { data: session, status } = useSession();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;

  const isCustomer = user?.role === 'CUSTOMER';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const login = useCallback(
    async (email: string, password: string, tenantSlug?: string, callbackUrl?: string) => {
      const result = await signIn('credentials', {
        email,
        password,
        tenantSlug,
        redirect: false,
        callbackUrl: callbackUrl || '/',
      });

      return result;
    },
    []
  );

  const logout = useCallback(async (callbackUrl?: string) => {
    await signOut({ callbackUrl: callbackUrl || '/auth/login' });
  }, []);

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    isCustomer,
    isAdmin,
    isSuperAdmin,
    login,
    logout,
    accessToken: session?.accessToken,
    error: session?.error,
  };
}
