'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Users,
  Settings,
  FileText,
  Shield,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/platform',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: 'Tenants',
    href: '/platform/tenants',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    label: 'Subscriptions',
    href: '/platform/subscriptions',
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    label: 'Plans',
    href: '/platform/plans',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: 'Platform Admins',
    href: '/platform/admins',
    icon: <Shield className="h-5 w-5" />,
  },
  {
    label: 'Settings',
    href: '/platform/settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

interface PlatformSidebarProps {
  className?: string;
}

export function PlatformSidebar({ className }: PlatformSidebarProps) {
  const pathname = usePathname();

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === '/platform') return pathname === '/platform';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'flex h-screen w-64 flex-col border-r bg-slate-900 text-white',
        className
      )}
    >
      <div className="flex h-16 items-center border-b border-slate-700 px-6">
        <Link href="/platform" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-400" />
          <span className="font-semibold">Platform Admin</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href!}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white',
                  isActive(item.href) && 'bg-slate-800 text-white'
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center gap-3 rounded-md px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700">
            <Users className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Super Admin</p>
            <p className="text-xs text-slate-400">admin@platform.com</p>
          </div>
        </div>
        <button className="mt-2 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
