'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ShieldX } from 'lucide-react';

export default function UnauthorizedPage() {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <ShieldX className="h-10 w-10 text-red-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>

        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
          {session?.user?.role && (
            <span className="block mt-2 text-sm">
              Your current role: <span className="font-medium">{session.user.role}</span>
            </span>
          )}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button variant="outline">Go to Home</Button>
          </Link>
          <Button onClick={handleSignOut} variant="destructive">
            Sign Out
          </Button>
        </div>

        {session?.user && (
          <p className="mt-8 text-sm text-gray-500">
            Signed in as {session.user.email}
          </p>
        )}
      </div>
    </div>
  );
}
