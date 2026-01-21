'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function AccountPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // In production, check auth and fetch user data
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Simulate user data
    setUser({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    });
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <nav className="space-y-2">
            <Link
              href="/account"
              className="block rounded-md bg-gray-100 px-4 py-2 font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/account/orders"
              className="block rounded-md px-4 py-2 text-gray-600 hover:bg-gray-50"
            >
              Orders
            </Link>
            <Link
              href="/account/addresses"
              className="block rounded-md px-4 py-2 text-gray-600 hover:bg-gray-50"
            >
              Addresses
            </Link>
            <Link
              href="/account/wishlist"
              className="block rounded-md px-4 py-2 text-gray-600 hover:bg-gray-50"
            >
              Wishlist
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full rounded-md px-4 py-2 text-left text-red-600 hover:bg-red-50"
            >
              Sign Out
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2">
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">
              Welcome, {user.firstName}!
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Recent Orders */}
              <Link
                href="/account/orders"
                className="rounded-lg border p-4 hover:border-primary"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <svg
                      className="h-5 w-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Orders</p>
                    <p className="text-sm text-gray-500">View order history</p>
                  </div>
                </div>
              </Link>

              {/* Addresses */}
              <Link
                href="/account/addresses"
                className="rounded-lg border p-4 hover:border-primary"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <svg
                      className="h-5 w-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Addresses</p>
                    <p className="text-sm text-gray-500">Manage addresses</p>
                  </div>
                </div>
              </Link>

              {/* Wishlist */}
              <Link
                href="/account/wishlist"
                className="rounded-lg border p-4 hover:border-primary"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <svg
                      className="h-5 w-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Wishlist</p>
                    <p className="text-sm text-gray-500">Saved items</p>
                  </div>
                </div>
              </Link>

              {/* Account Settings */}
              <Link
                href="/account/settings"
                className="rounded-lg border p-4 hover:border-primary"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <svg
                      className="h-5 w-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Settings</p>
                    <p className="text-sm text-gray-500">Account settings</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Account Info */}
          <div className="mt-6 rounded-lg border p-6">
            <h3 className="font-semibold mb-4">Account Information</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-500">Name:</span>{' '}
                {user.firstName} {user.lastName}
              </p>
              <p>
                <span className="text-gray-500">Email:</span> {user.email}
              </p>
            </div>
            <Button variant="outline" className="mt-4" size="sm">
              Edit Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
