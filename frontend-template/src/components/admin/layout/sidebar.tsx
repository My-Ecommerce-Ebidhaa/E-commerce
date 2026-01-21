'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  Settings,
  BarChart3,
  UserCog,
  Shield,
  ChevronDown,
  Store,
  CreditCard,
  Mail,
  MessageSquare,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  permission?: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: 'Products',
    href: '/admin/products',
    icon: <Package className="h-5 w-5" />,
    permission: 'products:read',
  },
  {
    label: 'Categories',
    href: '/admin/categories',
    icon: <FolderTree className="h-5 w-5" />,
    permission: 'categories:read',
  },
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: <ShoppingCart className="h-5 w-5" />,
    permission: 'orders:read',
  },
  {
    label: 'Customers',
    href: '/admin/customers',
    icon: <Users className="h-5 w-5" />,
    permission: 'customers:read',
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: <BarChart3 className="h-5 w-5" />,
    permission: 'analytics:read',
  },
  {
    label: 'Staff',
    href: '/admin/staff',
    icon: <UserCog className="h-5 w-5" />,
    permission: 'staff:read',
  },
  {
    label: 'Roles & Permissions',
    href: '/admin/roles',
    icon: <Shield className="h-5 w-5" />,
    permission: 'roles:read',
  },
  {
    label: 'Settings',
    icon: <Settings className="h-5 w-5" />,
    permission: 'settings:read',
    children: [
      {
        label: 'Store Settings',
        href: '/admin/settings',
        icon: <Store className="h-4 w-4" />,
      },
      {
        label: 'Payment Providers',
        href: '/admin/settings/providers?type=payment',
        icon: <CreditCard className="h-4 w-4" />,
      },
      {
        label: 'Email Providers',
        href: '/admin/settings/providers?type=email',
        icon: <Mail className="h-4 w-4" />,
      },
      {
        label: 'SMS Providers',
        href: '/admin/settings/providers?type=sms',
        icon: <MessageSquare className="h-4 w-4" />,
      },
    ],
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Settings']);

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'flex h-screen w-64 flex-col border-r bg-white',
        className
      )}
    >
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <Store className="h-6 w-6" />
          <span className="font-semibold">Admin Dashboard</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.label}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleExpanded(item.label)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100',
                      expandedItems.includes(item.label) && 'bg-gray-50'
                    )}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      {item.label}
                    </span>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform',
                        expandedItems.includes(item.label) && 'rotate-180'
                      )}
                    />
                  </button>
                  {expandedItems.includes(item.label) && (
                    <ul className="ml-6 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <Link
                            href={child.href!}
                            className={cn(
                              'flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100',
                              isActive(child.href) &&
                                'bg-blue-50 text-blue-700 font-medium'
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
                <Link
                  href={item.href!}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100',
                    isActive(item.href) && 'bg-blue-50 text-blue-700'
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

      <div className="border-t p-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          <Store className="h-5 w-5" />
          View Storefront
        </Link>
      </div>
    </aside>
  );
}
