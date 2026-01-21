'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Settings,
  FileText,
  Shield,
  LogOut,
  User,
  ChevronDown,
  ChevronRight,
  Plug,
} from 'lucide-react';

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
    icon: <Settings className="h-5 w-5" />,
    children: [
      {
        label: 'General',
        href: '/platform/settings/general',
        icon: <Settings className="h-4 w-4" />,
      },
      {
        label: 'Integrations',
        href: '/platform/settings/integrations',
        icon: <Plug className="h-4 w-4" />,
      },
    ],
  },
];

interface PlatformSidebarProps {
  className?: string;
}

export function PlatformSidebar({ className }: PlatformSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Settings']);

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === '/platform') return pathname === '/platform';
    return pathname.startsWith(href);
  };

  const isParentActive = (item: NavItem) => {
    if (item.children) {
      return item.children.some((child) => isActive(child.href));
    }
    return false;
  };

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  const userName = session?.user
    ? `${session.user.firstName || ''} ${session.user.lastName || ''}`.trim() || 'User'
    : 'Loading...';

  const userEmail = session?.user?.email || '';
  const userRole = session?.user?.role || '';

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
              {item.children ? (
                // Item with children (expandable)
                <div>
                  <button
                    onClick={() => toggleExpanded(item.label)}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white',
                      isParentActive(item) && 'bg-slate-800 text-white'
                    )}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      {item.label}
                    </span>
                    {expandedItems.includes(item.label) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {expandedItems.includes(item.label) && (
                    <ul className="mt-1 ml-4 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <Link
                            href={child.href!}
                            className={cn(
                              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white',
                              isActive(child.href) && 'bg-slate-800 text-white'
                            )}
                          >
                            {child.icon}
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                // Regular link item
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
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center gap-3 rounded-md px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700">
            <User className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-slate-400 truncate">{userEmail}</p>
            {userRole && (
              <span className="inline-flex items-center rounded bg-blue-500/20 px-1.5 py-0.5 text-xs font-medium text-blue-300">
                {userRole}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
