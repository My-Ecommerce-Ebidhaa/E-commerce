'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type AllowedRole = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: AllowedRole[];
  redirectTo?: string;
}

export function AuthGuard({
  children,
  allowedRoles,
  redirectTo = '/auth/login',
}: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      const callbackUrl = encodeURIComponent(window.location.pathname);
      router.push(`${redirectTo}?callbackUrl=${callbackUrl}`);
      return;
    }

    if (allowedRoles && !allowedRoles.includes(session.user.role)) {
      router.push('/unauthorized');
    }
  }, [session, status, allowedRoles, redirectTo, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return null;
  }

  return <>{children}</>;
}
